export default function PatientListHeader({ count, query, onQueryChange, onAdd }) {
  return (
    <div className="mb-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
            <span>Pacientes</span>
            <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-violet-700">{count} registrados</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Gestiona el listado completo de pacientes</h1>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
        >
          + Nuevo Paciente
        </button>
      </div>

      <div className="mt-6 max-w-md">
        <label className="sr-only" htmlFor="patient-search">Buscar paciente</label>
        <input
          id="patient-search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Buscar por nombre, DNI o email..."
          className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none transition focus:border-violet-500 focus:bg-white"
        />
      </div>
    </div>
  );
}
