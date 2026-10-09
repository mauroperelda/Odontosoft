import { useEffect, useMemo, useState } from "react";
import { Search, Info } from "lucide-react";
import { getPermisos } from "../services/permisos";
import { formatApiError } from "../services/apiErrors";
import { PageLoader } from "../components/Loader";
import { errorAlert } from "../utils/swal";
import PermissionsCatalogTable from "../components/PermissionsCatalogTable";

export default function AdminPermisos() {
  const [permisos, setPermisos] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getPermisos({ pageSize: 200 })
      .then((data) => {
        if (!cancelled) setPermisos(data);
      })
      .catch((err) => {
        const { message } = formatApiError(err);
        errorAlert({ title: "Error al cargar permisos", text: message });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!searchText.trim()) return permisos;
    const q = searchText.toLowerCase();
    return permisos.filter((p) => {
      return (
        String(p.Codigo ?? "").toLowerCase().includes(q) ||
        String(p.Nombre ?? "").toLowerCase().includes(q) ||
        String(p.Modulo ?? "").toLowerCase().includes(q) ||
        String(p.Descripcion ?? "").toLowerCase().includes(q)
      );
    });
  }, [permisos, searchText]);

  return (
    <>
      <div className="mb-5">
        <h2 className="text-[16px] font-semibold text-slate-800">
          Catálogo de permisos
        </h2>
        <p className="text-[13px] text-slate-400 mt-0.5">
          Listado completo de permisos disponibles en el sistema
        </p>
      </div>

      <div className="mb-4 relative max-w-md">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Buscar por código, nombre, módulo o descripción..."
          className="w-full pl-9 pr-3 py-2 text-[13px] border border-slate-200 rounded-lg bg-white text-slate-700 placeholder-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition"
        />
      </div>

      {loading ? (
        <PageLoader message="Cargando permisos..." />
      ) : (
        <PermissionsCatalogTable permisos={filtered} />
      )}

      {/* Mensaje honesto: el catálogo es de sólo lectura, no se crean/borran
          permisos desde esta pantalla. Los códigos son contrato con el front. */}
      <div className="mt-6 flex items-start gap-3 rounded-xl border border-sky-100 bg-sky-50 px-4 py-3">
        <Info size={16} className="text-sky-600 mt-0.5 shrink-0" />
        <div className="text-[12.5px] text-sky-800 leading-relaxed">
          Los permisos se gestionan desde configuración de sistema — contactar
          al administrador. Los códigos de permiso son contrato con el front
          (auth.js, ProtectedRoute, etc.) y modificarlos puede romper pantallas.
        </div>
      </div>
    </>
  );
}
