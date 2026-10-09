import { NavLink } from "react-router-dom";
import { Stethoscope, ClipboardList, Activity, Image as ImageIcon } from "lucide-react";

// 4 cards como tabs (no underline). Cada una es un NavLink para que
// la URL cambie al alternar pestañas y back/forward funcione solo.
const TABS = [
  { to: "odontograma",    label: "Odontograma",     desc: "Diagrama de piezas",    icon: Stethoscope,   color: "violet"  },
  { to: "historia-clinica", label: "Historia Clínica", desc: "Anamnesis y fichas",   icon: ClipboardList, color: "sky"     },
  { to: "periodontograma",  label: "Periodontograma",  desc: "Evaluación periodontal", icon: Activity,    color: "emerald" },
  { to: "imagenes",         label: "Imágenes",         desc: "Radiografías y fotos",   icon: ImageIcon,   color: "amber"   },
];

const ACTIVE_CLASSES = {
  violet:  "border-violet-500 bg-violet-50/60",
  sky:     "border-sky-500 bg-sky-50/60",
  emerald: "border-emerald-500 bg-emerald-50/60",
  amber:   "border-amber-500 bg-amber-50/60",
};
const ICON_CLASSES = {
  violet:  "bg-violet-100 text-violet-600",
  sky:     "bg-sky-100 text-sky-600",
  emerald: "bg-emerald-100 text-emerald-600",
  amber:   "bg-amber-100 text-amber-600",
};
const LABEL_ACTIVE = {
  violet:  "text-violet-700",
  sky:     "text-sky-700",
  emerald: "text-emerald-700",
  amber:   "text-amber-700",
};

export default function FichaTabs() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `flex flex-col items-start gap-2 rounded-2xl border-2 p-4 transition-all ${
                isActive
                  ? ACTIVE_CLASSES[tab.color]
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${ICON_CLASSES[tab.color]}`}>
                  <Icon size={18} />
                </div>
                <div>
                  <div className={`text-[14px] font-semibold ${isActive ? LABEL_ACTIVE[tab.color] : "text-slate-800"}`}>
                    {tab.label}
                  </div>
                  <div className="text-[12px] text-slate-500 mt-0.5">{tab.desc}</div>
                </div>
              </>
            )}
          </NavLink>
        );
      })}
    </div>
  );
}
