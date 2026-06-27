"use client";

import { createContext, useContext, useEffect, useState } from "react";

// Selectable app themes. `light` is the default Lavender (satin) palette;
// `pink` is a soft blush; `dark` preserves the original midnight palette.
export const THEMES = [
  { id: "light", label: "Lavender", swatch: "linear-gradient(135deg,#efe3fb,#dcc9f1)", ring: "#9c1fc9" },
  { id: "pink",  label: "Blush",    swatch: "linear-gradient(135deg,#fff2f8,#ffd9e6)", ring: "#ff9dc6" },
  { id: "dark",  label: "Midnight", swatch: "linear-gradient(135deg,#2d1155,#1a0a2e)", ring: "#9b59b6" },
];

const DEFAULT_THEME = "light";
const STORAGE_KEY = "vybi-theme";

const ThemeContext = createContext({ theme: DEFAULT_THEME, setTheme: () => {} });

function applyTheme(theme) {
  if (typeof document !== "undefined") {
    document.documentElement.dataset.vybiTheme = theme;
  }
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(DEFAULT_THEME);

  // Hydrate the saved preference once on mount (localStorage is client-only).
  useEffect(() => {
    let saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch {}
    if (saved && THEMES.some((t) => t.id === saved)) {
      setThemeState(saved);
      applyTheme(saved);
    } else {
      applyTheme(DEFAULT_THEME);
    }
  }, []);

  const setTheme = (next) => {
    setThemeState(next);
    applyTheme(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch {}
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
