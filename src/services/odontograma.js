import { api } from "./api";

// Endpoints del OdontoSoft.API:
// GET    /api/odontogramapieza/GetByHistoriaClinica/{hcId}  → OdontogramaPieza[]
// POST   /api/odontogramapieza/Create                       → upsert por (hcId, NumeroPieza)
// PUT    /api/odontogramapieza/Update/{id}
// DELETE /api/odontogramapieza/Delete/{id}

function normalizePieza(p) {
  if (!p) return p;
  return {
    Id: p.Id ?? p.id ?? 0,
    HistoriaClinicaId: p.HistoriaClinicaId ?? p.historiaClinicaId ?? 0,
    NumeroPieza: p.NumeroPieza ?? p.numeroPieza ?? 0,
    Estado: p.Estado ?? p.estado ?? null,
    Observacion: p.Observacion ?? p.observacion ?? null,
  };
}

export const getPiezasByHistoriaClinica = async (hcId) => {
  const { data } = await api.get(`odontogramapieza/GetByHistoriaClinica/${hcId}`);
  return (data ?? []).map(normalizePieza);
};

// El back hace upsert por (HistoriaClinicaId, NumeroPieza) así que sirve
// el mismo método para crear y actualizar desde el front.
export const guardarPieza = (piezaVm) =>
  api
    .post("odontogramapieza/Create", piezaVm)
    .then((r) => normalizePieza(r.data));

export const eliminarPieza = (piezaId) =>
  api.delete(`odontogramapieza/Delete/${piezaId}`).then((r) => r.data);
