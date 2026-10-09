// Helpers para extraer campos de un turno independientemente del shape
// del response. Soporta:
//   - Shape nuevo: el back manda PacienteObj/ProfesionalObj/TratamientoObj/
//     EstadoTurnoObj como objetos anidados (con Id, Nombre, Apellido, etc.)
//   - Shape viejo: esos campos llegan como strings (Paciente="Perelda, Mauro David",
//     Profesional="Virhuez, Leonel") o como null.
//   - camelCase o PascalCase (el front lee con fallbacks).
//
// Devuelven strings listos para mostrar o el objeto crudo cuando el caller
// necesita datos estructurados (ej. armar un defaultPatient para el buscador).

const pick = (a, b) => a ?? b;

const getObj = (a, camel, pascal) => {
  if (!a || typeof a !== "object") return null;
  return pick(a[pascal], a[camel]);
};

const isObject = (v) => v !== null && typeof v === "object";

const buildFullName = (apellido, nombre) => {
  const ap = (apellido ?? "").toString().trim();
  const no = (nombre ?? "").toString().trim();
  if (ap && no) return `${ap}, ${no}`;
  return ap || no || "";
};

export const getPacienteNombre = (a) => {
  const obj = getObj(a, "pacienteObj", "PacienteObj");
  if (isObject(obj)) {
    const full = buildFullName(
      pick(obj.Apellido, obj.apellido),
      pick(obj.Nombre, obj.nombre)
    );
    return full || "Paciente";
  }
  // Fallback: string plano
  const str = pick(a.Paciente, a.paciente);
  return str || "Paciente";
};

export const getProfesionalNombre = (a) => {
  const obj = getObj(a, "profesionalObj", "ProfesionalObj");
  if (isObject(obj)) {
    const full = buildFullName(
      pick(obj.Apellido, obj.apellido),
      pick(obj.Nombre, obj.nombre)
    );
    return full || "Profesional sin asignar";
  }
  const str = pick(a.Profesional, a.profesional);
  return str || "Profesional sin asignar";
};

// Devuelve el color del estado. Prioriza el objeto anidado (EstadoTurnoObj.ColorHex)
// y cae al campo plano ColorEstado si está.
export const getColorEstado = (a, fallback = "#a855f7") => {
  const obj = getObj(a, "estadoTurnoObj", "EstadoTurnoObj");
  if (isObject(obj)) {
    const hex = pick(obj.ColorHex, obj.colorHex);
    if (hex) return hex;
  }
  return pick(a.ColorEstado, a.colorEstado) || fallback;
};

// Devuelve el nombre legible del estado (ej. "Confirmado"), o null si no hay.
export const getEstadoNombre = (a) => {
  const obj = getObj(a, "estadoTurnoObj", "EstadoTurnoObj");
  if (isObject(obj)) {
    const nombre = pick(obj.Nombre, obj.nombre);
    if (nombre) return nombre;
  }
  return null;
};

// Devuelve el nombre del tratamiento, o null si no hay.
export const getTratamientoNombre = (a) => {
  const obj = getObj(a, "tratamientoObj", "TratamientoObj");
  if (isObject(obj)) {
    return pick(obj.Nombre, obj.nombre) || pick(obj.Descripcion, obj.descripcion) || null;
  }
  return null;
};

// Devuelve el id de la ubicación, o null si el turno no tiene consultorio
// asignado (caso de turnos legacy previos al cambio).
export const getUbicacionId = (a) => {
  const fk = pick(a.UbicacionId, a.ubicacionId);
  if (fk != null) return fk;
  const obj = getObj(a, "ubicacionObj", "UbicacionObj");
  if (isObject(obj)) {
    return pick(obj.Id, obj.id) ?? null;
  }
  return null;
};

// Devuelve el nombre legible de la ubicación, o null si no hay.
export const getUbicacionNombre = (a) => {
  const obj = getObj(a, "ubicacionObj", "UbicacionObj");
  if (isObject(obj)) {
    return pick(obj.Nombre, obj.nombre) ?? null;
  }
  return pick(a.Ubicacion, a.ubicacion) ?? null;
};

// Devuelve un objeto paciente "hidratado" para usar como defaultPatient del
// PatientSearchInput. Prioriza PacienteObj; si no está, no devuelve nada
// (el caller puede fetchearlo aparte con getPatientById).
export const getDefaultPatient = (a) => {
  const obj = getObj(a, "pacienteObj", "PacienteObj");
  if (isObject(obj)) {
    return {
      Id: pick(obj.Id, obj.id),
      Nombre: pick(obj.Nombre, obj.nombre),
      Apellido: pick(obj.Apellido, obj.apellido),
      Dni: pick(obj.Dni, obj.dni),
    };
  }
  return null;
};
