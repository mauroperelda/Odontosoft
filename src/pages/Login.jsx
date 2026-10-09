import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, LogIn, Stethoscope } from "lucide-react";
import { loginRequest } from "../services/auth";
import { useAuth } from "../context/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const value = email.trim();
    if (!value) return "Ingresá tu email o usuario.";

    const isEmail = value.includes("@");
    if (isEmail) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return "El email no tiene un formato válido.";
      }
    } else {
      // Validación de username: alfanumérico + . _ - , 3-50 caracteres
      if (value.length < 3) return "El usuario debe tener al menos 3 caracteres.";
      if (value.length > 50) return "El usuario es demasiado largo.";
      if (!/^[a-zA-Z0-9._-]+$/.test(value)) {
        return "El usuario solo puede contener letras, números, . _ -";
      }
    }

    if (!password) return "Ingresá tu contraseña.";
    if (password.length < 4) return "La contraseña es demasiado corta.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const response = await loginRequest({
        // El back compara contra User.Username (que se guarda como email en minúsculas)
        username: email.trim().toLowerCase(),
        password,
      });

      // Persistir token + datos de usuario. El back serializa en camelCase
      // (config default de System.Text.Json en ApiGetToken), así que leemos
      // camelCase de la respuesta y normalizamos a PascalCase para guardar
      // — es la convención del resto del proyecto (services, AuthContext,
      // Topbar, etc.). Esto se hace también en services/usuarios.js con
      // `normalizeUsuario`.
      const userData = {
        Id: response.id ?? response.Id,
        Username: response.username ?? response.Username,
        Name: response.name ?? response.Name,
        LastName: response.lastName ?? response.LastName,
        Email: response.email ?? response.Email,
        IsAdministrator: response.isAdministrator ?? response.IsAdministrator ?? false,
        IsSuperUser: response.isSuperUser ?? response.IsSuperUser ?? false,
        Activated: response.activated ?? response.Activated ?? false,
      };
      login(userData, response.Token);

      // Siempre ir al dashboard después del login
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.Message ||
        err.response?.data ||
        err.message ||
        "No se pudo iniciar sesión.";
      setError(typeof msg === "string" ? msg : "No se pudo iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

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
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <h2 className="login-form-title">Iniciar sesión</h2>
          <p className="login-form-subtitle">Ingresá a tu cuenta para continuar</p>

          {error && <div className="login-error" role="alert">{error}</div>}

          <div className="login-field">
            <label htmlFor="identifier">Email o usuario</label>
            <div className="login-input">
              <Mail size={16} color="#94a3b8" />
              <input
                id="identifier"
                type="text"
                placeholder="tucorreo@clinica.com o tu_usuario"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
              />
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="password">Contraseña</label>
            <div className="login-input">
              <Lock size={16} color="#94a3b8" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="login-eye"
                tabIndex={-1}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="login-row">
            <label className="login-remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>Recordarme</span>
            </label>
            <Link to="/recuperar" className="login-link">¿Olvidaste tu contraseña?</Link>
          </div>

          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? (
              "Ingresando..."
            ) : (
              <>
                <LogIn size={16} /> Ingresar
              </>
            )}
          </button>

          <p className="login-footer">
            ¿No tenés cuenta?{" "}
            <Link to="/registro" className="login-link">Crear cuenta</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
