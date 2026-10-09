// Normaliza la respuesta de error de un controller de ASP.NET Core.
//
// Devuelve siempre la misma forma:
//   { message: string,        // mensaje general para mostrar en un banner
//     fieldErrors: { [k]: string } }  // errores por campo (input-level)
//
// Acepta los formatos más comunes del back:
//   1. ValidationProblemDetails / ModelState:
//        { errors: { Nombre: ["El campo nombre..."], Apellido: ["..."] } }
//   2. Error genérico con { error: "..." } o { message: "..." }
//   3. String plano
//   4. Error de red (sin response)
export function formatApiError(err) {
  const data = err?.response?.data;
  const fieldErrors = {};

  if (data?.errors && typeof data.errors === "object") {
    for (const [field, msgs] of Object.entries(data.errors)) {
      // msgs puede ser string o array de strings
      const text = Array.isArray(msgs) ? msgs.join(", ") : String(msgs);
      fieldErrors[field] = text;
    }
  }

  let message;
  if (Object.keys(fieldErrors).length > 0) {
    message = Object.entries(fieldErrors)
      .map(([f, m]) => `${f}: ${m}`)
      .join(" | ");
  } else if (data?.error) {
    message = String(data.error);
  } else if (data?.message) {
    message = String(data.message);
  } else if (typeof data === "string") {
    message = data;
  } else if (err?.message) {
    message = err.message;
  } else {
    message = "Error desconocido";
  }

  return { message, fieldErrors };
}
