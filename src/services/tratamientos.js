import { api } from "./api";

// TratamientoController
// GET    /api/tratamiento/GetAll
// GET    /api/tratamiento/GetById/{id}
// POST   /api/tratamiento/Create
// PUT    /api/tratamiento/Update/{id}
// DELETE /api/tratamiento/Delete/{id}
// GET    /api/tratamiento/GetAllConPrecios   → TratamientoConPreciosViewModel[]
// PUT    /api/tratamiento/{id}/Precio        → upsert (body: { ubicacionId, precio })
// DELETE /api/tratamiento/{id}/Precio/{ubicacionId}

const pick = (a, b) => a ?? b;

function normalizePrecioPorUbicacion(p) {
  if (!p) return p;
  return {
    UbicacionId: pick(p.UbicacionId, p.ubicacionId),
    UbicacionNombre: pick(p.UbicacionNombre, p.ubicacionNombre) ?? "",
    Precio: pick(p.Precio, p.precio) ?? 0,
  };
}

function normalizeTratamientoConPrecios(t) {
  if (!t) return t;
  return {
    Id: pick(t.Id, t.id),
    Codigo: pick(t.Codigo, t.codigo) ?? null,
    Nombre: pick(t.Nombre, t.nombre) ?? "",
    Descripcion: pick(t.Descripcion, t.descripcion) ?? null,
    Disabled: pick(t.Disabled, t.disabled) ?? false,
    Precios: Array.isArray(t.Precios ?? t.precios)
      ? (t.Precios ?? t.precios).map(normalizePrecioPorUbicacion)
      : [],
  };
}

function normalizeTratamiento(t) {
  if (!t) return t;
  return {
    Id: pick(t.Id, t.id),
    Codigo: pick(t.Codigo, t.codigo) ?? null,
    Nombre: pick(t.Nombre, t.nombre) ?? "",
    Descripcion: pick(t.Descripcion, t.descripcion) ?? null,
    Disabled: pick(t.Disabled, t.disabled) ?? false,
  };
}

export const getTratamientos = async () => {
  const data = await api.get("tratamiento/GetAll").then((r) => r.data);
  return Array.isArray(data) ? data.map(normalizeTratamiento) : [];
};

export const getTratamientoById = (id) =>
  api.get(`tratamiento/GetById/${id}`).then((r) => normalizeTratamiento(r.data));

// Devuelve el catálogo con la lista de precios anidada por ubicación.
// Es lo que consume la pestaña "Servicios" de Ajustes.
export const getTratamientosConPrecios = async () => {
  const data = await api.get("tratamiento/GetAllConPrecios").then((r) => r.data);
  return Array.isArray(data) ? data.map(normalizeTratamientoConPrecios) : [];
};

export const createTratamiento = (payload) =>
  api.post("tratamiento/Create", payload).then((r) => normalizeTratamiento(r.data));

export const updateTratamiento = (id, payload) =>
  api.put(`tratamiento/Update/${id}`, payload).then((r) => normalizeTratamiento(r.data));

export const deleteTratamiento = (id) =>
  api.delete(`tratamiento/Delete/${id}`).then((r) => r.data);

// Upsert de precio: crea o actualiza el TratamientoPrecio para la combinación
// (tratamientoId, ubicacionId). Body: { ubicacionId, precio }.
export const upsertPrecio = (tratamientoId, ubicacionId, precio) =>
  api
    .put(`tratamiento/${tratamientoId}/Precio`, { ubicacionId, precio })
    .then((r) => r.data);

export const deletePrecio = (tratamientoId, ubicacionId) =>
  api.delete(`tratamiento/${tratamientoId}/Precio/${ubicacionId}`).then((r) => r.data);
