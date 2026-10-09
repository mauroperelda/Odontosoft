import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatCard({ title, value, icon, iconBg, trend }) {
  return (
    <div className="bg-white rounded-xl p-3 md:p-5 shadow-sm border border-gray-100">
      <div className="flex justify-between items-start mb-3 gap-2">
        <p className="text-[11px] md:text-[12px] font-semibold text-slate-500 uppercase tracking-wider leading-tight truncate min-w-0 flex-1">{title}</p>
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: iconBg || "#e0e7ff" }}
        >
          {icon}
        </div>
      </div>

      <h2 className="text-xl md:text-[26px] font-bold text-slate-900 leading-none mb-2 truncate">{value}</h2>

      {trend && (
        <div className="flex items-center gap-1">
          {trend.up
            ? <TrendingUp size={13} className="text-emerald-500" />
            : <TrendingDown size={13} className="text-red-400" />
          }
          <span className={`text-[12px] font-semibold ${trend.up ? "text-emerald-500" : "text-red-400"}`}>
            {trend.value}
          </span>
          <span className="text-[12px] text-slate-400">{trend.label}</span>
        </div>
      )}
    </div>
  );
}