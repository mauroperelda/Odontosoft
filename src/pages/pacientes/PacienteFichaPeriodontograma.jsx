import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Plus, Pencil } from "lucide-react";
import PeriodontogramaChart from "../../components/ficha/PeriodontogramaChart";
import PeriodontogramaEditor from "../../components/ficha/PeriodontogramaEditor";
import StatCard from "../../components/StatCard";
import { guardarPeriodontograma, actualizarPeriodontograma } from "../../services/periodontograma";
import { errorAlert, toastSuccess } from "../../utils/swal";
import { Activity, BarChart3, ListChecks } from "lucide-react";

export default function PacienteFichaPeriodontograma() {
  const { historiaClinica, periodontograma, refresh } = useOutletContext();
  const [editorOpen, setEditorOpen] = useState(false);
  const [saving, setSaving] = useState(false);

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

  const handleOpenEditor = () => {
    setEditorOpen(true);
  };

  const handleSave = async (vm) => {
    setSaving(true);
    try {
      if (vm.Id && vm.Id > 0) {
        await actualizarPeriodontograma(vm.Id, vm);
      } else {
        await guardarPeriodontograma({ ...vm, HistoriaClinicaId: historiaClinica.Id });
      }
      await refresh.periodontograma();
      toastSuccess("Periodontograma guardado");
      setEditorOpen(false);
    } catch (err) {
      errorAlert(err.message ?? "No se pudo guardar el periodontograma");
    } finally {
      setSaving(false);
    }
  };

  if (!periodontograma) {
    return (
      <div className="text-center py-12 space-y-4">
        <h3 className="text-[15px] font-semibold text-slate-700">Sin evaluación periodontal</h3>
        <p className="text-[13px] text-slate-500 max-w-sm mx-auto">
          Creá la primera evaluación para registrar sangrado, placa, bolsa y recesión por pieza.
        </p>
        <button
          type="button"
          onClick={handleOpenEditor}
          className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 px-4 py-2 text-[13px] font-semibold text-white"
        >
          <Plus size={14} />
          Crear periodontograma
        </button>
        {editorOpen && (
          <PeriodontogramaEditor
            key="new"
            initial={null}
            historiaClinicaId={historiaClinica.Id}
            onClose={() => setEditorOpen(false)}
            onSave={handleSave}
            saving={saving}
          />
        )}
      </div>
    );
  }

  const m = periodontograma.Metricas ?? {};

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-[16px] font-semibold text-slate-800">Periodontograma</h2>
          <p className="text-[12px] text-slate-500 mt-0.5">
            Última evaluación: {periodontograma.FechaRegistro?.slice(0, 10) ?? "—"}
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenEditor}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 px-3 py-1.5 text-[13px] font-medium text-slate-700"
        >
          <Pencil size={13} />
          {periodontograma.Piezas?.length > 0 ? "Editar" : "Nuevo"}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="BOP" value={`${m.BopPorcentaje ?? 0}%`} icon={<Activity size={16} className="text-red-500" />} iconBg="#fee2e2" />
        <StatCard title="Placa" value={`${m.PlacaPorcentaje ?? 0}%`} icon={<BarChart3 size={16} className="text-amber-500" />} iconBg="#fef3c7" />
        <StatCard title="Presentes" value={m.DientesPresentes ?? 0} icon={<ListChecks size={16} className="text-emerald-500" />} iconBg="#dcfce7" />
        <StatCard title="Ausentes" value={m.DientesAusentes ?? 0} icon={<ListChecks size={16} className="text-slate-500" />} iconBg="#e2e8f0" />
      </div>

      <PeriodontogramaChart piezas={periodontograma.Piezas ?? []} readOnly />

      {editorOpen && (
        <PeriodontogramaEditor
          key={periodontograma?.Id ?? "edit"}
          initial={periodontograma}
          historiaClinicaId={historiaClinica.Id}
          onClose={() => setEditorOpen(false)}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </div>
  );
}
