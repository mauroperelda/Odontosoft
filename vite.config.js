import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import http from "node:http";
import https from "node:https";
import { URL } from "node:url";

// ── Plugin custom de proxy ────────────────────────────────────────────────
// Vite 8 + http-proxy strippea el header "Authorization" cuando el target
// es localhost, lo que rompe el envío del JWT. Este plugin reenvía TODOS
// los headers manualmente usando el módulo http nativo de Node.
function apiProxyPlugin({ prefix, target, secure = false, rewrite }) {
  const targetUrl = new URL(target);
  const isHttps = targetUrl.protocol === "https:";
  // `secure: false` (default) → ignora self-signed certs típico de dev
  const agent = isHttps ? new https.Agent({ rejectUnauthorized: secure }) : undefined;

  return {
    name: `api-proxy-${prefix.replace("/", "")}`,
    configureServer(server) {
      server.middlewares.use(prefix, (req, res) => {
        // Vite ya strippeó el prefijo de req.url (porque usamos `use(prefix, ...)`),
        // así que tenemos que re-prependerlo antes de reenviar al target.
        const strippedPath = rewrite ? rewrite(req.url) : req.url;
        const destPath = prefix + strippedPath;
        const dest = new URL(destPath, targetUrl);

        // Clonar headers y forzar Authorization (si existe en el request original)
        const headers = { ...req.headers };
        const auth = req.headers.authorization;
        if (auth) {
          headers.authorization = auth;
        }
        // Host debe apuntar al target para que el API lo reconozca
        headers.host = dest.host;
        delete headers["content-length"]; // se recalcula al pipe

        console.log(
          `[proxy ${prefix}] ${req.method} ${req.url} → ${dest.href}` +
            ` | auth: ${auth ? "✓ " + String(auth).slice(0, 25) + "…" : "✗"}`
        );

        const proxyReq = (isHttps ? https : http).request(
          {
            hostname: dest.hostname,
            port: dest.port || (isHttps ? 443 : 80),
            path: dest.pathname + dest.search,
            method: req.method,
            headers,
            agent,
          },
          (proxyRes) => {
            res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
            proxyRes.pipe(res, { end: true });
          }
        );

        proxyReq.on("error", (err) => {
          console.error(`[proxy ${prefix}] error:`, err.message);
          if (!res.headersSent) {
            res.writeHead(502, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Proxy error", detail: err.message }));
          }
        });

        req.pipe(proxyReq, { end: true });
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    babel({ presets: [reactCompilerPreset()] }),
    // Proxy custom para /api → OdontoSoft.API (reenvía Authorization)
    // El API corre en HTTPS puerto 7288 (perfil por defecto de launchSettings.json)
    apiProxyPlugin({
      prefix: "/api",
      target: "https://localhost:7288",
      secure: false, // cert self-signed en dev
    }),
  ],
  server: {
    proxy: {
      // Mantengo el proxy de auth-api con la config de Vite (ya funcionaba)
      "/auth-api": {
        target: "https://localhost:7229",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/auth-api/, "/api"),
      },
    },
  },
  preview: {
    port: 4173,
  },
});
