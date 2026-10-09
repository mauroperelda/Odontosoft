import { useState, useEffect, useCallback } from "react";
import { Outlet, useParams, Navigate } from "react-router-dom";
import { getPatientById } from "../../services/patients";
import { getHistoriaClinicaByPaciente, createHistoriaClinica, updateHistoriaClinica } from "../../services/historiaClinica";
import { getPiezasByHistoriaClinica } from "../../services/odontograma";
import { getPeriodontogramaByHistoriaClinica } from "../../services/periodontograma";
import { getImagenesByHistoriaClinica } from "../../services/imagenes";
import FichaHeader from "../../components/ficha/FichaHeader";
import FichaTabs from "../../components/ficha/FichaTabs";
import { PageLoader } from "../../components/Loader";

// Layout de la ficha del paciente. Carga paciente + HC + piezas +
// periodontograma + imágenes en paralelo y los expone a los 4 tabs via
// `useOutletContext` para que cada tab los lea sin re-fetchear.
export default function PacienteFichaLayout() {
  const { id: pacienteId } = useParams();

  const [paciente, setPaciente] = useState(null);
  const [historiaClinica, setHistoriaClinica] = useState(null);
  const [piezas, setPiezas] = useState([]);
  const [periodontograma, setPeriodontograma] = useState(null);
  const [imagenes, setImagenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const pac = await getPatientById(pacienteId);
      setPaciente(pac);

      const hc = await getHistoriaClinicaByPaciente(pacienteId);
      setHistoriaClinica(hc);

      if (hc && hc.Id) {
        // Fetch todo en paralelo. Si algún endpoint falla, no bloqueamos a los
        // otros (cada uno tiene su propio try/catch).
        const results = await Promise.allSettled([
          getPiezasByHistoriaClinica(hc.Id),
          getPeriodontogramaByHistoriaClinica(hc.Id),
          getImagenesByHistoriaClinica(hc.Id),
        ]);
        setPiezas(results[0].status === "fulfilled" ? results[0].value : []);
        setPeriodontograma(results[1].status === "fulfilled" ? results[1].value : null);
        setImagenes(results[2].status === "fulfilled" ? results[2].value : []);
      } else {
        setPiezas([]);
        setPeriodontograma(null);
        setImagenes([]);
      }
    } catch (err) {
      console.error("Error cargando ficha:", err);
      setError(err.message ?? "No se pudo cargar la ficha del paciente.");
    } finally {
      setLoading(false);
    }
  }, [pacienteId]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // Helpers expuestos a los tabs para que refresquen data puntual.
  const refreshPiezas = useCallback(async () => {
    if (!historiaClinica?.Id) return;
    const data = await getPiezasByHistoriaClinica(historiaClinica.Id);
    setPiezas(data);
  }, [historiaClinica?.Id]);

  const refreshPeriodontograma = useCallback(async () => {
    if (!historiaClinica?.Id) return;
    const data = await getPeriodontogramaByHistoriaClinica(historiaClinica.Id);
    setPeriodontograma(data);
  }, [historiaClinica?.Id]);

  const refreshImagenes = useCallback(async () => {
    if (!historiaClinica?.Id) return;
    const data = await getImagenesByHistoriaClinica(historiaClinica.Id);
    setImagenes(data);
  }, [historiaClinica?.Id]);

  // Crear historia clínica desde el tab "Historia Clínica" si no existía.
  const inicializarHistoriaClinica = useCallback(async (payload) => {
    const hc = await createHistoriaClinica({ ...payload, PacienteId: Number(pacienteId) });
    setHistoriaClinica(hc);
    return hc;
  }, [pacienteId]);

  const guardarHistoriaClinica = useCallback(async (payload) => {
    if (!historiaClinica?.Id) return null;
    const hc = await updateHistoriaClinica(historiaClinica.Id, payload);
    setHistoriaClinica(hc);
    return hc;
  }, [historiaClinica?.Id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <PageLoader message="Cargando ficha del paciente..." />
      </div>
    );
  }

  if (error || !paciente) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
          {error ?? "Paciente no encontrado."}
        </div>
      </div>
    );
  }

  const context = {
    paciente,
    pacienteId: Number(pacienteId),
    historiaClinica,
    piezas,
    periodontograma,
    imagenes,
    refresh: { piezas: refreshPiezas, periodontograma: refreshPeriodontograma, imagenes: refreshImagenes },
    actions: { inicializarHistoriaClinica, guardarHistoriaClinica },
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">
        <FichaHeader paciente={paciente} />
        <FichaTabs />
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <Outlet context={context} />
        </div>
      </div>
    </div>
  );
}
