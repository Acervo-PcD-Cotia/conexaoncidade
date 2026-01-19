import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Home,
  Users,
  Trophy,
  Gift,
  HandHeart,
  MapPin,
  Settings,
  ClipboardList,
  Smartphone,
  Sparkles,
  ShieldCheck,
  Bus,
  Package,
  Briefcase,
  Store,
} from "lucide-react";
import { CommunityErrorBoundary } from "./CommunityErrorBoundary";
import { CommunityChatButton } from "./CommunityChatButton";
import { ImpactPanel } from "./ImpactPanel";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

interface CommunityLayoutProps {
  children: ReactNode;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  description?: string;
}

const communityNavItems: { section: string; items: NavItem[] }[] = [
  {
    section: "Comunidade",
    items: [
      { label: "Feed", href: "/comunidade", icon: Home, description: "Início" },
      { label: "Guia", href: "/comunidade/guia", icon: MapPin, description: "Locais" },
      { label: "Grupos", href: "/comunidade/grupos", icon: Users, description: "Participe" },
    ],
  },
  {
    section: "Marketplace",
    items: [
      { label: "Classificados", href: "/classificados", icon: Package, description: "Compra e venda" },
      { label: "Empregos", href: "/empregos", icon: Briefcase, description: "Vagas locais" },
      { label: "Guia Comercial", href: "/comunidade/guia", icon: Store, description: "Negócios" },
    ],
  },
  {
    section: "Gamificação",
    items: [
      { label: "Meus Pontos", href: "/comunidade/gamificacao", icon: Trophy, description: "Ranking" },
      { label: "Desafios", href: "/comunidade/desafios", icon: Sparkles, description: "Ganhe XP" },
      { label: "Benefícios", href: "/comunidade/beneficios", icon: Gift, badge: "Novo" },
    ],
  },
  {
    section: "Rede do Bem",
    items: [
      { label: "Ajuda", href: "/comunidade/rede-do-bem", icon: HandHeart, description: "Solidariedade" },
    ],
  },
  {
    section: "Serviços",
    items: [
      { label: "Apareça no Google", href: "/campanha/google-maps", icon: MapPin, badge: "Destaque", description: "Negócio local" },
      { label: "Check Fake News", href: "/anti-fake-news", icon: ShieldCheck, description: "Verificar notícia" },
      { label: "Transporte Escolar", href: "/transporte-escolar", icon: Bus, description: "Encontrar" },
      { label: "Censo PcD", href: "/censo-pcd", icon: ClipboardList, badge: "Novo" },
      { label: "Celular Ideal", href: "/comunidade/beneficios/celular-ideal", icon: Smartphone },
    ],
  },
  {
    section: "Perfil",
    items: [
      { label: "Configurações", href: "/comunidade/configuracoes", icon: Settings },
    ],
  },
];

export function CommunityLayout({ children }: CommunityLayoutProps) {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <CommunityErrorBoundary>
      <div className="min-h-screen bg-gradient-to-b from-pink-50/50 to-background dark:from-pink-950/10">
        {/* Mobile Navigation - Horizontal scroll */}
        <div className="lg:hidden border-b bg-background/95 backdrop-blur sticky top-0 z-40">
          <nav className="flex overflow-x-auto gap-1 p-2 scrollbar-hide">
            {communityNavItems.flatMap((section) =>
              section.items.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                      isActive
                        ? "bg-pink-600 text-white"
                        : "bg-muted hover:bg-muted/80 text-muted-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })
            )}
          </nav>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="flex gap-6">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 shrink-0">
              <nav className="sticky top-24 space-y-6">
                {communityNavItems.map((section) => (
                  <div key={section.section}>
                    <h4 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {section.section}
                    </h4>
                    <ul className="space-y-1">
                      {section.items.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                          <li key={item.href}>
                            <Link
                              to={item.href}
                              className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                                isActive
                                  ? "bg-pink-600 text-white shadow-md"
                                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                              )}
                            >
                              <item.icon className={cn("h-5 w-5", isActive && "text-white")} />
                              <div className="flex-1">
                                <span>{item.label}</span>
                                {item.description && !isActive && (
                                  <p className="text-xs text-muted-foreground/70">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                              {item.badge && (
                                <Badge
                                  variant="secondary"
                                  className={cn(
                                    "text-xs",
                                    isActive && "bg-white/20 text-white"
                                  )}
                                >
                                  {item.badge}
                                </Badge>
                              )}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
                
                {/* Impact Panel for authenticated users */}
                {user && (
                  <div className="mt-6 pt-6 border-t">
                    <ImpactPanel />
                  </div>
                )}
              </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
              {children}
            </main>
          </div>
        </div>
      </div>
      
      {/* AI Chat Button */}
      <CommunityChatButton />
    </CommunityErrorBoundary>
  );
}
