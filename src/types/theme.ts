export type ThemeMode = "light" | "dark" | "system";
export type ThemePreset = "institutional" | "tech";
export type ResolvedTheme = "light" | "dark";

export interface ThemeConfig {
  mode: ThemeMode;
  preset: ThemePreset;
}
