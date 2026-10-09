import ToothShape from "./teeth/ToothShape";
import { getToothType } from "./teeth/toothPaths";
import { ODONTO_ROW_MAXILAR, ODONTO_ROW_MANDIBULAR, isMaxilar, ODONTOGRAMA_ESTADOS, ODONTOGRAMA_COLORS } from "../../utils/dental";

// Layout del odontograma tal como aparece en la Ficha del Paciente:
// 2 filas (maxilar arriba, mandibular abajo), FDI numbers arriba de cada
// pieza, sin separación visible entre cuadrantes (la división está implícita
// en el centro del row).
export default function OdontogramaChart({ piezas = [], onSelectPieza }) {
  const piezasPorNumero = new Map(piezas.map((p) => [p.NumeroPieza, p]));

  return (
    <div className="space-y-4 dental-chart-mobile">
      {/* Maxilar (fila superior) */}
      <Fila label="Maxilar (arcada superior)" numeros={ODONTO_ROW_MAXILAR} piezasPorNumero={piezasPorNumero} onSelectPieza={onSelectPieza} />

      {/* Separador central con leyenda de la línea media */}
      <div className="flex items-center gap-3 px-2">
        <div className="flex-1 border-t border-dashed border-slate-200" />
        <span className="text-[10px] uppercase tracking-wider text-slate-400">Línea media</span>
        <div className="flex-1 border-t border-dashed border-slate-200" />
      </div>

      {/* Mandibular (fila inferior) */}
      <Fila label="Mandibular (arcada inferior)" numeros={ODONTO_ROW_MANDIBULAR} piezasPorNumero={piezasPorNumero} onSelectPieza={onSelectPieza} />

      <Leyenda />
    </div>
  );
}

function Fila({ label, numeros, piezasPorNumero, onSelectPieza }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3">{label}</div>
      {/* table-responsive da scroll horizontal en pantallas muy chicas,
          mientras que el CSS de globals.css escala los dientes en mobile. */}
      <div className="table-responsive -mx-4 px-4 pb-1">
        <div
          className="grid gap-x-1 items-end"
          style={{ gridTemplateColumns: "repeat(16, minmax(0, 1fr))", minWidth: 560 }}
        >
          {numeros.map((fdi) => {
            const pieza = piezasPorNumero.get(fdi);
            const estado = pieza?.Estado ?? pieza?.estado ?? null;
            const fill = colorFill(estado);
            return (
              <div key={fdi} className="tooth-cell flex flex-col items-center gap-1.5 min-w-0">
                {/* FDI number arriba */}
                <span className="text-[10px] font-semibold text-slate-500 tabular-nums">{fdi}</span>
                <ToothShape
                  type={getToothType(fdi)}
                  fill={fill}
                  stroke={estado ? "#475569" : "#cbd5e1"}
                  mirrored={!isMaxilar(fdi)}
                  size={56}
                  onClick={onSelectPieza ? () => onSelectPieza(fdi) : undefined}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function colorFill(estado) {
  if (!estado) return "#f8fafc";
  return ODONTOGRAMA_COLORS[estado] ?? "#f8fafc";
}

function Leyenda() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">Referencias</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3 text-[12px] text-slate-700">
        <LeyendaGrupo titulo="Tratamientos">
          <Item color="#a855f7" shape="circle" label="Corona" />
          <Item color="#0f172a" shape="triangle" label="Sellador" />
        </LeyendaGrupo>
        <LeyendaGrupo titulo="Extracción">
          <Item color="#ef4444" shape="x" label="Realizada" />
          <Item color="#3b82f6" shape="x" label="Planificada" />
        </LeyendaGrupo>
        <LeyendaGrupo titulo="Trat. de conducto">
          <Item color="#ef4444" shape="bar" label="Realizado" />
          <Item color="#3b82f6" shape="bar" label="Planificado" />
        </LeyendaGrupo>
        <LeyendaGrupo titulo="Caras del diente">
          <Item color="#ef4444" shape="square" label="Prestación realizada" />
          <Item color="#3b82f6" shape="square" label="Prestación futura" />
          <Item color="#e5e7eb" shape="square" label="Sin tratamiento" />
        </LeyendaGrupo>
      </div>
    </div>
  );
}

function LeyendaGrupo({ titulo, children }) {
  return (
    <div>
      <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{titulo}</div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Item({ color, shape, label }) {
  return (
    <div className="flex items-center gap-2">
      {shape === "circle"   && <span className="w-3 h-3 rounded-full" style={{ background: color }} />}
      {shape === "square"   && <span className="w-3 h-3" style={{ background: color }} />}
      {shape === "triangle" && (
        <svg width="12" height="12" viewBox="0 0 12 12">
          <polygon points="6,1 11,11 1,11" fill={color} />
        </svg>
      )}
      {shape === "x" && (
        <svg width="12" height="12" viewBox="0 0 12 12">
          <line x1="2" y1="2" x2="10" y2="10" stroke={color} strokeWidth="2" />
          <line x1="10" y1="2" x2="2" y2="10" stroke={color} strokeWidth="2" />
        </svg>
      )}
      {shape === "bar" && (
        <svg width="12" height="12" viewBox="0 0 12 12">
          <rect x="3" y="2" width="2" height="8" fill={color} />
          <rect x="7" y="2" width="2" height="8" fill={color} />
        </svg>
      )}
      {label}
    </div>
  );
}
