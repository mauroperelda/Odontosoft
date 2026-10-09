# ── Deploy dist/ → IIS ───────────────────────────────────
# Espeja el contenido de dist/ a la carpeta física del sitio en IIS.
# Pensado para OdontoSoft-front servido desde C:\inetpub\wwwroot\odontosoft.
#
# Uso:
#   npm run deploy                  (asume dist/ ya construido)
#   npm run build:remote:deploy     (build con .env.remote + deploy en uno)
#
# Notas:
#   • Robocopy /MIR borra archivos en destino que ya no estén en dist/.
#   • Si web.config cambió, recicla IIS automáticamente para que tome
#     los cambios de compresión / cache / rewrite.

$ErrorActionPreference = "Stop"

$src = Join-Path $PSScriptRoot "..\dist"
$dst = "C:\inetpub\wwwroot\odontosoft"

# ── Validaciones ────────────────────────────────────────
if (-not (Test-Path $src)) {
    Write-Error "No existe $src. Corré 'npm run build' o 'npm run build:remote' primero."
    exit 1
}

if (-not (Test-Path $dst)) {
    Write-Host "Creando $dst (no existía) ..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $dst -Force | Out-Null
}

# ── Espejado ────────────────────────────────────────────
Write-Host ""
Write-Host "  Source: $src" -ForegroundColor DarkGray
Write-Host "  Dest:   $dst" -ForegroundColor DarkGray
Write-Host ""

$robocopyArgs = @(
    $src,
    $dst,
    "/MIR",   # mirror: copia nuevos, sobreescribe cambiados, borra sobrantes
    "/NFL",   # sin log de filenames
    "/NDL",   # sin log de directorios
    "/NP",    # sin barra de progreso
    "/R:3",   # 3 reintentos en archivos bloqueados
    "/W:2"    # 2 seg entre reintentos
)

& robocopy @robocopyArgs | Out-Null
$exit = $LASTEXITCODE

# Robocopy exit codes: 0 = nada, 1 = copió, 2 = extras, 3 = mixto. Todos OK.
if ($exit -ge 8) {
    Write-Error "Robocopy falló (exit code $exit). Revisá permisos sobre $dst."
    exit 1
}

Write-Host "  Deploy OK" -ForegroundColor Green

# ── Recycle de IIS si web.config cambió ─────────────────
$srcWeb = Join-Path $src "web.config"
$dstWeb = Join-Path $dst "web.config"

$needsRecycle = $false
if ((-not (Test-Path $dstWeb)) -and (Test-Path $srcWeb)) {
    $needsRecycle = $true
} elseif ((Test-Path $srcWeb) -and (Test-Path $dstWeb)) {
    $srcHash = (Get-FileHash $srcWeb -Algorithm SHA256).Hash
    $dstHash = (Get-FileHash $dstWeb -Algorithm SHA256).Hash
    if ($srcHash -ne $dstHash) { $needsRecycle = $true }
}

if ($needsRecycle) {
    Write-Host "  web.config cambió → reciclando IIS ..." -ForegroundColor Cyan
    iisreset | Out-Null
    Write-Host "  IIS reciclado" -ForegroundColor Green
}

Write-Host ""
Write-Host "  Sitio disponible en:" -ForegroundColor Green
Write-Host "    http://localhost:8082/" -ForegroundColor White
Write-Host "    http://192.168.100.84:8082/  (LAN)" -ForegroundColor White
Write-Host ""
