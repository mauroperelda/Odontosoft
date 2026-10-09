import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { formatApiError } from "../services/apiErrors";
import PermissionsGroupEditor from "./PermissionsGroupEditor";
import { getPermisos } from "../services/permisos";

const EMPTY = {
  Codigo: "",
  Nombre: "",
  Descripcion: "",
  PermisoIds: [],
};

function toFormState(editing) {
  if (!editing) return { ...EMPTY };
  // Si el back ya trajo los permisos (caso GetById), hidratar desde ahí.
  // Si no, dejar PermisoIds vacío (será reemplazado en useEffect al editar).
  if (Array.isArray(editing.Permisos) && editing.Permisos.length > 0) {
    return {
      Codigo: editing.Codigo ?? "",
      Nombre: editing.Nombre ?? "",
      Descripcion: editing.Descripcion ?? "",
      PermisoIds: editing.Permisos.map((p) => Number(p.Id)),
    };
  }
  return {
    Codigo: editing.Codigo ?? "",
    Nombre: editing.Nombre ?? "",
    Descripcion: editing.Descripcion ?? "",
    PermisoIds: Array.isArray(editing.PermisoIds) ? [...editing.PermisoIds] : [],
  };
}

export default function RoleFormModal({ open, editing, onClose, onSave }) {
  return (
    <RoleForm
      key={open ? (editing?.Id ?? "new") : "closed"}
      open={open}
      editing={editing}
      onClose={onClose}
      onSave={onSave}
    />
  );
}

function RoleForm({ open, editing, onClose, onSave }) {
  const [form, setForm] = useState(() => toFormState(editing));
  const [permisos, setPermisos] = useState([]);
  const [loadingPermisos, setLoadingPermisos] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Cargar catálogo de permisos al abrir. Una sola llamada.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoadingPermisos(true);
    getPermisos({ pageSize: 200 })
      .then((data) => {
        if (!cancelled) setPermisos(data);
      })
      .catch(() => {
        if (!cancelled) setPermisos([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingPermisos(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  if (!open) return null;
  const isEdit = Boolean(editing?.Id);

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors((curr) => {
        const { [key]: _drop, ...rest } = curr;
        return rest;
      });
    }
  };

  const validate = () => {
    const errors = {};
    if (!form.Codigo?.trim()) errors.Codigo = "El código es obligatorio.";
    if (!form.Nombre?.trim()) errors.Nombre = "El nombre es obligatorio.";
    return errors;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    const localErrors = validate();
    if (Object.keys(localErrors).length > 0) {
      setFieldErrors(localErrors);
      setErrorMsg("");
      return;
    }
    setErrorMsg("");
    setFieldErrors({});
    setSubmitting(true);
    try {
      await onSave(form);
    } catch (err) {
      const { message, fieldErrors: fe } = formatApiError(err);
      setErrorMsg(message);
      setFieldErrors(fe || {});
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              {isEdit ? "Editar rol" : "Nuevo rol"}
            </h2>
            <p className="text-sm text-slate-500">
              {isEdit
                ? "Modificá los datos del rol y los permisos que tiene"
                : "Creá un rol nuevo y asignale permisos"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        {errorMsg && Object.keys(fieldErrors).length === 0 && (
          <p role="alert" className="mb-3 text-sm text-red-600">
            {errorMsg}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Código *"
            value={form.Codigo}
            onChange={(v) => setField("Codigo", v)}
            error={fieldErrors.Codigo}
            placeholder="Ej: asistente"
            autoComplete="off"
          />
          <Field
            label="Nombre *"
            value={form.Nombre}
            onChange={(v) => setField("Nombre", v)}
            error={fieldErrors.Nombre}
            placeholder="Ej: Asistente"
          />
        </div>

        <div className="mt-4">
          <Field
            label="Descripción"
            value={form.Descripcion}
            onChange={(v) => setField("Descripcion", v)}
            error={fieldErrors.Descripcion}
            placeholder="Opcional. Una línea explicando el alcance del rol."
          />
        </div>

        <div className="mt-5">
          {loadingPermisos ? (
            <p className="text-[12px] text-slate-400 bg-slate-50 rounded-lg px-3 py-3 text-center">
              Cargando permisos...
            </p>
          ) : (
            <PermissionsGroupEditor
              permisos={permisos}
              value={form.PermisoIds}
              onChange={(ids) => setField("PermisoIds", ids)}
              disabled={submitting}
            />
          )}
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
            disabled={submitting || loadingPermisos}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear rol"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, type = "text", value, onChange, error, autoComplete, placeholder }) {
  const inputClass = [
    "rounded-xl border bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition",
    error
      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
      : "border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100",
  ].join(" ");
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
      <span>{label}</span>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={error ? "true" : undefined}
        className={inputClass}
      />
      {error && <span className="text-xs font-normal text-red-600">{error}</span>}
    </label>
  );
}
