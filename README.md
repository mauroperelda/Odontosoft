# OdontoSoft — Frontend (React + Vite)

> Single Page Application (SPA) para la gestión integral de un consultorio odontológico: pacientes, turnos, presupuestos, pagos, odontograma, periodontograma e imágenes, con autenticación JWT, control de acceso por roles (RBAC) y un layout responsive con modo claro/oscuro. Construida con **React 19**, **Vite 8** y **TailwindCSS 4**.

> **Repos relacionados**
>
> - **Backend (este sistema consume):** [`odontosoft-back`](https://github.com/mauroperelda/odontosoftback) — solución .NET con `OdontoSoft.API` (REST).
> - **API de identidad:** [`ApiGetToken`](https://github.com/mauroperelda/ApiGetToken) — emite y valida los tokens JWT con BCrypt + RBAC; comparte `Jwt:Key`/`Issuer`/`Audience` con `OdontoSoft.API`.

---

## 1. Resumen

- **Dominio**: frontend de gestión para clínica odontológica. Cubre los flujos completos de **pacientes** (alta, edición, búsqueda), **ficha clínica por paciente** (odontograma interactivo, periodontograma, historia clínica, imágenes), **turnos** (agenda + carga manual), **facturación** (presupuestos y pagos) y **administración** (usuarios, roles y permisos).
- **Stack principal**: **React 19** + **Vite 8** + **JavaScript (ESM)**, **TailwindCSS 4**, **Axios**, **React Router 7**, **Lucide Icons**, **SweetAlert2**.
- **Bundler / DX**: Vite 8 con plugin custom para proxy a la API de negocio, plugin de proxy estándar de Vite para la API de identidad, **Babel + React Compiler** (`@rolldown/plugin-babel` + `babel-plugin-react-compiler`) y **ESLint 9** con `eslint-plugin-react-hooks` y `eslint-plugin-react-refresh`.
- **Autenticación y autorización**:
  - Login contra `ApiGetToken` (`POST /api/Account/Login`) → **JWT** persistido en `localStorage`.
  - Inyección automática del header `Authorization: Bearer …` en cada request vía interceptor de Axios.
  - **Renovación de sesión cross-tab** (`storage` event) y **logout forzado por 401** (evento `auth:logout`).
  - **Roles y permisos leídos directamente del JWT** (claims `Rol` y `Permiso`) — sin round-trip por render.
  - **`<ProtectedRoute>`** con gate por roles (ej. `/admin/*` requiere `admin`).
- **UI / UX**:
  - **Layout responsive** desktop + mobile drawer con bloqueo de scroll y cierre por `Esc`.
  - **Tema claro/oscuro** con persistencia en `localStorage` y respeto a `prefers-color-scheme`.
  - Componentes reutilizables (`StatCard`, `Card`, `Button`, `Loader`, modales, tablas) y `swal.js` como helper único de toasts/alertas.

---

## 2. Arquitectura del frontend

```
odontosoft-front/
├── index.html                       ← entry HTML (Vite)
├── vite.config.js                   ← plugins + proxies a /api y /auth-api
├── eslint.config.js                 ← ESLint 9 flat config
├── package.json
├── public/                          ← assets estáticos (favicon, icons)
├── scripts/                         ← deploy.ps1, start-tunnels.ps1 (PowerShell)
└── src/
    ├── main.jsx                     ← ReactDOM.createRoot + <App />
    ├── App.jsx                      ← Router, providers y rutas
    ├── App.css / styles/globals.css ← reset, layout y componentes (Tailwind 4)
    ├── context/                     ← Auth + Theme (providers + useX hooks)
    ├── layout/                      ← MainLayout, Sidebar, Topbar, Content, Header
    ├── components/                  ← UI reutilizable, modales, ProtectedRoute
    │   └── ficha/                   ← OdontogramaChart, Periodontograma*, UploadImagenes, ToothShape…
    ├── pages/                       ← Páginas routed: Login, Dashboard, Pacientes, Turnos…
    │   └── pacientes/               ← Sub-rutas ficha: odontograma, historia, perio, imágenes
    ├── services/                    ← 1 archivo por dominio (api, auth, patients, …)
    └── utils/                       ← permissions, swal, dental, useMediaQuery, turnoFormat
```

### Diagrama lógico

```
                ┌────────────────────────────────────────────────┐
                │                  Browser SPA                   │
                │  ┌──────────┐    ┌──────────┐    ┌──────────┐   │
                │  │  Auth    │    │  Theme   │    │ Protected│   │
                │  │ Context  │    │ Context  │    │  Route   │   │
                │  └────┬─────┘    └──────────┘    └────┬─────┘   │
                │       │ token, roles, permisos         │         │
                │       ▼                                ▼         │
                │  ┌──────────┐                  ┌────────────┐    │
                │  │  Axios   │── Bearer ────────│  Pages     │    │
                │  │ intercept│                  │  (rutas)   │    │
                │  └────┬─────┘                  └─────┬──────┘    │
                │       │                              │           │
                │       │  /api      /auth-api         │           │
                └───┬───┴──────────────────────────────┴────┬──────┘
                    │                                      │
                    ▼                                      ▼
       ┌────────────────────────┐               ┌──────────────────────┐
       │   OdontoSoft.API       │               │   ApiGetToken        │
       │   (negocio, JWT)       │ ◄── JWT ────► │   (identidad, JWT)   │
       └────────────┬───────────┘               └──────────┬───────────┘
                    │                                      │
                    ▼                                      ▼
              SQL Server (Odontosoft)             SQL Server (MANAGER_ODONTOSOFT)
```

### Patrones aplicados

- **Context + Hook** (`AuthContext`, `ThemeContext`) con `useMemo` para estabilizar referencias y evitar renders innecesarios.
- **Separación dominio / infraestructura** en `services/`: cada recurso del backend tiene un módulo JS (`patients.js`, `turnos.js`, `roles.js`, etc.) + un cliente Axios parametrizable.
- **Custom proxy en Vite** (no usa el proxy estándar porque Vite 8 + http-proxy strippea `Authorization` contra `localhost`) — un plugin reenvía los headers manualmente con `http`/`https` nativo de Node.
- **Componentes presentacionales + contenedores**: páginas consumen servicios, modales y tablas; los modales exponen props + callbacks.
- **Rutas con sub-rutas anidadas** (`/pacientes/:id` → `odontograma`, `historia-clinica`, `periodontograma`, `imagenes`).
- **Layout adaptativo desktop/mobile** con un solo `MainLayout` que monta `Sidebar` (desktop) o un `Drawer` (mobile < 768px) y sincroniza contra `useMediaQuery`.

---

## 3. Stack tecnológico

| Capa            | Tecnología                                                                                             |
| --------------- | ------------------------------------------------------------------------------------------------------ |
| UI              | **React 19.2** + **React DOM 19.2** (`StrictMode`, hooks, contextos)                                   |
| Lenguaje        | **JavaScript (ESM)** (no TypeScript)                                                                   |
| Build / dev     | **Vite 8** + `@vitejs/plugin-react` + `@rolldown/plugin-babel` + `babel-plugin-react-compiler`         |
| Estilos         | **TailwindCSS 4** (`@tailwindcss/vite`), `globals.css` con tokens, dark-mode vía atributo `data-theme` |
| Routing         | **react-router-dom 7** (`BrowserRouter`, `Routes`, `Outlet`, `NavLink`)                                |
| HTTP            | **Axios 1.x** con dos clientes (`api` para negocio, `authApi` para identidad) e interceptors           |
| Iconos          | **lucide-react**                                                                                       |
| Alertas/toasts  | **SweetAlert 2** centralizado en `utils/swal.js` (`toastError`, `errorAlert`, etc.)                    |
| Auth/JWT        | **jsonwebtoken 9** (instalado; el parseo de claims se hace con `atob` propio en `services/auth.js`)    |
| Linter          | **ESLint 9** flat config + `eslint-plugin-react-hooks` + `eslint-plugin-react-refresh`                 |
| Deploy / devops | Scripts PowerShell: `scripts/deploy.ps1` (deploy) y `scripts/start-tunnels.ps1` (trycloudflare)        |

---

## 4. Sistema de login / autenticación

### 4.1. Clientes HTTP

```js
// src/services/auth.js  →  cliente para la API de IDENTIDAD
authApi = axios.create({
  baseURL: import.meta.env.VITE_AUTH_API_URL || "/auth-api",
});

// src/services/api.jsx   →  cliente para la API de NEGOCIO
api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
});
```

El proxy de Vite redirige:

- `/auth-api/*` → `https://localhost:7229/api/*` (ApiGetToken)
- `/api/*` → `https://localhost:7288/*` (OdontoSoft.API)

> **Detalle técnico**: el proxy a `/api` es un plugin custom (no el de Vite) porque Vite 8 + `http-proxy` strippea el header `Authorization` cuando el target es `localhost`. El plugin reenvía los headers manualmente usando los módulos `http`/`https` nativos de Node.

### 4.2. Flujo de login

```
[Login.jsx]
  • Valida email/username + password en cliente
  • loginRequest({ username, password })
        └─► authApi.post("/Account/Login")
              └─► ApiGetToken /api/Account/Login
                    └─► 200 { result, message, token, userData }
  • Normaliza response (camelCase → PascalCase) para el resto del código
  • AuthContext.login(userData, token)
        ├─ tokenStorage.set(jwt)        // localStorage["odontosoft_token"]
        ├─ userStorage.set(userData)    // localStorage["odontosoft_user"]
        └─ setUser/setToken + emisión a todos los consumers
  • navigate("/dashboard")
```

### 4.3. Inyección del token en cada request (interceptor de Axios)

```js
api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (!token) return config;

  // Si el token está vencido, limpia sesión y emite auth:logout
  const expiry = parseJwtClaims(token).exp * 1000;
  if (expiry < Date.now()) {
    tokenStorage.clear();
    window.dispatchEvent(new Event("auth:logout"));
    return config;
  }

  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      tokenStorage.clear();
      window.dispatchEvent(new Event("auth:logout")); // → AuthContext hace logout
    }
    return Promise.reject(err);
  },
);
```

### 4.4. AuthContext (single source of truth en el cliente)

```js
const {
  user,
  token,
  isAuthenticated,
  login,
  logout,
  roles,
  permisos,
  hasRole,
  hasPermission,
  isAdmin,
} = useAuth();
```

- `roles` y `permisos` se derivan de los **claims `Rol` y `Permiso` del JWT** con `useMemo` — **O(1) por render, sin request al backend**.
- Sincronización **entre pestañas** vía `window.addEventListener("storage", …)`.
- **Logout forzado** vía `window.dispatchEvent(new Event("auth:logout"))` (disparado por el interceptor al recibir 401 o cuando el token expira localmente).
- Para datos autoritativos (p. ej. después de un cambio de roles) el backend expone `GET /api/Auth/Me`.

### 4.5. Helpers de claims

`src/utils/permissions.js` parsea el payload del JWT y expone:

```js
getRolesFromToken(token); // ["admin", "profesional"]
getPermisosFromToken(token); // ["Paciente.Crear", "Turno.Editar", ...]
hasRole(token, "admin"); // boolean
hasPermission(token, "X"); // boolean
isAdmin(token); // hasRole(token, "admin")
```

> **No se hace request al backend en cada lectura de permiso** — se lee del JWT local. El back puede haber cambiado permisos desde el último login, pero mientras el token esté vigente es lo que vale.

### 4.6. `<ProtectedRoute>` y gate por roles

```jsx
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
```

- Si no hay sesión → redirige a `/login` (guarda `location` en `state` para volver tras login).
- Si la ruta exige roles y el user no los tiene → redirige a `/dashboard` + toast de error.

### 4.7. Rutas principales

| Ruta                  | Auth        | Descripción                                                    |
| --------------------- | ----------- | -------------------------------------------------------------- |
| `/login`              | público     | Pantalla de login (email/username + password, mostrar/ocultar) |
| `/registro`           | público     | Registro self-service                                          |
| `/dashboard`          | JWT         | KPIs (turnos de hoy, pacientes, $) + lista de turnos           |
| `/pacientes`          | JWT         | Listado + alta + edición + búsqueda por nombre/DNI             |
| `/pacientes/:id`      | JWT         | Ficha con sub-tabs:                                            |
| ├─ `odontograma`      | JWT         | Odontograma interactivo por pieza                              |
| ├─ `historia-clinica` | JWT         | Historia clínica del paciente                                  |
| ├─ `periodontograma`  | JWT         | Periodontograma (sondaje por pieza)                            |
| └─ `imagenes`         | JWT         | Galería + upload de imágenes (multipart, 10 MB)                |
| `/turnos`             | JWT         | Agenda + carga manual de turnos                                |
| `/facturacion`        | JWT         | Presupuestos y pagos (con tabs y formularios)                  |
| `/ajustes`            | JWT         | Ajustes del sistema (tema, etc.)                               |
| `/admin/*`            | rol `admin` | Sub-tabs: **usuarios**, **roles**, **permisos**                |

---

## 5. Servicios del frontend

Cada archivo en `src/services/` es un módulo fino sobre Axios. Algunos ejemplos:

| Módulo               | Responsabilidad                                                                                             |
| -------------------- | ----------------------------------------------------------------------------------------------------------- |
| `api.jsx`            | Cliente Axios base + interceptors de token/401/exp + helpers de `VITE_*`                                    |
| `auth.js`            | `authApi` (ApiGetToken), `loginRequest`, `registerRequest`, `tokenStorage`, `userStorage`, `parseJwtClaims` |
| `apiErrors.js`       | `formatApiError(err)` — extrae mensaje legible de distintas formas de error                                 |
| `uploadApi.jsx`      | Cliente para uploads multipart (`Content-Type: multipart/form-data`)                                        |
| `patients.js`        | `getPatients`, `getPatientById`, `createPatient`, `updatePatient`, `deletePatient`, `getPatientByNameOrDni` |
| `appointments.js`    | Turnos: alta, edición, agenda (`getAppointmentsCalendar`)                                                   |
| `tratamientos.js`    | Tratamientos + precios                                                                                      |
| `presupuestos.js`    | Presupuestos + detalle                                                                                      |
| `invoices.js`        | Pagos / facturación                                                                                         |
| `historiaClinica.js` | Historia clínica del paciente                                                                               |
| `odontograma.js`     | Odontograma por pieza                                                                                       |
| `periodontograma.js` | Periodontograma                                                                                             |
| `imagenes.js`        | Imágenes del paciente                                                                                       |
| `ubicaciones.js`     | Ubicaciones del consultorio                                                                                 |
| `locations.js`       | Localidades y provincias                                                                                    |
| `lookups.js`         | Datos de referencia cruzados                                                                                |
| `dashboard.js`       | Agregados para la home                                                                                      |
| `usuarios.js`        | CRUD admin de usuarios + asignación de roles                                                                |
| `roles.js`           | CRUD admin de roles + permisos                                                                              |
| `permisos.js`        | CRUD admin de permisos                                                                                      |
| `turnoFormat.js`     | Helpers de formato (estado, nombre, color)                                                                  |

---

## 6. Componentes UI reutilizables

`src/components/` agrupa piezas independientes del dominio:

- **Layout / chrome**: `AdminLayout`, `MainLayout` (en `src/layout/`), `Sidebar`, `Topbar`, `Header`, `ContentLayout`, `ProtectedRoute`.
- **Tarjetas / métricas**: `StatCard`, `Card`, `Button`, `Loader`, `PageLoader`.
- **Tablas / listados**: `PatientTable`, `UsersAdminTable`, `RolesAdminTable`, `PermissionsCatalogTable`, `PermissionsGroupEditor`, `RolesGroupEditor`, `InvoiceTable`, `BillingHeader`, `BillingTabs`, `PatientListHeader`.
- **Modales**: `PatientModal`, `AddPatientModal`, `AppointmentModal`, `UserFormModal`, `RoleFormModal`, `InvoiceForm`, `ManualLoadForm`, `SearchPatientForm`, `PatientSearchInput`.
- **Ficha del paciente** (`src/components/ficha/`): `FichaHeader`, `FichaTabs`, `OdontogramaChart`, `PeriodontogramaChart`, `PeriodontogramaEditor`, `PiezaModal`, `ImagenesGallery`, `UploadImagenesModal`, `teeth/ToothShape`.
- **Calendarios**: `Calendar`.

`src/utils/` aporta `swal.js` (toasts/alertas), `permissions.js` (claims), `dental.js` (catálogo dental), `useMediaQuery.js`, `turnoFormat.js` (formateos varios).

---

## 7. Theming y responsive

- **Tailwind 4** vía `@tailwindcss/vite` + `@import "tailwindcss"` en `globals.css`.
- **Tema claro/oscuro** con atributo `data-theme` en `<html>`, persistido en `localStorage` (`odontosoft-theme`) y respeto a `prefers-color-scheme` en el primer render.
- **Responsive** mobile-first con un breakpoint principal en **768px** (md:). `MainLayout` decide entre `Sidebar` fijo (desktop) y `Drawer` overlay (mobile), con cierre por `Esc` y bloqueo de scroll del body mientras el drawer está abierto.

---

## 8. Despliegue y túneles

`scripts/` contiene dos scripts PowerShell:

- `scripts/deploy.ps1` — empaqueta y publica el `dist/` generado.
- `scripts/start-tunnels.ps1` — levanta túneles tipo **trycloudflare.com** para exponer el dev server públicamente (útil para probar contra la API de negocio desde cualquier device).

Comandos npm:

```bash
npm run dev               # Vite dev server con HMR
npm run build             # build a ./dist
npm run build:remote      # build con --mode remote
npm run build:deploy      # build + deploy.ps1
npm run build:remote:deploy
npm run tunnel            # levantar trycloudflare
npm run lint              # ESLint
npm run preview           # servir ./dist en :4173
```

---

## 9. Cómo correrlo localmente

### Requisitos

- Node.js 20+ y npm.
- Backend levantado (al menos `ApiGetToken` y `OdontoSoft.API`) — ver `odontosoft-back/README.md`.

### Variables de entorno (`.env`)

```ini
VITE_AUTH_API_URL=/auth-api        # default, vía proxy de Vite
VITE_API_BASE_URL=/api             # default, vía proxy de Vite
```

### Pasos

```bash
npm install
npm run dev      # abre http://localhost:5173
```

Login con cualquier usuario creado en `ApiGetToken` (seed inicial: `admin` / admin) y la app se autentica contra `https://localhost:7229/api/Account/Login`.

---

## 10. Aprendizajes y logros técnicos destacables

- **SPA React 19** con arquitectura de **contextos independientes** (Auth + Theme) y consumo de backend vía **dos clientes Axios especializados** (auth y negocio).
- **Auth/AuthZ client-side**:
  - JWT en `localStorage` con interceptors que limpian sesión al expirar o al recibir 401.
  - Sincronización **cross-tab** y logout forzado vía eventos de `window`.
  - **Roles y permisos derivados del JWT** (O(1), sin round-trip).
  - **`<ProtectedRoute>` con gate por roles** y redirección inteligente.
- **Custom Vite plugin** para resolver un bug conocido de Vite 8 + `http-proxy` que strippea `Authorization` contra `localhost` — solución con `http`/`https` nativos de Node.
- **React Compiler** habilitado vía `@rolldown/plugin-babel` + `babel-plugin-react-compiler` para memoización automática.
- **UI responsiva única** desktop + mobile drawer con manejo de `Esc`, scroll-lock y media queries reactivas.
- **Tema claro/oscuro** con `prefers-color-scheme`, persistido y sincronizado con `data-theme`.
- **ESLint 9 flat config** con `react-hooks` y `react-refresh` para hygiene de hooks y Fast Refresh.

---

## 11. Licencia

Este proyecto se distribuye bajo los términos del archivo `LICENSE` incluido en el repositorio.

---

**Mauro Perelda** — _Frontend / Full-stack Developer_
