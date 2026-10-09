import { api } from "./api";

// El OdontoSoft.API no expone un endpoint agregado de Dashboard.
// Armamos el summary a partir de los endpoints existentes.
export const getDashboardSummary = async () => {
  const [turnos, pacientes, pagos] = await Promise.allSettled([
    api.get("turno/GetAll").then((r) => r.data),
    api.get("paciente/GetAll").then((r) => r.data),
    api.get("pago/GetAll").then((r) => r.data),
  ]);

  const safe = (r) => (r.status === "fulfilled" ? r.value : []);
  const totalTurnos = safe(turnos).length;
  const totalPacientes = safe(pacientes).length;
  const totalPagos = safe(pagos);

  return {
    turnosProgramados: totalTurnos,
    turnosCompletados: totalPagos.length, // aproximación
    pacientesHoy: totalPacientes,
    facturadoHoy: totalPagos.reduce((acc, p) => acc + (p.Monto ?? p.monto ?? 0), 0),
  };
};
