import { api } from "./api";

// UbicacionController
// GET    /api/ubicacion/GetAll       → UbicacionViewModel[]
// GET    /api/ubicacion/GetById/{id}
// POST   /api/ubicacion/Create
// PUT    /api/ubicacion/Update/{id}
// DELETE /api/ubicacion/Delete/{id}

// La API serializa en camelCase. Normalizamos a PascalCase para que los
// componentes no tengan que escribir `u.Nombre ?? u.nombre` en cada lado.
function normalizeUbicacion(u) {
  if (!u) return u;
  return {
    Id: u.Id ?? u.id,
    Nombre: u.Nombre ?? u.nombre ?? "",
    Direccion: u.Direccion ?? u.direccion ?? "",
    CodigoPostal: u.CodigoPostal ?? u.codigoPostal ?? null,
    Ciudad: u.Ciudad ?? u.ciudad ?? "",
    Provincia: u.Provincia ?? u.provincia ?? null,
    Telefono: u.Telefono ?? u.telefono ?? null,
    Email: u.Email ?? u.email ?? null,
    Disabled: u.Disabled ?? u.disabled ?? false,
  };
}

export const getUbicaciones = async () => {
  const data = await api.get("ubicacion/GetAll").then((r) => r.data);
  return Array.isArray(data) ? data.map(normalizeUbicacion) : [];
};

export const getUbicacionById = async (id) => {
  const data = await api.get(`ubicacion/GetById/${id}`).then((r) => r.data);
  return normalizeUbicacion(data);
};

export const createUbicacion = (payload) =>
  api.post("ubicacion/Create", payload).then((r) => normalizeUbicacion(r.data));

export const updateUbicacion = (id, payload) =>
  api.put(`ubicacion/Update/${id}`, payload).then((r) => normalizeUbicacion(r.data));

export const deleteUbicacion = (id) =>
  api.delete(`ubicacion/Delete/${id}`).then((r) => r.data);
