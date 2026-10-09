import { api } from "./api";

// Endpoints del OdontoSoft.API:
// GET    /api/paciente/GetAll                  → PagedResult<Paciente>
// GET    /api/paciente/GetById/{id}            → un paciente
// POST   /api/paciente/Create                  → crear (body: PacienteViewModel)
// PUT    /api/paciente/Update/{id}             → actualizar
// DELETE /api/paciente/Delete/{id}             → baja
// GET    /api/paciente/GetAllByNombreDni?searchText=…  → búsqueda

// Devuelve el array de pacientes (extrae .items del PagedResult).
// Si quisieras metadata de paginación, podés usar getPagedPatients.
const extractItems = (response) => {
  if (Array.isArray(response)) return response;
  return response?.items ?? [];
};

// El back ahora devuelve camelCase; los componentes del front leen PascalCase
// (Id, Nombre, Apellido, Dni, ...). Normalizamos acá para no poner fallbacks
// en cada componente.
function normalizePaciente(p) {
  if (!p) return p;
  return {
    Id: p.Id ?? p.id,
    Nombre: p.Nombre ?? p.nombre,
    Apellido: p.Apellido ?? p.apellido,
    Dni: p.Dni ?? p.dni,
    Email: p.Email ?? p.email ?? null,
    Celular: p.Celular ?? p.celular ?? null,
    Telefono: p.Telefono ?? p.telefono ?? null,
    FechaNacimiento: p.FechaNacimiento ?? p.fechaNacimiento ?? null,
    DomicilioCalle: p.DomicilioCalle ?? p.domicilioCalle ?? null,
    DomicilioNumero: p.DomicilioNumero ?? p.domicilioNumero ?? null,
    ProvinciaId: p.ProvinciaId ?? p.provinciaId ?? null,
    LocalidadId: p.LocalidadId ?? p.localidadId ?? null,
    Provincia: p.Provincia ?? p.provincia ?? null,
    Localidad: p.Localidad ?? p.localidad ?? null,
  };
}

export const getPatients = async () => {
  const data = await api
    .get("paciente/GetAll", { params: { page: 1, pageSize: 200 } })
    .then((r) => r.data);
  return extractItems(data).map(normalizePaciente);
};

// Devuelve el PagedResult completo (por si necesitás total/pageSize/etc.)
export const getPagedPatients = (page = 1, pageSize = 50, searchText = "") =>
  api
    .get("paciente/GetAll", { params: { page, pageSize, searchText } })
    .then((r) => r.data);

export const getPatientById = async (id) => {
  const data = await api.get(`paciente/GetById/${id}`).then((r) => r.data);
  return normalizePaciente(data);
};

export const searchPatients = (searchText) =>
  api
    .get("paciente/GetAllByNombreDni", { params: { searchText } })
    .then((r) => r.data);

export const createPatient = (payload) =>
  api.post("paciente/Create", payload).then((r) => normalizePaciente(r.data));

export const updatePatient = (id, payload) =>
  api.put(`paciente/Update/${id}`, payload).then((r) => normalizePaciente(r.data));

export const deletePatient = (id) =>
  api.delete(`paciente/Delete/${id}`).then((r) => r.data);
