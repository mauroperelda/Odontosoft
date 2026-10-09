import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import {
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  getRolesDeUsuario,
  addRolAUsuario,
  removeRolDeUsuario,
} from "../services/usuarios";
import { getRoles } from "../services/roles";
import { formatApiError } from "../services/apiErrors";
import {
  PageLoader,
  InlineLoader,
  FullPageOverlay,
} from "../components/Loader";
import { confirmDelete, errorAlert, infoAlert, toastSuccess } from "../utils/swal";
import UsersAdminTable from "../components/UsersAdminTable";
import UserFormModal from "../components/UserFormModal";
import { useAuth } from "../context/useAuth";

export default function AdminUsuarios() {
  const { user: currentUser } = useAuth();

  const [usuarios, setUsuarios] = useState([]);
  const [rolesCatalog, setRolesCatalog] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // { ...usuario, RolIds }

  // ── Carga inicial ──
  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [us, rs] = await Promise.all([getUsuarios(), getRoles()]);
      setUsuarios(us);
      setRolesCatalog(rs);
    } catch (err) {
      const { message } = formatApiError(err);
      errorAlert({ title: "Error al cargar usuarios", text: message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  // ── Filtro local (server también acepta searchText, lo mandamos al recargar) ──
  const filtered = useMemo(() => {
    if (!searchText.trim()) return usuarios;
    const q = searchText.toLowerCase();
    return usuarios.filter((u) => {
      return (
        String(u.Username ?? "").toLowerCase().includes(q) ||
        String(u.Email ?? "").toLowerCase().includes(q) ||
        String(u.Name ?? "").toLowerCase().includes(q) ||
        String(u.LastName ?? "").toLowerCase().includes(q)
      );
    });
  }, [usuarios, searchText]);

  const openNew = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = async (u) => {
    // Traemos RolIds desde el endpoint dedicado (GetById podría ya traerlo,
    // pero depender de la membresía fresca desde el back es más seguro que
    // confiar en el snapshot del listado).
    try {
      const [full, rolesDeUser] = await Promise.all([
        getUsuarioById(u.Id),
        getRolesDeUsuario(u.Id),
      ]);
      setEditing({ ...full, RolIds: rolesDeUser.map((r) => Number(r.Id)) });
      setModalOpen(true);
    } catch (err) {
      const { message } = formatApiError(err);
      errorAlert({ title: "No se pudo abrir el usuario", text: message });
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  // Sincroniza los roles del usuario con los IDs seleccionados.
  // Diferencia entre los actuales y los del form, hace add/remove puntuales.
  const syncRoles = async (usuarioId, desiredIds) => {
    const current = await getRolesDeUsuario(usuarioId);
    const currentIds = new Set(current.map((r) => Number(r.Id)));
    const desiredSet = new Set(desiredIds.map(Number));
    const toAdd = [...desiredSet].filter((id) => !currentIds.has(id));
    const toRemove = [...currentIds].filter((id) => !desiredSet.has(id));
    // Si falla uno, los siguientes no se ejecutan. Suficiente para esta UI.
    for (const id of toAdd) {
      await addRolAUsuario(usuarioId, id);
    }
    for (const id of toRemove) {
      await removeRolDeUsuario(usuarioId, id);
    }
  };

  const handleSave = async (form) => {
    setSaving(true);
    try {
      const isEdit = Boolean(editing?.Id);
      const basePayload = {
        Username: form.Username.trim(),
        Name: form.Name.trim(),
        LastName: form.LastName.trim(),
        Email: form.Email.trim(),
        IsAdministrator: !!form.IsAdministrator,
        IsSuperUser: !!form.IsSuperUser,
        Activated: !!form.Activated,
        Disabled: !!form.Disabled,
        ChangePasswordRequired: !!form.ChangePasswordRequired,
      };

      let savedId;
      if (isEdit) {
        const payload = { ...basePayload };
        if (form.Password && form.Password.length >= 8) {
          payload.Password = form.Password;
        }
        const updated = await updateUsuario(editing.Id, payload);
        savedId = updated.Id;
        // Sincronizar roles recién después de actualizar lo demás.
        await syncRoles(updated.Id, form.RolIds);
      } else {
        const created = await createUsuario({
          ...basePayload,
          Password: form.Password,
        });
        savedId = created.Id;
        await syncRoles(created.Id, form.RolIds);
      }

      toastSuccess(isEdit ? "Usuario actualizado" : "Usuario creado");
      closeModal();
      await reload();

      // Si me edité a mí mismo, los roles del JWT quedaron stale.
      if (isEdit && currentUser && Number(savedId) === Number(currentUser.Id)) {
        infoAlert({
          title: "Tus permisos cambiaron",
          text: "Tus roles o permisos fueron modificados. Para que el sistema los reconozca, cerrá sesión y volvé a iniciarla.",
          confirmText: "Entendido",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (u) => {
    const ok = await confirmDelete({
      title: "¿Eliminar usuario?",
      text: `Se eliminará "${u.Username}" (${u.Name} ${u.LastName}). Esta acción no se puede deshacer.`,
    });
    if (!ok) return;
    setDeletingId(u.Id);
    try {
      await deleteUsuario(u.Id);
      toastSuccess("Usuario eliminado");
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
          <h2 className="text-[16px] font-semibold text-slate-800">Usuarios del sistema</h2>
          <p className="text-[13px] text-slate-400 mt-0.5">
            Crea, edita y asigna roles a los usuarios
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-medium rounded-lg border-none cursor-pointer transition"
        >
          <Plus size={15} /> Nuevo usuario
        </button>
      </div>

      {/* Búsqueda */}
      <div className="mb-4 relative max-w-md">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Buscar por usuario, nombre, apellido o email..."
          className="w-full pl-9 pr-3 py-2 text-[13px] border border-slate-200 rounded-lg bg-white text-slate-700 placeholder-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition"
        />
      </div>

      {loading ? (
        <PageLoader message="Cargando usuarios..." />
      ) : (
        <UsersAdminTable
          users={filtered}
          rolesCatalog={rolesCatalog}
          onEdit={openEdit}
          onDelete={handleDelete}
          deletingId={deletingId}
          editingId={null}
          currentUserId={currentUser?.Id}
        />
      )}

      <UserFormModal
        open={modalOpen}
        editing={editing}
        roles={rolesCatalog}
        onClose={closeModal}
        onSave={handleSave}
      />

      {saving && <FullPageOverlay message="Guardando usuario..." />}
    </>
  );
}
