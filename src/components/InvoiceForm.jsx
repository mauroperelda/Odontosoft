import { useEffect, useMemo, useRef, useState } from "react";
import {
  Loader2,
  Plus,
  Trash2,
  X,
  ChevronDown,
  Receipt,
  Search,
} from "lucide-react";
import PatientSearchInput from "./PatientSearchInput";

// Catálogo vacío para que `?` no rompa si no hay datos.
const EMPTY_FORM = {
  pacienteId: null,
  paciente: null,
  ubicacionId: "",
  servicios: [], // { id, tratamientoId, codigo, nombre, cantidad, precioUnitario, manualPrice }
  paymentMethod: "Efectivo",
  status: "Pagada",
};

// Construye un id local estable para cada línea de servicio (no es del back).
const newLineId = () =>
  `svc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

// Devuelve el precio de un tratamiento para una ubicación, o null si no hay.
const priceFor = (tratamiento, ubicacionId) => {
  if (!tratamiento || !ubicacionId) return null;
  const match = (tratamiento.Precios ?? []).find(
    (p) => String(p.UbicacionId) === String(ubicacionId)
  );
  return match ? Number(match.Precio) : null;
};

export default function InvoiceForm({
  onSave,
  patients: _patients, // ya no se usa: ahora la búsqueda la hace PatientSearchInput
  ubicaciones = [],
  tratamientos = [],
  saving = false,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [servicioPickerOpen, setServicioPickerOpen] = useState(false);
  const [servicioQuery, setServicioQuery] = useState("");
  const formRef = useRef(null);

  // Reset al desmontar (cuando el padre cambia de tab).
  useEffect(() => {
    return () => setForm(EMPTY_FORM);
  }, []);

  // Si cambia la ubicación, re-aplicamos los precios que el usuario no tocó
  // a mano. Así el catálogo manda por default.
  useEffect(() => {
    if (!form.ubicacionId) return;
    setForm((f) => ({
      ...f,
      servicios: f.servicios.map((s) => {
        if (s.manualPrice) return s;
        const t = tratamientos.find((x) => x.Id === s.tratamientoId);
        const nuevo = priceFor(t, f.ubicacionId);
        return nuevo == null ? s : { ...s, precioUnitario: nuevo };
      }),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.ubicacionId]);

  const handlePatientChange = (id, patient) => {
    setForm((f) => ({ ...f, pacienteId: id, paciente: patient }));
    setFieldErrors((e) => {
      if (!e.PacienteId) return e;
      const { PacienteId, ...rest } = e;
      return rest;
    });
  };

  const handleUbicacionChange = (e) => {
    setForm((f) => ({ ...f, ubicacionId: e.target.value }));
  };

  const handleAddServicio = (t) => {
    setForm((f) => {
      // No duplicar el mismo tratamiento: si ya está, incrementamos cantidad.
      const existing = f.servicios.find((s) => s.tratamientoId === t.Id);
      if (existing) {
        return {
          ...f,
          servicios: f.servicios.map((s) =>
            s.tratamientoId === t.Id
              ? { ...s, cantidad: s.cantidad + 1 }
              : s
          ),
        };
      }
      const precio = priceFor(t, f.ubicacionId);
      // Si no hay precio cargado para esta ubicación, la línea queda como
      // "manual" sólo cuando ya hay ubicación elegida. Si todavía no se
      // eligió ubicación, dejamos que el useEffect la complete al elegirla.
      const manualPrice = f.ubicacionId != null && precio == null;
      return {
        ...f,
        servicios: [
          ...f.servicios,
          {
            id: newLineId(),
            tratamientoId: t.Id,
            codigo: t.Codigo ?? "",
            nombre: t.Nombre ?? "",
            cantidad: 1,
            precioUnitario: precio ?? 0,
            manualPrice,
          },
        ],
      };
    });
    setServicioPickerOpen(false);
    setServicioQuery("");
  };

  const handleRemoveServicio = (id) => {
    setForm((f) => ({
      ...f,
      servicios: f.servicios.filter((s) => s.id !== id),
    }));
  };

  const handleCantidadChange = (id, value) => {
    const n = Math.max(1, Number(value) || 1);
    setForm((f) => ({
      ...f,
      servicios: f.servicios.map((s) =>
        s.id === id ? { ...s, cantidad: n } : s
      ),
    }));
  };

  const handlePrecioChange = (id, value) => {
    const v = String(value ?? "").replace(",", ".");
    const n = v === "" ? 0 : Number(v);
    setForm((f) => ({
      ...f,
      servicios: f.servicios.map((s) =>
        s.id === id
          ? { ...s, precioUnitario: Number.isNaN(n) ? 0 : n, manualPrice: true }
          : s
      ),
    }));
  };

  const handleField = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const total = useMemo(
    () =>
      form.servicios.reduce(
        (acc, s) => acc + (Number(s.cantidad) || 0) * (Number(s.precioUnitario) || 0),
        0
      ),
    [form.servicios]
  );

  const totalFormateado = useMemo(
    () =>
      total.toLocaleString("es-AR", {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 2,
      }),
    [total]
  );

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (saving) return;

    const errors = {};
    if (!form.pacienteId) errors.PacienteId = "Seleccioná un paciente.";
    if (form.servicios.length === 0)
      errors.Servicios = "Agregá al menos un servicio.";
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    const payload = {
      pacienteId: form.pacienteId,
      servicios: form.servicios.map((s) => ({
        tratamientoId: s.tratamientoId,
        cantidad: s.cantidad,
        precioUnitario: s.precioUnitario,
      })),
      paymentMethod: form.paymentMethod,
      status: form.status,
    };

    // El padre devuelve `null` si hubo un error no-campo (mostrado por él),
    // o un objeto `fieldErrors` si el back devolvió errores por campo.
    const result = await onSave?.(payload);
    if (result && typeof result === "object") {
      setFieldErrors(result);
    } else if (result == null) {
      // No reseteamos: el padre no cerró el form (error).
    } else {
      // Éxito: el padre ya cambió de tab. Limpiamos por las dudas.
      setForm(EMPTY_FORM);
    }
  };

  return (
    <section
      ref={formRef}
      className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Nueva factura</h2>
          <p className="text-sm text-slate-400">
            Buscá al paciente, elegí la ubicación y agregá los servicios a facturar.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-right">
          <p className="text-[11px] uppercase tracking-wider text-slate-400">Total</p>
          <p className="text-lg font-semibold text-slate-900">{totalFormateado}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4">
        {/* Paciente */}
        <div className="grid gap-2">
          <label className="text-sm font-semibold text-slate-700">Paciente</label>
          <PatientSearchInput
            value={form.pacienteId}
            onChange={handlePatientChange}
            error={fieldErrors.PacienteId}
            placeholder="Buscar paciente por nombre o DNI..."
          />
        </div>

        {/* Ubicación */}
        <div className="grid gap-2">
          <label className="text-sm font-semibold text-slate-700">Ubicación</label>
          <div className="relative">
            <select
              value={form.ubicacionId}
              onChange={handleUbicacionChange}
              className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            >
              <option value="">Seleccionar ubicación...</option>
              {ubicaciones.map((u) => (
                <option key={u.Id} value={u.Id}>
                  {u.Nombre}
                  {u.Ciudad ? ` — ${u.Ciudad}` : ""}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
          <p className="text-xs text-slate-400">
            La ubicación define el precio por defecto de cada servicio.
          </p>
        </div>

        {/* Servicios */}
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-700">Servicios</label>
            <button
              type="button"
              onClick={() => setServicioPickerOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Plus size={13} /> Agregar servicio
            </button>
          </div>

          {servicioPickerOpen && (
            <ServicioPicker
              tratamientos={tratamientos}
              query={servicioQuery}
              onQueryChange={setServicioQuery}
              onPick={handleAddServicio}
              onClose={() => {
                setServicioPickerOpen(false);
                setServicioQuery("");
              }}
              serviciosEnForm={form.servicios}
              ubicacionId={form.ubicacionId}
            />
          )}

          {fieldErrors.Servicios && (
            <p className="text-xs font-normal text-red-600">{fieldErrors.Servicios}</p>
          )}

          {form.servicios.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-500">
              <Receipt size={20} className="mx-auto mb-2 text-slate-400" />
              <p className="text-sm font-semibold text-slate-700">
                No hay servicios agregados
              </p>
              <p className="text-xs text-slate-500">
                Usá &quot;Agregar servicio&quot; para empezar.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-2">Servicio</th>
                    <th className="px-2 py-2 w-20 text-center">Cant.</th>
                    <th className="px-2 py-2 w-32 text-right">Precio unit.</th>
                    <th className="px-4 py-2 w-32 text-right">Subtotal</th>
                    <th className="px-2 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {form.servicios.map((s) => {
                    const subtotal =
                      (Number(s.cantidad) || 0) * (Number(s.precioUnitario) || 0);
                    return (
                      <tr key={s.id} className="bg-white">
                        <td className="px-4 py-2.5">
                          <p className="text-sm font-medium text-slate-800">
                            {s.nombre}
                          </p>
                          {s.codigo && (
                            <p className="text-[11px] text-slate-400">
                              {s.codigo}
                            </p>
                          )}
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={s.cantidad}
                            onChange={(e) =>
                              handleCantidadChange(s.id, e.target.value)
                            }
                            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-center text-sm text-slate-700 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <div className="flex items-center justify-end gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5">
                            <span className="text-xs text-slate-400">$</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={s.precioUnitario}
                              onChange={(e) =>
                                handlePrecioChange(s.id, e.target.value)
                              }
                              className="w-20 bg-transparent text-right text-sm text-slate-700 outline-none"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-right text-sm font-semibold text-slate-800">
                          {subtotal.toLocaleString("es-AR", {
                            style: "currency",
                            currency: "ARS",
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-2 py-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveServicio(s.id)}
                            className="inline-flex items-center justify-center rounded-full p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                            title="Quitar"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50">
                    <td colSpan={3} className="px-4 py-2.5 text-right text-xs uppercase tracking-wider text-slate-500">
                      Total
                    </td>
                    <td className="px-4 py-2.5 text-right text-sm font-semibold text-slate-900">
                      {totalFormateado}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Pago / estado */}
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Método de pago
            <select
              value={form.paymentMethod}
              onChange={handleField("paymentMethod")}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            >
              <option>Efectivo</option>
              <option>Tarjeta</option>
              <option>Transferencia</option>
            </select>
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Estado
            <select
              value={form.status}
              onChange={handleField("status")}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            >
              <option value="Pagada">Pagada</option>
              <option value="Pendiente">Pendiente</option>
            </select>
            <p className="text-xs font-normal text-slate-400">
              Pagada registra el cobro ahora; Pendiente deja la factura abierta para cobrar después.
            </p>
          </label>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:from-cyan-400 hover:to-violet-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? "Guardando..." : "Guardar factura"}
          </button>
        </div>
      </form>
    </section>
  );
}

// ── Picker de servicios (autocomplete client-side sobre el catálogo) ──

const formatARS = (n) =>
  Number(n ?? 0).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

function ServicioPicker({
  tratamientos,
  query,
  onQueryChange,
  onPick,
  onClose,
  serviciosEnForm,
  ubicacionId,
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const q = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!q) return tratamientos;
    return tratamientos.filter((t) => {
      const nombre = (t.Nombre ?? "").toLowerCase();
      const codigo = (t.Codigo ?? "").toLowerCase();
      return nombre.includes(q) || codigo.includes(q);
    });
  }, [tratamientos, q]);

  const enFormIds = useMemo(
    () => new Set(serviciosEnForm.map((s) => s.tratamientoId)),
    [serviciosEnForm]
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="relative border-b border-slate-100">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Buscar servicio por nombre o código..."
          className="w-full rounded-t-2xl border-0 bg-white py-3 pl-9 pr-9 text-sm text-slate-700 outline-none placeholder:text-slate-400"
        />
        <button
          type="button"
          onClick={onClose}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          title="Cerrar"
        >
          <X size={14} />
        </button>
      </div>
      {!ubicacionId && (
        <p className="border-b border-slate-100 bg-amber-50 px-4 py-2 text-[11px] text-amber-700">
          Seleccioná una ubicación para que se autocomplete el precio.
        </p>
      )}
      <ul className="max-h-72 overflow-y-auto py-1">
        {filtered.length === 0 ? (
          <li className="px-4 py-3 text-sm text-slate-500">
            Sin resultados para &quot;{query}&quot;.
          </li>
        ) : (
          filtered.map((t) => {
            const yaAgregado = enFormIds.has(t.Id);
            const precio = ubicacionId ? priceFor(t, ubicacionId) : null;
            return (
              <li key={t.Id}>
                <button
                  type="button"
                  onClick={() => onPick(t)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-slate-50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-800">
                      {t.Nombre}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-400">
                      {t.Codigo && <span>{t.Codigo}</span>}
                      {yaAgregado && (
                        <span className="rounded-full bg-violet-50 px-1.5 py-0.5 font-medium text-violet-600">
                          Ya en la factura
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    {ubicacionId == null ? (
                      <span className="text-[11px] text-slate-400">—</span>
                    ) : precio != null ? (
                      <span className="text-sm font-semibold text-slate-800">
                        {formatARS(precio)}
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                        Sin precio
                      </span>
                    )}
                  </div>
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
