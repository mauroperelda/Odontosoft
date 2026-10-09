import { useNavigate } from "react-router-dom";
import { ArrowLeft, X } from "lucide-react";
import { calcEdad } from "../../utils/dental";

// Header gradient con botón "Volver", nombre del paciente, edad y X de cerrar.
// Se usa arriba de todo en /pacientes/:id. NO está envuelto en MainLayout
// (la ficha es una vista enfocada que reemplaza la chrome habitual).
//
// La X de cerrar navega de vuelta a /pacientes (en vez de navigate(-1)) para
// que el destino sea predecible: siempre volvemos al listado de pacientes,
// sin importar de dónde vinimos.
export default function FichaHeader({ paciente }) {
  const navigate = useNavigate();
  if (!paciente) return null;

  const nombreCompleto = `${paciente.Nombre ?? paciente.nombre ?? ""} ${paciente.Apellido ?? paciente.apellido ?? ""}`.trim();
  const dni = paciente.Dni ?? paciente.dni;
  const edad = calcEdad(paciente.FechaNacimiento ?? paciente.fechaNacimiento);

  const cerrarFicha = () => navigate("/pacientes");

  return (
    <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-5 text-white rounded-2xl shadow-md">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 rounded-lg bg-white/15 hover:bg-white/25 transition-colors px-3 py-1.5 text-[13px] font-medium"
          title="Volver"
        >
          <ArrowLeft size={15} />
          Volver
        </button>

        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold leading-tight truncate">
            {nombreCompleto || "Paciente sin nombre"}
          </h1>
          <div className="flex items-center gap-3 mt-0.5 text-[13px] text-white/80">
            {dni && <span>DNI {dni}</span>}
            {edad != null && <span>• {edad} años</span>}
            <span>• Ficha clínica</span>
          </div>
        </div>

        <button
          type="button"
          onClick={cerrarFicha}
          aria-label="Cerrar ficha"
          title="Cerrar ficha"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-violet-700 hover:bg-white/90 hover:scale-105 transition-all shrink-0 shadow-md"
        >
          <X size={20} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
