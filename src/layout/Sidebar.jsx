import { NavLink, useNavigate } from "react-router-dom";
import { Home, Users, Calendar, DollarSign, LogOut, Shield } from "lucide-react";
import { useAuth } from "../context/useAuth";

const NAV_BASE = [
  { to: "/dashboard",   label: "Inicio",      icon: <Home size={17} />,       end: true },
  { to: "/pacientes",   label: "Pacientes",   icon: <Users size={17} /> },
  { to: "/turnos",      label: "Turnos",      icon: <Calendar size={17} /> },
  { to: "/facturacion", label: "Facturación", icon: <DollarSign size={17} /> },
];

// Entrada de administración. Filtrada por isAdmin en el componente, pero
// declarada aparte para mantener el array base plano y simple de leer.
const NAV_ADMIN = {
  to: "/admin/usuarios",
  label: "Administración",
  icon: <Shield size={17} />,
};

export default function Sidebar({ collapsed = false, onNavigate, className = "" }) {
  const { logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  // El helper isAdmin() del AuthContext ya lee del JWT; usamos la misma
  // fuente de verdad que ProtectedRoute, así nunca se desincronizan.
  const showAdmin = isAdmin();
  const NAV = showAdmin ? [...NAV_BASE, NAV_ADMIN] : NAV_BASE;

  const linkClass = ({ isActive }) =>
    `menu-item${isActive ? " active" : ""}${collapsed ? " justify-center px-0" : ""}`;

  // En mobile el sidebar vive dentro de un drawer; al tocar una opción
  // o cerrar sesión queremos avisarle al padre para que cierre el drawer.
  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
    onNavigate?.();
  };

  return (
    <aside
      className={`sidebar transition-all duration-250 ${className}`}
      style={{ width: collapsed ? "60px" : "220px" }}
    >

      {/* Logo */}
      <div className="flex items-center gap-3 px-4 border-b border-white/10 shrink-0" style={{ height: "56px" }}>
        <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-sm">O</span>
        </div>
        {!collapsed && (
          <span className="text-white font-semibold text-[15px] whitespace-nowrap tracking-wide">
            OdontoApp
          </span>
        )}
      </div>

      {/* Nav */}
      <div className="flex-1 py-3 overflow-hidden">
        {NAV.map(({ to, label, icon, end }) => (
          <NavLink key={to} to={to} end={end} className={linkClass} onClick={() => onNavigate?.()} title={collapsed ? label : ""}>
            {icon}
            {!collapsed && label}
          </NavLink>
        ))}
      </div>

      {/* Footer — sticky para que el botón quede siempre visible aunque
          el contenido del nav sea largo (en mobile sin esto queda fuera
          de pantalla). */}
      <div className="border-t border-white/10 py-2 shrink-0 sticky bottom-0 z-10" style={{ background: "#313a46" }}>
        <button
          onClick={handleLogout}
          className={`menu-item${collapsed ? " justify-center px-0" : ""}`}
          title={collapsed ? "Cerrar sesión" : ""}
        >
          <LogOut size={17} />
          {!collapsed && "Cerrar sesión"}
        </button>
      </div>
    </aside>
  );
}