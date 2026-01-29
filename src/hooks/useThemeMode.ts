import { useState, useEffect, useMemo, useCallback } from "react";
import type { ThemeMode, ThemePreset, ResolvedTheme } from "@/types/theme";

export type { ThemeMode, ThemePreset, ResolvedTheme };

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

  const [preset, setPresetState] = useState<ThemePreset>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme-preset") as ThemePreset;
      if (stored && ["institutional", "tech"].includes(stored)) {
        return stored;
      }
    }
    return "institutional";
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

  // Apply preset attribute to document
  useEffect(() => {
    document.documentElement.setAttribute("data-preset", preset);
  }, [preset]);

  // Persist mode to localStorage
  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem("theme-mode", newMode);
  }, []);

  // Persist preset to localStorage
  const setPreset = useCallback((newPreset: ThemePreset) => {
    setPresetState(newPreset);
    localStorage.setItem("theme-preset", newPreset);
  }, []);

  // Toggle between light/dark (skips system)
  const toggleTheme = useCallback(() => {
    setMode(resolvedTheme === "light" ? "dark" : "light");
  }, [resolvedTheme, setMode]);

  return {
    mode,
    setMode,
    preset,
    setPreset,
    resolvedTheme,
    toggleTheme,
    systemTheme,
  };
}
