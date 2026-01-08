import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const routeLabels: Record<string, string> = {
  admin: "Dashboard",
  "noticias-ai": "Notícias AI",
  news: "Notícias",
  new: "Nova",
  edit: "Editar",
  categories: "Categorias",
  tags: "Tags",
  banners: "Banners",
  ads: "Anúncios",
  stories: "Stories",
  users: "Usuários",
  "home-editor": "Editor Home",
  "quick-notes": "Notas Rápidas",
  analytics: "Analytics",
  social: "Redes Sociais",
  queue: "Fila",
  history: "Histórico",
  logs: "Logs",
  settings: "Configurações",
  links: "Links",
  create: "Criar",
  solutions: "Soluções",
  events: "Eventos",
  editions: "Edições",
  financial: "Financeiro",
  training: "Treinamento",
};

// Context fetchers for dynamic titles
const contextFetchers: Record<string, (id: string) => Promise<string | null>> = {
  news: async (id) => {
    const { data } = await supabase
      .from("news")
      .select("title")
      .eq("id", id)
      .single();
    return data?.title || null;
  },
  stories: async (id) => {
    const { data } = await supabase
      .from("web_stories")
      .select("title")
      .eq("id", id)
      .single();
    return data?.title || null;
  },
  events: async (id) => {
    const { data } = await supabase
      .from("events")
      .select("title")
      .eq("id", id)
      .single();
    return data?.title || null;
  },
  editions: async (id) => {
    const { data } = await supabase
      .from("digital_editions")
      .select("title")
      .eq("id", id)
      .single();
    return data?.title || null;
  },
  categories: async (id) => {
    const { data } = await supabase
      .from("categories")
      .select("name")
      .eq("id", id)
      .single();
    return data?.name || null;
  },
};

const isUuid = (str: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

const truncateTitle = (title: string, maxLength = 35) => {
  if (title.length <= maxLength) return title;
  return title.substring(0, maxLength) + "...";
};

export function Breadcrumb() {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  // Detect UUID and its context
  const uuidIndex = pathSegments.findIndex((seg) => isUuid(seg));
  const context = uuidIndex > 0 ? pathSegments[uuidIndex - 1] : null;
  const uuid = uuidIndex >= 0 ? pathSegments[uuidIndex] : null;

  // Query to fetch dynamic title
  const { data: resourceTitle } = useQuery({
    queryKey: ["breadcrumb-title", context, uuid],
    queryFn: async () => {
      if (!context || !uuid || !contextFetchers[context]) return null;
      return contextFetchers[context](uuid);
    },
    enabled: !!context && !!uuid && !!contextFetchers[context],
    staleTime: 60000, // Cache for 1 minute
  });

  // Don't show breadcrumb on main dashboard
  if (pathSegments.length <= 1) {
    return null;
  }

  const breadcrumbItems = pathSegments.map((segment, index) => {
    const path = "/" + pathSegments.slice(0, index + 1).join("/");
    const isLast = index === pathSegments.length - 1;

    let label: string;
    if (isUuid(segment)) {
      label = resourceTitle ? truncateTitle(resourceTitle) : "Carregando...";
    } else {
      label = routeLabels[segment] || segment;
    }

    return {
      path,
      label,
      isLast,
    };
  });

  return (
    <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
      <Link
        to="/admin"
        className="flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>

      {breadcrumbItems.slice(1).map((item) => (
        <div key={item.path} className="flex items-center gap-1.5">
          <ChevronRight className="h-3.5 w-3.5" />
          {item.isLast ? (
            <span className="font-medium text-foreground">{item.label}</span>
          ) : (
            <Link
              to={item.path}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
