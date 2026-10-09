import axios from "axios";
import { tokenStorage, parseJwtClaims } from "./auth";

// Cliente axios dedicado a uploads multipart/form-data.
// Diferencia con `api.jsx`: NO hardcodea Content-Type, así el browser
// genera el boundary automáticamente al mandar FormData.
// Si reusáramos `api`, axios conservaría "application/json" como Content-Type
// y el back rechazaría el request porque no encuentra el boundary.
export const uploadApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
});

// ── Mismo manejo de JWT que api.jsx ────────────────────────────────────
function getTokenExpiryMs(token) {
  if (!token) return null;
  const claims = parseJwtClaims(token);
  if (!claims?.exp) return null;
  return claims.exp * 1000;
}

uploadApi.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (!token) {
    console.warn("[uploadApi] Sin token en localStorage → request a", config.url);
    return config;
  }

  const expiry = getTokenExpiryMs(token);
  const now = Date.now();
  if (expiry && expiry < now) {
    console.warn("[uploadApi] Token EXPIRADO. Limpiando sesión.");
    tokenStorage.clear();
    window.dispatchEvent(new Event("auth:logout"));
    return config;
  }

  config.headers = config.headers ?? {};
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

uploadApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      console.warn("[uploadApi] 401 desde", err.config?.url, "→ limpiando sesión");
      tokenStorage.clear();
      window.dispatchEvent(new Event("auth:logout"));
    }
    return Promise.reject(err);
  }
);
