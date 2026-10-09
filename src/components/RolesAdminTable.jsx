import { Loader2, Pencil, Trash2 } from "lucide-react";

function PermisosCount({ rol }) {
  if (Array.isArray(rol.Permisos)) {
    return (
      <span className="inline-flex items-center rounded-full bg-violet-50 px-2.5 py-0.5 text-[11px] font-medium text-violet-700">
        {rol.Permisos.length} permiso{rol.Permisos.length === 1 ? "" : "s"}
      </span>
    );
  }
  return <span className="text-[12px] text-slate-400">—</span>;
}

export default function RolesAdminTable({
  roles,
  onEdit,
  onDelete,
  deletingId,
  editingId,
}) {
  return (
    <div className="table-responsive rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px]">
          <tr>
            <th className="px-3 py-3 md:px-6 md:py-4">Código</th>
            <th className="px-3 py-3 md:px-6 md:py-4">Nombre</th>
            <th className="px-3 py-3 md:px-6 md:py-4 hidden md:table-cell">Descripción</th>
            <th className="px-3 py-3 md:px-6 md:py-4">Permisos</th>
            {(onEdit || onDelete) && (
              <th className="px-3 py-3 md:px-6 md:py-4 text-right">Acciones</th>
            )}
          </tr>
        </thead>
        <tbody>
          {roles.length === 0 ? (
            <tr className="border-t border-slate-200">
              <td
                colSpan={onEdit || onDelete ? 5 : 4}
                className="px-6 py-20 text-center text-slate-400"
              >
                No hay roles que coincidan con la búsqueda.
              </td>
            </tr>
          ) : (
            roles.map((rol) => {
              const id = rol.Id;
              const isDeleting = deletingId === id;
              const isEditing = editingId === id;
              return (
                <tr
                  key={id}
                  className="border-t border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-3 py-3 md:px-6 md:py-4">
                    <code className="rounded-md bg-slate-100 px-2 py-0.5 text-[12px] font-mono text-slate-700">
                      {rol.Codigo}
                    </code>
                  </td>
                  <td className="px-3 py-3 md:px-6 md:py-4 font-medium text-slate-900">
                    {rol.Nombre}
                    {rol.Disabled && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                        deshabilitado
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 md:px-6 md:py-4 text-slate-600 max-w-xs hidden md:table-cell">
                    <span className="line-clamp-2 block">
                      {rol.Descripcion || "—"}
                    </span>
                  </td>
                  <td className="px-3 py-3 md:px-6 md:py-4">
                    <PermisosCount rol={rol} />
                  </td>
                  {(onEdit || onDelete) && (
                    <td className="px-3 py-3 md:px-6 md:py-4">
                      <div className="inline-flex items-center justify-end gap-1">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(rol)}
                            disabled={isDeleting}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                            title="Editar"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(rol)}
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
        <span>Mostrando {roles.length} roles</span>
      </div>
    </div>
  );
}
