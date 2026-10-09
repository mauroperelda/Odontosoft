import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { toastError } from "../utils/swal";

/**
 * Protege una ruta. Por defecto sólo chequea que haya sesión. Si se pasa
 * la prop `roles` (array de códigos), también exige que el user tenga al
 * menos uno de esos roles; si no, redirige a /dashboard y dispara un
 * toast de error.
 */
export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, roles: userRoles } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Si la ruta exige roles y el user no tiene ninguno de ellos, afuera.
  if (Array.isArray(roles) && roles.length > 0) {
    const tieneAlguno = roles.some((r) => userRoles.includes(r));
    if (!tieneAlguno) {
      // Toast en el siguiente tick para que se dispare después de que el
      // Navigate haya desmontado esta ruta.
      setTimeout(() => {
        toastError("No tenés permisos para acceder a esa sección.");
      }, 0);
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}
