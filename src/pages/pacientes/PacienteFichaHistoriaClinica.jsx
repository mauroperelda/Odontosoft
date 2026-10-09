import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { errorAlert, toastSuccess } from "../../utils/swal";
import { Spinner } from "../../components/Loader";

export default function PacienteFichaHistoriaClinica() {
  const { historiaClinica, actions } = useOutletContext();

  const [alergias, setAlergias] = useState("");
  const [medicamentos, setMedicamentos] = useState("");
  const [antecedentes, setAntecedentes] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [saving, setSaving] = useState(false);
  const [initializing, setInitializing] = useState(false);

  useEffect(() => {
    if (historiaClinica) {
      setAlergias(historiaClinica.Alergias ?? "");
      setMedicamentos(historiaClinica.Medicamentos ?? "");
      setAntecedentes(historiaClinica.AntecedentesMedicos ?? "");
      setObservaciones(historiaClinica.Observaciones ?? "");
    }
  }, [historiaClinica]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await actions.guardarHistoriaClinica({
        Alergias: alergias || null,
        Medicamentos: medicamentos || null,
        AntecedentesMedicos: antecedentes || null,
        Observaciones: observaciones || null,
      });
      toastSuccess("Historia clínica guardada");
    } catch (err) {
      errorAlert(err.message ?? "No se pudo guardar la historia clínica");
    } finally {
      setSaving(false);
    }
  };

  const handleInicializar = async () => {
    setInitializing(true);
    try {
      await actions.inicializarHistoriaClinica({
        Alergias: null,
        Medicamentos: null,
        AntecedentesMedicos: null,
        Observaciones: null,
      });
      toastSuccess("Historia clínica inicializada");
    } catch (err) {
      errorAlert(err.message ?? "No se pudo inicializar la historia clínica");
    } finally {
      setInitializing(false);
    }
  };

  if (!historiaClinica) {
    return (
      <div className="text-center py-10 space-y-3">
        <h3 className="text-[15px] font-semibold text-slate-700">No hay historia clínica todavía</h3>
        <p className="text-[13px] text-slate-500">Inicializá una para empezar a registrar anamnesis y piezas.</p>
        <button
          type="button"
          onClick={handleInicializar}
          disabled={initializing}
          className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-50"
        >
          {initializing && <Spinner className="h-3 w-3 text-white" />}
          Inicializar historia clínica
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-[16px] font-semibold text-slate-800">Historia Clínica</h2>
        <p className="text-[12px] text-slate-500 mt-0.5">Anamnesis, antecedentes y fichas de tratamiento</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Textarea label="Alergias" value={alergias} onChange={setAlergias} />
        <Textarea label="Medicamentos actuales" value={medicamentos} onChange={setMedicamentos} />
      </div>
      <Textarea label="Antecedentes médicos" value={antecedentes} onChange={setAntecedentes} rows={4} />
      <Textarea label="Observaciones" value={observaciones} onChange={setObservaciones} rows={3} />

      <FichasTratamientoList fichas={historiaClinica.Fichas ?? []} />

      <div className="flex justify-end pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-violet-600 hover:bg-violet-700 px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-50 flex items-center gap-1.5"
        >
          {saving && <Spinner className="h-3 w-3 text-white" />}
          Guardar historia clínica
        </button>
      </div>
    </div>
  );
}

function Textarea({ label, value, onChange, rows = 2 }) {
  return (
    <div>
      <label className="block text-[12px] font-medium text-slate-600 mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
      />
    </div>
  );
}

function FichasTratamientoList({ fichas }) {
  if (!fichas || fichas.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4 text-center text-[12px] text-slate-500">
        Sin fichas de tratamiento registradas.
      </div>
    );
  }
  return (
    <div>
      <h3 className="text-[13px] font-semibold text-slate-700 mb-2">Fichas de tratamiento</h3>
      <div className="space-y-1.5">
        {fichas.map((f) => (
          <div key={f.Id} className="rounded-lg border border-slate-200 px-3 py-2 flex items-center gap-3">
            <span className="font-mono text-[12px] text-slate-500">#{f.Id}</span>
            <span className="text-[13px] text-slate-700 flex-1 truncate">
              {f.TratamientoNombre ?? f.TratamientoId ?? "Tratamiento"}
            </span>
            <span className="text-[12px] text-slate-400">{f.Fecha?.slice(0, 10) ?? ""}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
