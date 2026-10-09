import { api } from "./api";

// Endpoints del OdontoSoft.API:
// GET    /api/periodontograma/GetByHistoriaClinica/{hcId}  → última evaluación con métricas
// GET    /api/periodontograma/GetById/{id}                  → con piezas
// POST   /api/periodontograma/Create
// PUT    /api/periodontograma/Update/{id}                   → reemplaza piezas
// GET    /api/periodontograma/GetMetricas/{id}

function normalizeMetricas(m) {
  if (!m) return null;
  return {
    BopPorcentaje: m.BopPorcentaje ?? m.bopPorcentaje ?? 0,
    PlacaPorcentaje: m.PlacaPorcentaje ?? m.placaPorcentaje ?? 0,
    DientesPresentes: m.DientesPresentes ?? m.dientesPresentes ?? 0,
    DientesAusentes: m.DientesAusentes ?? m.dientesAusentes ?? 0,
  };
}

function normalizePieza(p) {
  if (!p) return p;
  return {
    Id: p.Id ?? p.id ?? 0,
    PeriodontogramaId: p.PeriodontogramaId ?? p.periodontogramaId ?? 0,
    NumeroPieza: p.NumeroPieza ?? p.numeroPieza ?? 0,
    Estado: p.Estado ?? p.estado ?? null,
    Sangrado: !!(p.Sangrado ?? p.sangrado),
    Supuracion: !!(p.Supuracion ?? p.supuracion),
    Placa: !!(p.Placa ?? p.placa),
    BolsaPeriodontal: p.BolsaPeriodontal ?? p.bolsaPeriodontal ?? null,
    Recesion: p.Recesion ?? p.recesion ?? null,
    Observacion: p.Observacion ?? p.observacion ?? null,
  };
}

function normalizePeriodontograma(p) {
  if (!p) return p;
  return {
    Id: p.Id ?? p.id ?? 0,
    HistoriaClinicaId: p.HistoriaClinicaId ?? p.historiaClinicaId ?? 0,
    FechaRegistro: p.FechaRegistro ?? p.fechaRegistro ?? null,
    Observaciones: p.Observaciones ?? p.observaciones ?? null,
    Piezas: (p.Piezas ?? p.piezas ?? []).map(normalizePieza),
    Metricas: normalizeMetricas(p.Metricas ?? p.metricas),
  };
}

async function safeGet(url) {
  try {
    const res = await api.get(url);
    return res.data;
  } catch (err) {
    if (err.response?.status === 404) return null;
    throw err;
  }
}

export const getPeriodontogramaByHistoriaClinica = async (hcId) => {
  const data = await safeGet(`periodontograma/GetByHistoriaClinica/${hcId}`);
  return data ? normalizePeriodontograma(data) : null;
};

export const getPeriodontogramaById = async (id) => {
  const data = await safeGet(`periodontograma/GetById/${id}`);
  return data ? normalizePeriodontograma(data) : null;
};

export const guardarPeriodontograma = (vm) =>
  api
    .post("periodontograma/Create", vm)
    .then((r) => normalizePeriodontograma(r.data));

export const actualizarPeriodontograma = (id, vm) =>
  api
    .put(`periodontograma/Update/${id}`, vm)
    .then((r) => normalizePeriodontograma(r.data));

export const getMetricas = async (id) => {
  const data = await safeGet(`periodontograma/GetMetricas/${id}`);
  return data ? normalizeMetricas(data) : null;
};
