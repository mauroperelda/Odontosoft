import { useState } from "react";
import { X, Trash2 } from "lucide-react";
import { ODONTOGRAMA_ESTADOS } from "../../utils/dental";
import { Spinner } from "../Loader";

// Modal para crear/editar una pieza del odontograma.
// onSave(vm) para guardar (POST → back hace upsert por hcId+NumeroPieza).
// onDelete() solo se muestra si la pieza ya existe (Id !== 0).
//
// IMPORTANTE: el padre debe pasar un `key` que cambie cuando cambia la pieza
// (ej: `key={pieza?.Id ?? 'new'}`) para que el useState initializer tome
// los valores correctos. Sin eso, el modal retendría los valores de la
// pieza anterior al cambiar de una pieza a otra.
export default function PiezaModal({ pieza, numeroPieza, historiaClinicaId, open, onClose, onSave, onDelete, saving, deleting }) {
  const [estado, setEstado] = useState(pieza?.Estado ?? pieza?.estado ?? "Sano");
  const [observacion, setObservacion] = useState(pieza?.Observacion ?? pieza?.observacion ?? "");

  if (!open) return null;

  const isNew = !pieza || (pieza.Id ?? pieza.id ?? 0) === 0;
  const id = pieza?.Id ?? pieza?.id ?? 0;

  const handleSave = () => {
    onSave({
      Id: id,
      HistoriaClinicaId: historiaClinicaId,
      NumeroPieza: numeroPieza ?? pieza?.NumeroPieza ?? pieza?.numeroPieza,
      Estado: estado,
      Observacion: observacion || null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-[1px] p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-[15px] font-semibold text-slate-800">
            {isNew ? "Crear pieza" : "Editar pieza"} #{numeroPieza ?? pieza?.NumeroPieza ?? pieza?.numeroPieza}
          </h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-slate-600 mb-1">Estado</label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {ODONTOGRAMA_ESTADOS.map((est) => (
                <option key={est} value={est}>{est}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-slate-600 mb-1">Observación</label>
            <textarea
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              rows={3}
              placeholder="Notas clínicas (opcional)"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 px-5 py-3 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
          <div>
            {!isNew && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                disabled={deleting}
                className="flex items-center gap-1.5 text-[12px] font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                {deleting ? <Spinner className="h-3 w-3 text-red-600" /> : <Trash2 size={13} />}
                Eliminar
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg px-3 py-1.5 text-[13px] font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-violet-600 hover:bg-violet-700 px-4 py-1.5 text-[13px] font-semibold text-white disabled:opacity-50 flex items-center gap-1.5"
            >
              {saving && <Spinner className="h-3 w-3 text-white" />}
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
