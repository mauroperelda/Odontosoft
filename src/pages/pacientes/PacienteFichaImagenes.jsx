import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Upload, Image as ImageIcon } from "lucide-react";
import ImagenesGallery from "../../components/ficha/ImagenesGallery";
import UploadImagenesModal from "../../components/ficha/UploadImagenesModal";
import { subirImagenes, eliminarImagen } from "../../services/imagenes";
import { confirmDelete, errorAlert, toastSuccess } from "../../utils/swal";

export default function PacienteFichaImagenes() {
  const { historiaClinica, imagenes, refresh } = useOutletContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  if (!historiaClinica) {
    return (
      <div className="text-center py-10">
        <h3 className="text-[15px] font-semibold text-slate-700">No hay historia clínica</h3>
        <p className="text-[13px] text-slate-500 mt-1">
          Inicializá primero la historia clínica desde la pestaña "Historia Clínica".
        </p>
      </div>
    );
  }

  const handleUpload = async ({ files, descripcion }) => {
    setUploading(true);
    try {
      await subirImagenes(historiaClinica.Id, files, descripcion);
      await refresh.imagenes();
      toastSuccess(`${files.length} imagen(es) subida(s)`);
      setModalOpen(false);
    } catch (err) {
      errorAlert(err.message ?? "No se pudieron subir las imágenes");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imagen) => {
    const ok = await confirmDelete(`¿Eliminar "${imagen.NombreArchivo}"? Esta acción no se puede deshacer.`);
    if (!ok) return;
    setDeletingId(imagen.Id);
    try {
      await eliminarImagen(imagen.Id);
      await refresh.imagenes();
      toastSuccess("Imagen eliminada");
    } catch (err) {
      errorAlert(err.message ?? "No se pudo eliminar la imagen");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-[16px] font-semibold text-slate-800">Imágenes</h2>
          <p className="text-[12px] text-slate-500 mt-0.5">
            Radiografías, fotos intraorales y documentos del paciente
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 px-3 py-1.5 text-[13px] font-semibold text-white"
        >
          <Upload size={13} />
          Subir imágenes
        </button>
      </div>

      <ImagenesGallery imagenes={imagenes} onDelete={handleDelete} deletingId={deletingId} />

      {modalOpen && (
        <UploadImagenesModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onUpload={handleUpload}
          uploading={uploading}
        />
      )}
    </div>
  );
}
