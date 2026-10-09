import { api } from "./api";

// Endpoints del OdontoSoft.API:
// GET    /api/historiaclinica/GetByPaciente/{pacienteId}   → HistoriaClinicaViewModel (o 404)
// GET    /api/historiaclinica/GetById/{id}                 → HistoriaClinicaViewModel
// POST   /api/historiaclinica/Create                       → body: HistoriaClinicaViewModel
// PUT    /api/historiaclinica/Update/{id}                  → body: HistoriaClinicaViewModel

// Devuelve 404 como null en vez de tirar excepción, para que la UI pueda
// mostrar el empty-state con CTA "Inicializar historia clínica".
async function safeGet(url) {
  try {
    const res = await api.get(url);
    return res.data;
  } catch (err) {
    if (err.response?.status === 404) return null;
    throw err;
  }
}

function normalizeOdontogramaPieza(p) {
  if (!p) return p;
  return {
    Id: p.Id ?? p.id ?? 0,
    HistoriaClinicaId: p.HistoriaClinicaId ?? p.historiaClinicaId ?? 0,
    NumeroPieza: p.NumeroPieza ?? p.numeroPieza ?? 0,
    Estado: p.Estado ?? p.estado ?? null,
    Observacion: p.Observacion ?? p.observacion ?? null,
  };
}

function normalizeFichaTratamiento(f) {
  if (!f) return f;
  return {
    Id: f.Id ?? f.id ?? 0,
    HistoriaClinicaId: f.HistoriaClinicaId ?? f.historiaClinicaId ?? 0,
    TratamientoId: f.TratamientoId ?? f.tratamientoId ?? null,
    TratamientoNombre: f.TratamientoNombre ?? f.tratamientoNombre ?? null,
    Fecha: f.Fecha ?? f.fecha ?? null,
    Observaciones: f.Observaciones ?? f.observaciones ?? null,
    Estado: f.Estado ?? f.estado ?? null,
    Diente: f.Diente ?? f.diente ?? null,
  };
}

function normalizeHistoriaClinica(h) {
  if (!h) return h;
  return {
    Id: h.Id ?? h.id ?? 0,
    PacienteId: h.PacienteId ?? h.pacienteId ?? 0,
    Paciente: h.Paciente ?? h.paciente ?? null,
    Alergias: h.Alergias ?? h.alergias ?? null,
    Medicamentos: h.Medicamentos ?? h.medicamentos ?? null,
    AntecedentesMedicos: h.AntecedentesMedicos ?? h.antecedentesMedicos ?? null,
    Observaciones: h.Observaciones ?? h.observaciones ?? null,
    Piezas: (h.Piezas ?? h.piezas ?? []).map(normalizeOdontogramaPieza),
    Fichas: (h.Fichas ?? h.fichas ?? []).map(normalizeFichaTratamiento),
  };
}

// Devuelve null si el paciente todavía no tiene HC (el front muestra CTA
// "Inicializar historia clínica" en ese caso).
export const getHistoriaClinicaByPaciente = async (pacienteId) => {
  const data = await safeGet(`historiaclinica/GetByPaciente/${pacienteId}`);
  return data ? normalizeHistoriaClinica(data) : null;
};

export const getHistoriaClinicaById = async (hcId) => {
  const data = await safeGet(`historiaclinica/GetById/${hcId}`);
  return data ? normalizeHistoriaClinica(data) : null;
};

export const createHistoriaClinica = (payload) =>
  api
    .post("historiaclinica/Create", payload)
    .then((r) => normalizeHistoriaClinica(r.data));

export const updateHistoriaClinica = (hcId, payload) =>
  api
    .put(`historiaclinica/Update/${hcId}`, payload)
    .then((r) => normalizeHistoriaClinica(r.data));
