import { useMemo } from "react";
import { groupPermisosByModulo } from "../services/permisos";

/**
 * Catálogo de permisos de solo lectura, agrupado por módulo. Mismo patrón
 * visual que PermissionsGroupEditor pero sin checkboxes.
 */
export default function PermissionsCatalogTable({ permisos }) {
  const grupos = useMemo(() => groupPermisosByModulo(permisos), [permisos]);
  const moduloKeys = Object.keys(grupos).sort();

  if (moduloKeys.length === 0) {
    return (
      <p className="text-[13px] text-slate-400 bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
        No hay permisos en el catálogo.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {moduloKeys.map((modulo) => {
        const items = grupos[modulo];
        return (
          <details
            key={modulo}
            open
            className="rounded-xl border border-gray-100 bg-white shadow-sm"
          >
            <summary className="cursor-pointer select-none px-5 py-3 text-[14px] font-semibold text-slate-700 list-none flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="text-slate-400">▸</span>
                {modulo}
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                {items.length} permiso{items.length === 1 ? "" : "s"}
              </span>
            </summary>
            <div className="border-t border-gray-100">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-5 py-2 w-1/2">
                      Nombre
                    </th>
                    <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-5 py-2">
                      Código
                    </th>
                    <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-5 py-2">
                      Descripción
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((p) => (
                    <tr
                      key={p.Id}
                      className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-3 text-[13px] text-slate-700">
                        {p.Nombre}
                      </td>
                      <td className="px-5 py-3">
                        <code className="text-[12px] text-slate-500 font-mono bg-slate-50 px-1.5 py-0.5 rounded">
                          {p.Codigo}
                        </code>
                      </td>
                      <td className="px-5 py-3 text-[12px] text-slate-400">
                        {p.Descripcion || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        );
      })}
    </div>
  );
}
