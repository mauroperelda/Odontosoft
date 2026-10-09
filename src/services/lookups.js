import { api } from "./api";

// Endpoints auxiliares para los combos/formularios
// GET /api/profesional/GetAll
// GET /api/tratamiento/GetAll
// GET /api/estadoTurno/GetAll
// GET /api/provincia/GetAll
// GET /api/localidad/GetAll

const listAll = (endpoint) => api.get(endpoint).then((r) => r.data);

// El API serializa en camelCase (Program.cs → JsonNamingPolicy.CamelCase).
// Normalizamos a PascalCase (Id, Nombre, Apellido) para que los componentes
// no tengan que escribir `p.Apellido ?? p.apellido` en cada lugar.
const pick = (a, b) => a ?? b;

const normalizeProfesional = (p) => ({
  Id: pick(p.Id, p.id),
  Nombre: pick(p.Nombre, p.nombre),
  Apellido: pick(p.Apellido, p.apellido),
  Dni: pick(p.Dni, p.dni),
});

const normalizeTratamiento = (t) => ({
  Id: pick(t.Id, t.id),
  Nombre: pick(t.Nombre, t.nombre),
  Descripcion: pick(t.Descripcion, t.descripcion),
});

const normalizeEstadoTurno = (e) => ({
  Id: pick(e.Id, e.id),
  Nombre: pick(e.Nombre, e.nombre),
  ColorHex: pick(e.ColorHex, e.colorHex),
});

const normalizeProvincia = (p) => ({
  Id: pick(p.Id, p.id),
  Nombre: pick(p.Nombre, p.nombre),
});

const normalizeLocalidad = (l) => ({
  Id: pick(l.Id, l.id),
  Nombre: pick(l.Nombre, l.nombre),
  ProvinciaId: pick(l.ProvinciaId, l.provinciaId),
});

export const getProfesionales = async () => {
  const data = await listAll("profesional/GetAll");
  return Array.isArray(data) ? data.map(normalizeProfesional) : [];
};

export const getTratamientos = async () => {
  const data = await listAll("tratamiento/GetAll");
  return Array.isArray(data) ? data.map(normalizeTratamiento) : [];
};

export const getEstadosTurno = async () => {
  const data = await listAll("estadoTurno/GetAll");
  return Array.isArray(data) ? data.map(normalizeEstadoTurno) : [];
};

export const getProvincias = async () => {
  const data = await listAll("provincia/GetAll");
  return Array.isArray(data) ? data.map(normalizeProvincia) : [];
};

export const getLocalidades = async (provinciaId) => {
  const data = await api
    .get("localidad/GetAll", { params: provinciaId ? { provinciaId } : {} })
    .then((r) => r.data);
  return Array.isArray(data) ? data.map(normalizeLocalidad) : [];
};
