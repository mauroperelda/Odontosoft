import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import {
  getRoles,
  getRolById,
  createRol,
  updateRol,
  deleteRol,
} from "../services/roles";
import { formatApiError } from "../services/apiErrors";
import { PageLoader, FullPageOverlay } from "../components/Loader";
import { confirmDelete, errorAlert, toastSuccess } from "../utils/swal";
import RolesAdminTable from "../components/RolesAdminTable";
import RoleFormModal from "../components/RoleFormModal";

export default function AdminRoles() {
  const [roles, setRoles] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getRoles();
      setRoles(data);
    } catch (err) {
      const { message } = formatApiError(err);
      errorAlert({ title: "Error al cargar roles", text: message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const filtered = useMemo(() => {
    if (!searchText.trim()) return roles;
    const q = searchText.toLowerCase();
    return roles.filter((r) => {
      return (
        String(r.Codigo ?? "").toLowerCase().includes(q) ||
        String(r.Nombre ?? "").toLowerCase().includes(q) ||
        String(r.Descripcion ?? "").toLowerCase().includes(q)
      );
    });
  }, [roles, searchText]);

  const openNew = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = async (r) => {
    try {
      // getRolById devuelve el rol con sus permisos embebidos. El modal
      // los usa para hidratar el editor de permisos.
      const full = await getRolById(r.Id);
      setEditing(full);
      setModalOpen(true);
    } catch (err) {
      const { message } = formatApiError(err);
      errorAlert({ title: "No se pudo abrir el rol", text: message });
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const handleSave = async (form) => {
    setSaving(true);
    try {
      const payload = {
        Codigo: form.Codigo.trim(),
        Nombre: form.Nombre.trim(),
        Descripcion: form.Descripcion?.trim() || null,
        PermisoIds: form.PermisoIds,
      };
      if (editing?.Id) {
        await updateRol(editing.Id, payload);
        toastSuccess("Rol actualizado");
      } else {
        await createRol(payload);
        toastSuccess("Rol creado");
      }
      closeModal();
      await reload();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (r) => {
    const ok = await confirmDelete({
      title: "¿Eliminar rol?",
      text: `Se eliminará "${r.Nombre}" (código: ${r.Codigo}). Los usuarios que lo tengan asignado dejarán de contar con sus permisos en su próximo login.`,
    });
    if (!ok) return;
    setDeletingId(r.Id);
    try {
      await deleteRol(r.Id);
      toastSuccess("Rol eliminado");
      await reload();
    } catch (err) {
      const { message } = formatApiError(err);
      errorAlert({ title: "No se pudo eliminar", text: message });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="flex items-start justify-between mb-5 gap-4 flex-wrap">
        <div>
          <h2 className="text-[16px] font-semibold text-slate-800">Roles del sistema</h2>
          <p className="text-[13px] text-slate-400 mt-0.5">
            Definí los roles del sistema y los permisos asociados a cada uno
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-medium rounded-lg border-none cursor-pointer transition"
        >
          <Plus size={15} /> Nuevo rol
        </button>
      </div>

      <div className="mb-4 relative max-w-md">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Buscar por código, nombre o descripción..."
          className="w-full pl-9 pr-3 py-2 text-[13px] border border-slate-200 rounded-lg bg-white text-slate-700 placeholder-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition"
        />
      </div>

      {loading ? (
        <PageLoader message="Cargando roles..." />
      ) : (
        <RolesAdminTable
          roles={filtered}
          onEdit={openEdit}
          onDelete={handleDelete}
          deletingId={deletingId}
          editingId={null}
        />
      )}

      <RoleFormModal
        open={modalOpen}
        editing={editing}
        onClose={closeModal}
        onSave={handleSave}
      />

      {saving && <FullPageOverlay message="Guardando rol..." />}
    </>
  );
}
