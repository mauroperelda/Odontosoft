import { useEffect, useMemo, useState } from "react";
import { tokenStorage, userStorage } from "../services/auth";
import { AuthContext } from "./AuthContextObject";
import {
  getRolesFromToken,
  getPermisosFromToken,
  hasRole as hasRoleFromToken,
  hasPermission as hasPermissionFromToken,
  isAdmin as isAdminFromToken,
} from "../utils/permissions";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => userStorage.get());
  const [token, setToken] = useState(() => tokenStorage.get());

  // Sincroniza entre pestañas + logout forzado por api.jsx (401, token expirado)
  useEffect(() => {
    const onStorageOrLogout = () => {
      setUser(userStorage.get());
      setToken(tokenStorage.get());
    };
    window.addEventListener("storage", onStorageOrLogout);
    window.addEventListener("auth:logout", onStorageOrLogout);
    return () => {
      window.removeEventListener("storage", onStorageOrLogout);
      window.removeEventListener("auth:logout", onStorageOrLogout);
    };
  }, []);

  const login = (userData, jwt) => {
    userStorage.set(userData);
    tokenStorage.set(jwt);
    setUser(userData);
    setToken(jwt);
  };

  const logout = () => {
    tokenStorage.clear();
    setUser(null);
    setToken(null);
  };

  // Roles/permisos vienen de los claims del JWT (no se pegan al back).
  // El back también expone GET /api/Auth/Me para datos autoritativos, pero
  // leer del JWT es O(1) y no requiere round-trip por render.
  const roles = useMemo(() => getRolesFromToken(token), [token]);
  const permisos = useMemo(() => getPermisosFromToken(token), [token]);

  // Helpers convenientes para los consumidores. Aceptan un argumento y
  // delegan en los helpers de utils/permissions.js, que son los que
  // realmente parsean el token. Aislamos el token acá para que el resto
  // del código no lo manipule directamente.
  const hasRole = (rol) => hasRoleFromToken(token, rol);
  const hasPermission = (permiso) => hasPermissionFromToken(token, permiso);
  const isAdmin = () => isAdminFromToken(token);

  // useMemo en el value para que la referencia del objeto sea estable
  // entre renders (mientras user y token no cambien). Sin esto, cualquier
  // consumidor de useAuth re-renderiza aunque nada haya cambiado.
  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!token,
      login,
      logout,
      roles,
      permisos,
      hasRole,
      hasPermission,
      isAdmin,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, token, roles, permisos]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
