import React, { useState } from "react";
import { Loader2, X } from "lucide-react";
import { formatApiError } from "../services/apiErrors";

const EMPTY = {
  Nombre: "",
  Apellido: "",
  Dni: "",
  Email: "",
  Celular: "",
  Telefono: "",
  FechaNacimiento: "",
  DomicilioCalle: "",
  DomicilioNumero: "",
  ProvinciaId: "",
  LocalidadId: "",
};

// Pasa de un Paciente (cualquier shape: PascalCase o camelCase) al form state
function toFormState(editing) {
  if (!editing) return EMPTY;
  const pick = (a, b) => a ?? b ?? "";
  const fecha = editing.FechaNacimiento ?? editing.fechaNacimiento ?? null;
  return {
    ...EMPTY,
    Nombre: pick(editing.Nombre, editing.nombre),
    Apellido: pick(editing.Apellido, editing.apellido),
    Dni: pick(editing.Dni, editing.dni),
    Email: pick(editing.Email, editing.email),
    Celular: pick(editing.Celular, editing.celular),
    Telefono: pick(editing.Telefono, editing.telefono),
    FechaNacimiento: fecha ? String(fecha).substring(0, 10) : "",
    DomicilioCalle: pick(editing.DomicilioCalle, editing.domicilioCalle),
    DomicilioNumero: pick(editing.DomicilioNumero, editing.domicilioNumero),
    ProvinciaId: pick(editing.ProvinciaId, editing.provinciaId),
    LocalidadId: pick(editing.LocalidadId, editing.localidadId),
  };
}

export default function AddPatientModal({ open, editing, onClose, onSave }) {
  // `key` fuerza a React a remontar el componente cuando cambia el paciente
  // a editar — sin useEffect, sin setState dentro de effect.
  return (
    <PatientForm
      key={open ? (editing?.Id ?? editing?.id ?? "new") : "closed"}
      open={open}
      editing={editing}
      onClose={onClose}
      onSave={onSave}
    />
  );
}

function PatientForm({ open, editing, onClose, onSave }) {
  const [form, setForm] = useState(() => toFormState(editing));
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  if (!open) return null;

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    // Limpia el error del campo apenas el usuario lo modifica
    if (fieldErrors[field]) {
      setFieldErrors((curr) => {
        const { [field]: _, ...rest } = curr;
        return rest;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setFieldErrors({});
    setSubmitting(true);
    try {
      await onSave(form);
      // Si onSave resuelve, la página cierra el modal (cambia editing/open)
    } catch (err) {
      const { message, fieldErrors: fe } = formatApiError(err);
      setErrorMsg(message);
      setFieldErrors(fe);
    } finally {
      setSubmitting(false);
    }
  };

  const hasError = (field) => Boolean(fieldErrors[field]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              {editing ? "Editar Paciente" : "Agregar Paciente"}
            </h2>
            <p className="text-sm text-slate-500">
              Completá los datos para {editing ? "actualizar" : "registrar"} al paciente
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
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
          <Field label="Nombre *" error={fieldErrors.Nombre}>
            <input required value={form.Nombre} onChange={handleChange("Nombre")} />
          </Field>
          <Field label="Apellido *" error={fieldErrors.Apellido}>
            <input required value={form.Apellido} onChange={handleChange("Apellido")} />
          </Field>
          <Field label="DNI *" error={fieldErrors.Dni}>
            <input required value={form.Dni} onChange={handleChange("Dni")} />
          </Field>
          <Field
            label="Fecha de Nacimiento *"
            error={fieldErrors.FechaNacimiento}
          >
            <input
              type="date"
              required
              value={form.FechaNacimiento}
              onChange={handleChange("FechaNacimiento")}
            />
          </Field>
          <Field label="Email" error={fieldErrors.Email}>
            <input type="email" value={form.Email} onChange={handleChange("Email")} />
          </Field>
          <Field label="Celular" error={fieldErrors.Celular}>
            <input value={form.Celular} onChange={handleChange("Celular")} />
          </Field>
          <Field label="Teléfono" error={fieldErrors.Telefono}>
            <input value={form.Telefono} onChange={handleChange("Telefono")} />
          </Field>
          <Field label="Domicilio (calle)" error={fieldErrors.DomicilioCalle}>
            <input
              value={form.DomicilioCalle}
              onChange={handleChange("DomicilioCalle")}
            />
          </Field>
          <Field label="Número" error={fieldErrors.DomicilioNumero}>
            <input
              type="number"
              value={form.DomicilioNumero}
              onChange={handleChange("DomicilioNumero")}
            />
          </Field>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting
              ? "Guardando..."
              : editing
              ? "Guardar cambios"
              : "Guardar paciente"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
      <span>{label}</span>
      {React.cloneElement(children, {
        "aria-invalid": error ? "true" : undefined,
        className: [
          "rounded-xl border bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition",
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
