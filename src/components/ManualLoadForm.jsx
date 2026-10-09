export default function ManualLoadForm() {
  return (
    <div className="mt-6 grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-[13px] font-semibold text-slate-700">Nombre</label>
          <input
            className="rounded-3xl border border-slate-200 bg-white py-3 px-4 text-sm text-slate-700 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            placeholder="Nombre del paciente"
          />
        </div>
        <div className="grid gap-2">
          <label className="text-[13px] font-semibold text-slate-700">Apellido</label>
          <input
            className="rounded-3xl border border-slate-200 bg-white py-3 px-4 text-sm text-slate-700 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            placeholder="Apellido del paciente"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <label className="text-[13px] font-semibold text-slate-700">Teléfono</label>
        <input
          className="rounded-3xl border border-slate-200 bg-white py-3 px-4 text-sm text-slate-700 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
          placeholder="Número de teléfono"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-[13px] font-semibold text-slate-700">Hora de inicio</label>
          <select className="rounded-3xl border border-slate-200 bg-white py-3 px-4 text-sm text-slate-700 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100">
            <option>Seleccionar hora</option>
          </select>
        </div>
        <div className="grid gap-2">
          <label className="text-[13px] font-semibold text-slate-700">Hora de fin</label>
          <select className="rounded-3xl border border-slate-200 bg-white py-3 px-4 text-sm text-slate-700 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100">
            <option>Seleccionar hora</option>
          </select>
        </div>
      </div>

      <div className="grid gap-2">
        <label className="text-[13px] font-semibold text-slate-700">Ubicación</label>
        <select className="rounded-3xl border border-slate-200 bg-white py-3 px-4 text-sm text-slate-700 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100">
          <option>Seleccionar ubicación</option>
        </select>
      </div>
    </div>
  );
}
