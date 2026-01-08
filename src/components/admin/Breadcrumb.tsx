import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

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

export function Breadcrumb() {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  // Don't show breadcrumb on main dashboard
  if (pathSegments.length <= 1) {
    return null;
  }

  const breadcrumbItems = pathSegments.map((segment, index) => {
    const path = "/" + pathSegments.slice(0, index + 1).join("/");
    const isLast = index === pathSegments.length - 1;
    
    // Check if segment is a UUID (for edit pages)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment);
    const label = isUuid ? "..." : (routeLabels[segment] || segment);

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
      
      {breadcrumbItems.slice(1).map((item, index) => (
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
