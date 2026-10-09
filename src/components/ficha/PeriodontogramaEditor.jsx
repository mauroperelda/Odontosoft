import { useState, useMemo } from "react";
import { X, Activity, BarChart3, ListChecks } from "lucide-react";
import { FDI_ALL, PERIODONTAL_ESTADOS, PERIODONTO_QUADRANTS, isMaxilar, PERIODONTAL_MARKER_COLORS } from "../../utils/dental";
import ToothShape from "./teeth/ToothShape";
import { getToothType } from "./teeth/toothPaths";
import StatCard from "../StatCard";
import { Spinner } from "../Loader";

// Modal "Editar Periodontograma" (Imagen 1 que mandó el usuario).
// Sub-tabs: Vista Gráfica (4 cuadrantes) | Datos Detallados (tabla 32 filas).
// 4 stat cards arriba con BOP, Placa, Presentes, Ausentes.
//
// Props:
//   initial: periodontograma completo (cabecera + piezas + métricas) o null si es nuevo
//   historiaClinicaId: para el POST inicial
//   onClose()
//   onSave(vm) → devuelve la vm con todas las piezas listas para POST/PUT
//   saving
//
// IMPORTANTE: el padre debe pasar un `key` que cambie cuando cambia la
// evaluación (ej: `key={initial?.Id ?? 'new'}`) para que el useState
// initializer tome los valores correctos.
export default function PeriodontogramaEditor({ initial, historiaClinicaId, onClose, onSave, saving }) {
  const [tab, setTab] = useState("grafica");

  // Trabajamos SIEMPRE con 32 piezas (las 32 FDI). Si initial no tiene
  // alguna pieza, la inicializamos vacía para que la grilla/tabla muestren
  // el input correcto.
  const [piezas, setPiezas] = useState(() => initPiezas(initial?.Piezas ?? initial?.piezas ?? []));

  const [observaciones, setObservaciones] = useState(initial?.Observaciones ?? initial?.observaciones ?? "");

  // Métricas calculadas en vivo (no se persisten, igual que en el back).
  const metricas = useMemo(() => calcMetricas(piezas), [piezas]);

  const updatePieza = (numeroPieza, patch) => {
    setPiezas((prev) => prev.map((p) => (p.NumeroPieza === numeroPieza ? { ...p, ...patch } : p)));
  };

  const handleSave = () => {
    onSave({
      Id: initial?.Id ?? initial?.id ?? 0,
      HistoriaClinicaId: initial?.HistoriaClinicaId ?? initial?.historiaClinicaId ?? historiaClinicaId,
      FechaRegistro: initial?.FechaRegistro ?? initial?.fechaRegistro ?? new Date().toISOString(),
      Observaciones: observaciones || null,
      Piezas: piezas,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-[1px] p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-[16px] font-semibold text-slate-800">Editar Periodontograma</h2>
            <p className="text-[12px] text-slate-500 mt-0.5">
              Evaluación periodontal completa · {piezas.length} piezas
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        {/* 4 stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-6 pt-4">
          <StatCard title="BOP" value={`${metricas.bop}%`} icon={<Activity size={16} className="text-red-500" />} iconBg="#fee2e2" />
          <StatCard title="Placa" value={`${metricas.placa}%`} icon={<BarChart3 size={16} className="text-amber-500" />} iconBg="#fef3c7" />
          <StatCard title="Presentes" value={metricas.presentes} icon={<ListChecks size={16} className="text-emerald-500" />} iconBg="#dcfce7" />
          <StatCard title="Ausentes" value={metricas.ausentes} icon={<ListChecks size={16} className="text-slate-500" />} iconBg="#e2e8f0" />
        </div>

        {/* Sub-tabs Vista Gráfica / Datos Detallados */}
        <div className="flex gap-0 border-b border-gray-200 px-6 mt-4">
          {[
            { id: "grafica", label: "Vista Gráfica" },
            { id: "datos",   label: "Datos Detallados" },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-[13px] font-medium border-b-2 -mb-px transition-colors ${
                tab === t.id
                  ? "text-violet-600 border-violet-600"
                  : "text-slate-500 border-transparent hover:text-slate-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {tab === "grafica" ? (
            <VistaGrafica piezas={piezas} updatePieza={updatePieza} />
          ) : (
            <TablaDetallada piezas={piezas} updatePieza={updatePieza} />
          )}

          <div className="mt-5">
            <label className="block text-[12px] font-medium text-slate-600 mb-1">Observaciones</label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              rows={2}
              placeholder="Notas generales del examen..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg px-3 py-1.5 text-[13px] font-medium text-slate-600 hover:bg-slate-100"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-violet-600 hover:bg-violet-700 px-4 py-1.5 text-[13px] font-semibold text-white disabled:opacity-50 flex items-center gap-1.5"
          >
            {saving && <Spinner className="h-3 w-3 text-white" />}
            Guardar evaluación
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Sub-vistas ───────────────────────────────────────────────────────────

function VistaGrafica({ piezas, updatePieza }) {
  const piezasPorNumero = new Map(piezas.map((p) => [p.NumeroPieza, p]));

  return (
    <div className="space-y-3">
      <p className="text-[12px] text-slate-500">
        Click rápido en una pieza para alternar sangrado. Usá "Datos Detallados" para editar el resto.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {PERIODONTO_QUADRANTS.map((q) => (
          <CuadranteEditor key={q.key} q={q} piezasPorNumero={piezasPorNumero} updatePieza={updatePieza} />
        ))}
      </div>
    </div>
  );
}

function CuadranteEditor({ q, piezasPorNumero, updatePieza }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-3">
      <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">{q.label}</div>
      <div className="grid grid-cols-8 gap-x-1 items-end">
        {q.fdis.map((fdi, i) => {
          const p = piezasPorNumero.get(fdi);
          return (
            <button
              key={fdi}
              type="button"
              onClick={() => updatePieza(fdi, { Sangrado: !p?.Sangrado })}
              className="flex flex-col items-center gap-1 hover:scale-105 transition-transform min-w-0"
              title={`Click para toggle sangrado en pieza ${fdi}`}
            >
              <div className="relative">
                <ToothShape
                  type={getToothType(fdi)}
                  fill="#d1fae5"
                  stroke="#86efac"
                  mirrored={!isMaxilar(fdi)}
                  size={40}
                />
                {p?.Sangrado && (
                  <span
                    className="absolute pointer-events-none"
                    style={{ top: "10%", left: "20%", width: 5, height: 5, borderRadius: "50%", background: PERIODONTAL_MARKER_COLORS.sangrado }}
                  />
                )}
              </div>
              <span className="text-[9px] font-medium text-slate-500 tabular-nums">{q.display[i]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TablaDetallada({ piezas, updatePieza }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[12px]">
        <thead>
          <tr className="text-left text-slate-500 border-b border-slate-200">
            <th className="py-2 pr-2 font-medium">N°</th>
            <th className="py-2 pr-2 font-medium">Estado</th>
            <th className="py-2 pr-2 font-medium">Bolsa (mm)</th>
            <th className="py-2 pr-2 font-medium">Sangrado</th>
            <th className="py-2 pr-2 font-medium">Supuración</th>
            <th className="py-2 pr-2 font-medium">Placa</th>
            <th className="py-2 pr-2 font-medium">Recesión (mm)</th>
            <th className="py-2 pr-2 font-medium">Observación</th>
          </tr>
        </thead>
        <tbody>
          {piezas.map((p) => (
            <tr key={p.NumeroPieza} className="border-b border-slate-100">
              <td className="py-1.5 pr-2 font-semibold text-slate-700">{p.NumeroPieza}</td>
              <td className="py-1.5 pr-2">
                <select
                  value={p.Estado ?? "Sano"}
                  onChange={(e) => updatePieza(p.NumeroPieza, { Estado: e.target.value })}
                  className="rounded border border-slate-200 px-1.5 py-1 text-[12px] w-full"
                >
                  {PERIODONTAL_ESTADOS.map((est) => <option key={est} value={est}>{est}</option>)}
                </select>
              </td>
              <td className="py-1.5 pr-2">
                <input
                  type="number" step="0.5" min="0"
                  value={p.BolsaPeriodontal ?? ""}
                  onChange={(e) => updatePieza(p.NumeroPieza, { BolsaPeriodontal: e.target.value === "" ? null : Number(e.target.value) })}
                  className="w-16 rounded border border-slate-200 px-1.5 py-1 text-[12px]"
                />
              </td>
              <td className="py-1.5 pr-2">
                <input type="checkbox" checked={!!p.Sangrado} onChange={(e) => updatePieza(p.NumeroPieza, { Sangrado: e.target.checked })} />
              </td>
              <td className="py-1.5 pr-2">
                <input type="checkbox" checked={!!p.Supuracion} onChange={(e) => updatePieza(p.NumeroPieza, { Supuracion: e.target.checked })} />
              </td>
              <td className="py-1.5 pr-2">
                <input type="checkbox" checked={!!p.Placa} onChange={(e) => updatePieza(p.NumeroPieza, { Placa: e.target.checked })} />
              </td>
              <td className="py-1.5 pr-2">
                <input
                  type="number" step="0.5" min="0"
                  value={p.Recesion ?? ""}
                  onChange={(e) => updatePieza(p.NumeroPieza, { Recesion: e.target.value === "" ? null : Number(e.target.value) })}
                  className="w-16 rounded border border-slate-200 px-1.5 py-1 text-[12px]"
                />
              </td>
              <td className="py-1.5 pr-2">
                <input
                  type="text"
                  value={p.Observacion ?? ""}
                  onChange={(e) => updatePieza(p.NumeroPieza, { Observacion: e.target.value })}
                  className="w-full rounded border border-slate-200 px-1.5 py-1 text-[12px]"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────

function initPiezas(initial) {
  const map = new Map((initial ?? []).map((p) => [p.NumeroPieza ?? p.numeroPieza, p]));
  return FDI_ALL.map((num) => {
    const existing = map.get(num);
    return {
      NumeroPieza: num,
      Estado: existing?.Estado ?? "Sano",
      Sangrado: !!(existing?.Sangrado),
      Supuracion: !!(existing?.Supuracion),
      Placa: !!(existing?.Placa),
      BolsaPeriodontal: existing?.BolsaPeriodontal ?? null,
      Recesion: existing?.Recesion ?? null,
      Observacion: existing?.Observacion ?? null,
    };
  });
}

function calcMetricas(piezas) {
  const total = piezas.length;
  const conSangrado = piezas.filter((p) => p.Sangrado).length;
  const conPlaca = piezas.filter((p) => p.Placa).length;
  return {
    bop: total === 0 ? 0 : Math.round((conSangrado * 100) / total),
    placa: total === 0 ? 0 : Math.round((conPlaca * 100) / total),
    presentes: total,
    ausentes: Math.max(0, 32 - total),
  };
}
