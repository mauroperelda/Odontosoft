import { api } from "./api";

// OdontoSoft.API no tiene un "FacturacionController".
// La facturación se compone de Pagos (vinculados a un Presupuesto) y
// cada Presupuesto tiene Detalles (servicios/tratamientos facturados).
//
// Endpoints del back:
//   GET    /api/pago/GetAll
//   GET    /api/pago/GetById/{id}
//   GET    /api/presupuesto/GetAll
//   GET    /api/presupuesto/GetById/{id}
//   POST   /api/presupuesto/Create                → PresupuestoViewModel
//   POST   /api/presupuesto/GuardarDetallePresupuesto  → PresupuestoDetalleViewModel
//   DELETE /api/presupuesto/EliminarDetallePresupuesto/{id}
//   POST   /api/presupuesto/GuardarPagoPresupuesto     → PagoViewModel
//   DELETE /api/presupuesto/EliminarPagoPresupuesto/{id}

const ENDPOINTS = {
  pagos: {
    list: "pago/GetAll",
    byId: "pago/GetById",
    create: "pago/Create",
    update: (id) => `pago/Update/${id}`,
    delete: (id) => `pago/Delete/${id}`,
  },
  presupuestos: {
    list: "presupuesto/GetAll",
    byId: "presupuesto/GetById",
    create: "presupuesto/Create",
    guardarDetalle: "presupuesto/GuardarDetallePresupuesto",
    eliminarDetalle: (id) => `presupuesto/EliminarDetallePresupuesto/${id}`,
    guardarPago: "presupuesto/GuardarPagoPresupuesto",
    eliminarPago: (id) => `presupuesto/EliminarPagoPresupuesto/${id}`,
  },
};

export const getPagos = (page = 1, pageSize = 20, searchText = "") =>
  api
    .get("pago/GetAll", { params: { page, pageSize, searchText } })
    .then((r) => r.data);

export const getPagoById = (id) => api.get(ENDPOINTS.pagos.byId + `/${id}`).then((r) => r.data);
export const createPago = (payload) => api.post(ENDPOINTS.pagos.create, payload).then((r) => r.data);
export const updatePago = (id, payload) => api.put(ENDPOINTS.pagos.update(id), payload).then((r) => r.data);
export const deletePago = (id) => api.delete(ENDPOINTS.pagos.delete(id)).then((r) => r.data);

export const getPresupuestos = (page = 1, pageSize = 20) =>
  api.get("presupuesto/GetAll", { params: { page, pageSize } }).then((r) => r.data);

export const getPresupuestoById = (id) =>
  api.get(ENDPOINTS.presupuestos.byId + `/${id}`).then((r) => r.data);

export const createPresupuesto = (payload) =>
  api.post(ENDPOINTS.presupuestos.create, payload).then((r) => r.data);

// ─── Adaptación para la pantalla de Facturación ────────────────────────────

// Normaliza un Pago (cualquier shape: PascalCase o camelCase) a la forma
// "invoice" que esperan los componentes de la UI.
function pagoToInvoice(pago) {
  if (!pago) return null;
  const pick = (a, b) => a ?? b;
  const id = pick(pago.Id, pago.id);
  const monto = Number(pick(pago.Monto, pago.monto) ?? 0);
  return {
    id,
    number: `PAG-${id}`,
    // El back (PagoController.GetAll) ahora proyecta PacienteNombre
    // navegando Presupuesto→Paciente. Caemos a Observaciones si no hay
    // paciente asociado (ej. pagos viejos).
    customerName:
      pick(pago.PacienteNombre, pago.pacienteNombre) ??
      pick(pago.Observaciones, pago.observaciones) ??
      "—",
    total: `$${monto.toFixed(2)}`,
    amount: monto,
    status: pick(pago.Estado, pago.estado) ?? "Pagado",
    date: pick(pago.Fecha, pago.fecha) ?? null,
    paymentMethod: pick(pago.MetodoPago, pago.metodoPago) ?? "—",
  };
}

const extractItems = (response) => {
  if (Array.isArray(response)) return response;
  return response?.items ?? [];
};

export const getInvoices = async () => {
  const data = await getPagos(1, 200);
  return extractItems(data).map(pagoToInvoice).filter(Boolean);
};

// ─── Creación de factura: presupuesto + detalles + (opcional) pago ───────
//
// La factura no se asocia a un profesional. El back acepta ProfesionalId = null.
//
// Flujo:
//   1. POST /presupuesto/Create con { PacienteId, Fecha, Total, Estado, Observaciones }
//   2. POST /presupuesto/GuardarDetallePresupuesto por cada servicio
//      (el back recalcula el Total a partir de los detalles)
//   3. Si el estado es "Pagada", POST /presupuesto/GuardarPagoPresupuesto
//      con el monto total.
export const createInvoiceWithDetails = async (formValues) => {
  const { pacienteId, servicios, paymentMethod, status, observaciones } = formValues;

  if (!pacienteId) {
    const err = new Error("Seleccioná un paciente para registrar la factura.");
    err.fieldErrors = { PacienteId: err.message };
    throw err;
  }
  if (!Array.isArray(servicios) || servicios.length === 0) {
    const err = new Error("Agregá al menos un servicio para facturar.");
    err.fieldErrors = { Servicios: err.message };
    throw err;
  }

  // 1) Crear presupuesto.
  const presupuesto = await createPresupuesto({
    PacienteId: pacienteId,
    Fecha: new Date().toISOString(),
    Observaciones: observaciones || null,
    Total: 0, // el back recalcula en base a los detalles
    Estado: "Pendiente",
  });

  const presupuestoId =
    presupuesto?.Id ?? presupuesto?.id ?? presupuesto?.id;

  if (!presupuestoId) {
    throw new Error("El servidor no devolvió el id del presupuesto.");
  }

  // 2) Agregar detalles.
  let total = 0;
  for (const s of servicios) {
    const cantidad = Number(s.cantidad) || 1;
    const precioUnitario = Number(s.precioUnitario) || 0;
    if (precioUnitario < 0) continue;
    const detalle = await api.post(ENDPOINTS.presupuestos.guardarDetalle, {
      PresupuestoId: presupuestoId,
      TratamientoId: s.tratamientoId,
      Cantidad: cantidad,
      PrecioUnitario: precioUnitario,
    });
    // El back devuelve el detalle con Subtotal y TotalPresupuesto.
    total =
      Number(detalle?.TotalPresupuesto ?? detalle?.totalPresupuesto ?? total + cantidad * precioUnitario);
  }

  // 3) Si la factura está "Pagada", registrar el pago.
  if (status === "Pagada" && total > 0) {
    await api.post(ENDPOINTS.presupuestos.guardarPago, {
      PresupuestoId: presupuestoId,
      Fecha: new Date().toISOString(),
      Monto: total,
      MetodoPago: paymentMethod || "Efectivo",
      Observaciones: observaciones || null,
    });
  }

  return { presupuesto, total };
};
