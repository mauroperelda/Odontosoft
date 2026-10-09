import { Loader2, Pencil, Trash2 } from "lucide-react";

function fullName(u) {
  const n = [u.Name, u.LastName].filter(Boolean).join(" ");
  return n || "—";
}

function StatusBadge({ u }) {
  if (u.Disabled) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        Deshabilitado
      </span>
    );
  }
  if (!u.Activated) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-700">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        Inactivo
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      Activo
    </span>
  );
}

function RoleChips({ u, rolesCatalog }) {
  const ids = u.RolIds || [];
  if (ids.length === 0) {
    return <span className="text-[12px] text-slate-400">—</span>;
  }
  const byId = new Map((rolesCatalog || []).map((r) => [Number(r.Id), r]));
  return (
    <div className="flex flex-wrap gap-1.5">
      {ids.slice(0, 4).map((id) => {
        const r = byId.get(Number(id));
        return (
          <span
            key={id}
            className="inline-flex items-center rounded-full bg-violet-50 px-2.5 py-0.5 text-[11px] font-medium text-violet-700"
            title={r?.Nombre}
          >
            {r?.Codigo || `#${id}`}
          </span>
        );
      })}
      {ids.length > 4 && (
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
          +{ids.length - 4}
        </span>
      )}
    </div>
  );
}

export default function UsersAdminTable({
  users,
  rolesCatalog = [],
  onEdit,
  onDelete,
  deletingId,
  editingId,
  currentUserId,
}) {
  return (
    <div className="table-responsive rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px]">
          <tr>
            <th className="px-3 py-3 md:px-6 md:py-4">Usuario</th>
            <th className="px-3 py-3 md:px-6 md:py-4 hidden md:table-cell">Email</th>
            <th className="px-3 py-3 md:px-6 md:py-4">Roles</th>
            <th className="px-3 py-3 md:px-6 md:py-4 hidden md:table-cell">Flags</th>
            <th className="px-3 py-3 md:px-6 md:py-4">Estado</th>
            {(onEdit || onDelete) && (
              <th className="px-3 py-3 md:px-6 md:py-4 text-right">Acciones</th>
            )}
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr className="border-t border-slate-200">
              <td
                colSpan={onEdit || onDelete ? 6 : 5}
                className="px-6 py-20 text-center text-slate-400"
              >
                No hay usuarios que coincidan con la búsqueda.
              </td>
            </tr>
          ) : (
            users.map((u) => {
              const id = u.Id;
              const isDeleting = deletingId === id;
              const isEditing = editingId === id;
              const isMe = currentUserId === id;
              return (
                <tr
                  key={id}
                  className="border-t border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-3 py-3 md:px-6 md:py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-[12px] font-semibold text-slate-600">
                        {String(u.Username || "?")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 truncate">
                          {u.Username}
                          {isMe && (
                            <span className="ml-2 rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700">
                              vos
                            </span>
                          )}
                        </p>
                        <p className="text-[12px] text-slate-500 truncate">
                          {fullName(u)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 md:px-6 md:py-4 text-slate-600 hidden md:table-cell">
                    <span className="block max-w-[180px] truncate">{u.Email || "—"}</span>
                  </td>
                  <td className="px-3 py-3 md:px-6 md:py-4">
                    <RoleChips u={u} rolesCatalog={rolesCatalog} />
                  </td>
                  <td className="px-3 py-3 md:px-6 md:py-4 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {u.IsAdministrator && (
                        <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-medium text-rose-700">
                          admin flag
                        </span>
                      )}
                      {u.IsSuperUser && (
                        <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                          superuser
                        </span>
                      )}
                      {u.ChangePasswordRequired && (
                        <span className="inline-flex items-center rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-medium text-orange-700">
                          reset pwd
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3 md:px-6 md:py-4">
                    <StatusBadge u={u} />
                  </td>
                  {(onEdit || onDelete) && (
                    <td className="px-3 py-3 md:px-6 md:py-4">
                      <div className="inline-flex items-center justify-end gap-1">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(u)}
                            disabled={isDeleting}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                            title="Editar"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(u)}
                            disabled={isDeleting}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                            title="Eliminar"
                          >
                            {isDeleting ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3 md:px-6 md:py-4 text-slate-500 text-sm">
        <span>Mostrando {users.length} usuarios</span>
      </div>
    </div>
  );
}
