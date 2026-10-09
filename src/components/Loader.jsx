import { Loader2 } from "lucide-react";

/**
 * Spinner inline chico para usar dentro de botones o celdas.
 * Hereda el color de texto del contexto (`text-violet-600` por defecto).
 */
export function Spinner({ className = "h-4 w-4 text-violet-600" }) {
  return (
    <Loader2
      className={`animate-spin ${className}`}
      role="status"
      aria-label="Cargando"
    />
  );
}

/**
 * Loader de página/sección. Centrado, con mensaje opcional.
 * Usar para "cargando datos" a nivel de pantalla completa o un panel grande.
 */
export function PageLoader({ message = "Cargando...", className = "" }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-3 py-12 ${className}`}
    >
      <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      {message && (
        <p className="text-sm text-slate-500">{message}</p>
      )}
    </div>
  );
}

/**
 * Loader inline horizontal para usar en banners o cards donde solo
 * se necesita una fila de "cargando..." más sutil que el PageLoader.
 */
export function InlineLoader({ message = "Cargando..." }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600"
    >
      <Loader2 className="h-4 w-4 animate-spin text-violet-600" />
      <span>{message}</span>
    </div>
  );
}

/**
 * Overlay transparente para cuando una operación bloquea la UI
 * (ej. "guardando factura" sobre el modal).
 */
export function FullPageOverlay({ message }) {
  return (
    <div
      role="status"
      aria-live="assertive"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 backdrop-blur-[1px]"
    >
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-white px-8 py-6 shadow-xl">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
        {message && (
          <p className="text-sm font-medium text-slate-700">{message}</p>
        )}
      </div>
    </div>
  );
}
