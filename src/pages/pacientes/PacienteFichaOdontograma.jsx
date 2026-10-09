import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import OdontogramaChart from "../../components/ficha/OdontogramaChart";
import PiezaModal from "../../components/ficha/PiezaModal";
import { guardarPieza, eliminarPieza } from "../../services/odontograma";
import { calcEdad } from "../../utils/dental";
import { errorAlert, toastSuccess } from "../../utils/swal";

export default function PacienteFichaOdontograma() {
  const { paciente, historiaClinica, piezas, refresh } = useOutletContext();

  const [modalPieza, setModalPieza] = useState(null); // { numeroPieza, pieza? }
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const edad = calcEdad(paciente?.FechaNacimiento ?? paciente?.fechaNacimiento);

  const handleSelectPieza = (numeroPieza) => {
    const existing = piezas.find((p) => p.NumeroPieza === numeroPieza);
    setModalPieza({ numeroPieza, pieza: existing });
  };

  const handleSave = async (vm) => {
    if (!historiaClinica?.Id) {
      errorAlert("Necesitás inicializar la historia clínica antes de cargar piezas.");
      return;
    }
    setSaving(true);
    try {
      await guardarPieza(vm);
      await refresh.piezas();
      toastSuccess("Pieza guardada");
      setModalPieza(null);
    } catch (err) {
      errorAlert(err.message ?? "No se pudo guardar la pieza");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const id = modalPieza?.pieza?.Id;
    if (!id) return;
    setDeleting(true);
    try {
      await eliminarPieza(id);
      await refresh.piezas();
      toastSuccess("Pieza eliminada");
      setModalPieza(null);
    } catch (err) {
      errorAlert(err.message ?? "No se pudo eliminar la pieza");
    } finally {
      setDeleting(false);
    }
  };

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

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[16px] font-semibold text-slate-800">Odontograma</h2>
        <p className="text-[12px] text-slate-500 mt-0.5">
          Odontograma Permanente (Adulto) · {edad != null ? `${edad} años` : "Sin fecha de nacimiento"} · Click en una pieza para editarla
        </p>
      </div>

      <OdontogramaChart piezas={piezas} onSelectPieza={handleSelectPieza} />

      <div className="text-center text-[12px] text-slate-400 pt-3 border-t border-slate-100">
        Odontograma digital — Sistema OdontoSoft
      </div>

      <PiezaModal
        key={modalPieza?.pieza?.Id ?? modalPieza?.numeroPieza ?? "closed"}
        open={!!modalPieza}
        pieza={modalPieza?.pieza}
        numeroPieza={modalPieza?.numeroPieza}
        historiaClinicaId={historiaClinica.Id}
        onClose={() => setModalPieza(null)}
        onSave={handleSave}
        onDelete={modalPieza?.pieza ? handleDelete : null}
        saving={saving}
        deleting={deleting}
      />
    </div>
  );
}
