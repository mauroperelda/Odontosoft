import axios from "axios";
import { tokenStorage, parseJwtClaims } from "./auth";

// Cliente para la API principal (OdontoSoft.API)
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Decodifica un JWT y devuelve el `exp` en ms, o null si no se puede.
function getTokenExpiryMs(token) {
  if (!token) return null;
  const claims = parseJwtClaims(token);
  if (!claims?.exp) return null;
  return claims.exp * 1000;
}

// Inyecta el token JWT en cada request + loguea info de debug
api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (!token) {
    console.warn("[api] Sin token en localStorage → request a", config.url);
    return config;
  }

  const expiry = getTokenExpiryMs(token);
  const now = Date.now();
  if (expiry && expiry < now) {
    console.warn("[api] Token EXPIRADO. Limpiando sesión.");
    tokenStorage.clear();
    // Forzamos redirect a login en el siguiente render
    window.dispatchEvent(new Event("auth:logout"));
    return config;
  }

  config.headers = config.headers ?? {};
  config.headers.Authorization = `Bearer ${token}`;

  if (import.meta.env.DEV) {
    const claims = parseJwtClaims(token);
    console.log(
      "[api] →",
      config.method?.toUpperCase(),
      config.url,
      "\n   iss:",
      claims?.iss,
      "\n   aud:",
      claims?.aud,
      "\n   exp:",
      expiry ? new Date(expiry).toISOString() : "n/a",
      "\n   token[0..20]:",
      String(token).slice(0, 20) + "…"
    );
  }
  return config;
});

// Si el back responde 401, limpiamos sesión y emitimos un evento global
// para que el AuthContext haga logout (y el ProtectedRoute redirija).
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      console.warn("[api] 401 desde", err.config?.url, "→ limpiando sesión");
      tokenStorage.clear();
      window.dispatchEvent(new Event("auth:logout"));
    }
    return Promise.reject(err);
  }
);
