import { authApi } from "./auth";

// Endpoints de ApiGetToken (proxy /auth-api → https://localhost:7229):
// GET    /api/Permisos?modulo=&page=&pageSize= → PagedResult<Permiso>
// GET    /api/Permisos/{id}                     → Permiso
// (POST/PUT/DELETE no expuestos en el front — el catálogo es config de sistema)

// camelCase → PascalCase para que el resto del código lea consistente con
// lo que ya hace services/patients.js. El back ahora devuelve camelCase.
function normalizePermiso(p) {
  if (!p) return p;
  return {
    Id: p.Id ?? p.id,
    Codigo: p.Codigo ?? p.codigo,
    Modulo: p.Modulo ?? p.modulo,
    Nombre: p.Nombre ?? p.nombre,
    Descripcion: p.Descripcion ?? p.descripcion ?? null,
    Disabled: p.Disabled ?? p.disabled ?? false,
  };
}

const extractItems = (response) => {
  if (Array.isArray(response)) return response;
  return response?.items ?? response?.Items ?? [];
};

/**
 * Trae el catálogo de permisos. Por defecto pageSize=200 para traer todos
 * (el modal de asignación los necesita juntos para que los checkboxes
 * no se rompan entre páginas).
 */
export async function getPermisos({ modulo, pageSize = 200, page = 1, searchText } = {}) {
  const params = { page, pageSize };
  if (modulo) params.modulo = modulo;
  if (searchText) params.searchText = searchText;
  const data = await authApi.get("/Permisos", { params }).then((r) => r.data);
  return extractItems(data).map(normalizePermiso);
}

export async function getPermisoById(id) {
  const data = await authApi.get(`/Permisos/${id}`).then((r) => r.data);
  return normalizePermiso(data);
}

/**
 * Devuelve los permisos agrupados por módulo: { [modulo]: Permiso[] }.
 * Útil para renderizar el editor con <details> por módulo.
 */
export function groupPermisosByModulo(permisos) {
  const grupos = {};
  for (const p of permisos ?? []) {
    const m = p.Modulo || "Otros";
    if (!grupos[m]) grupos[m] = [];
    grupos[m].push(p);
  }
  // Orden estable: por nombre de módulo y por código dentro
  for (const k of Object.keys(grupos)) {
    grupos[k].sort((a, b) => String(a.Codigo).localeCompare(String(b.Codigo)));
  }
  return grupos;
}
