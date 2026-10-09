import { authApi } from "./auth";

// Endpoints de ApiGetToken (proxy /auth-api → https://localhost:7229):
// GET    /api/Usuarios?searchText=&page=&pageSize=  → PagedResult<Usuario>
// GET    /api/Usuarios/{id}                         → Usuario + rolIds
// POST   /api/Usuarios                              → crea (body: RegisterUserRequest)
// PUT    /api/Usuarios/{id}                         → actualiza (body: UpdateUsuarioRequest)
// DELETE /api/Usuarios/{id}                         → soft
// GET    /api/Usuarios/{usuarioId}/Roles            → roles del usuario
// POST   /api/Usuarios/{usuarioId}/Roles/{rolId}
// DELETE /api/Usuarios/{usuarioId}/Roles/{rolId}

function normalizeUsuario(u) {
  if (!u) return u;
  return {
    Id: u.Id ?? u.id,
    Username: u.Username ?? u.username,
    Name: u.Name ?? u.name ?? "",
    LastName: u.LastName ?? u.lastName ?? "",
    Email: u.Email ?? u.email ?? "",
    IsAdministrator: u.IsAdministrator ?? u.isAdministrator ?? false,
    IsSuperUser: u.IsSuperUser ?? u.isSuperUser ?? false,
    Activated: u.Activated ?? u.activated ?? false,
    Disabled: u.Disabled ?? u.disabled ?? false,
    ChangePasswordRequired:
      u.ChangePasswordRequired ?? u.changePasswordRequired ?? false,
    RolIds: Array.isArray(u.RolIds ?? u.rolIds)
      ? (u.RolIds ?? u.rolIds).map((r) => Number(r))
      : [],
  };
}

const extractItems = (response) => {
  if (Array.isArray(response)) return response;
  return response?.items ?? response?.Items ?? [];
};

export async function getUsuarios({ searchText, page = 1, pageSize = 200 } = {}) {
  const params = { page, pageSize };
  if (searchText) params.searchText = searchText;
  const data = await authApi.get("/Usuarios", { params }).then((r) => r.data);
  return extractItems(data).map(normalizeUsuario);
}

export async function getUsuarioById(id) {
  const data = await authApi.get(`/Usuarios/${id}`).then((r) => r.data);
  return normalizeUsuario(data);
}

export async function createUsuario(payload) {
  const data = await authApi.post("/Usuarios", payload).then((r) => r.data);
  return normalizeUsuario(data);
}

export async function updateUsuario(id, payload) {
  const data = await authApi.put(`/Usuarios/${id}`, payload).then((r) => r.data);
  return normalizeUsuario(data);
}

export async function deleteUsuario(id) {
  return authApi.delete(`/Usuarios/${id}`).then((r) => r.data);
}

export async function getRolesDeUsuario(usuarioId) {
  const data = await authApi.get(`/Usuarios/${usuarioId}/Roles`).then((r) => r.data);
  return extractItems(data).map((r) => ({
    Id: r.Id ?? r.id,
    Codigo: r.Codigo ?? r.codigo,
    Nombre: r.Nombre ?? r.nombre,
    Descripcion: r.Descripcion ?? r.descripcion ?? null,
  }));
}

export async function addRolAUsuario(usuarioId, rolId) {
  const data = await authApi
    .post(`/Usuarios/${usuarioId}/Roles/${rolId}`)
    .then((r) => r.data);
  return data;
}

export async function removeRolDeUsuario(usuarioId, rolId) {
  return authApi
    .delete(`/Usuarios/${usuarioId}/Roles/${rolId}`)
    .then((r) => r.data);
}
