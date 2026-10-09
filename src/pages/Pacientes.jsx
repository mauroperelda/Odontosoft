import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import PatientListHeader from "../components/PatientListHeader";
import PatientTable from "../components/PatientTable";
import AddPatientModal from "../components/AddPatientModal";
import { PageLoader } from "../components/Loader";
import { formatApiError } from "../services/apiErrors";
import {
  confirmDelete,
  errorAlert,
  toastSuccess,
} from "../utils/swal";
import {
  createPatient,
  deletePatient,
  getPatients,
  updatePatient,
} from "../services/patients";

export default function Pacientes() {
  const [patients, setPatients] = useState([]);
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  const handleView = (patient) => {
    const id = patient.Id ?? patient.id;
    navigate(`/pacientes/${id}`);
  };

  const loadPatients = async () => {
    try {
      setLoading(true);
      const data = await getPatients();
      setPatients(data ?? []);
    } catch (err) {
      const { message } = formatApiError(err);
      errorAlert({
        title: "No se pudieron cargar los pacientes",
        text: message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    if (!query.trim()) return patients;
    const lower = query.toLowerCase();
    return patients.filter((p) =>
      [p.Nombre, p.Apellido, p.Dni, p.Email, p.Celular]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(lower))
    );
  }, [patients, query]);

  const handleSave = async (form) => {
    // El back espera PascalCase
    const payload = {
      Nombre: form.Nombre,
      Apellido: form.Apellido,
      Dni: form.Dni,
      Email: form.Email,
      Celular: form.Celular,
      Telefono: form.Telefono,
      FechaNacimiento: form.FechaNacimiento || null,
      DomicilioCalle: form.DomicilioCalle,
      DomicilioNumero: form.DomicilioNumero,
      ProvinciaId: form.ProvinciaId || null,
      LocalidadId: form.LocalidadId || null,
    };

    if (editing) {
      const updated = await updatePatient(editing.Id || editing.id, payload);
      setPatients((curr) =>
        curr.map((p) =>
          (p.Id || p.id) === (updated.Id || updated.id) ? updated : p
        )
      );
      setIsModalOpen(false);
      setEditing(null);
      setQuery("");
      toastSuccess(
        `Paciente ${updated.Nombre} ${updated.Apellido} actualizado.`
      );
    } else {
      const created = await createPatient(payload);
      setPatients((curr) => [...curr, created]);
      setIsModalOpen(false);
      setEditing(null);
      setQuery("");
      toastSuccess(
        `Paciente ${created.Nombre} ${created.Apellido} guardado.`
      );
    }
    // Si createPatient/updatePatient rechaza, la excepción se propaga al modal
  };

  const handleDelete = async (patient) => {
    const id = patient.Id || patient.id;
    const fullName = `${patient.Nombre ?? ""} ${patient.Apellido ?? ""}`.trim();
    const ok = await confirmDelete({
      title: "¿Eliminar paciente?",
      text: `Vas a eliminar a ${fullName || "este paciente"}. Esta acción no se puede deshacer.`,
      confirmText: "Sí, eliminar",
    });
    if (!ok) return;
    setDeletingId(id);
    try {
      await deletePatient(id);
      setPatients((curr) => curr.filter((p) => (p.Id || p.id) !== id));
      toastSuccess(`Paciente ${fullName} eliminado.`);
    } catch (err) {
      const { message } = formatApiError(err);
      errorAlert({
        title: "No se pudo eliminar el paciente",
        text: message,
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <MainLayout headerProps={{ pageTitle: "Pacientes" }}>
      <PatientListHeader
        count={patients.length}
        query={query}
        onQueryChange={setQuery}
        onAdd={() => {
          setEditing(null);
          setIsModalOpen(true);
        }}
      />

      {loading ? (
        <PageLoader message="Cargando pacientes..." />
      ) : (
        <PatientTable
          patients={filteredPatients}
          deletingId={deletingId}
          onEdit={(p) => {
            setEditing(p);
            setIsModalOpen(true);
          }}
          onDelete={handleDelete}
          onView={handleView}
        />
      )}

      <AddPatientModal
        open={isModalOpen}
        editing={editing}
        onClose={() => {
          setIsModalOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
      />
    </MainLayout>
  );
}
