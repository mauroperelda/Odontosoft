# ── start-tunnels.ps1 ────────────────────────────────────────────────────
# Levanta 3 quick tunnels de Cloudflare (front:8082, api:8081, auth:8080),
# captura las URLs públicas, actualiza .env.remote, y rebuild + deploy del front.
#
# Uso (desde la raíz del proyecto):
#   npm run tunnel
#
# Requisitos:
#   - cloudflared instalado en "$env:ProgramFiles\cloudflared\cloudflared.exe"
#   - IIS corriendo con los 3 sitios en localhost:8082 / 8081 / 8080
#   - Permisos normales (no requiere Admin)

$ErrorActionPreference = "Stop"

$root = (Resolve-Path "$PSScriptRoot\..").Path
Set-Location $root

# ── 1. Ubicar cloudflared ────────────────────────────────────────────────
$cloudflared = Join-Path $env:ProgramFiles "cloudflared\cloudflared.exe"
if (-not (Test-Path $cloudflared)) {
    Write-Host ""
    Write-Host "ERROR: no se encontro cloudflared en $cloudflared" -ForegroundColor Red
    Write-Host "Descargalo desde https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# ── 2. Matar tunnels previos ────────────────────────────────────────────
$previos = Get-Process -Name cloudflared -ErrorAction SilentlyContinue
if ($previos) {
    Write-Host "Cerrando $($previos.Count) tunnel(s) previos..." -ForegroundColor DarkGray
    $previos | Stop-Process -Force
    Start-Sleep -Seconds 2
}

# ── 3. Definir los 3 tunnels ─────────────────────────────────────────────
$tunnels = @(
    @{ Port = 8082; Label = "front" }
    @{ Port = 8081; Label = "api"   }
    @{ Port = 8080; Label = "auth"  }
)

$logDir = Join-Path $root ".tunnels"
New-Item -Path $logDir -ItemType Directory -Force | Out-Null

# ── 4. Función: arrancar cloudflared y capturar salida línea por línea ──
#    (no usa Start-Process porque bufferea; usa .NET Process con eventos)
function Start-Tunnel {
    param([int]$Port, [string]$LogPath)

    # Inicializar log vacío
    "" | Set-Content -Path $LogPath -Encoding UTF8

    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = $cloudflared
    $psi.Arguments = "tunnel --url http://localhost:$Port --no-autoupdate"
    $psi.UseShellExecute = $false
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError  = $true
    $psi.CreateNoWindow         = $true
    $psi.StandardOutputEncoding = [System.Text.Encoding]::UTF8
    $psi.StandardErrorEncoding  = [System.Text.Encoding]::UTF8

    $proc = [System.Diagnostics.Process]::Start($psi)

    # Handlers asíncronos: escriben cada línea al log apenas se emite
    $writeLine = {
        if ($EventArgs.Data) {
            [System.IO.File]::AppendAllText(
                $Event.MessageData,
                $EventArgs.Data + "`r`n",
                [System.Text.Encoding]::UTF8
            )
        }
    }
    Register-ObjectEvent -InputObject $proc -EventName OutputDataReceived -MessageData $LogPath -Action $writeLine | Out-Null
    Register-ObjectEvent -InputObject $proc -EventName ErrorDataReceived  -MessageData $LogPath -Action $writeLine | Out-Null

    $proc.BeginOutputReadLine()
    $proc.BeginErrorReadLine()

    return $proc
}

Write-Host ""
Write-Host "Levantando tunnels..." -ForegroundColor Cyan

foreach ($t in $tunnels) {
    $logPath = Join-Path $logDir "$($t.Label).log"
    if (Test-Path $logPath) { Remove-Item $logPath -Force }
    Start-Tunnel -Port $t.Port -LogPath $logPath | Out-Null
}

# ── 5. Esperar a que cada tunnel publique su URL ────────────────────────
$urls = @{}
foreach ($t in $tunnels) {
    $logPath = Join-Path $logDir "$($t.Label).log"
    $deadline = (Get-Date).AddSeconds(60)
    $url = $null

    while ((Get-Date) -lt $deadline) {
        if (Test-Path $logPath) {
            $content = Get-Content $logPath -Raw -ErrorAction SilentlyContinue
            if ($content -and $content -match 'https://[a-z0-9-]+\.trycloudflare\.com') {
                $url = $matches[0]
                break
            }
        }
        Start-Sleep -Seconds 2
    }

    if (-not $url) {
        Write-Host ""
        Write-Host "ERROR: tunnel '$($t.Label)' no publico su URL. Contenido del log:" -ForegroundColor Red
        if (Test-Path $logPath) {
            Get-Content $logPath | Select-Object -First 30 | ForEach-Object { Write-Host "  $_" }
        } else {
            Write-Host "  (log file no existe aun)"
        }
        Write-Host ""
        exit 1
    }

    $urls[$t.Label] = $url
    Write-Host "  $($t.Label.PadRight(6)) :$($t.Port) -> $url" -ForegroundColor Green
}

# ── 6. Actualizar .env.remote ───────────────────────────────────────────
$envRemote = Join-Path $root ".env.remote"
$content = Get-Content $envRemote -Raw
$content = $content -replace 'VITE_API_BASE_URL=.*',  "VITE_API_BASE_URL=$($urls.api)/api"
$content = $content -replace 'VITE_AUTH_API_URL=.*',  "VITE_AUTH_API_URL=$($urls.auth)/api"

# UTF-8 sin BOM (Vite/dotenv rompe con BOM)
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($envRemote, $content, $utf8NoBom)

Write-Host ""
Write-Host "══════════════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""
Write-Host "   COMPARTI ESTE LINK  ->  $($urls.front)" -ForegroundColor White -BackgroundColor DarkBlue
Write-Host ""
Write-Host "   api   : $($urls.api)" -ForegroundColor DarkGray
Write-Host "   auth  : $($urls.auth)" -ForegroundColor DarkGray
Write-Host ""
Write-Host "══════════════════════════════════════════════════════════════════" -ForegroundColor Yellow

# ── 7. Build + deploy ───────────────────────────────────────────────────
Write-Host ""
Write-Host "Compilando (npm run build:remote)..." -ForegroundColor Cyan
& npm run build:remote
if ($LASTEXITCODE -ne 0) { throw "build fallo (codigo $LASTEXITCODE)" }

Write-Host "Publicando (npm run deploy)..." -ForegroundColor Cyan
& npm run deploy
if ($LASTEXITCODE -ne 0) { throw "deploy fallo (codigo $LASTEXITCODE)" }

Write-Host ""
Write-Host "Listo. Compartir: $($urls.front)" -ForegroundColor Green
Write-Host ""
Write-Host "Los tunnels quedan corriendo en background. Para detenerlos:" -ForegroundColor Yellow
Write-Host "  Get-Process cloudflared | Stop-Process" -ForegroundColor DarkGray
Write-Host ""
