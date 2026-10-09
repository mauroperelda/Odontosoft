import { useEffect, useMemo, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Loader2, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import MainLayout from "../layout/MainLayout";
import AppointmentModal from "../components/AppointmentModal";
import { PageLoader } from "../components/Loader";
import { formatApiError } from "../services/apiErrors";
import {
  confirmDelete,
  errorAlert,
  toastSuccess,
} from "../utils/swal";
import {
  createAppointment,
  deleteAppointment,
  getAppointmentsCalendar,
  updateAppointment,
} from "../services/appointments";
import {
  getColorEstado,
  getPacienteNombre,
  getProfesionalNombre,
  getUbicacionId,
  getUbicacionNombre,
} from "../services/turnoFormat";
import { getUbicaciones } from "../services/ubicaciones";

const WEEK_DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function getMonthDays(year, month) {
  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const startIndex = (firstOfMonth.getDay() + 6) % 7;
  const totalCells = 42;
  const days = [];

  for (let i = 0; i < totalCells; i += 1) {
    const dayNumber = i - startIndex + 1;
    let date;
    let isCurrentMonth = true;

    if (dayNumber <= 0) {
      date = new Date(year, month - 1, prevMonthDays + dayNumber);
      isCurrentMonth = false;
    } else if (dayNumber > daysInMonth) {
      date = new Date(year, month + 1, dayNumber - daysInMonth);
      isCurrentMonth = false;
    } else {
      date = new Date(year, month, dayNumber);
    }
    days.push({ day: date.getDate(), date, isCurrentMonth });
  }
  return days;
}

const sameDay = (a, b) => new Date(a).toDateString() === new Date(b).toDateString();

const formatTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
};

export default function Turnos() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState("dia");
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  // "" = todas las ubicaciones. Cualquier id = filtra por ese consultorio.
  const [filterUbicacionId, setFilterUbicacionId] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const [turnosData, ubicacionesData] = await Promise.all([
        getAppointmentsCalendar(),
        getUbicaciones(),
      ]);
      setAppointments(turnosData ?? []);
      setUbicaciones(ubicacionesData ?? []);
    } catch (err) {
      const { message } = formatApiError(err);
      errorAlert({
        title: "No se pudieron cargar los turnos",
        text: message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Aplica el filtro de ubicación a la lista cruda.
  const filteredAppointments = useMemo(() => {
    if (!filterUbicacionId) return appointments;
    return appointments.filter(
      (a) => String(getUbicacionId(a) ?? "") === String(filterUbicacionId)
    );
  }, [appointments, filterUbicacionId]);

  const monthDays = useMemo(
    () => getMonthDays(selectedDate.getFullYear(), selectedDate.getMonth()),
    [selectedDate]
  );

  const todaysAppointments = useMemo(
    () =>
      filteredAppointments
        .filter((a) => sameDay(a.Fecha ?? a.fecha, selectedDate))
        .sort((a, b) =>
          new Date(a.HoraInicio ?? a.horaInicio) - new Date(b.HoraInicio ?? b.horaInicio)
        ),
    [filteredAppointments, selectedDate]
  );

  const historyAppointments = useMemo(() => {
    // Historial = todo lo anterior a hoy (medianoche), independiente
    // de la fecha seleccionada en el calendario.
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return filteredAppointments
      .filter((a) => {
        const d = new Date(a.Fecha ?? a.fecha);
        return !Number.isNaN(d.getTime()) && d < startOfToday;
      })
      .sort(
        (a, b) =>
          new Date(b.Fecha ?? b.fecha) - new Date(a.Fecha ?? a.fecha)
      );
  }, [filteredAppointments]);

  // Agrupa el historial por día, para mostrarlo como timeline cronológico.
  const historyByDay = useMemo(() => {
    const map = new Map();
    for (const a of historyAppointments) {
      const d = new Date(a.Fecha ?? a.fecha);
      const key = d.toDateString();
      if (!map.has(key)) map.set(key, { date: d, items: [] });
      map.get(key).items.push(a);
    }
    // items por día ordenados por hora de inicio ascendente
    for (const group of map.values()) {
      group.items.sort(
        (a, b) =>
          new Date(a.HoraInicio ?? a.horaInicio) -
          new Date(b.HoraInicio ?? b.horaInicio)
      );
    }
    return Array.from(map.values()).sort((a, b) => b.date - a.date);
  }, [historyAppointments]);

  const selectedDateLabel = selectedDate.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const monthName = selectedDate.toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  });

  const handlePrevMonth = () =>
    setSelectedDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1));
  const handleNextMonth = () =>
    setSelectedDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1));

  const openCreateModal = () => {
    setEditingAppointment(null);
    setShowModal(true);
  };

  const handleEdit = (a) => {
    setEditingAppointment(a);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAppointment(null);
  };

  const handleSubmit = async (payload, editingId) => {
    if (editingId) {
      await updateAppointment(editingId, payload);
      toastSuccess("Turno actualizado correctamente.");
    } else {
      await createAppointment(payload);
      toastSuccess("Turno agendado correctamente.");
    }
    closeModal();
    await load();
  };

  const handleDelete = async (id) => {
    const ok = await confirmDelete({
      title: "¿Eliminar turno?",
      text: "El turno se va a eliminar de la agenda. Esta acción no se puede deshacer.",
      confirmText: "Sí, eliminar",
    });
    if (!ok) return;
    setDeletingId(id);
    try {
      await deleteAppointment(id);
      await load();
      toastSuccess("Turno eliminado.");
    } catch (err) {
      const { message } = formatApiError(err);
      errorAlert({
        title: "No se pudo eliminar el turno",
        text: message,
      });
    } finally {
      setDeletingId(null);
    }
  };

  const AppointmentCard = ({ a }) => {
    const id = a.Id ?? a.id;
    const pacienteNombre = getPacienteNombre(a);
    const profesionalNombre = getProfesionalNombre(a);
    const ubicacionNombre = getUbicacionNombre(a);
    const observacion = a.Observacion ?? a.observacion;
    const isDeleting = deletingId === id;
    const horaInicio = formatTime(a.HoraInicio ?? a.horaInicio);
    const horaFin = a.HoraFin || a.horaFin ? formatTime(a.HoraFin ?? a.horaFin) : null;
    return (
      <div
        className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-left flex items-center gap-3"
        style={{ borderLeft: `4px solid ${getColorEstado(a)}` }}
      >
        {/* Hora — chip a la izquierda */}
        <div className="shrink-0 text-center min-w-[60px] rounded-lg bg-white border border-slate-200 px-2 py-1.5">
          <p className="text-[13px] font-semibold text-slate-700 leading-none tabular-nums">
            {horaInicio}
          </p>
          {horaFin && (
            <p className="text-[10px] text-slate-400 leading-none mt-0.5 tabular-nums">
              a {horaFin}
            </p>
          )}
        </div>

        {/* Paciente + doctor + ubicación */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900 truncate">
            {pacienteNombre}
          </p>
          <p className="text-xs text-slate-500 truncate">
            {profesionalNombre}
            {ubicacionNombre && (
              <span className="inline-flex items-center gap-0.5 ml-1">
                · <MapPin size={10} className="text-slate-400" /> {ubicacionNombre}
              </span>
            )}
          </p>
          {observacion && (
            <p className="text-[11px] text-slate-400 truncate italic mt-0.5">{observacion}</p>
          )}
        </div>

        {/* Acciones — fila horizontal (siempre a la derecha) */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => handleEdit(a)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            title="Editar"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={() => handleDelete(id)}
            disabled={isDeleting}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            title="Eliminar"
          >
            {isDeleting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <MainLayout headerProps={{ pageTitle: "Turnos" }}>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400 mb-2">Gestión de Turnos</p>
          <h1 className="text-[28px] font-semibold text-slate-900">
            Administra y programa las citas de tus pacientes
          </h1>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
        >
          <Plus size={16} /> Nuevo Turno
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-2">
            <div>
              <p className="text-[13px] font-semibold text-slate-500 mb-1">Calendario</p>
              <p className="text-sm text-slate-400">Selecciona una fecha</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={handlePrevMonth}
                className="h-10 w-10 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200">
                <ChevronLeft size={18} />
              </button>
              <button type="button" onClick={handleNextMonth}
                className="h-10 w-10 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="mb-4 text-sm font-semibold text-slate-600 capitalize">{monthName}</div>

          <div className="grid grid-cols-7 gap-2 text-center text-[12px] font-semibold text-slate-500 mb-3">
            {WEEK_DAYS.map((day) => <span key={day}>{day}</span>)}
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-sm text-slate-700">
            {monthDays.map(({ day, date, isCurrentMonth }, index) => {
              const isSelected = date.toDateString() === selectedDate.toDateString();
              const hasAppointments = filteredAppointments.some((a) => sameDay(a.Fecha ?? a.fecha, date));
              return (
                <button
                  type="button"
                  key={`${date.toDateString()}-${index}`}
                  onClick={() => setSelectedDate(date)}
                  disabled={!isCurrentMonth}
                  className={`h-11 rounded-2xl transition relative ${
                    isSelected
                      ? "bg-violet-600 text-white shadow-sm"
                      : isCurrentMonth
                      ? "bg-slate-50 text-slate-800 hover:bg-slate-100"
                      : "text-slate-300"
                  }`}
                >
                  {day}
                  {hasAppointments && isCurrentMonth && !isSelected && (
                    <span className="absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-violet-500" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
              <p className="text-sm text-slate-500">Hoy</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {loading ? "..." : todaysAppointments.length}
              </p>
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">turnos</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
              <p className="text-sm text-slate-500">Total</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {loading ? "..." : filteredAppointments.length}
              </p>
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">turnos</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-[20px] font-semibold text-slate-900">Turnos del día</h2>
              <p className="text-sm text-slate-500 capitalize">Turnos del {selectedDateLabel}</p>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={15} className="text-slate-400" />
              <select
                value={filterUbicacionId}
                onChange={(e) => setFilterUbicacionId(e.target.value)}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                aria-label="Filtrar por ubicación"
              >
                <option value="">Todas las ubicaciones</option>
                {ubicaciones.map((u) => (
                  <option key={u.Id ?? u.id} value={u.Id ?? u.id}>
                    {u.Nombre ?? u.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-1">
            <div className="grid grid-cols-2 overflow-hidden rounded-2xl bg-slate-100 text-sm font-semibold text-slate-600">
              <button type="button" onClick={() => setActiveTab("dia")}
                className={`px-4 py-3 transition ${activeTab === "dia" ? "bg-white text-slate-900" : "bg-transparent"}`}>
                Turnos del día
              </button>
              <button type="button" onClick={() => setActiveTab("historial")}
                className={`px-4 py-3 transition ${activeTab === "historial" ? "bg-white text-slate-900" : "bg-transparent"}`}>
                Historial
              </button>
            </div>
          </div>

          {loading ? (
            <PageLoader message="Cargando turnos..." className="mt-10" />
          ) : activeTab === "dia" ? (
            todaysAppointments.length > 0 ? (
              <div className="mt-4 space-y-2">
                {todaysAppointments.map((a) => (
                  <AppointmentCard key={a.Id ?? a.id} a={a} />
                ))}
              </div>
            ) : (
              <EmptyState onAdd={openCreateModal} />
            )
          ) : historyByDay.length > 0 ? (
            <div className="mt-6 space-y-6">
              {historyByDay.map(({ date, items }) => {
                const dayLabel = date.toLocaleDateString("es-AR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                });
                return (
                  <div key={date.toDateString()}>
                    <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-slate-500">
                      {dayLabel}
                    </h3>
                    <div className="space-y-2">
                      {items.map((a) => (
                        <AppointmentCard key={a.Id ?? a.id} a={a} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-10 text-center text-slate-500">
              No hay turnos en el historial.
            </div>
          )}
        </section>
      </div>

      <AppointmentModal
        // `key` fuerza un remount limpio en cada apertura: si no, el modal
        // abre con la form guardada del open anterior y solo cuando algo
        // fuerza un re-render (ej. un click) se ve el estado nuevo.
        key={editingAppointment?.Id ?? (showModal ? "new" : "closed")}
        open={showModal}
        defaultDate={selectedDate}
        editingAppointment={editingAppointment}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
    </MainLayout>
  );
}

function EmptyState({ onAdd }) {
  return (
    <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
      <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <Calendar size={28} />
      </div>
      <p className="text-lg font-semibold text-slate-900 mb-2">No hay turnos programados</p>
      <p className="text-sm text-slate-500 mb-5">
        Hacé clic en "Nuevo Turno" para agendar una cita
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center justify-center rounded-full bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-violet-700"
      >
        + Agregar turno
      </button>
    </div>
  );
}
