import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { formatApiError } from "../services/apiErrors";
import RolesGroupEditor from "./RolesGroupEditor";

const EMPTY = {
  Username: "",
  Name: "",
  LastName: "",
  Email: "",
  Password: "",
  IsAdministrator: false,
  IsSuperUser: false,
  Activated: true,
  Disabled: false,
  ChangePasswordRequired: false,
  RolIds: [],
};

function toFormState(editing) {
  if (!editing) return { ...EMPTY, Password: "" };
  return {
    Username: editing.Username ?? "",
    Name: editing.Name ?? "",
    LastName: editing.LastName ?? "",
    Email: editing.Email ?? "",
    Password: "", // nunca mostramos el hash en el form
    IsAdministrator: !!editing.IsAdministrator,
    IsSuperUser: !!editing.IsSuperUser,
    Activated: editing.Activated ?? true,
    Disabled: !!editing.Disabled,
    ChangePasswordRequired: !!editing.ChangePasswordRequired,
    RolIds: Array.isArray(editing.RolIds) ? [...editing.RolIds] : [],
  };
}

export default function UserFormModal({
  open,
  editing,
  onClose,
  onSave,
  roles,
}) {
  // `key` fuerza remontaje al cambiar de usuario o al cerrar/abrir
  return (
    <UserForm
      key={open ? (editing?.Id ?? "new") : "closed"}
      open={open}
      editing={editing}
      onClose={onClose}
      onSave={onSave}
      roles={roles}
    />
  );
}

function UserForm({ open, editing, onClose, onSave, roles }) {
  const [form, setForm] = useState(() => toFormState(editing));
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

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
    if (!form.Username?.trim()) errors.Username = "El usuario es obligatorio.";
    if (!form.Name?.trim()) errors.Name = "El nombre es obligatorio.";
    if (!form.LastName?.trim()) errors.LastName = "El apellido es obligatorio.";
    if (!form.Email?.trim()) errors.Email = "El email es obligatorio.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.Email.trim()))
      errors.Email = "Email inválido.";
    if (!isEdit) {
      if (!form.Password || form.Password.length < 8)
        errors.Password = "La contraseña debe tener al menos 8 caracteres.";
    } else if (form.Password && form.Password.length < 8) {
      errors.Password = "Si la cambiás, debe tener al menos 8 caracteres.";
    }
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
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              {isEdit ? "Editar usuario" : "Nuevo usuario"}
            </h2>
            <p className="text-sm text-slate-500">
              {isEdit
                ? "Modificá los datos del usuario y sus roles"
                : "Cargá los datos del nuevo usuario y asignale roles"}
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
            label="Usuario *"
            value={form.Username}
            onChange={(v) => setField("Username", v)}
            error={fieldErrors.Username}
            autoComplete="off"
          />
          <Field
            label="Email *"
            type="email"
            value={form.Email}
            onChange={(v) => setField("Email", v)}
            error={fieldErrors.Email}
            autoComplete="off"
          />
          <Field
            label="Nombre *"
            value={form.Name}
            onChange={(v) => setField("Name", v)}
            error={fieldErrors.Name}
          />
          <Field
            label="Apellido *"
            value={form.LastName}
            onChange={(v) => setField("LastName", v)}
            error={fieldErrors.LastName}
          />
          <Field
            label={isEdit ? "Nueva contraseña (vacío = no cambiar)" : "Contraseña *"}
            type="password"
            value={form.Password}
            onChange={(v) => setField("Password", v)}
            error={fieldErrors.Password}
            autoComplete="new-password"
            placeholder={isEdit ? "Sin cambios" : ""}
          />
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <Checkbox
            label="Es administrador (flag legacy)"
            checked={form.IsAdministrator}
            onChange={(v) => setField("IsAdministrator", v)}
            disabled={submitting}
          />
          <Checkbox
            label="Es superusuario"
            checked={form.IsSuperUser}
            onChange={(v) => setField("IsSuperUser", v)}
            disabled={submitting}
          />
          <Checkbox
            label="Cuenta activada"
            checked={form.Activated}
            onChange={(v) => setField("Activated", v)}
            disabled={submitting}
          />
          <Checkbox
            label="Cuenta deshabilitada"
            checked={form.Disabled}
            onChange={(v) => setField("Disabled", v)}
            disabled={submitting}
          />
          <Checkbox
            label="Debe cambiar contraseña en el próximo login"
            checked={form.ChangePasswordRequired}
            onChange={(v) => setField("ChangePasswordRequired", v)}
            disabled={submitting}
          />
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[13px] font-medium text-slate-700">
              Roles asignados
              <span className="ml-2 text-[11px] text-slate-400 font-normal">
                ({form.RolIds.length} seleccionados)
              </span>
            </p>
          </div>
          <p className="text-[11px] text-slate-400 mb-2">
            El flag "Es administrador" arriba es legacy y coexiste con el rol
            "admin" del sistema RBAC. Podés gestionarlos en paralelo.
          </p>
          <RolesGroupEditor
            roles={roles}
            value={form.RolIds}
            onChange={(ids) => setField("RolIds", ids)}
            disabled={submitting}
          />
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
              : isEdit
              ? "Guardar cambios"
              : "Crear usuario"}
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

function Checkbox({ label, checked, onChange, disabled }) {
  return (
    <label
      className={`flex items-center gap-2 text-[13px] text-slate-700 ${
        disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      <input
        type="checkbox"
        checked={!!checked}
        onChange={(e) => onChange?.(e.target.checked)}
        disabled={disabled}
        className="w-4 h-4 accent-violet-600 cursor-pointer disabled:cursor-not-allowed"
      />
      {label}
    </label>
  );
}
