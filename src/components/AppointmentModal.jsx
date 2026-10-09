import React, { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import {
  getEstadosTurno,
  getProfesionales,
  getTratamientos,
} from "../services/lookups";
import { getPatientById } from "../services/patients";
import { formatApiError } from "../services/apiErrors";
import { toastError } from "../utils/swal";
import { getDefaultPatient } from "../services/turnoFormat";
import { getUbicaciones } from "../services/ubicaciones";
import PatientSearchInput from "./PatientSearchInput";

const EMPTY = {
  PacienteId: "",
  ProfesionalId: "",
  Fecha: "",
  HoraInicio: "",
  HoraFin: "",
  TratamientoId: "",
  EstadoTurnoId: "",
  UbicacionId: "",
  Observacion: "",
};

// Helpers para mapear un turno del backend a los inputs del form.
const pick = (a, b) => a ?? b;
const toDateInput = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
const toTimeInput = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};
const fromAppointment = (a) => ({
  PacienteId: pick(a.PacienteId, a.pacienteId) ?? "",
  ProfesionalId: pick(a.ProfesionalId, a.profesionalId) ?? "",
  Fecha: toDateInput(pick(a.Fecha, a.fecha)),
  HoraInicio: toTimeInput(pick(a.HoraInicio, a.horaInicio)),
  HoraFin: toTimeInput(pick(a.HoraFin, a.horaFin)),
  TratamientoId: pick(a.TratamientoId, a.tratamientoId) ?? "",
  EstadoTurnoId: pick(a.EstadoTurnoId, a.estadoTurnoId) ?? "",
  UbicacionId: pick(a.UbicacionId, a.ubicacionId) ?? "",
  Observacion: pick(a.Observacion, a.observacion) ?? "",
});

export default function AppointmentModal({
  open,
  defaultDate,
  editingAppointment = null,
  onClose,
  onSubmit,
}) {
  const isEdit = Boolean(editingAppointment);
  const [form, setForm] = useState(EMPTY);
  const [defaultPatient, setDefaultPatient] = useState(null);
  const [profesionales, setProfesionales] = useState([]);
  const [tratamientos, setTratamientos] = useState([]);
  const [estados, setEstados] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!open) return;

    // Inicializa el form según sea creación o edición.
    if (editingAppointment) {
      setForm(fromAppointment(editingAppointment));
      // Si el back ya trae PacienteObj, lo usamos como defaultPatient y
      // nos ahorramos el fetch adicional a /paciente/GetById/{id}.
      setDefaultPatient(getDefaultPatient(editingAppointment));
    } else {
      setForm(EMPTY);
      setDefaultPatient(null);
      if (defaultDate) {
        setForm((f) => ({
          ...f,
          Fecha: defaultDate.toISOString().slice(0, 10),
        }));
      }
    }

    const pacienteId = editingAppointment
      ? pick(editingAppointment.PacienteId, editingAppointment.pacienteId)
      : null;
    const yaTienePacienteObj = Boolean(getDefaultPatient(editingAppointment));

    const load = async () => {
      setLoading(true);
      try {
        const tasks = [
          getProfesionales(),
          getTratamientos(),
          getEstadosTurno(),
          getUbicaciones(),
        ];
        // Solo fetch del paciente si NO vino embebido en el appointment.
        if (pacienteId && !yaTienePacienteObj) {
          tasks.push(getPatientById(pacienteId));
        }

        const settled = await Promise.allSettled(tasks);
        const [prof, tr, est, ub, paciente] = settled;

        if (prof.status === "fulfilled") setProfesionales(prof.value ?? []);
        else {
          console.error("[AppointmentModal] profesionales:", prof.reason);
          setProfesionales([]);
        }
        if (tr.status === "fulfilled") setTratamientos(tr.value ?? []);
        else {
          console.error("[AppointmentModal] tratamientos:", tr.reason);
          setTratamientos([]);
        }
        if (est.status === "fulfilled") setEstados(est.value ?? []);
        else {
          console.error("[AppointmentModal] estados:", est.reason);
          setEstados([]);
        }
        if (ub.status === "fulfilled") setUbicaciones(ub.value ?? []);
        else {
          console.error("[AppointmentModal] ubicaciones:", ub.reason);
          setUbicaciones([]);
        }
        if (paciente && paciente.status === "fulfilled") {
          setDefaultPatient(paciente.value ?? null);
        } else if (paciente) {
          console.error("[AppointmentModal] paciente:", paciente.reason);
        }
      } catch (err) {
        toastError(
          "No se pudieron cargar los datos auxiliares. " +
            formatApiError(err).message
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [open, defaultDate, editingAppointment]);

  if (!open) return null;

  const handleChange = (key) => (e) => {
    setForm((curr) => ({ ...curr, [key]: e.target.value }));
    if (fieldErrors[key]) {
      setFieldErrors((curr) => {
        const { [key]: _, ...rest } = curr;
        return rest;
      });
    }
  };

  const handlePatientChange = (id /*, patient */) => {
    setForm((curr) => ({ ...curr, PacienteId: id ? String(id) : "" }));
    if (fieldErrors.PacienteId) {
      setFieldErrors((curr) => {
        const { PacienteId: _, ...rest } = curr;
        return rest;
      });
    }
  };

  const validate = () => {
    const fe = {};
    if (!form.PacienteId) fe.PacienteId = "Seleccioná un paciente.";
    if (!form.ProfesionalId) fe.ProfesionalId = "Seleccioná un profesional.";
    if (!form.Fecha) fe.Fecha = "La fecha es obligatoria.";
    if (!form.HoraInicio) fe.HoraInicio = "La hora de inicio es obligatoria.";
    return fe;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setFieldErrors({});

    const clientErrors = validate();
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }

    setSubmitting(true);
    const editingId = editingAppointment
      ? pick(editingAppointment.Id, editingAppointment.id)
      : null;
    const payload = {
      ...form,
      PacienteId: Number(form.PacienteId),
      ProfesionalId: Number(form.ProfesionalId),
      TratamientoId: form.TratamientoId ? Number(form.TratamientoId) : null,
      EstadoTurnoId: form.EstadoTurnoId ? Number(form.EstadoTurnoId) : null,
      UbicacionId: form.UbicacionId ? Number(form.UbicacionId) : null,
      Fecha: `${form.Fecha}T00:00:00`,
      HoraInicio: `${form.Fecha}T${form.HoraInicio}:00`,
      HoraFin: form.HoraFin ? `${form.Fecha}T${form.HoraFin}:00` : null,
    };

    try {
      await onSubmit(payload, editingId);
    } catch (err) {
      const { message, fieldErrors: fe } = formatApiError(err);
      setErrorMsg(message);
      setFieldErrors(fe);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              {isEdit ? "Editar Turno" : "Nuevo Turno"}
            </h2>
            <p className="text-sm text-slate-500">
              {isEdit
                ? "Modificá los datos de la cita"
                : "Asigná una cita a un paciente"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        {errorMsg && Object.keys(fieldErrors).length === 0 && (
          <p
            role="alert"
            className="mb-3 text-sm text-red-600"
          >
            {errorMsg}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5 text-sm font-semibold text-slate-700 sm:col-span-2">
            <span>Paciente *</span>
            {isEdit ? (
              // En edición el paciente es read-only: no se puede cambiar
              // de paciente en un turno existente. Mostramos el nombre
              // que vino del back (defaultPatient) o, si no llegó, el id.
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700">
                <span className="font-medium">
                  {defaultPatient
                    ? `${defaultPatient.Apellido ?? ""}, ${defaultPatient.Nombre ?? ""}`.trim()
                    : `Paciente #${form.PacienteId}`}
                </span>
                {defaultPatient?.Dni && (
                  <span className="text-xs text-slate-500">
                    · DNI {defaultPatient.Dni}
                  </span>
                )}
                <span className="ml-auto text-[11px] uppercase tracking-wider text-slate-400">
                  No editable
                </span>
              </div>
            ) : (
              <PatientSearchInput
                value={form.PacienteId}
                onChange={handlePatientChange}
                error={fieldErrors.PacienteId}
                placeholder="Buscar paciente por nombre o DNI..."
                autoFocus
                defaultPatient={defaultPatient}
              />
            )}
          </div>
          <div className="grid gap-1">
            <SelectField
              label="Profesional *"
              error={fieldErrors.ProfesionalId}
              value={form.ProfesionalId}
              onChange={handleChange("ProfesionalId")}
              options={profesionales.map((p) => ({
                value: p.Id,
                label: `${p.Apellido ?? ""} ${p.Nombre ?? ""}`.trim(),
              }))}
            />
            {!loading && profesionales.length === 0 && (
              <p className="text-xs text-amber-700">
                ⚠ No se cargaron profesionales. Revisá la consola del navegador
                (F12) para ver el error del API.
              </p>
            )}
          </div>

          <Field label="Fecha *" error={fieldErrors.Fecha}>
            <input
              type="date"
              required
              value={form.Fecha}
              onChange={handleChange("Fecha")}
            />
          </Field>
          <Field label="Hora inicio *" error={fieldErrors.HoraInicio}>
            <input
              type="time"
              required
              value={form.HoraInicio}
              onChange={handleChange("HoraInicio")}
            />
          </Field>

          <Field label="Hora fin" error={fieldErrors.HoraFin}>
            <input
              type="time"
              value={form.HoraFin}
              onChange={handleChange("HoraFin")}
            />
          </Field>

          <div className="grid gap-1">
            <SelectField
              label="Tratamiento"
              error={fieldErrors.TratamientoId}
              value={form.TratamientoId}
              onChange={handleChange("TratamientoId")}
              options={tratamientos.map((t) => ({
                value: t.Id,
                label: t.Nombre ?? t.Descripcion,
              }))}
            />
            {!loading && tratamientos.length === 0 && (
              <p className="text-xs text-amber-700">
                ⚠ No se cargaron tratamientos. Revisá la consola (F12).
              </p>
            )}
          </div>

          <div className="grid gap-1">
            <SelectField
              label="Ubicación"
              error={fieldErrors.UbicacionId}
              value={form.UbicacionId}
              onChange={handleChange("UbicacionId")}
              options={ubicaciones.map((u) => ({
                value: u.Id ?? u.id,
                label: u.Nombre ?? u.nombre,
              }))}
            />
            {!loading && ubicaciones.length === 0 && (
              <p className="text-xs text-slate-400">
                Sin ubicaciones cargadas. Cargá una en Ajustes → Ubicaciones.
              </p>
            )}
          </div>

          <div className="grid gap-1">
            <SelectField
              label="Estado"
              error={fieldErrors.EstadoTurnoId}
              value={form.EstadoTurnoId}
              onChange={handleChange("EstadoTurnoId")}
              options={estados.map((e) => ({
                value: e.Id,
                label: e.Nombre ?? e.Descripcion,
              }))}
              autoFocus={isEdit}
            />
            {!loading && estados.length === 0 && (
              <p className="text-xs text-amber-700">
                ⚠ No se cargaron estados. Revisá la consola (F12).
              </p>
            )}
          </div>
        </div>

        <Field
          label="Observación"
          error={fieldErrors.Observacion}
          className="mt-4"
        >
          <textarea
            rows={2}
            value={form.Observacion}
            onChange={handleChange("Observacion")}
          />
        </Field>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting || loading}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting
              ? "Guardando..."
              : isEdit
              ? "Guardar cambios"
              : "Guardar turno"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, error, children, className = "" }) {
  return (
    <label
      className={`grid gap-1.5 text-sm font-semibold text-slate-700 ${className}`}
    >
      <span>{label}</span>
      {React.cloneElement(children, {
        "aria-invalid": error ? "true" : undefined,
        className: [
          "w-full rounded-xl border bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition",
          error
            ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
            : "border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100",
        ].join(" "),
      })}
      {error && (
        <span className="text-xs font-normal text-red-600">{error}</span>
      )}
    </label>
  );
}

function SelectField({ label, value, onChange, options, error, autoFocus = false }) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
      <span>{label}</span>
      <select
        value={value}
        onChange={onChange}
        autoFocus={autoFocus}
        aria-invalid={error ? "true" : undefined}
        className={[
          "rounded-xl border bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition",
          error
            ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
            : "border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100",
        ].join(" ")}
      >
        <option value="">— Seleccionar —</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && (
        <span className="text-xs font-normal text-red-600">{error}</span>
      )}
    </label>
  );
}
