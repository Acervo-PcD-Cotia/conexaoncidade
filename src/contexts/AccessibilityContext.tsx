import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export interface AccessibilitySettings {
  fontSize: "normal" | "large" | "extra-large";
  highContrast: boolean;
  reducedMotion: boolean;
  readingMode: boolean;
  vlibrasActive: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => void;
  resetSettings: () => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
}

const defaultSettings: AccessibilitySettings = {
  fontSize: "normal",
  highContrast: false,
  reducedMotion: false,
  readingMode: false,
  vlibrasActive: false,
};

const STORAGE_KEY = "accessibility-settings";

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    if (typeof window === "undefined") return defaultSettings;
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...defaultSettings, ...JSON.parse(stored) };
      }
    } catch {
      // Ignore parse errors
    }
    return defaultSettings;
  });

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // Font size
    root.classList.remove("text-base", "text-lg", "text-xl");
    switch (settings.fontSize) {
      case "large":
        root.classList.add("text-lg");
        break;
      case "extra-large":
        root.classList.add("text-xl");
        break;
      default:
        root.classList.add("text-base");
    }

    // High contrast
    if (settings.highContrast) {
      body.classList.add("high-contrast");
    } else {
      body.classList.remove("high-contrast");
    }

    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add("reduce-motion");
    } else {
      root.classList.remove("reduce-motion");
    }

    // Reading mode
    if (settings.readingMode) {
      body.classList.add("reading-mode");
    } else {
      body.classList.remove("reading-mode");
    }

    // Persist to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Ignore storage errors
    }
  }, [settings]);

  const updateSetting = useCallback(<K extends keyof AccessibilitySettings>(
    key: K, 
    value: AccessibilitySettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
  }, []);

  const increaseFontSize = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      fontSize: prev.fontSize === "normal" ? "large" : prev.fontSize === "large" ? "extra-large" : "extra-large",
    }));
  }, []);

  const decreaseFontSize = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      fontSize: prev.fontSize === "extra-large" ? "large" : prev.fontSize === "large" ? "normal" : "normal",
    }));
  }, []);

  return (
    <AccessibilityContext.Provider value={{ settings, updateSetting, resetSettings, increaseFontSize, decreaseFontSize }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility must be used within AccessibilityProvider");
  }
  return context;
}
