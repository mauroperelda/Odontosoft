import { useState, useRef } from "react";
import { X, Upload, Image as ImageIcon, FileText } from "lucide-react";
import { Spinner } from "../Loader";

// Modal para subir 1 o varias imágenes a una historia clínica.
// No usamos dropzone libs: el patrón es un <input type="file" multiple> +
// lista de previews con FormData al confirmar.
//
// onUpload(formData) recibe { files, descripcion } listo para pasar a
// subirImagenes(hcId, files, descripcion) en services/imagenes.js.
export default function UploadImagenesModal({ open, onClose, onUpload, uploading }) {
  const [files, setFiles] = useState([]);
  const [descripcion, setDescripcion] = useState("");
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  if (!open) return null;

  const handleSelect = (e) => {
    const list = Array.from(e.target.files ?? []);
    // Filtrar por tipo
    const valid = list.filter((f) => f.type.startsWith("image/"));
    const rejected = list.length - valid.length;
    if (rejected > 0) {
      setError(`${rejected} archivo(s) rechazado(s): solo se aceptan imágenes.`);
    } else {
      setError(null);
    }
    setFiles((prev) => [...prev, ...valid]);
  };

  const removeFile = (i) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = () => {
    if (files.length === 0) {
      setError("Seleccioná al menos una imagen.");
      return;
    }
    onUpload({ files, descripcion });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-[1px] p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-[15px] font-semibold text-slate-800">Subir imágenes</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="rounded-2xl border-2 border-dashed border-slate-300 hover:border-violet-400 hover:bg-violet-50/30 cursor-pointer py-8 flex flex-col items-center text-center transition-colors"
          >
            <Upload size={28} className="text-slate-400" />
            <p className="text-[13px] text-slate-600 mt-2 font-medium">Click para seleccionar archivos</p>
            <p className="text-[12px] text-slate-400 mt-1">JPG, PNG, WEBP · máximo 10 MB cada uno</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleSelect}
              className="hidden"
            />
          </div>

          {files.length > 0 && (
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg border border-slate-200 px-2 py-1.5">
                  <FileText size={14} className="text-slate-400 shrink-0" />
                  <span className="text-[12px] text-slate-700 truncate flex-1">{f.name}</span>
                  <span className="text-[11px] text-slate-400">{formatBytes(f.size)}</span>
                  <button type="button" onClick={() => removeFile(i)} className="text-slate-400 hover:text-red-500">
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="block text-[12px] font-medium text-slate-600 mb-1">Descripción (opcional)</label>
            <input
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej: Radiografía panorámica 2024"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            disabled={uploading}
            className="rounded-lg px-3 py-1.5 text-[13px] font-medium text-slate-600 hover:bg-slate-100"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={uploading || files.length === 0}
            className="rounded-lg bg-violet-600 hover:bg-violet-700 px-4 py-1.5 text-[13px] font-semibold text-white disabled:opacity-50 flex items-center gap-1.5"
          >
            {uploading && <Spinner className="h-3 w-3 text-white" />}
            Subir {files.length > 0 ? `(${files.length})` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatBytes(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
