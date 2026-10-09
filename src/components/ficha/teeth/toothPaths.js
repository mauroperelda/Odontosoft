// Paths SVG de cada tipo de pieza dental en vista vestibular (maxilar apuntando
// hacia abajo, mandibular invertido).
// viewBox normalizado: 0 0 24 32. Corona ocupa y=2..y=28, cervical y=28.
//
// Las formas están dibujadas para que se lean claramente como diente a tamaño
// 50-60px (tamaño que usamos en el chart). A tamaños muy chicos (<20px) las
// curvas se pierden un poco; por eso en esos casos conviene usar un simple
// rectángulo (ver componente <ToothShape>).

// Ancho / alto proporcionales por tipo (relativos al viewBox 24x32)
export const TOOTH_PROPORTIONS = {
  incisor:  { w: 18, h: 26 }, // 1, 2 - más angostos
  canine:   { w: 18, h: 28 }, // 3 - un poco más altos
  premolar: { w: 20, h: 24 }, // 4, 5 - más anchos
  molar:    { w: 22, h: 22 }, // 6, 7, 8 - los más anchos y cortos
};

// Mapea número FDI → tipo de pieza
export function getToothType(fdi) {
  if ([11, 12, 21, 22, 31, 32, 41, 42].includes(fdi)) return "incisor";
  if ([13, 23, 33, 43].includes(fdi)) return "canine";
  if ([14, 15, 24, 25, 34, 35, 44, 45].includes(fdi)) return "premolar";
  return "molar"; // 16, 17, 18, 26, 27, 28, 36, 37, 38, 46, 47, 48
}

// ── PATHS ────────────────────────────────────────────────────────────────
// Cada path es la silueta de la corona en vista vestibular.
// El sistema de coordenadas es local: la corona siempre "apunta hacia abajo",
// y el componente se encarga de espejar para mandibulares.

// Incisor: corona rectangular con leve convexidad lateral y borde incisal
// con un pequeño mamelón central.
const INCISOR_PATH = `
  M 5 5
  Q 3 5 3 7
  L 3 24
  Q 3 27 6 27
  L 8 27
  L 9 25
  L 12 25
  L 12 28
  L 13 25
  L 16 25
  L 18 27
  Q 21 27 21 24
  L 21 7
  Q 21 5 19 5
  L 18 3
  L 6 3
  Z
`;

// Canino: corona pentagonal con cúspide puntiaguda.
const CANINE_PATH = `
  M 5 8
  Q 3 8 3 10
  L 3 24
  Q 3 27 6 27
  L 8 27
  L 10 25
  L 12 27
  L 14 25
  L 16 27
  Q 19 27 19 24
  L 19 10
  Q 19 7 17 5
  L 14 2
  L 12 1
  L 10 2
  L 7 5
  Q 5 7 5 8
  Z
`;

// Premolar: corona más ancha con 2 cúspides suaves.
const PREMOLAR_PATH = `
  M 3 5
  Q 1 5 1 7
  L 1 24
  Q 1 27 4 27
  L 6 27
  L 7 24
  L 11 24
  L 11 27
  L 13 27
  L 13 24
  L 17 24
  L 18 27
  Q 21 27 21 24
  L 21 7
  Q 21 5 19 5
  L 17 3
  L 13 3
  L 12 6
  L 11 3
  L 7 3
  Z
`;

// Molar: corona ancha con 4 cúspides marcadas.
const MOLAR_PATH = `
  M 1 5
  Q 0 5 0 7
  L 0 24
  Q 0 27 3 27
  L 5 27
  L 6 24
  L 9 24
  L 10 27
  L 12 27
  L 13 24
  L 16 24
  L 17 27
  L 19 27
  Q 22 27 22 24
  L 22 7
  Q 22 5 20 5
  L 18 3
  L 16 6
  L 14 3
  L 12 6
  L 10 3
  L 8 6
  L 6 3
  Z
`;

export const TOOTH_PATHS = {
  incisor: INCISOR_PATH,
  canine: CANINE_PATH,
  premolar: PREMOLAR_PATH,
  molar: MOLAR_PATH,
};

// Detalles internos (líneas sutiles) que se dibujan encima de la corona.
// Cada uno es un array de elementos <path> o <line>.
export const TOOTH_DETAILS = {
  incisor: [
    // línea cervical horizontal
    { type: "line", x1: 5, y1: 8, x2: 19, y2: 8, opacity: 0.35 },
  ],
  canine: [
    { type: "line", x1: 5, y1: 9, x2: 19, y2: 9, opacity: 0.35 },
  ],
  premolar: [
    { type: "line", x1: 3, y1: 9, x2: 21, y2: 9, opacity: 0.35 },
    // surco central vertical
    { type: "line", x1: 12, y1: 10, x2: 12, y2: 22, opacity: 0.2 },
  ],
  molar: [
    { type: "line", x1: 1, y1: 9, x2: 23, y2: 9, opacity: 0.35 },
    // surco vestibular vertical
    { type: "line", x1: 12, y1: 10, x2: 12, y2: 22, opacity: 0.2 },
  ],
};
