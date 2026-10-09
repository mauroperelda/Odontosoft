/**
 * Editor simple con checkboxes de roles. Muestra cada rol con su código
 * y nombre. Usado en el form de Usuario.
 *
 * Props:
 *  - roles: Rol[]         → catálogo de roles disponibles
 *  - value: number[]      → IDs de roles seleccionados
 *  - onChange: (ids) => void
 *  - disabled: boolean
 */
export default function RolesGroupEditor({
  roles,
  value = [],
  onChange,
  disabled = false,
}) {
  const selectedSet = new Set(value.map(Number));

  const toggle = (id) => {
    if (disabled) return;
    const idNum = Number(id);
    const next = new Set(selectedSet);
    if (next.has(idNum)) next.delete(idNum);
    else next.add(idNum);
    onChange?.(Array.from(next));
  };

  if (!roles || roles.length === 0) {
    return (
      <p className="text-[12px] text-slate-400 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
        No hay roles en el sistema. Creá al menos uno desde la pestaña Roles.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      {roles.map((r) => {
        const checked = selectedSet.has(Number(r.Id));
        return (
          <label
            key={r.Id}
            className={`flex items-start gap-3 rounded-md border border-slate-200 px-3 py-2 transition ${
              disabled
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer hover:bg-slate-50"
            }`}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggle(r.Id)}
              disabled={disabled}
              className="mt-0.5 w-4 h-4 accent-violet-600 cursor-pointer disabled:cursor-not-allowed"
            />
            <span className="flex-1 min-w-0">
              <span className="block text-[13px] font-medium text-slate-700">
                {r.Nombre}
              </span>
              <code className="block text-[11px] text-slate-400 font-mono mt-0.5">
                {r.Codigo}
              </code>
            </span>
          </label>
        );
      })}
    </div>
  );
}
