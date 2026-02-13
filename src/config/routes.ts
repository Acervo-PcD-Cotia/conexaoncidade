/**
 * Centralized route constants for administrative paths.
 * Obfuscated to avoid common attack patterns on /admin and /auth.
 */
export const ROUTES = {
  AUTH: "/spah",
  ADMIN: "/spah/painel",
  LOGIN: "/spah", // alias
} as const;
