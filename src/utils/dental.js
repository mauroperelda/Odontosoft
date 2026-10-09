// Utilidades puras del dominio dental. Sin React, sin estado.
// Mantener este archivo 100% libre de dependencias del front para poder
// reusarlo en tests, en el back si hicieran falta helpers equivalentes, etc.

// ── Notación FDI (Fédération Dentaire Internationale) ────────────────────
// Numeración 11..48 que divide la boca en 4 cuadrantes:
//   - SD: Superior Derecho (diente 18 al 11, de atrás hacia adelante)
//   - SI: Superior Izquierdo (21 al 28, de adelante hacia atrás)
//   - II: Inferior Izquierdo (31 al 38, de atrás hacia adelante)
//   - ID: Inferior Derecho (48 al 41, de adelante hacia atrás)
//
// IMPORTANTE: este objeto debe estar declarado ANTES de cualquier constante
// derivada (ODONTO_ROW_*, PERIODONTO_QUADRANTS, FDI_ALL) para evitar el
// TDZ error "Cannot access 'FDI_QUADRANTS' before initialization".
export const FDI_QUADRANTS = {
  SD: [18, 17, 16, 15, 14, 13, 12, 11],
  SI: [21, 22, 23, 24, 25, 26, 27, 28],
  II: [31, 32, 33, 34, 35, 36, 37, 38],
  ID: [48, 47, 46, 45, 44, 43, 42, 41],
};

// Layout del ODONTOGRAMA: 2 filas con FDI numbers.
//   - maxilar: [18..11] | [21..28]  (de izquierda a derecha, viendo al paciente)
//   - mandibular: [48..41] | [31..38]
// En el chart, los mandibulares se renderizan espejados (mirrored).
export const ODONTO_ROW_MAXILAR = [
  ...FDI_QUADRANTS.SD,  // 18..11
  ...FDI_QUADRANTS.SI,  // 21..28
];
export const ODONTO_ROW_MANDIBULAR = [
  ...FDI_QUADRANTS.ID,  // 48..41
  ...FDI_QUADRANTS.II,  // 31..38
];

// Layout del PERIODONTOGRAMA: 4 cuadrantes, cada uno con 1..8 (display).
// En cada cuadrante, el orden visual es de izquierda a derecha.
export const PERIODONTO_QUADRANTS = [
  { key: "SD", label: "Superior Derecho",   fdis: FDI_QUADRANTS.SD, display: [8, 7, 6, 5, 4, 3, 2, 1] },
  { key: "SI", label: "Superior Izquierdo", fdis: FDI_QUADRANTS.SI, display: [1, 2, 3, 4, 5, 6, 7, 8] },
  { key: "II", label: "Inferior Izquierdo", fdis: FDI_QUADRANTS.II, display: [1, 2, 3, 4, 5, 6, 7, 8] },
  { key: "ID", label: "Inferior Derecho",   fdis: FDI_QUADRANTS.ID, display: [8, 7, 6, 5, 4, 3, 2, 1] },
];

export const FDI_QUADRANT_LABELS = {
  SD: "Sup. Derecho",
  SI: "Sup. Izquierdo",
  II: "Inf. Izquierdo",
  ID: "Inf. Derecho",
};

export const FDI_ALL = [...FDI_QUADRANTS.SD, ...FDI_QUADRANTS.SI, ...FDI_QUADRANTS.II, ...FDI_QUADRANTS.ID];

// Devuelve la cuadrante FDI al que pertenece un número de pieza.
// El dígito de las decenas (1, 2, 3, 4) define el cuadrante.
export function getCuadrant(numeroPieza) {
  const decena = Math.floor(numeroPieza / 10);
  if (decena === 1) return "SD";
  if (decena === 2) return "SI";
  if (decena === 3) return "II";
  if (decena === 4) return "ID";
  return null;
}

// Determina si una pieza es maxilar (true) o mandibular (false).
// Útil para espejar (mirrored) el componente ToothShape.
export function isMaxilar(fdi) {
  const decena = Math.floor(fdi / 10);
  return decena === 1 || decena === 2;
}

// ── Colores por estado del ODONTOGRAMA ───────────────────────────────────
// Mantenemos la misma paleta que el odontograma histórico del consultorio:
// verde sano, rojo caries, púrpura corona, azul endodoncia, etc.
export const ODONTOGRAMA_ESTADOS = [
  "Sano",
  "Caries",
  "Ausente",
  "Extracción indicada",
  "Corona",
  "Endodoncia",
  "Sellador",
  "Restauración",
  "Implante",
  "Puente",
];

export const ODONTOGRAMA_COLORS = {
  Sano: "#22c55e",
  Caries: "#ef4444",
  Ausente: "#9ca3af",
  "Extracción indicada": "#1f2937",
  Corona: "#a855f7",
  Endodoncia: "#3b82f6",
  Sellador: "#06b6d4",
  Restauración: "#f59e0b",
  Implante: "#ec4899",
  Puente: "#8b5cf6",
};

export function getColorForEstado(estado) {
  if (!estado) return ODONTOGRAMA_COLORS.Sano;
  return ODONTOGRAMA_COLORS[estado] ?? "#94a3b8";
}

// ── Colores de marcadores del PERIODONTOGRAMA ────────────────────────────
// Distintos del odontograma: cada marcador es una marca puntual en la pieza.
export const PERIODONTAL_MARKER_COLORS = {
  sangrado: "#dc2626",
  supuracion: "#7c2d12",
  placa: "#fbbf24",
  recesion: "#0ea5e9",
};

export const PERIODONTAL_ESTADOS = ["Sano", "Leve", "Moderado", "Severo"];

// Calcula la edad en años a partir de una fecha de nacimiento.
// Devuelve null si la fecha es inválida o nula.
export function calcEdad(fechaNacimiento) {
  if (!fechaNacimiento) return null;
  const fn = new Date(fechaNacimiento);
  if (isNaN(fn.getTime())) return null;
  const hoy = new Date();
  let edad = hoy.getFullYear() - fn.getFullYear();
  const m = hoy.getMonth() - fn.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < fn.getDate())) edad--;
  return edad;
}
