import { useEffect, useState } from "react";

/**
 * Suscribe a una media query de CSS y devuelve si matchea en el momento actual.
 *
 * @param {string} query - ej: "(max-width: 767px)"
 * @returns {boolean}
 */
export default function useMediaQuery(query) {
  const getMatch = () =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false;

  const [matches, setMatches] = useState(getMatch);

  useEffect(() => {
    const mq = window.matchMedia(query);
    // El lazy initializer de useState ya leyó el valor inicial; acá sólo
    // nos suscribimos a cambios futuros del media query.
    const handler = (e) => setMatches(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [query]);

  return matches;
}
