import { useState, useEffect, useMemo, useCallback } from "react";

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export function useThemeMode() {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme-mode") as ThemeMode;
      if (stored && ["light", "dark", "system"].includes(stored)) {
        return stored;
      }
    }
    return "system";
  });

  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
  });

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Calculate resolved theme
  const resolvedTheme = useMemo<ResolvedTheme>(() => {
    if (mode === "system") {
      return systemTheme;
    }
    return mode;
  }, [mode, systemTheme]);

  // Apply theme class to document
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
  }, [resolvedTheme]);

  // Persist mode to localStorage
  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem("theme-mode", newMode);
  }, []);

  // Toggle between light/dark (skips system)
  const toggleTheme = useCallback(() => {
    setMode(resolvedTheme === "light" ? "dark" : "light");
  }, [resolvedTheme, setMode]);

  return {
    mode,
    setMode,
    resolvedTheme,
    toggleTheme,
    systemTheme,
  };
}
