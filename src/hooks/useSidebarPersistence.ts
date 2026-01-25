import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";

const STORAGE_KEY_OPEN_GROUP = "adminSidebarOpenGroup";
const STORAGE_KEY_COLLAPSED = "adminSidebarCollapsed";

// Map routes to their parent group IDs
const ROUTE_TO_GROUP: Record<string, string> = {
  // Principal
  "/admin": "principal",
  "/admin/news": "principal",
  "/admin/noticias-ai": "principal",
  "/admin/quick-notes": "principal",
  "/admin/categories": "principal",
  "/admin/tags": "principal",
  "/admin/stories": "principal",
  
  // Editorial
  "/admin/home-editor": "editorial",
  "/admin/banners": "editorial",
  "/admin/ads": "editorial",
  "/admin/anti-fake-news": "editorial",
  "/admin/partners": "editorial",
  "/admin/social": "editorial",
  "/admin/links": "editorial",
  "/admin/analytics": "editorial",
  "/admin/editions": "editorial",
  "/admin/podcasts": "editorial",
  
  // Streaming (main group)
  "/admin/stream": "streaming",
  "/admin/broadcast": "streaming",
  "/admin/conexao-studio": "streaming",
  "/admin/streaming/radio": "streaming",
  "/admin/streaming/tv": "streaming",
  
  // Negócios
  "/admin/solutions": "negocios",
  "/admin/training": "negocios",
  "/admin/financial": "negocios",
  "/admin/autopost": "negocios",
  "/admin/campaigns": "negocios",
  
  // Transporte Escolar
  "/admin/transporte-escolar": "transporte",
  
  // Config Portal
  "/admin/settings/template": "config-portal",
  "/admin/settings/vocabulary": "config-portal",
  "/admin/settings/modules": "config-portal",
  
  // Admin
  "/admin/community": "admin",
  "/admin/sso-monitor": "admin",
  "/admin/users": "admin",
  "/admin/logs": "admin",
  "/admin/settings": "admin",
};

function getGroupFromPath(pathname: string): string | null {
  // Exact match first
  if (ROUTE_TO_GROUP[pathname]) {
    return ROUTE_TO_GROUP[pathname];
  }
  
  // Check for partial matches (e.g., /admin/broadcast/list matches /admin/broadcast)
  const sortedRoutes = Object.keys(ROUTE_TO_GROUP).sort((a, b) => b.length - a.length);
  for (const route of sortedRoutes) {
    if (pathname.startsWith(route) && route !== "/admin") {
      return ROUTE_TO_GROUP[route];
    }
  }
  
  return null;
}

export interface SidebarPersistence {
  openGroup: string | null;
  setOpenGroup: (id: string | null) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
  toggleGroup: (groupId: string) => void;
}

export function useSidebarPersistence(): SidebarPersistence {
  const location = useLocation();
  
  // Initialize state from localStorage
  const [openGroup, setOpenGroupState] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_OPEN_GROUP);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  
  const [isCollapsed, setIsCollapsedState] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_COLLAPSED);
      return stored ? JSON.parse(stored) : false;
    } catch {
      return false;
    }
  });
  
  // Persist openGroup to localStorage
  const setOpenGroup = useCallback((id: string | null) => {
    setOpenGroupState(id);
    try {
      localStorage.setItem(STORAGE_KEY_OPEN_GROUP, JSON.stringify(id));
    } catch {
      // Ignore storage errors
    }
  }, []);
  
  // Persist collapsed state to localStorage
  const setIsCollapsed = useCallback((collapsed: boolean) => {
    setIsCollapsedState(collapsed);
    try {
      localStorage.setItem(STORAGE_KEY_COLLAPSED, JSON.stringify(collapsed));
    } catch {
      // Ignore storage errors
    }
  }, []);
  
  // Toggle collapsed state
  const toggleCollapsed = useCallback(() => {
    setIsCollapsed(!isCollapsed);
  }, [isCollapsed, setIsCollapsed]);
  
  // Toggle group with single-open behavior
  const toggleGroup = useCallback((groupId: string) => {
    setOpenGroup(openGroup === groupId ? null : groupId);
  }, [openGroup, setOpenGroup]);
  
  // Auto-open group based on current route (only when not collapsed)
  useEffect(() => {
    if (isCollapsed) return;
    
    const groupForCurrentPath = getGroupFromPath(location.pathname);
    if (groupForCurrentPath && groupForCurrentPath !== openGroup) {
      setOpenGroup(groupForCurrentPath);
    }
  }, [location.pathname, isCollapsed]);
  
  return {
    openGroup,
    setOpenGroup,
    isCollapsed,
    setIsCollapsed,
    toggleCollapsed,
    toggleGroup,
  };
}
