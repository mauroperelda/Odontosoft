import StatCard from "./StatCard";
import { Receipt, DollarSign, MapPin, Users } from "lucide-react";

export default function BillingHeader({ stats }) {
  return (
    <section className="mb-6 rounded-[20px] md:rounded-[28px] bg-gradient-to-r from-cyan-600 via-teal-500 to-sky-600 p-4 md:p-6 text-white shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs md:text-sm uppercase tracking-[0.28em] text-cyan-100/75">Facturación</p>
          <h1 className="text-xl md:text-3xl font-semibold tracking-tight leading-tight">Registra facturas y lleva control de tus ingresos</h1>
        </div>
        <div className="self-start sm:self-auto rounded-full border border-white/15 bg-white/10 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-semibold text-white shadow-sm">
          <span className="text-slate-100">{stats.totalLabel}</span>
        </div>
      </div>

      <div className="mt-4 md:mt-6 grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          title="Facturas hoy"
          value={stats.today}
          icon={<Receipt size={20} color="#088f8f" />}
          iconBg="#cffafe"
          trend={{ value: "En esta sesión", label: "", up: true }}
        />
        <StatCard
          title="Total facturado"
          value={stats.total}
          icon={<DollarSign size={20} color="#047857" />}
          iconBg="#d1fae5"
          trend={{ value: stats.totalTrend, label: "vs mes anterior", up: stats.totalUp }}
        />
        <StatCard
          title="Ubicaciones"
          value={stats.locations}
          icon={<MapPin size={20} color="#0f766e" />}
          iconBg="#ccfbf1"
          trend={{ value: "Consultorios activos", label: "", up: true }}
        />
        <StatCard
          title="Pacientes activos"
          value={stats.activePatients}
          icon={<Users size={20} color="#7c3aed" />}
          iconBg="#ede9fe"
          trend={{ value: "En el sistema", label: "", up: true }}
        />
      </div>
    </section>
  );
}
