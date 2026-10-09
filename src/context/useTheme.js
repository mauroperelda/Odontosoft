import { useContext } from "react";
import { ThemeContext } from "./ThemeContextObject";

export const useTheme = () => useContext(ThemeContext);
