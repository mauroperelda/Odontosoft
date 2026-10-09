// Página wrapper para /admin/*.
// Redirige a /admin/usuarios cuando se entra a /admin sin subruta.
import { Navigate } from "react-router-dom";

export default function Admin() {
  return <Navigate to="/admin/usuarios" replace />;
}
