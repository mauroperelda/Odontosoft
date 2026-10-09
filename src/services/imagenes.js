import { api } from "./api";
import { uploadApi } from "./uploadApi";

// Endpoints del OdontoSoft.API:
// GET    /api/imagenpaciente/GetByHistoriaClinica/{hcId}  → ImagenPaciente[]
// GET    /api/imagenpaciente/GetById/{id}
// POST   /api/imagenpaciente/Upload/{hcId}                → multipart/form-data (campo "archivo")
// PUT    /api/imagenpaciente/Update/{id}                  → solo edita Descripcion
// DELETE /api/imagenpaciente/Delete/{id}                  → borra archivo físico + registro
// GET    /api/imagenpaciente/Download/{id}                → FileStreamResult (no es static file)

const BASE = import.meta.env.VITE_API_BASE_URL || "/api";

function normalizeImagen(i) {
  if (!i) return i;
  return {
    Id: i.Id ?? i.id ?? 0,
    HistoriaClinicaId: i.HistoriaClinicaId ?? i.historiaClinicaId ?? 0,
    NombreArchivo: i.NombreArchivo ?? i.nombreArchivo ?? null,
    RutaArchivo: i.RutaArchivo ?? i.rutaArchivo ?? null,
    MimeType: i.MimeType ?? i.mimeType ?? null,
    TamanoBytes: i.TamanoBytes ?? i.tamanoBytes ?? 0,
    Descripcion: i.Descripcion ?? i.descripcion ?? null,
    FechaSubida: i.FechaSubida ?? i.fechaSubida ?? null,
  };
}

export const getImagenesByHistoriaClinica = async (hcId) => {
  const { data } = await api.get(`imagenpaciente/GetByHistoriaClinica/${hcId}`);
  return (data ?? []).map(normalizeImagen);
};

// Sube 1 o varios archivos. Devuelve el array de imágenes creadas.
// Usa `uploadApi` (sin Content-Type hardcodeado) para que el browser ponga
// el boundary correcto en multipart/form-data.
export const subirImagenes = async (hcId, files, descripcion = "") => {
  if (!files || files.length === 0) return [];
  const formData = new FormData();
  for (const f of files) formData.append("archivo", f);
  if (descripcion) formData.append("descripcion", descripcion);

  const { data } = await uploadApi.post(`imagenpaciente/Upload/${hcId}`, formData);
  // El back devuelve 1 imagen por upload, así que si subimos varias las
  // esperamos todas. Como hoy el endpoint es de 1 archivo, devolvemos un array
  // con un solo item (los componentes lo manejan igual).
  return Array.isArray(data) ? data.map(normalizeImagen) : [normalizeImagen(data)];
};

export const actualizarDescripcion = (id, descripcion) =>
  api
    .put(`imagenpaciente/Update/${id}`, { Descripcion: descripcion })
    .then((r) => normalizeImagen(r.data));

export const eliminarImagen = (id) =>
  api.delete(`imagenpaciente/Delete/${id}`).then((r) => r.data);

// URL para mostrar la imagen en un <img src>. No es static file, lo sirve
// el controller con FileStreamResult. El front necesita estar autenticado
// para que el browser incluya la cookie / token, así que usamos el cliente
// `api` con responseType "blob" para que axios devuelva un Blob URL local
// (no expone el JWT en la URL).
export const getImagenBlobUrl = async (id) => {
  const res = await api.get(`imagenpaciente/Download/${id}`, {
    responseType: "blob",
  });
  return URL.createObjectURL(res.data);
};
