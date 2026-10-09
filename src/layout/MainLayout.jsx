import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import useMediaQuery from "../utils/useMediaQuery";

// Breakpoint mobile alineado con Tailwind `md:` = 768px.
const MOBILE_QUERY = "(max-width: 767px)";

export default function MainLayout({ children, headerProps }) {
  // Desktop: sidebar colapsado/expandido (empezamos expandido como antes).
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  // Mobile: drawer abierto/cerrado.
  const [mobileOpen, setMobileOpen] = useState(false);

  const isMobile = useMediaQuery(MOBILE_QUERY);

  // Si el usuario redimensiona a desktop con el drawer abierto, lo cerramos
  // para que el estado no quede colgado. Es sincronización con un sistema
  // externo (el media query del viewport), por lo que setState aquí es
  // legítimo — sólo deshabilitamos el warning de la regla nueva.
  useEffect(() => {
    if (!isMobile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMobileOpen(false);
    }
  }, [isMobile]);

  // Cerrar con ESC + bloquear scroll del body mientras el drawer está abierto.
  useEffect(() => {
    if (!isMobile || !mobileOpen) return;

    const onKey = (e) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [mobileOpen, isMobile]);

  const handleMenuToggle = () => {
    if (isMobile) setMobileOpen((o) => !o);
    else setDesktopCollapsed((c) => !c);
  };

  return (
    <div className="app-container relative">
      {/* Sidebar fijo en desktop */}
      {!isMobile && <Sidebar collapsed={desktopCollapsed} />}

      {/* Drawer mobile */}
      {isMobile && (
        <div
          className={`fixed inset-0 z-50 flex ${mobileOpen ? "" : "pointer-events-none"}`}
          aria-hidden={!mobileOpen}
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Cerrar menú"
            tabIndex={mobileOpen ? 0 : -1}
            className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${
              mobileOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => setMobileOpen(false)}
          />

          {/* Panel */}
          <div
            className={`relative z-10 h-full transition-transform duration-250 ${
              mobileOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <Sidebar
              collapsed={false}
              onNavigate={() => setMobileOpen(false)}
              className="shadow-2xl h-full"
            />
          </div>
        </div>
      )}

      <div className="main-content min-w-0 flex-1">
        <Topbar onMenuToggle={handleMenuToggle} title={headerProps?.pageTitle} />
        <div className="content">{children}</div>
      </div>
    </div>
  );
}
