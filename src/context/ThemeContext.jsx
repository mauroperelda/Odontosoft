import { useCallback, useEffect, useMemo, useState } from "react";
import { ThemeContext } from "./ThemeContextObject";

const STORAGE_KEY = "odontosoft-theme";

/**
 * Tema inicial: prioriza lo persistido en localStorage. Si no hay nada,
 * usa la preferencia del sistema operativo.
 */
function getInitialTheme() {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  // Sincroniza el atributo en <html> + persiste la elección del usuario.
  // Esto NO es un setState en effect — es un side-effect hacia el DOM
  // y localStorage (sincronización hacia sistemas externos).
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
