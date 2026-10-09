import { Bell, Search, Settings, Grid, Menu, Sun, Moon, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useTheme } from "../context/useTheme";

// Iniciales del avatar a partir del nombre y apellido.
// Si falta alguno, devuelve "?" para no romper la UI.
function getInitials(name, lastName) {
  const a = (name?.[0] ?? "").toUpperCase();
  const b = (lastName?.[0] ?? "").toUpperCase();
  return (a + b) || "?";
}

export default function Topbar({ onMenuToggle }) {
  const navigate = useNavigate();
  const { user, roles, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const today = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const fullName = [user?.Name, user?.LastName].filter(Boolean).join(" ") || user?.Username || "Usuario";
  const initials = getInitials(user?.Name, user?.LastName);
  const primaryRole = roles[0] ?? "—";
  const allRolesTitle = roles.length > 1 ? roles.join(" · ") : undefined;

  return (
    <div className="topbar">

      {/* Hamburguesa */}
      <button
        onClick={onMenuToggle}
        className="text-gray-500 hover:text-gray-800 transition-colors cursor-pointer bg-transparent border-none p-1 shrink-0"
      >
        <Menu size={20} />
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Fecha */}
      <span className="text-[13px] text-slate-400 capitalize hidden md:block">
        {today}
      </span>

      {/* Divisor */}
      <div className="w-px h-5 bg-gray-200 mx-1" />

      {/* Notificaciones */}
      <button className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer bg-transparent border-none">
        <Bell size={18} />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
      </button>

      {/* Ajustes — navega a /ajustes */}
      <button
        onClick={() => navigate("/ajustes")}
        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer bg-transparent border-none"
        title="Ajustes"
      >
        <Settings size={18} />
      </button>

      {/* Tema claro / oscuro */}
      <button
        type="button"
        onClick={toggleTheme}
        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer bg-transparent border-none"
        title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* Divisor */}
      <div className="w-px h-5 bg-gray-200 mx-1" />

      {/* Avatar + user info (lee del AuthContext en vez de hardcode) */}
      <div
        className="flex items-center gap-2.5 cursor-pointer"
        title={allRolesTitle}
      >
        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold text-[13px] shrink-0">
          {initials}
        </div>
        <div className="hidden sm:block">
          <p className="text-[13px] font-semibold text-slate-700 leading-none mb-0.5">
            {fullName}
          </p>
          <p className="text-[11px] text-gray-400 leading-none capitalize">
            {primaryRole}
          </p>
        </div>
      </div>

      {/* Cerrar sesión — solo visible en mobile.
          En desktop el botón vive en el sidebar (MainLayout). */}
      <button
        type="button"
        onClick={() => {
          logout();
          navigate("/login", { replace: true });
        }}
        title="Cerrar sesión"
        aria-label="Cerrar sesión"
        className="md:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-red-50 text-red-500 hover:text-red-600 transition-colors cursor-pointer bg-transparent border-none"
      >
        <LogOut size={18} />
      </button>

    </div>
  );
}