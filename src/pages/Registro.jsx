import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Mail, Lock, Eye, EyeOff, UserPlus, Stethoscope,
  User, IdCard, Mail as EmailIcon,
} from "lucide-react";
import { registerRequest, loginRequest } from "../services/auth";
import { useAuth } from "../context/useAuth";

export default function Registro() {
  const navigate = useNavigate();
  const { login: persistAuth } = useAuth();

  const [form, setForm] = useState({
    username: "",
    name: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (key) => (e) => {
    setForm({ ...form, [key]: e.target.value });
    if (errors[key]) setErrors({ ...errors, [key]: null });
  };

  // Validación en front
  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = "El usuario es obligatorio.";
    else if (form.username.length < 3) e.username = "Mínimo 3 caracteres.";
    else if (!/^[a-zA-Z0-9._-]+$/.test(form.username))
      e.username = "Solo letras, números, . _ -";

    if (!form.name.trim()) e.name = "El nombre es obligatorio.";
    if (!form.lastName.trim()) e.lastName = "El apellido es obligatorio.";

    if (!form.email.trim()) e.email = "El email es obligatorio.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Email con formato inválido.";

    if (!form.password) e.password = "La contraseña es obligatoria.";
    else if (form.password.length < 8)
      e.password = "Mínimo 8 caracteres.";

    if (form.password !== form.confirmPassword)
      e.confirmPassword = "Las contraseñas no coinciden.";

    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    if (!acceptTerms) {
      setError("Aceptá los términos y condiciones para continuar.");
      return;
    }

    setLoading(true);
    try {
      // 1) Registrar contra la API
      await registerRequest({
        Username: form.username.trim().toLowerCase(),
        Name: form.name.trim(),
        LastName: form.lastName.trim(),
        Email: form.email.trim().toLowerCase(),
        Password: form.password, // el back almacena/hasha
        // Flags por defecto que el back puede sobreescribir:
        IsAdministrator: false,
        IsSuperUser: false,
        Activated: true,
        Disabled: false,
        ChangePasswordRequired: false,
        ProfileId: 1, // perfil por defecto
      });

      // 2) Login automático para obtener el token
      const auth = await loginRequest({
        username: form.username.trim().toLowerCase(),
        password: form.password,
      });

      const userData = {
        Id: auth.id ?? auth.Id,
        Username: auth.username ?? auth.Username,
        Name: auth.name ?? auth.Name,
        LastName: auth.lastName ?? auth.LastName,
        Email: auth.email ?? auth.Email,
        IsAdministrator: auth.isAdministrator ?? auth.IsAdministrator ?? false,
        IsSuperUser: auth.isSuperUser ?? auth.IsSuperUser ?? false,
        Activated: auth.activated ?? auth.Activated ?? false,
      };
      persistAuth(userData, auth.Token);

      navigate("/", { replace: true });
    } catch (err) {
      // Errores de validación que devuelve el back (ModelState)
      const data = err.response?.data;
      if (data && typeof data === "object" && !data.Message) {
        const fieldErrors = {};
        for (const key of Object.keys(data)) {
          const val = data[key];
          if (Array.isArray(val)) fieldErrors[key.charAt(0).toLowerCase() + key.slice(1)] = val.join(" ");
          else if (typeof val === "string") fieldErrors[key.charAt(0).toLowerCase() + key.slice(1)] = val;
        }
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
          return;
        }
      }
      const msg =
        data?.Message ||
        data?.message ||
        (typeof data === "string" ? data : null) ||
        err.message ||
        "No se pudo crear la cuenta.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fieldError = (key) => errors[key] && (
    <span className="login-field-error">{errors[key]}</span>
  );

  return (
    <div className="login-page">
      {/* Panel izquierdo — branding */}
      <div className="login-brand">
        <div className="login-brand-inner">
          <div className="login-logo">
            <Stethoscope size={28} color="#ffffff" />
          </div>
          <h1 className="login-brand-title">OdontoSoft</h1>
          <p className="login-brand-subtitle">
            Software de gestión para consultorios odontológicos
          </p>
          <ul className="login-brand-list">
            <li>📅 Agenda de turnos inteligente</li>
            <li>🧑‍⚕️ Historias clínicas digitales</li>
            <li>💳 Facturación y cobros</li>
            <li>📊 Reportes en tiempo real</li>
          </ul>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="login-form-wrap">
        <form className="login-form login-form--wide" onSubmit={handleSubmit} noValidate>
          <h2 className="login-form-title">Crear cuenta</h2>
          <p className="login-form-subtitle">Empezá a gestionar tu consultorio</p>

          {error && <div className="login-error" role="alert">{error}</div>}

          <div className="login-grid-2">
            <div className="login-field">
              <label htmlFor="name">Nombre *</label>
              <div className="login-input">
                <User size={16} color="#94a3b8" />
                <input
                  id="name"
                  type="text"
                  placeholder="Mauro"
                  value={form.name}
                  onChange={update("name")}
                  autoComplete="given-name"
                />
              </div>
              {fieldError("name")}
            </div>

            <div className="login-field">
              <label htmlFor="lastName">Apellido *</label>
              <div className="login-input">
                <User size={16} color="#94a3b8" />
                <input
                  id="lastName"
                  type="text"
                  placeholder="David"
                  value={form.lastName}
                  onChange={update("lastName")}
                  autoComplete="family-name"
                />
              </div>
              {fieldError("lastName")}
            </div>

            <div className="login-field">
              <label htmlFor="username">Usuario *</label>
              <div className="login-input">
                <IdCard size={16} color="#94a3b8" />
                <input
                  id="username"
                  type="text"
                  placeholder="maurodavid"
                  value={form.username}
                  onChange={update("username")}
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                />
              </div>
              {fieldError("username")}
            </div>

            <div className="login-field">
              <label htmlFor="email">Email *</label>
              <div className="login-input">
                <EmailIcon size={16} color="#94a3b8" />
                <input
                  id="email"
                  type="email"
                  placeholder="tucorreo@clinica.com"
                  value={form.email}
                  onChange={update("email")}
                  autoComplete="email"
                />
              </div>
              {fieldError("email")}
            </div>
          </div>

          <div className="login-grid-2">
            <div className="login-field">
              <label htmlFor="password">Contraseña *</label>
              <div className="login-input">
                <Lock size={16} color="#94a3b8" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  value={form.password}
                  onChange={update("password")}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="login-eye"
                  tabIndex={-1}
                  aria-label="Mostrar u ocultar contraseña"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldError("password")}
            </div>

            <div className="login-field">
              <label htmlFor="confirmPassword">Confirmar *</label>
              <div className="login-input">
                <Lock size={16} color="#94a3b8" />
                <input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repetir contraseña"
                  value={form.confirmPassword}
                  onChange={update("confirmPassword")}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="login-eye"
                  tabIndex={-1}
                  aria-label="Mostrar u ocultar contraseña"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldError("confirmPassword")}
            </div>
          </div>

          <label className="login-remember login-terms">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
            />
            <span>
              Acepto los{" "}
              <Link to="/terminos" className="login-link">términos y condiciones</Link>
              {" "}y la{" "}
              <Link to="/privacidad" className="login-link">política de privacidad</Link>
            </span>
          </label>

          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? (
              "Creando cuenta..."
            ) : (
              <>
                <UserPlus size={16} /> Crear cuenta
              </>
            )}
          </button>

          <p className="login-footer">
            ¿Ya tenés cuenta?{" "}
            <Link to="/login" className="login-link">Iniciar sesión</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
