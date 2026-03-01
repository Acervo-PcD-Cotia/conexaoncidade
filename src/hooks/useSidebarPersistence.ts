import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";

const STORAGE_KEY_OPEN_GROUP = "adminSidebarOpenGroup";
const STORAGE_KEY_COLLAPSED = "adminSidebarCollapsed";

// ============ NOVA ARQUITETURA DE 6 MÓDULOS SEMÂNTICOS ============
// Map routes to their parent group IDs
const ROUTE_TO_GROUP: Record<string, string> = {
  // CONTEÚDO
  "/spah/painel": "conteudo",
  "/spah/painel/news": "conteudo",
  "/spah/painel/noticias-ai": "conteudo",
  "/spah/painel/quick-notes": "conteudo",
  "/spah/painel/stories": "conteudo",
  "/spah/painel/podcasts": "conteudo",
  "/spah/painel/editions": "conteudo",
  "/spah/painel/autopost-regional": "conteudo",
  "/spah/painel/relatorio-txt": "conteudo",
  
  // DISTRIBUIÇÃO & ALCANCE
  "/spah/painel/social": "distribuicao",
  "/spah/painel/links": "distribuicao",
  "/spah/painel/anti-fake-news": "distribuicao",
  
  // PUBLICIDADE & MONETIZAÇÃO
  "/spah/painel/ads": "monetizacao",
  "/spah/painel/banners": "monetizacao",
  "/spah/painel/publidoor": "monetizacao",
  "/spah/painel/partners": "monetizacao",
  
  // STREAMING & MÍDIA
  "/spah/painel/stream": "streaming",
  "/spah/painel/broadcast": "streaming",
  "/spah/painel/conexao-studio": "streaming",
  "/spah/painel/streaming/radio": "streaming",
  "/spah/painel/streaming/tv": "streaming",
  
  // GESTÃO DO PORTAL
  "/spah/painel/home-editor": "gestao",
  "/spah/painel/categories": "gestao",
  "/spah/painel/tags": "gestao",
  "/spah/painel/settings/template": "gestao",
  "/spah/painel/settings/vocabulary": "gestao",
  "/spah/painel/settings/modules": "gestao",
  
  // INTELIGÊNCIA & MÉTRICAS
  "/spah/painel/analytics": "inteligencia",
  "/spah/painel/reading-analytics": "inteligencia",
  
  // CONEXÃO ACADEMY (primeiro nível)
  "/spah/painel/academy": "academy",
  "/spah/painel/academy/curso": "academy",
  "/spah/painel/academy/aula": "academy",
  "/spah/painel/academy/admin": "academy",
  
  // CONEXÃO.AI (primeiro nível)
  "/spah/painel/conexao-ai": "conexao-ai",
  "/spah/painel/conexao-ai/assistente": "conexao-ai",
  "/spah/painel/conexao-ai/criador": "conexao-ai",
  "/spah/painel/conexao-ai/ferramentas": "conexao-ai",
  "/spah/painel/conexao-ai/automacoes": "conexao-ai",
  "/spah/painel/conexao-ai/insights": "conexao-ai",
  
  // NEGÓCIOS
  "/spah/painel/solutions": "negocios",
  "/spah/painel/financial": "negocios",
  "/spah/painel/autopost": "negocios",
  "/spah/painel/campaigns": "negocios",
  "/spah/painel/censo-pcd": "negocios",
  
  // TRANSPORTE ESCOLAR
  "/spah/painel/transporte-escolar": "transporte",
  
  // ADMINISTRAÇÃO
  "/spah/painel/community": "admin",
  "/spah/painel/sso-monitor": "admin",
  "/spah/painel/users": "admin",
  "/spah/painel/logs": "admin",
  "/spah/painel/settings": "admin",
};

function getGroupFromPath(pathname: string): string | null {
  // Exact match first
  if (ROUTE_TO_GROUP[pathname]) {
    return ROUTE_TO_GROUP[pathname];
  }
  
  // Check for partial matches (e.g., /spah/painel/broadcast/list matches /spah/painel/broadcast)
  const sortedRoutes = Object.keys(ROUTE_TO_GROUP).sort((a, b) => b.length - a.length);
  for (const route of sortedRoutes) {
    if (pathname.startsWith(route) && route !== "/spah/painel") {
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
