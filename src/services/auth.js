import axios from "axios";

// Cliente dedicado a autenticación contra ApiGetToken
// Usa el prefijo /auth-api que el proxy de Vite redirige a https://localhost:7229/api
export const authApi = axios.create({
  baseURL: import.meta.env.VITE_AUTH_API_URL || "/auth-api",
  headers: { "Content-Type": "application/json" },
});

// Log de cada respuesta para debug
authApi.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("[authApi error]", {
      url: err.config?.url,
      status: err.response?.status,
      data: err.response?.data,
      message: err.message,
    });
    return Promise.reject(err);
  }
);

// ── Storage del token ─────────────────────────────────────────────
const TOKEN_KEY = "odontosoft_token";
const USER_KEY = "odontosoft_user";

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

export const userStorage = {
  get: () => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  set: (user) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
};

// ── Endpoints ─────────────────────────────────────────────────────

// Login: POST /Account/Login  →  { username, password }
// Devuelve LoginUserResponse (incluye Token)
export async function loginRequest({ username, password }) {
  let data;
  try {
    const res = await authApi.post("/Account/Login", { username, password });
    data = res.data;
  } catch (err) {
    // 400/401 desde el back, o error de red
    const body = err.response?.data;
    const msg =
      body?.Message ||
      body?.message ||
      (typeof body === "string" ? body : null) ||
      err.message ||
      "No se pudo iniciar sesión";
    throw new Error(msg);
  }

  // Algunos endpoints devuelven 200 con Result=false; otros devuelven 401 directo
  if (!data) {
    throw new Error("La API no devolvió una respuesta válida.");
  }
  if (data.Result === false || data.result === false) {
    throw new Error(data.Message || data.message || "Credenciales inválidas.");
  }
  // ASP.NET puede serializar como "Token" o "token" según la config de JSON
  const token = data.Token ?? data.token;
  if (!token) {
    console.error("Login response sin Token:", data);
    throw new Error("La API no devolvió un token válido.");
  }
  // Normalizo a Token mayúscula para el resto del código
  data.Token = token;
  return data;
}

// Register: POST /Account/Register  →  body con datos del nuevo User
// Devuelve LoginUserResponse (incluye Token) si el back autentica al usuario post-registro
export async function registerRequest(payload) {
  const { data } = await authApi.post("/Account/Register", payload);
  if (!data || data.Result === false || data.result === false) {
    throw new Error(data?.Message || data?.message || "No se pudo crear la cuenta");
  }
  if (data && (data.token || data.Token)) {
    data.Token = data.Token ?? data.token;
  }
  return data;
}

// ── Helpers de claims (decodifica el payload del JWT) ─────────────
export function parseJwtClaims(token) {
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return {};
  }
}
