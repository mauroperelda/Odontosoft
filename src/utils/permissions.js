// Helpers para extraer roles/permisos del JWT del usuario actual.
// Reusan parseJwtClaims (en services/auth.js) y devuelven siempre arrays
// (incluso si el token es null o no trae los claims).
//
// Estos helpers NO hacen requests al back. Para datos autoritativos (por
// ejemplo después de un cambio de roles), el back expone GET /api/Auth/Me.

import { parseJwtClaims } from "../services/auth";

/**
 * Devuelve la lista de códigos de roles que están en el claim "Rol" del JWT.
 * El claim puede aparecer varias veces (uno por rol); en el payload del
 * JWT se representa como string (un solo rol) o array de strings (varios).
 */
export function getRolesFromToken(token) {
  if (!token) return [];
  const claims = parseJwtClaims(token);
  const rol = claims?.Rol ?? claims?.rol;
  if (!rol) return [];
  return Array.isArray(rol) ? rol : [rol];
}

/**
 * Devuelve la lista de códigos de permisos del claim "Permiso" del JWT.
 * Mismo manejo que getRolesFromToken (string vs array).
 */
export function getPermisosFromToken(token) {
  if (!token) return [];
  const claims = parseJwtClaims(token);
  const permiso = claims?.Permiso ?? claims?.permiso;
  if (!permiso) return [];
  return Array.isArray(permiso) ? permiso : [permiso];
}

/**
 * Chequea si el usuario tiene el rol pasado (case-sensitive).
 */
export function hasRole(token, rol) {
  if (!rol) return false;
  return getRolesFromToken(token).includes(rol);
}

/**
 * Chequea si el usuario tiene el permiso pasado (case-sensitive).
 */
export function hasPermission(token, permiso) {
  if (!permiso) return false;
  return getPermisosFromToken(token).includes(permiso);
}

/**
 * Chequea si el usuario tiene el rol "admin". Útil para mostrar/ocultar
 * el bloque de administración y para proteger la ruta /admin/*.
 */
export function isAdmin(token) {
  return hasRole(token, "admin");
}
