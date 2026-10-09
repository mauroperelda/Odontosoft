import { api } from "./api";

// LocalidadController
// GET    /api/localidad/GetAll
// GET    /api/localidad/GetById/{id}
// GET    /api/localidad/GetByProvincia/{provinciaId}
// POST   /api/localidad/Create
// PUT    /api/localidad/Update/{id}
// DELETE /api/localidad/Delete/{id}
// GET    /api/localidad/SincronizarLocalidades

export const getLocalidades = (provinciaId) => {
  const url = provinciaId
    ? `localidad/GetByProvincia/${provinciaId}`
    : "localidad/GetAll";
  return api.get(url).then((r) => r.data);
};

export const getLocalidadById = (id) =>
  api.get(`localidad/GetById/${id}`).then((r) => r.data);

// La API actual no tiene un modelo "Consultorio" / "Sucursal".
// Devolvemos lista vacía para que la UI muestre el placeholder.
// TODO: cuando exista SucursalController, mapear aquí.
export const getLocations = async () => [];

export const createLocalidad = (payload) =>
  api.post("localidad/Create", payload).then((r) => r.data);

export const updateLocalidad = (id, payload) =>
  api.put(`localidad/Update/${id}`, payload).then((r) => r.data);

export const deleteLocalidad = (id) =>
  api.delete(`localidad/Delete/${id}`).then((r) => r.data);
