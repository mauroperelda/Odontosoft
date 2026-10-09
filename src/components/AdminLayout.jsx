import { NavLink, Outlet } from "react-router-dom";
import MainLayout from "../layout/MainLayout";

// Sub-tabs de administración. Usan NavLink en vez de state local para que
// cada ruta sea deep-linkable y la URL cambie al alternar pestañas
// (back/forward del browser funciona gratis).
const TABS = [
  { to: "/admin/usuarios", label: "Usuarios" },
  { to: "/admin/roles",    label: "Roles" },
  { to: "/admin/permisos", label: "Permisos" },
];

export default function AdminLayout() {
  return (
    <MainLayout headerProps={{ pageTitle: "Administración" }}>
      <div className="mb-5">
        <h1 className="text-[18px] font-semibold text-slate-800">Administración</h1>
        <p className="text-[13px] text-slate-400 mt-0.5">
          Gestioná usuarios, roles y permisos del sistema
        </p>
      </div>

      <div className="flex gap-0 border-b border-gray-200 mb-6">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `px-5 py-2.5 text-[13px] font-medium border-none cursor-pointer bg-transparent transition-colors border-b-2 -mb-px ${
                isActive
                  ? "text-indigo-600 border-indigo-600"
                  : "text-slate-500 border-transparent hover:text-slate-700"
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </MainLayout>
  );
}
