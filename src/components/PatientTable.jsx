import { Loader2, Trash2, Eye, Pencil } from "lucide-react";

export default function PatientTable({ patients, onEdit, onDelete, onView, deletingId }) {
  const showActions = !!(onEdit || onDelete || onView);

  return (
    <div className="table-responsive rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px]">
          <tr>
            <th className="px-3 py-3 md:px-6 md:py-4">Paciente</th>
            <th className="px-3 py-3 md:px-6 md:py-4 hidden md:table-cell">DNI</th>
            <th className="px-3 py-3 md:px-6 md:py-4 hidden md:table-cell">Celular</th>
            <th className="px-3 py-3 md:px-6 md:py-4">Email</th>
            {showActions && <th className="px-3 py-3 md:px-6 md:py-4 text-right">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {patients.length === 0 ? (
            <tr className="border-t border-slate-200">
              <td colSpan="5" className="px-6 py-20 text-center text-slate-400">
                No hay pacientes registrados aún.
              </td>
            </tr>
          ) : (
            patients.map((patient) => {
              const id = patient.Id ?? patient.id;
              const isDeleting = deletingId === id;
              return (
                <tr key={id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-3 py-3 md:px-6 md:py-4 font-medium text-slate-900">
                    <span className="block max-w-[140px] md:max-w-none truncate">
                      {patient.Apellido}, {patient.Nombre}
                    </span>
                  </td>
                  <td className="px-3 py-3 md:px-6 md:py-4 text-slate-600 whitespace-nowrap hidden md:table-cell">{patient.Dni}</td>
                  <td className="px-3 py-3 md:px-6 md:py-4 text-slate-600 whitespace-nowrap hidden md:table-cell">{patient.Celular ?? "—"}</td>
                  <td className="px-3 py-3 md:px-6 md:py-4 text-slate-600">
                    <span className="block max-w-[140px] md:max-w-none truncate">{patient.Email ?? "—"}</span>
                  </td>
                  {showActions && (
                    <td className="px-3 py-3 md:px-6 md:py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        {onView && (
                          <button
                            onClick={() => onView(patient)}
                            disabled={isDeleting}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-violet-200 text-violet-700 hover:bg-violet-50 disabled:opacity-50"
                            title="Ver ficha clínica"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {onEdit && (
                          <button
                            onClick={() => onEdit(patient)}
                            disabled={isDeleting}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                            title="Editar"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(patient)}
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
        <span>Mostrando {patients.length} pacientes</span>
      </div>
    </div>
  );
}
