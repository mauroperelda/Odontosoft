import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/useAuth";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import Pacientes from "./pages/Pacientes";
import PacienteFichaLayout from "./pages/pacientes/PacienteFichaLayout";
import PacienteFichaOdontograma from "./pages/pacientes/PacienteFichaOdontograma";
import PacienteFichaHistoriaClinica from "./pages/pacientes/PacienteFichaHistoriaClinica";
import PacienteFichaPeriodontograma from "./pages/pacientes/PacienteFichaPeriodontograma";
import PacienteFichaImagenes from "./pages/pacientes/PacienteFichaImagenes";
import Turnos from "./pages/Turnos";
import Facturacion from "./pages/Facturacion";
import Ajustes from "./pages/Ajustes";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Admin from "./pages/Admin";
import AdminUsuarios from "./pages/AdminUsuarios";
import AdminRoles from "./pages/AdminRoles";
import AdminPermisos from "./pages/AdminPermisos";
import AdminLayout from "./components/AdminLayout";
import "./App.css";
import "./styles/globals.css";

function RootRedirect() {
  // Si está autenticado, va al dashboard; si no, al login
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />

            {/* Raíz: decide a dónde ir */}
            <Route path="/" element={<RootRedirect />} />

            {/* Rutas protegidas */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pacientes"
              element={
                <ProtectedRoute>
                  <Pacientes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pacientes/:id"
              element={
                <ProtectedRoute>
                  <PacienteFichaLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="odontograma" replace />} />
              <Route path="odontograma" element={<PacienteFichaOdontograma />} />
              <Route path="historia-clinica" element={<PacienteFichaHistoriaClinica />} />
              <Route path="periodontograma" element={<PacienteFichaPeriodontograma />} />
              <Route path="imagenes" element={<PacienteFichaImagenes />} />
            </Route>
            <Route
              path="/turnos"
              element={
                <ProtectedRoute>
                  <Turnos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/facturacion"
              element={
                <ProtectedRoute>
                  <Facturacion />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ajustes"
              element={
                <ProtectedRoute>
                  <Ajustes />
                </ProtectedRoute>
              }
            />

            {/* Administración — gateada por rol "admin".
                /admin redirige a /admin/usuarios (definido en pages/Admin.jsx). */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Admin />} />
              <Route path="usuarios" element={<AdminUsuarios />} />
              <Route path="roles" element={<AdminRoles />} />
              <Route path="permisos" element={<AdminPermisos />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
