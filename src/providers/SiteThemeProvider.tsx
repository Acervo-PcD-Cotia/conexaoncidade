import { ReactNode } from "react";
import { useApplyTheme } from "@/hooks/useSiteTheme";

interface SiteThemeProviderProps {
  children: ReactNode;
}

/**
 * Provider that applies dynamic theme CSS variables based on the active template.
 * Must be placed inside TenantProvider to access site configuration.
 */
export function SiteThemeProvider({ children }: SiteThemeProviderProps) {
  // Apply theme CSS variables to document root
  useApplyTheme();

  return <>{children}</>;
}
