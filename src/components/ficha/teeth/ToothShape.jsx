import { TOOTH_PATHS, TOOTH_DETAILS, TOOTH_PROPORTIONS } from "./toothPaths";

// Componente puro de la silueta de un diente.
// Props:
//   type: "incisor" | "canine" | "premolar" | "molar"
//   fill: color de la corona (default: blanco)
//   stroke: color del contorno (default: gris)
//   mirrored: si true, espeja verticalmente (mandibulares)
//   size: alto en px (default 56). El ancho se calcula según proporciones.
//   onClick, className, ...rest
//
// Para que la forma se vea proporcionada cuando el chart es chico, el viewBox
// se centra en el bounding box del path usando un viewBox 0 0 24 32 (el path
// está dibujado dentro de esos límites, con padding de 1px a cada lado).
export default function ToothShape({
  type = "incisor",
  fill = "#f8fafc",
  stroke = "#94a3b8",
  mirrored = false,
  size = 56,
  onClick,
  className = "",
  ...rest
}) {
  const path = TOOTH_PATHS[type] ?? TOOTH_PATHS.incisor;
  const details = TOOTH_DETAILS[type] ?? [];
  const props = TOOTH_PROPORTIONS[type] ?? TOOTH_PROPORTIONS.incisor;
  // Tamaño del viewBox real
  const VB_W = 24;
  const VB_H = 32;
  // Tamaño en px (mantenemos proporción del viewBox)
  const width = (size * props.w) / 28;
  const height = size;

  const cursor = onClick ? "cursor-pointer" : "";
  const transform = mirrored ? `scale(1, -1) translate(0, -${VB_H})` : "";

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      className={`${cursor} ${className}`.trim()}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={`Pieza ${type}`}
      {...rest}
    >
      <g transform={transform}>
        {/* corona */}
        <path
          d={path}
          fill={fill}
          stroke={stroke}
          strokeWidth={0.7}
          strokeLinejoin="round"
        />
        {/* detalles internos (cervical, surcos) */}
        {details.map((d, i) =>
          d.type === "line" ? (
            <line
              key={i}
              x1={d.x1}
              y1={d.y1}
              x2={d.x2}
              y2={d.y2}
              stroke={stroke}
              strokeWidth={0.4}
              opacity={d.opacity}
            />
          ) : null
        )}
        {/* highlight sutil para dar volumen (solo si fill no es el default) */}
        <ellipse
          cx={VB_W / 2}
          cy={10}
          rx={props.w / 3.5}
          ry={3}
          fill="white"
          opacity={0.18}
        />
      </g>
    </svg>
  );
}
