import { createContext, useContext } from "react";
import type { Theme } from "../hooks/useTheme";

// theme context
export const ThemeContext = createContext<{
    theme: Theme;
    setTheme: (theme: Theme) => void;
} | null>(null);

export const useSaveThemeContext = () => useContext(ThemeContext) ?? { theme: null, setTheme: () => {} };
