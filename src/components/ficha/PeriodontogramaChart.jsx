import ToothShape from "./teeth/ToothShape";
import { getToothType } from "./teeth/toothPaths";
import { PERIODONTO_QUADRANTS, isMaxilar, PERIODONTAL_MARKER_COLORS } from "../../utils/dental";

// Layout del periodontograma tal como aparece en el modal "Editar
// Periodontograma": 4 cuadrantes con números 1-8 debajo de cada pieza.
// En cada cuadrante, los dientes se renderizan espejados según maxilar/
// mandibular. Los marcadores (sangrado, supuración, placa, recesión) se
// dibujan como overlay sobre la corona.
export default function PeriodontogramaChart({ piezas = [], onSelectPieza, readOnly = true }) {
  const piezasPorNumero = new Map(piezas.map((p) => [p.NumeroPieza, p]));

  return (
    <div className="space-y-4 dental-chart-mobile">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PERIODONTO_QUADRANTS.slice(0, 2).map((q) => (
          <Cuadrante key={q.key} q={q} piezasPorNumero={piezasPorNumero} onSelectPieza={onSelectPieza} readOnly={readOnly} />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PERIODONTO_QUADRANTS.slice(2, 4).map((q) => (
          <Cuadrante key={q.key} q={q} piezasPorNumero={piezasPorNumero} onSelectPieza={onSelectPieza} readOnly={readOnly} />
        ))}
      </div>
      <Leyenda />
    </div>
  );
}

function Cuadrante({ q, piezasPorNumero, onSelectPieza, readOnly }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3">{q.label}</div>
      {/* table-responsive da scroll horizontal si el cuadrante no entra
          en pantallas chicas; el CSS escala los dientes en mobile. */}
      <div className="table-responsive -mx-4 px-4 pb-1">
        <div
          className="grid grid-cols-8 gap-x-1 items-end"
          style={{ minWidth: 360 }}
        >
          {q.fdis.map((fdi, i) => {
            const pieza = piezasPorNumero.get(fdi);
            return (
              <div key={fdi} className="tooth-cell flex flex-col items-center gap-1 min-w-0">
                <div className="relative">
                  <ToothShape
                    type={getToothType(fdi)}
                    fill="#d1fae5" // verde claro base para piezas sanas
                    stroke="#86efac"
                    mirrored={!isMaxilar(fdi)}
                    size={48}
                    onClick={!readOnly && onSelectPieza ? () => onSelectPieza(fdi) : undefined}
                  />
                  <Marcadores pieza={pieza} />
                </div>
                {/* Display number 1-8 abajo */}
                <span className="text-[10px] font-medium text-slate-500 tabular-nums">{q.display[i]}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Marcadores({ pieza }) {
  if (!pieza) return null;
  return (
    <div className="absolute inset-0 pointer-events-none">
      {pieza.Sangrado && (
        <span
          className="absolute"
          style={{ top: "10%", left: "20%", width: 6, height: 6, borderRadius: "50%", background: PERIODONTAL_MARKER_COLORS.sangrado }}
        />
      )}
      {pieza.Supuracion && (
        <span
          className="absolute"
          style={{ top: "10%", right: "20%", width: 0, height: 0, borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderTop: `7px solid ${PERIODONTAL_MARKER_COLORS.supuracion}` }}
        />
      )}
      {pieza.Placa && (
        <span
          className="absolute rounded-full"
          style={{ top: "20%", left: "50%", transform: "translateX(-50%)", width: 10, height: 10, border: `2px solid ${PERIODONTAL_MARKER_COLORS.placa}` }}
        />
      )}
      {pieza.Recesion != null && Number(pieza.Recesion) > 0 && (
        <span
          className="absolute text-[7px] font-bold"
          style={{ top: "55%", left: "50%", transform: "translateX(-50%)", color: PERIODONTAL_MARKER_COLORS.recesion }}
        >
          R{pieza.Recesion}
        </span>
      )}
      {pieza.BolsaPeriodontal != null && Number(pieza.BolsaPeriodontal) > 0 && (
        <span
          className="absolute text-[7px] font-bold px-1 rounded"
          style={{ bottom: -2, left: "50%", transform: "translateX(-50%)", color: "white" }}
        >
          {/* No renderizamos el badge acá, se muestra desde ToothShape */}
        </span>
      )}
    </div>
  );
}

function Leyenda() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">Leyenda</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2 text-[12px] text-slate-700">
        <div>
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Estado por bolsa</div>
          <div className="space-y-1">
            <ItemPill color="#86efac" label="Sano (0-2mm)" />
            <ItemPill color="#fde68a" label="Leve (3mm)" />
            <ItemPill color="#fdba74" label="Moderado (4mm)" />
            <ItemPill color="#fca5a5" label="Severo (5mm+)" />
          </div>
        </div>
        <div>
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Marcadores</div>
          <div className="space-y-1">
            <ItemDot color={PERIODONTAL_MARKER_COLORS.sangrado} label="Sangrado (puntos en corona)" />
            <ItemTri color={PERIODONTAL_MARKER_COLORS.supuracion} label="Supuración (triángulos)" />
            <ItemRing color={PERIODONTAL_MARKER_COLORS.placa} label="Placa (anillo azul)" />
            <ItemText color={PERIODONTAL_MARKER_COLORS.recesion} label="Margen/Recesión" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ItemPill({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-3 h-3 rounded" style={{ background: color }} />
      {label}
    </div>
  );
}

function ItemDot({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-3 h-3 rounded-full" style={{ background: color }} />
      {label}
    </div>
  );
}

function ItemTri({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <svg width="12" height="12" viewBox="0 0 12 12">
        <polygon points="6,1 11,11 1,11" fill={color} />
      </svg>
      {label}
    </div>
  );
}

function ItemRing({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-3 h-3 rounded-full" style={{ border: `2px solid ${color}` }} />
      {label}
    </div>
  );
}

function ItemText({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-bold" style={{ color }}>Rx</span>
      {label}
    </div>
  );
}
