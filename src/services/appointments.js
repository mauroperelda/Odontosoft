import { api } from "./api";

// Endpoints del OdontoSoft.API:
// GET    /api/turno/GetAll                     → todos los turnos
// GET    /api/turno/GetById/{id}               → un turno
// GET    /api/turno/GetCalendario              → turnos con datos expandidos (paciente, profesional, color)
// POST   /api/turno/Create                     → crear (body: TurnoViewModel)
// PUT    /api/turno/Update/{id}                → actualizar
// DELETE /api/turno/Delete/{id}                → baja

export const getAppointments = () =>
  api.get("turno/GetAll").then((r) => r.data);

export const getAppointmentById = (id) =>
  api.get(`turno/GetById/${id}`).then((r) => r.data);

export const getAppointmentsCalendar = () =>
  api.get("turno/GetCalendario").then((r) => r.data);

export const createAppointment = (payload) =>
  api.post("turno/Create", payload).then((r) => r.data);

export const updateAppointment = (id, payload) =>
  api.put(`turno/Update/${id}`, payload).then((r) => r.data);

export const deleteAppointment = (id) =>
  api.delete(`turno/Delete/${id}`).then((r) => r.data);
