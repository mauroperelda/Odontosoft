import { authApi } from "./auth";

// Endpoints de ApiGetToken (proxy /auth-api → https://localhost:7229):
// GET    /api/Roles?searchText=&page=&pageSize= → PagedResult<Rol>
// GET    /api/Roles/{id}                        → Rol + permisos[]
// POST   /api/Roles                             → crea
// PUT    /api/Roles/{id}                        → actualiza (si permisoIds!=null, reemplaza membresía)
// DELETE /api/Roles/{id}                        → soft
// GET    /api/Roles/{rolId}/Permisos            → permisos del rol
// POST   /api/Roles/{rolId}/Permisos/{permisoId}
// DELETE /api/Roles/{rolId}/Permisos/{permisoId}

function normalizeRol(r) {
  if (!r) return r;
  return {
    Id: r.Id ?? r.id,
    Codigo: r.Codigo ?? r.codigo,
    Nombre: r.Nombre ?? r.nombre,
    Descripcion: r.Descripcion ?? r.descripcion ?? null,
    Disabled: r.Disabled ?? r.disabled ?? false,
    Permisos: Array.isArray(r.Permisos ?? r.permisos)
      ? (r.Permisos ?? r.permisos).map((p) => ({
          Id: p.Id ?? p.id,
          Codigo: p.Codigo ?? p.codigo,
          Modulo: p.Modulo ?? p.modulo,
          Nombre: p.Nombre ?? p.nombre,
        }))
      : undefined,
  };
}

const extractItems = (response) => {
  if (Array.isArray(response)) return response;
  return response?.items ?? response?.Items ?? [];
};

export async function getRoles({ searchText, page = 1, pageSize = 200 } = {}) {
  const params = { page, pageSize };
  if (searchText) params.searchText = searchText;
  const data = await authApi.get("/Roles", { params }).then((r) => r.data);
  return extractItems(data).map(normalizeRol);
}

export async function getRolById(id) {
  const data = await authApi.get(`/Roles/${id}`).then((r) => r.data);
  return normalizeRol(data);
}

export async function createRol(payload) {
  const data = await authApi.post("/Roles", payload).then((r) => r.data);
  return normalizeRol(data);
}

export async function updateRol(id, payload) {
  const data = await authApi.put(`/Roles/${id}`, payload).then((r) => r.data);
  return normalizeRol(data);
}

export async function deleteRol(id) {
  return authApi.delete(`/Roles/${id}`).then((r) => r.data);
}

export async function getPermisosDeRol(rolId) {
  const data = await authApi.get(`/Roles/${rolId}/Permisos`).then((r) => r.data);
  return extractItems(data).map((p) => ({
    Id: p.Id ?? p.id,
    Codigo: p.Codigo ?? p.codigo,
    Modulo: p.Modulo ?? p.modulo,
    Nombre: p.Nombre ?? p.nombre,
  }));
}

export async function addPermisoARol(rolId, permisoId) {
  const data = await authApi
    .post(`/Roles/${rolId}/Permisos/${permisoId}`)
    .then((r) => r.data);
  return data;
}

export async function removePermisoDeRol(rolId, permisoId) {
  return authApi.delete(`/Roles/${rolId}/Permisos/${permisoId}`).then((r) => r.data);
}
