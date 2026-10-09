import { useMemo, useState } from "react";
import { groupPermisosByModulo } from "../services/permisos";

/**
 * Editor de permisos agrupados por módulo, con <details> colapsables.
 *
 * Props:
 *  - permisos: Permiso[]  → catálogo completo (viene de getPermisos)
 *  - value: number[]      → IDs de permisos seleccionados
 *  - onChange: (ids) => void
 *  - disabled: boolean    → deshabilita todos los checkboxes
 */
export default function PermissionsGroupEditor({
  permisos,
  value = [],
  onChange,
  disabled = false,
}) {
  const grupos = useMemo(() => groupPermisosByModulo(permisos), [permisos]);
  const moduloKeys = Object.keys(grupos).sort();

  // Estado local para "expandir/colapsar todos" — se aplica a los <details>
  // de la lista por medio de un atributo `open` controlado.
  const [forceOpen, setForceOpen] = useState(null); // null | true | false

  const selectedSet = useMemo(() => new Set(value.map(Number)), [value]);

  const togglePermiso = (id) => {
    if (disabled) return;
    const idNum = Number(id);
    const next = new Set(selectedSet);
    if (next.has(idNum)) next.delete(idNum);
    else next.add(idNum);
    onChange?.(Array.from(next));
  };

  const isOpen = (key, index) => {
    if (forceOpen === true) return true;
    if (forceOpen === false) return false;
    // Por defecto, abierto el primero
    return index === 0;
  };

  if (moduloKeys.length === 0) {
    return (
      <p className="text-[12px] text-slate-400 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
        No hay permisos en el catálogo.
      </p>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[13px] font-medium text-slate-700">
          Permisos del rol
          <span className="ml-2 text-[11px] text-slate-400 font-normal">
            ({value.length} seleccionados)
          </span>
        </p>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setForceOpen(true)}
            disabled={disabled}
            className="text-[11px] px-2.5 py-1 rounded-md text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer transition disabled:opacity-50"
          >
            Expandir
          </button>
          <button
            type="button"
            onClick={() => setForceOpen(false)}
            disabled={disabled}
            className="text-[11px] px-2.5 py-1 rounded-md text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer transition disabled:opacity-50"
          >
            Colapsar
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 max-h-[420px] overflow-y-auto pr-1">
        {moduloKeys.map((modulo, idx) => {
          const items = grupos[modulo];
          return (
            <details
              key={modulo}
              open={isOpen(modulo, idx)}
              className="rounded-lg border border-slate-200 bg-slate-50/40 open:bg-white"
            >
              <summary className="cursor-pointer select-none px-4 py-2.5 text-[13px] font-semibold text-slate-700 list-none flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="text-slate-400">▸</span>
                  {modulo}
                </span>
                <span className="text-[11px] text-slate-400 font-normal">
                  {items.filter((p) => selectedSet.has(Number(p.Id))).length} /{" "}
                  {items.length}
                </span>
              </summary>
              <div className="px-3 pb-3 pt-1 flex flex-col gap-1">
                {items.map((p) => {
                  const checked = selectedSet.has(Number(p.Id));
                  return (
                    <label
                      key={p.Id}
                      className={`flex items-start gap-3 rounded-md px-3 py-2 cursor-pointer transition ${
                        disabled
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => togglePermiso(p.Id)}
                        disabled={disabled}
                        className="mt-0.5 w-4 h-4 accent-violet-600 cursor-pointer disabled:cursor-not-allowed"
                      />
                      <span className="flex-1 min-w-0">
                        <span className="block text-[13px] text-slate-700">
                          {p.Nombre}
                        </span>
                        <code className="block text-[11px] text-slate-400 font-mono mt-0.5">
                          {p.Codigo}
                        </code>
                      </span>
                    </label>
                  );
                })}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
