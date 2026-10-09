import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import StatCard from "../components/StatCard";
import { PageLoader } from "../components/Loader";
import { formatApiError } from "../services/apiErrors";
import { errorAlert } from "../utils/swal";
import { getAppointmentsCalendar } from "../services/appointments";
import { getPatients } from "../services/patients";
import {
  getColorEstado,
  getEstadoNombre,
  getPacienteNombre,
  getProfesionalNombre,
} from "../services/turnoFormat";
import {
  Calendar,
  Clock,
  Users,
  DollarSign,
  CalendarPlus,
  UserSearch,
  ChevronRight,
} from "lucide-react";

// Devuelve true si la fecha de `iso` cae en el día local `target`
const sameDay = (iso, target) => {
  if (!iso) return false;
  const d = new Date(iso);
  return (
    d.getFullYear() === target.getFullYear() &&
    d.getMonth() === target.getMonth() &&
    d.getDate() === target.getDate()
  );
};

const formatTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
};

export default function Dashboard() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [turnos, pacientes] = await Promise.all([
          getAppointmentsCalendar(),
          getPatients(),
        ]);
        setAppointments(Array.isArray(turnos) ? turnos : []);
        setPatients(Array.isArray(pacientes) ? pacientes : []);
      } catch (err) {
        const { message } = formatApiError(err);
        errorAlert({
          title: "No se pudo cargar el dashboard",
          text: message,
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const today = new Date();

  const stats = useMemo(() => {
    const turnosHoy = appointments.filter((a) =>
      sameDay(a.Fecha ?? a.fecha, today)
    );
    const turnosCompletados = turnosHoy.filter(
      (a) =>
        (a.EstadoTurnoId ?? a.estadoTurnoId) != null &&
        new Date(a.HoraFin ?? a.horaFin) < new Date()
    ).length;
    const pacientesHoySet = new Set(
      turnosHoy.map((a) => a.PacienteId ?? a.pacienteId).filter(Boolean)
    );
    return {
      turnosProgramados: turnosHoy.length,
      turnosCompletados,
      pacientesHoy: pacientesHoySet.size,
    };
  }, [appointments, today]);

  const agenda = useMemo(() => {
    return appointments
      .filter((a) => sameDay(a.Fecha ?? a.fecha, today))
      .sort(
        (a, b) =>
          new Date(a.HoraInicio ?? a.horaInicio) -
          new Date(b.HoraInicio ?? b.horaInicio)
      )
      .slice(0, 5);
  }, [appointments, today]);

  return (
    <MainLayout headerProps={{ pageTitle: "Dashboard" }}>
      {/* Page header */}
      <div className="mb-5">
        <h1 className="text-[18px] font-semibold text-slate-800">Dashboard</h1>
      </div>

      {/* Stats — 2 columnas en mobile, 4 en desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-5">
        <StatCard
          title="Turnos programados"
          value={loading ? "…" : String(stats.turnosProgramados)}
          icon={<Calendar size={20} color="#6366f1" />}
          iconBg="#e0e7ff"
        />
        <StatCard
          title="Turnos completados"
          value={loading ? "…" : String(stats.turnosCompletados)}
          icon={<Clock size={20} color="#10b981" />}
          iconBg="#d1fae5"
        />
        <StatCard
          title="Pacientes hoy"
          value={loading ? "…" : String(stats.pacientesHoy)}
          icon={<Users size={20} color="#a855f7" />}
          iconBg="#f3e8ff"
        />
        <StatCard
          title="Pacientes totales"
          value={loading ? "…" : String(patients.length)}
          icon={<DollarSign size={20} color="#06b6d4" />}
          iconBg="#cffafe"
        />
      </div>

      {/* Main section — stack en mobile, side-by-side en desktop */}
      <div className="grid grid-cols-1 lg:[grid-template-columns:1fr_300px] gap-4 md:gap-6">
        {/* Agenda */}
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4 md:mb-6">
            <div>
              <h3 className="text-[13px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                Agenda de hoy
              </h3>
              <p className="text-[12px] text-slate-400">
                Timeline de turnos programados
              </p>
            </div>
            <Link
              to="/turnos"
              className="text-[13px] text-indigo-500 font-medium hover:underline whitespace-nowrap"
            >
              Ver completa
            </Link>
          </div>

          {loading ? (
            <PageLoader message="Cargando agenda..." className="py-6" />
          ) : agenda.length === 0 ? (
            <div className="flex flex-col items-center py-10 gap-3">
              <div className="bg-slate-100 w-12 h-12 rounded-full flex items-center justify-center">
                <Calendar size={24} color="#94a3b8" />
              </div>
              <p className="text-slate-400 text-[13px]">No hay turnos para hoy</p>
              <Link
                to="/turnos"
                className="text-indigo-500 text-[13px] font-medium hover:underline bg-transparent border-none cursor-pointer"
              >
                + Agendar turno
              </Link>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {agenda.map((a) => {
                const id = a.Id ?? a.id;
                const paciente = getPacienteNombre(a);
                const profesional = getProfesionalNombre(a);
                const estadoNombre = getEstadoNombre(a);
                const estadoColor = getColorEstado(a);
                return (
                  <li
                    key={id}
                    className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2"
                    style={{ borderLeft: `4px solid ${estadoColor}` }}
                  >
                    <span className="text-[12px] font-mono text-slate-500 w-16 shrink-0">
                      {formatTime(a.HoraInicio ?? a.horaInicio)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-slate-800 truncate">
                        {paciente}
                      </p>
                      {profesional && (
                        <p className="text-[12px] text-slate-500 truncate">
                          {profesional}
                        </p>
                      )}
                    </div>
                    {estadoNombre && (
                      <span
                        className="shrink-0 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium"
                        style={{
                          color: estadoColor,
                          borderColor: estadoColor,
                          backgroundColor: `${estadoColor}14`, // ~8% alpha
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: estadoColor }}
                        />
                        {estadoNombre}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Side panel */}
        <div className="flex flex-col gap-4">
          {/* Acciones rápidas */}
          <div className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-gray-100">
            <h3 className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Acciones rápidas
            </h3>
            <div className="flex flex-col gap-2">
              <Link
                to="/turnos"
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-medium transition-colors cursor-pointer border-none text-center"
              >
                <CalendarPlus size={15} /> Agendar turno
              </Link>
              <Link
                to="/pacientes"
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 text-[13px] font-medium border border-slate-200 transition-colors cursor-pointer"
              >
                <UserSearch size={15} /> Ver pacientes
              </Link>
              <Link
                to="/facturacion"
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 text-[13px] font-medium border border-slate-200 transition-colors cursor-pointer"
              >
                <DollarSign size={15} /> Facturación
              </Link>
            </div>
          </div>

          {/* Tip del día */}
          <div
            className="rounded-xl p-4 md:p-5 shadow-sm"
            style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}
          >
            <p className="text-[10px] font-bold tracking-widest text-white/60 mb-2 uppercase">
              Tip del día
            </p>
            <p className="text-[13px] text-white/90 leading-relaxed mb-4">
              Usá el odontograma para registrar tratamientos de forma visual.
              Tus pacientes podrán ver el estado de sus dientes de manera clara
              y profesional.
            </p>
            <a
              href="#"
              className="inline-flex items-center gap-1 text-white text-[13px] font-semibold hover:underline"
            >
              Probar ahora <ChevronRight size={13} />
            </a>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
