import { useEffect, useRef, useState } from "react";
import { Loader2, Search, X } from "lucide-react";
import { searchPatients } from "../services/patients";
import { formatApiError } from "../services/apiErrors";

// Combobox/autocomplete de pacientes: tipea para buscar por nombre o DNI.
// Mantiene el id seleccionado en `value` y notifica via `onChange(id, patient)`.
export default function PatientSearchInput({
  value,
  onChange,
  error,
  placeholder = "Buscar paciente por nombre o DNI...",
  autoFocus = false,
  defaultPatient = null,
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const [selected, setSelected] = useState(defaultPatient);

  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Si el padre nos pasa un `defaultPatient`, lo sincronizamos como
  // `selected` para mostrar el nombre en el input. Esto cubre el caso
  // donde el paciente se carga de forma asíncrona (ej. edición de un
  // turno: el modal lo setea en su useEffect, después del mount).
  useEffect(() => {
    if (defaultPatient && (!selected || selected.Id !== defaultPatient.Id)) {
      setSelected(defaultPatient);
    }
  }, [defaultPatient, selected]);

  // Búsqueda debounced al endpoint /paciente/GetAllByNombreDni
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const data = await searchPatients(trimmed);
        if (!cancelled) {
          setResults(Array.isArray(data) ? data : []);
          setHighlighted(0);
        }
      } catch (err) {
        if (!cancelled) {
          setResults([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  // Cierra el dropdown al hacer click fuera
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Auto-focus opcional al montar
  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = (patient) => {
    const id = patient.Id ?? patient.id;
    onChange(id, patient);
    setSelected(patient);
    setQuery("");
    setResults([]);
    setOpen(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    onChange("", null);
    setSelected(null);
    setQuery("");
    setResults([]);
    setOpen(true);
    inputRef.current?.focus();
  };

  const handleKey = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlighted((h) => Math.min(h + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      if (open && results[highlighted]) {
        e.preventDefault();
        handleSelect(results[highlighted]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  // El input muestra el nombre del paciente seleccionado cuando el usuario
  // no está tipeando. Al abrir el dropdown (focus) NO se oculta el label,
  // para que el paciente no desaparezca cuando el usuario hace click en el input.
  const trimmed = query.trim();
  const showSelectedLabel =
    selected && trimmed === "" && !loading;
  const displayValue = showSelectedLabel
    ? `${selected.Apellido ?? selected.apellido ?? ""}, ${selected.Nombre ?? selected.nombre ?? ""}`.trim()
    : query;

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            // Al tipear, limpiamos la selección previa
            if (selected) {
              setSelected(null);
              if (value) onChange("", null);
            }
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKey}
          placeholder={placeholder}
          autoComplete="off"
          aria-invalid={error ? "true" : undefined}
          aria-autocomplete="list"
          aria-expanded={open}
          className={[
            "w-full rounded-xl border bg-slate-50 pl-9 pr-9 py-2.5 text-sm text-slate-700 outline-none transition",
            error
              ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
              : "border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100",
          ].join(" ")}
        />

        {loading && (
          <Loader2
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-slate-400"
          />
        )}

        {!loading && (query || selected) && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
            aria-label="Limpiar selección"
            tabIndex={-1}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {open && trimmed !== "" && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 z-30 mt-1 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
        >
          {loading && results.length === 0 && (
            <li className="px-4 py-3 text-sm text-slate-500">Buscando pacientes...</li>
          )}
          {!loading && results.length === 0 && (
            <li className="px-4 py-3 text-sm text-slate-500">
              No se encontraron pacientes con "{trimmed}".
            </li>
          )}
          {results.map((p, i) => {
            const id = p.Id ?? p.id;
            const apellido = p.Apellido ?? p.apellido ?? "";
            const nombre = p.Nombre ?? p.nombre ?? "";
            const dni = p.Dni ?? p.dni ?? "";
            const isActive = i === highlighted;
            return (
              <li
                key={id}
                role="option"
                aria-selected={isActive}
                onMouseDown={(e) => {
                  // mousedown para que se ejecute antes del blur del input
                  e.preventDefault();
                  handleSelect(p);
                }}
                onMouseEnter={() => setHighlighted(i)}
                className={[
                  "cursor-pointer px-4 py-2 text-sm transition",
                  isActive ? "bg-violet-50" : "hover:bg-slate-50",
                ].join(" ")}
              >
                <div className="font-medium text-slate-800">
                  {apellido}, {nombre}
                </div>
                {dni && (
                  <div className="text-xs text-slate-500">DNI {dni}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {error && (
        <span className="mt-1 block text-xs font-normal text-red-600">
          {error}
        </span>
      )}
    </div>
  );
}
