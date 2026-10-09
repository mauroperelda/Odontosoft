import { useEffect, useState } from "react";
import MainLayout from "../layout/MainLayout";
import { MapPin, Plus, Loader2, X, Tag, DollarSign, Edit, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import {
  getUbicaciones,
  createUbicacion,
  updateUbicacion,
  deleteUbicacion,
} from "../services/ubicaciones";
import {
  getTratamientosConPrecios,
  createTratamiento,
  upsertPrecio,
  deletePrecio,
} from "../services/tratamientos";
import { formatApiError } from "../services/apiErrors";

// ── Componentes de Modal ──────────────────────────────

function Modal({ open, onClose, title, subtitle, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer"
        >
          <X size={18} />
        </button>
        <h2 className="text-[17px] font-semibold text-slate-800 mb-1">{title}</h2>
        {subtitle && <p className="text-[13px] text-slate-400 mb-5">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}

function Field({ label, required, value, onChange, placeholder, type = "text", half, error }) {
  return (
    <div className={half ? "flex-1" : "w-full"}>
      <label className="block text-[13px] font-medium text-slate-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className={`w-full border rounded-lg px-3 py-2 text-[13px] text-slate-700 placeholder-gray-300 outline-none transition focus:ring-2 ${
          error
            ? "border-red-400 focus:border-red-400 focus:ring-red-50"
            : "border-gray-200 focus:border-indigo-400 focus:ring-indigo-50"
        }`}
      />
      {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
    </div>
  );
}

// ── Modal Ubicación (crear / editar) ──────────────────

const EMPTY_UBICACION = {
  Nombre: "",
  Direccion: "",
  Ciudad: "",
  Provincia: "",
  CodigoPostal: "",
  Telefono: "",
  Email: "",
};

function ModalUbicacion({ open, onClose, onSaved, initial }) {
  const [form, setForm] = useState(EMPTY_UBICACION);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...EMPTY_UBICACION, ...initial } : EMPTY_UBICACION);
      setErrors({});
    }
  }, [open, initial]);

  const isEdit = Boolean(initial?.Id);

  const setField = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setSaving(true);
    setErrors({});
    try {
      const payload = {
        Nombre: form.Nombre?.trim(),
        Direccion: form.Direccion?.trim(),
        Ciudad: form.Ciudad?.trim(),
        Provincia: form.Provincia?.trim() || null,
        CodigoPostal: form.CodigoPostal?.trim() || null,
        Telefono: form.Telefono?.trim() || null,
        Email: form.Email?.trim() || null,
      };
      if (isEdit) {
        await updateUbicacion(initial.Id, payload);
      } else {
        await createUbicacion(payload);
      }
      await onSaved?.();
      onClose();
    } catch (err) {
      const { message, fieldErrors } = formatApiError(err);
      setErrors(fieldErrors);
      Swal.fire({
        icon: "error",
        title: "No se pudo guardar",
        text: message,
        customClass: {
          popup: "rounded-2xl",
          confirmButton:
            "rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700",
        },
        buttonsStyling: false,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Editar ubicación" : "Nueva Ubicación"}
      subtitle={isEdit ? "Modificá los datos de la ubicación" : "Agrega una nueva ubicación a tu consultorio"}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Field
          label="Nombre"
          required
          placeholder="Ej: Consultorio Principal"
          value={form.Nombre}
          onChange={setField("Nombre")}
          error={errors.Nombre}
        />
        <Field
          label="Dirección"
          required
          placeholder="Ej: Av. Corrientes 1234"
          value={form.Direccion}
          onChange={setField("Direccion")}
          error={errors.Direccion}
        />
        <div className="flex gap-3">
          <Field
            label="Ciudad"
            required
            placeholder="Ej: Buenos Aires"
            half
            value={form.Ciudad}
            onChange={setField("Ciudad")}
            error={errors.Ciudad}
          />
          <Field
            label="Provincia/Estado"
            placeholder="Ej: CABA"
            half
            value={form.Provincia}
            onChange={setField("Provincia")}
          />
        </div>
        <Field
          label="Código Postal"
          placeholder="Ej: C1043AAZ"
          value={form.CodigoPostal}
          onChange={setField("CodigoPostal")}
        />
        <div className="flex gap-3">
          <Field
            label="Teléfono"
            placeholder="Ej: +54 11 4567-8900"
            half
            value={form.Telefono}
            onChange={setField("Telefono")}
          />
          <Field
            label="Email"
            placeholder="Ej: centro@clinicadental.com"
            half
            value={form.Email}
            onChange={setField("Email")}
          />
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-[13px] font-medium text-slate-600 bg-gray-100 hover:bg-gray-200 border-none cursor-pointer transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg text-[13px] font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed border-none cursor-pointer transition"
          >
            {saving ? "Guardando..." : isEdit ? "Guardar" : "Crear"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ── Modal Servicio (crear) ────────────────────────────

const EMPTY_SERVICIO = {
  Codigo: "",
  Nombre: "",
  Precios: {}, // { [ubicacionId]: "0.00" }  (string para que se pueda borrar)
};

function ModalServicio({ open, onClose, onSaved, ubicaciones }) {
  const [form, setForm] = useState(EMPTY_SERVICIO);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(EMPTY_SERVICIO);
      setErrors({});
    }
  }, [open]);

  const setField = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));
  const setPrecio = (ubicacionId) => (value) =>
    setForm((f) => ({ ...f, Precios: { ...f.Precios, [ubicacionId]: value } }));

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (saving) return;
    setErrors({});

    // Validaciones locales mínimas antes de pegarle al back.
    const local = {};
    if (!form.Codigo.trim()) local.Codigo = "El código es obligatorio.";
    if (!form.Nombre.trim()) local.Nombre = "El nombre es obligatorio.";
    if (Object.keys(local).length > 0) {
      setErrors(local);
      return;
    }

    setSaving(true);
    try {
      const creado = await createTratamiento({
        Codigo: form.Codigo.trim(),
        Nombre: form.Nombre.trim(),
        Descripcion: null,
      });

      // Upsert de los precios completados (omitimos los vacíos o "0")
      const upserts = Object.entries(form.Precios ?? {})
        .map(([ubicacionId, raw]) => {
          const v = String(raw ?? "").replace(",", ".").trim();
          const num = Number(v);
          if (v === "" || Number.isNaN(num) || num < 0) return null;
          return { ubicacionId: Number(ubicacionId), precio: num };
        })
        .filter(Boolean);

      // Sin Promise.all: si falla uno no perdemos los anteriores, pero sí los
      // siguientes. Suficiente para esta UI.
      for (const u of upserts) {
        await upsertPrecio(creado.Id, u.ubicacionId, u.precio);
      }

      await onSaved?.();
      onClose();
    } catch (err) {
      const { message, fieldErrors } = formatApiError(err);
      setErrors(fieldErrors);
      Swal.fire({
        icon: "error",
        title: "No se pudo guardar",
        text: message,
        customClass: {
          popup: "rounded-2xl",
          confirmButton:
            "rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700",
        },
        buttonsStyling: false,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nuevo Servicio"
      subtitle="Define el código, nombre del servicio y un precio por ubicación."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex gap-3">
          <Field
            label="Código"
            required
            placeholder="Ej: OD001"
            half
            value={form.Codigo}
            onChange={setField("Codigo")}
            error={errors.Codigo}
          />
          <Field
            label="Nombre"
            required
            placeholder="Ej: Limpieza dental"
            half
            value={form.Nombre}
            onChange={setField("Nombre")}
            error={errors.Nombre}
          />
        </div>

        {ubicaciones.length > 0 ? (
          <div>
            <label className="block text-[13px] font-medium text-slate-700 mb-2">
              Precios por ubicación
            </label>
            <div className="flex flex-col gap-2">
              {ubicaciones.map((u) => (
                <div
                  key={u.Id}
                  className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3"
                >
                  <div>
                    <p className="text-[13px] font-medium text-slate-700">{u.Nombre}</p>
                    <p className="text-[12px] text-slate-400">{u.Direccion}</p>
                  </div>
                  <div className="flex items-center gap-1 border border-gray-200 rounded-lg px-3 py-1.5 bg-white">
                    <span className="text-[13px] text-slate-400">$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.Precios[u.Id] ?? ""}
                      onChange={(e) => setPrecio(u.Id)(e.target.value)}
                      placeholder="0.00"
                      className="w-24 text-[13px] text-slate-700 outline-none bg-transparent"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-[12px] text-slate-400 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
            No hay ubicaciones cargadas. Creá una primero desde la pestaña Ubicaciones.
          </p>
        )}

        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-[13px] font-medium text-slate-600 bg-gray-100 hover:bg-gray-200 border-none cursor-pointer transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg text-[13px] font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed border-none cursor-pointer transition"
          >
            {saving ? "Creando..." : "Crear"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ── Modal Editar Precios de un Servicio ───────────────

function ModalPrecios({ open, onClose, onSaved, tratamiento, ubicaciones }) {
  // Trabajamos sobre un mapa { [ubicacionId]: string } para que el usuario
  // pueda vaciar inputs sin que se normalicen a 0 antes de confirmar.
  const [precios, setPrecios] = useState({});
  const [deleted, setDeleted] = useState(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && tratamiento) {
      const init = {};
      (tratamiento.Precios ?? []).forEach((p) => {
        init[p.UbicacionId] = String(p.Precio ?? 0);
      });
      setPrecios(init);
      setDeleted(new Set());
    }
  }, [open, tratamiento]);

  if (!tratamiento) return null;

  const setPrecio = (ubicacionId) => (value) => {
    setPrecios((p) => ({ ...p, [ubicacionId]: value }));
    // Si el usuario tocó el input, deshacemos el marcado de borrado.
    setDeleted((d) => {
      if (!d.has(ubicacionId)) return d;
      const n = new Set(d);
      n.delete(ubicacionId);
      return n;
    });
  };

  const toggleDelete = (ubicacionId) => {
    setDeleted((d) => {
      const n = new Set(d);
      if (n.has(ubicacionId)) n.delete(ubicacionId);
      else n.add(ubicacionId);
      return n;
    });
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (saving) return;
    setSaving(true);
    try {
      // 1) Borramos los que el usuario marcó para eliminar.
      for (const ubicacionId of deleted) {
        await deletePrecio(tratamiento.Id, ubicacionId);
      }
      // 2) Upsert del resto (incluye los nuevos, que vienen en el mapa).
      for (const [ubicacionId, raw] of Object.entries(precios)) {
        if (deleted.has(Number(ubicacionId))) continue;
        const v = String(raw ?? "").replace(",", ".").trim();
        if (v === "") continue;
        const num = Number(v);
        if (Number.isNaN(num) || num < 0) continue;
        await upsertPrecio(tratamiento.Id, Number(ubicacionId), num);
      }
      await onSaved?.();
      onClose();
    } catch (err) {
      const { message } = formatApiError(err);
      Swal.fire({
        icon: "error",
        title: "No se pudieron guardar los precios",
        text: message,
        customClass: {
          popup: "rounded-2xl",
          confirmButton:
            "rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700",
        },
        buttonsStyling: false,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Precios: ${tratamiento.Nombre}`}
      subtitle="Definí el precio del servicio para cada ubicación. Dejá vacío si no aplica."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {ubicaciones.length === 0 ? (
          <p className="text-[12px] text-slate-400 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
            No hay ubicaciones cargadas. Creá una primero desde la pestaña Ubicaciones.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {ubicaciones.map((u) => {
              const marcadoBorrar = deleted.has(u.Id);
              return (
                <div
                  key={u.Id}
                  className={`flex items-center justify-between rounded-lg px-4 py-3 border transition ${
                    marcadoBorrar ? "bg-red-50 border-red-100" : "bg-gray-50 border-transparent"
                  }`}
                >
                  <div>
                    <p className="text-[13px] font-medium text-slate-700">{u.Nombre}</p>
                    <p className="text-[12px] text-slate-400">{u.Direccion}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex items-center gap-1 border rounded-lg px-3 py-1.5 bg-white ${
                        marcadoBorrar ? "border-red-200 opacity-60" : "border-gray-200"
                      }`}
                    >
                      <span className="text-[13px] text-slate-400">$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={marcadoBorrar ? "" : precios[u.Id] ?? ""}
                        onChange={(e) => setPrecio(u.Id)(e.target.value)}
                        disabled={marcadoBorrar}
                        placeholder="—"
                        className="w-24 text-[13px] text-slate-700 outline-none bg-transparent"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleDelete(u.Id)}
                      title={marcadoBorrar ? "Restaurar" : "Quitar precio"}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg border-none cursor-pointer transition ${
                        marcadoBorrar
                          ? "bg-white text-slate-500 hover:text-slate-700"
                          : "bg-white text-red-400 hover:text-red-600 hover:bg-red-50"
                      }`}
                    >
                      {marcadoBorrar ? <Plus size={14} /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-[13px] font-medium text-slate-600 bg-gray-100 hover:bg-gray-200 border-none cursor-pointer transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg text-[13px] font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed border-none cursor-pointer transition"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ── Tabs ──────────────────────────────────────────────

const TABS = ["Ubicaciones", "Servicios", "Perfil", "Preferencias"];

// ── Tab Ubicaciones ───────────────────────────────────

function TabUbicaciones({ onDataChanged }) {
  const [ubicaciones, setUbicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getUbicaciones();
      setUbicaciones(data);
    } catch (err) {
      const { message } = formatApiError(err);
      Swal.fire({
        icon: "error",
        title: "Error al cargar ubicaciones",
        text: message,
        customClass: {
          popup: "rounded-2xl",
          confirmButton:
            "rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700",
        },
        buttonsStyling: false,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (u) => {
    const result = await Swal.fire({
      icon: "warning",
      iconColor: "#dc2626",
      title: "¿Eliminar ubicación?",
      text: `Se eliminará "${u.Nombre}". Esta acción no se puede deshacer.`,
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      buttonsStyling: false,
      customClass: {
        popup: "rounded-2xl",
        title: "text-lg font-semibold text-slate-900",
        htmlContainer: "text-sm text-slate-600",
        confirmButton:
          "rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700",
        cancelButton:
          "rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 ml-2",
      },
    });
    if (!result.isConfirmed) return;
    setDeletingId(u.Id);
    try {
      await deleteUbicacion(u.Id);
      await load();
      onDataChanged?.();
    } catch (err) {
      const { message } = formatApiError(err);
      Swal.fire({
        icon: "error",
        title: "No se pudo eliminar",
        text: message,
        customClass: {
          popup: "rounded-2xl",
          confirmButton:
            "rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700",
        },
        buttonsStyling: false,
      });
    }
    finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-[16px] font-semibold text-slate-800">Gestión de Ubicaciones</h2>
          <p className="text-[13px] text-slate-400 mt-0.5">
            Administra los consultorios y ubicaciones de tu práctica
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-medium rounded-lg border-none cursor-pointer transition"
        >
          <Plus size={15} /> Nueva Ubicación
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="table-responsive">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {["Nombre", "Dirección", "Ciudad", "Teléfono", "Email", "Acciones"].map((h) => (
                  <th
                    key={h}
                    className={`text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-3 md:px-5 md:py-3 whitespace-nowrap ${
                      h === "Acciones" ? "text-right" : "text-left"
                    } ${["Ciudad", "Teléfono", "Email"].includes(h) ? "hidden md:table-cell" : ""}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-[13px] text-slate-400">
                    Cargando ubicaciones...
                  </td>
                </tr>
              ) : ubicaciones.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-[13px] text-slate-400">
                    No hay ubicaciones cargadas. Creá la primera con el botón de arriba.
                  </td>
                </tr>
              ) : (
                ubicaciones.map((u) => (
                  <tr
                    key={u.Id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-3 py-3 md:px-5 md:py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                          <MapPin size={13} className="text-indigo-500" />
                        </div>
                        <span className="text-[13px] font-medium text-slate-700">{u.Nombre}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 md:px-5 md:py-4">
                      <p className="text-[13px] text-slate-600">
                        <span className="block max-w-[180px] md:max-w-none truncate">{u.Direccion}</span>
                      </p>
                      {u.CodigoPostal && (
                        <p className="text-[12px] text-slate-400">CP: {u.CodigoPostal}</p>
                      )}
                    </td>
                    <td className="px-3 py-3 md:px-5 md:py-4 hidden md:table-cell">
                      <p className="text-[13px] text-slate-600">{u.Ciudad}</p>
                      {u.Provincia && (
                        <p className="text-[12px] text-slate-400">{u.Provincia}</p>
                      )}
                    </td>
                    <td className="px-3 py-3 md:px-5 md:py-4 text-[13px] text-slate-600 hidden md:table-cell">{u.Telefono || "—"}</td>
                    <td className="px-3 py-3 md:px-5 md:py-4 text-[13px] text-slate-600 hidden md:table-cell">
                      <span className="block max-w-[180px] truncate">{u.Email || "—"}</span>
                    </td>
                    <td className="px-3 py-3 md:px-5 md:py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditing(u);
                            setModalOpen(true);
                          }}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer transition"
                          title="Editar ubicación"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(u)}
                          disabled={deletingId === u.Id}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer transition"
                          title="Eliminar ubicación"
                        >
                          {deletingId === u.Id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ModalUbicacion
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        initial={editing}
        onSaved={async () => {
          await load();
          onDataChanged?.();
        }}
      />
    </>
  );
}

// ── Tab Servicios ─────────────────────────────────────

function TabServicios({ ubicaciones, onDataChanged }) {
  const [tratamientos, setTratamientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [preciosModal, setPreciosModal] = useState(null); // tratamiento o null

  const load = async () => {
    setLoading(true);
    try {
      const data = await getTratamientosConPrecios();
      setTratamientos(data);
    } catch (err) {
      const { message } = formatApiError(err);
      Swal.fire({
        icon: "error",
        title: "Error al cargar servicios",
        text: message,
        customClass: {
          popup: "rounded-2xl",
          confirmButton:
            "rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700",
        },
        buttonsStyling: false,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Columna de precio: usamos la primera ubicación (la del header) o la primera
  // con precio cargado.
  const headerUbicacion = ubicaciones[0];

  const formatPrecio = (n) => {
    if (n == null) return "—";
    return `$${Number(n).toLocaleString("es-AR", { minimumFractionDigits: 0 })}`;
  };

  const precioDeColumna = (t) => {
    if (!headerUbicacion) return null;
    return t.Precios?.find((p) => p.UbicacionId === headerUbicacion.Id)?.Precio;
  };

  return (
    <>
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-[16px] font-semibold text-slate-800">Servicios odontológicos</h2>
          <p className="text-[13px] text-slate-400 mt-0.5">
            Administra el catálogo de servicios y sus precios por ubicación.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-medium rounded-lg border-none cursor-pointer transition"
        >
          <Plus size={15} /> Nuevo servicio
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-16 text-center text-[13px] text-slate-400">
          Cargando servicios...
        </div>
      ) : tratamientos.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-16 flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center">
            <Tag size={22} className="text-indigo-400" />
          </div>
          <p className="text-[14px] font-medium text-slate-600">No hay servicios</p>
          <p className="text-[13px] text-slate-400">
            Crea tu primer servicio para poder usarlo en facturación.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="mt-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-medium rounded-lg border-none cursor-pointer transition"
          >
            Agregar primer servicio
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="table-responsive">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Código", "Nombre", `Precio (${headerUbicacion?.Nombre ?? "ubicación"})`, "Acciones"].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-3 md:px-5 md:py-3 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {tratamientos.map((s) => (
                  <tr
                    key={s.Id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-3 py-3 md:px-5 md:py-4">
                      <span className="inline-block bg-indigo-50 text-indigo-600 text-[12px] font-semibold px-2.5 py-0.5 rounded-md">
                        {s.Codigo || "—"}
                      </span>
                    </td>
                    <td className="px-3 py-3 md:px-5 md:py-4 text-[13px] font-medium text-slate-700">
                      <span className="block max-w-[160px] md:max-w-none truncate">{s.Nombre}</span>
                    </td>
                    <td className="px-3 py-3 md:px-5 md:py-4 text-[13px] text-slate-600 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <DollarSign size={13} className="text-slate-400 shrink-0" />
                        <span className="truncate">{formatPrecio(precioDeColumna(s))}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 md:px-5 md:py-4">
                      <button
                        onClick={() => setPreciosModal(s)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50 cursor-pointer transition"
                        title="Editar precios"
                      >
                        <DollarSign size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ModalServicio
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        ubicaciones={ubicaciones}
        onSaved={async () => {
          await load();
          onDataChanged?.();
        }}
      />
      <ModalPrecios
        open={Boolean(preciosModal)}
        onClose={() => setPreciosModal(null)}
        tratamiento={preciosModal}
        ubicaciones={ubicaciones}
        onSaved={async () => {
          await load();
          onDataChanged?.();
        }}
      />
    </>
  );
}

// ── Página principal ──────────────────────────────────

export default function Ajustes() {
  const [activeTab, setActiveTab] = useState("Ubicaciones");
  // Cacheamos las ubicaciones acá para que "Servicios" las pueda usar sin
  // pedirselas de nuevo. TabUbicaciones también emite onDataChanged para
  // mantenerlo fresco.
  const [ubicaciones, setUbicaciones] = useState([]);

  useEffect(() => {
    let mounted = true;
    getUbicaciones()
      .then((data) => {
        if (mounted) setUbicaciones(data);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <MainLayout headerProps={{ pageTitle: "Ajustes" }}>
      {/* Page header */}
      <div className="mb-5">
        <h1 className="text-[18px] font-semibold text-slate-800">Ajustes</h1>
        <p className="text-[13px] text-slate-400 mt-0.5">
          Configura tu consultorio y personaliza tu experiencia
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-gray-200 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-[13px] font-medium border-none cursor-pointer bg-transparent transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? "text-indigo-600 border-indigo-600"
                : "text-slate-500 border-transparent hover:text-slate-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Contenido de la tab activa */}
      {activeTab === "Ubicaciones" && (
        <TabUbicaciones
          onDataChanged={async () => {
            const data = await getUbicaciones();
            setUbicaciones(data);
          }}
        />
      )}
      {activeTab === "Servicios" && (
        <TabServicios
          ubicaciones={ubicaciones}
          onDataChanged={async () => {
            const data = await getUbicaciones();
            setUbicaciones(data);
          }}
        />
      )}
      {activeTab === "Perfil" && (
        <div className="text-[13px] text-slate-400">Perfil — próximamente</div>
      )}
      {activeTab === "Preferencias" && (
        <div className="text-[13px] text-slate-400">Preferencias — próximamente</div>
      )}
    </MainLayout>
  );
}
