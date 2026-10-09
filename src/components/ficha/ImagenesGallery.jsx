import { useState, useEffect } from "react";
import { Image as ImageIcon, Trash2, FileText, Calendar } from "lucide-react";
import { getImagenBlobUrl } from "../../services/imagenes";

// Grilla de imágenes del paciente. Cada card carga su propio blob URL
// on-demand (no se descargan todas al entrar) y lo revoca al desmontar
// para no leakear memoria.
export default function ImagenesGallery({ imagenes, onDelete, deletingId }) {
  if (!imagenes || imagenes.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {imagenes.map((img) => (
        <ImagenCard key={img.Id} imagen={img} onDelete={onDelete} deleting={deletingId === img.Id} />
      ))}
    </div>
  );
}

function ImagenCard({ imagen, onDelete, deleting }) {
  const [url, setUrl] = useState(null);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let blobUrl = null;
    (async () => {
      try {
        blobUrl = await getImagenBlobUrl(imagen.Id);
        if (!cancelled) setUrl(blobUrl);
        else URL.revokeObjectURL(blobUrl);
      } catch {
        if (!cancelled) setErrored(true);
      }
    })();
    return () => {
      cancelled = true;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [imagen.Id]);

  const fecha = imagen.FechaSubida ? new Date(imagen.FechaSubida).toLocaleDateString("es-AR") : "";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden flex flex-col">
      <div className="aspect-square bg-slate-100 flex items-center justify-center overflow-hidden">
        {url && !errored ? (
          <img src={url} alt={imagen.NombreArchivo} className="w-full h-full object-cover" />
        ) : (
          <ImageIcon size={32} className="text-slate-300" />
        )}
      </div>
      <div className="p-3 flex-1 flex flex-col">
        <div className="text-[13px] font-medium text-slate-800 truncate" title={imagen.NombreArchivo}>
          {imagen.NombreArchivo}
        </div>
        {imagen.Descripcion && (
          <div className="text-[12px] text-slate-500 mt-1 line-clamp-2">{imagen.Descripcion}</div>
        )}
        <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-400">
          <Calendar size={11} />
          {fecha}
          <span className="ml-auto">{formatBytes(imagen.TamanoBytes)}</span>
        </div>
        <button
          type="button"
          onClick={() => onDelete(imagen)}
          disabled={deleting}
          className="mt-2 flex items-center justify-center gap-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 py-1.5 text-[12px] font-medium disabled:opacity-50"
        >
          <Trash2 size={12} />
          {deleting ? "Eliminando..." : "Eliminar"}
        </button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/40 py-16 flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
        <ImageIcon size={26} className="text-slate-400" />
      </div>
      <h3 className="text-[15px] font-semibold text-slate-700">Sin imágenes todavía</h3>
      <p className="text-[13px] text-slate-500 mt-1 max-w-xs">
        Subí radiografías, fotos intraorales o documentos del paciente.
      </p>
    </div>
  );
}

function formatBytes(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
