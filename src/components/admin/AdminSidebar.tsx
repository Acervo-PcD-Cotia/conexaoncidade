import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Newspaper,
  FilePlus2,
  FolderTree,
  Users,
  Image,
  PlaySquare,
  Settings,
  Zap,
  BarChart3,
  History,
  PanelTop,
  Megaphone,
  Tag,
  Sparkles,
  Share2,
  Link2,
  Puzzle,
  Handshake,
  BookOpen,
  GraduationCap,
  Receipt,
  Bot,
  UsersRound,
  Mic,
  ShieldCheck,
  Shield,
  MapPin,
  Smartphone,
  Bus,
  School,
  AlertTriangle,
  Accessibility,
  Briefcase,
  LucideIcon,
  Radio,
  Play,
  Tv,
  Calendar,
  Music,
  Video,
  FolderOpen,
  Presentation,
  Palette,
  Languages,
  ToggleLeft,
  Satellite,
  ExternalLink,
  Loader2,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useUserRole } from "@/hooks/useRequireRole";
import { useNewsCreationModal } from "@/contexts/NewsCreationModalContext";
import { useSsoNavigation } from "@/hooks/useSsoNavigation";
import { useSidebarPersistence } from "@/hooks/useSidebarPersistence";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import logoFull from "@/assets/logo-full.png";

interface MenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
  action?: boolean;
}

interface SidebarGroupConfig {
  id: string;
  title: string;
  icon: LucideIcon;
  items: MenuItem[];
  adminOnly?: boolean;
  subGroups?: {
    id: string;
    title: string;
    icon: LucideIcon;
    items: MenuItem[];
  }[];
}

const mainMenuItems: MenuItem[] = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Notícias", url: "/admin/news", icon: Newspaper },
  { title: "Cadastrar Notícia", url: "#create-news", icon: FilePlus2, action: true },
  { title: "Notícias IA", url: "/admin/noticias-ai", icon: Sparkles },
  { title: "Notas Rápidas", url: "/admin/quick-notes", icon: Zap },
  { title: "Categorias", url: "/admin/categories", icon: FolderTree },
  { title: "Tags", url: "/admin/tags", icon: Tag },
  { title: "Web Stories", url: "/admin/stories", icon: PlaySquare },
];

const editorialItems: MenuItem[] = [
  { title: "Editor da Home", url: "/admin/home-editor", icon: PanelTop },
  { title: "Banners", url: "/admin/banners", icon: Image },
  { title: "Anúncios", url: "/admin/ads", icon: Megaphone },
  { title: "Check Fake News", url: "/admin/anti-fake-news", icon: ShieldCheck },
  { title: "Parceiros & Sindicação", url: "/admin/partners", icon: Handshake },
  { title: "Distribuição Social", url: "/admin/social", icon: Share2 },
  { title: "Gerador de Links", url: "/admin/links", icon: Link2 },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
  { title: "Edição Digital", url: "/admin/editions", icon: BookOpen },
  { title: "Podcasts", url: "/admin/podcasts", icon: Mic },
];

const broadcastItems: MenuItem[] = [
  { title: "Dashboard", url: "/admin/broadcast", icon: Radio },
  { title: "Transmissões", url: "/admin/broadcast/list", icon: Play },
  { title: "Canais", url: "/admin/broadcast/channels", icon: Tv },
  { title: "Programas", url: "/admin/broadcast/programs", icon: Calendar },
  { title: "Playlist Rádio", url: "/admin/broadcast/playlist", icon: Music },
  { title: "Grade de Vídeos", url: "/admin/broadcast/videos", icon: Tv },
];

const conexaoStudioItems: MenuItem[] = [
  { title: "Dashboard", url: "/admin/conexao-studio", icon: Video },
  { title: "Estúdios", url: "/admin/conexao-studio/studios", icon: Tv },
  { title: "Biblioteca", url: "/admin/conexao-studio/library", icon: FolderOpen },
  { title: "Destinos", url: "/admin/conexao-studio/destinations", icon: Share2 },
  { title: "Webinários", url: "/admin/conexao-studio/webinars", icon: Presentation },
  { title: "Branding", url: "/admin/conexao-studio/branding", icon: Palette },
  { title: "Equipe", url: "/admin/conexao-studio/team", icon: Users },
];

const streamingConfigItems: MenuItem[] = [
  { title: "Rádio Web (Config)", url: "/admin/streaming/radio", icon: Radio },
  { title: "TV Web (Config)", url: "/admin/streaming/tv", icon: Tv },
];

const businessItems: MenuItem[] = [
  { title: "Soluções", url: "/admin/solutions", icon: Puzzle },
  { title: "Treinamento", url: "/admin/training", icon: GraduationCap },
  { title: "Financeiro", url: "/admin/financial", icon: Receipt },
  { title: "Auto Post PRO", url: "/admin/autopost", icon: Bot },
  { title: "Campanhas", url: "/admin/campaigns/google-maps", icon: MapPin },
  { title: "Censo PcD", url: "/admin/censo-pcd", icon: Accessibility },
  { title: "Geração Cotia", url: "#sso-gcotia", icon: ExternalLink, action: true },
];

const transporteEscolarItems: MenuItem[] = [
  { title: "Dashboard", url: "/admin/transporte-escolar", icon: LayoutDashboard },
  { title: "Escolas", url: "/admin/transporte-escolar/escolas", icon: School },
  { title: "Transportadores", url: "/admin/transporte-escolar/transportadores", icon: Bus },
  { title: "Leads", url: "/admin/transporte-escolar/leads", icon: Users },
  { title: "Denúncias", url: "/admin/transporte-escolar/reports", icon: AlertTriangle },
];

const templateSettingsItems: MenuItem[] = [
  { title: "Modelo do Portal", url: "/admin/settings/template", icon: Palette },
  { title: "Vocabulário", url: "/admin/settings/vocabulary", icon: Languages },
  { title: "Módulos", url: "/admin/settings/modules", icon: ToggleLeft },
];

const adminOnlyItems: MenuItem[] = [
  { title: "Conexões", url: "/admin/community", icon: UsersRound },
  { title: "Cadastro Assistido", url: "/admin/community/phone-import", icon: Smartphone },
  { title: "Relatório Ofertas", url: "/admin/community/phone-offers-report", icon: BarChart3 },
  { title: "Monitor SSO", url: "/admin/sso-monitor", icon: Shield },
  { title: "Usuários", url: "/admin/users", icon: Users },
  { title: "Logs", url: "/admin/logs", icon: History },
  { title: "Configurações", url: "/admin/settings", icon: Settings },
];

// All sidebar groups configuration
const sidebarGroups: SidebarGroupConfig[] = [
  {
    id: "principal",
    title: "Principal",
    icon: LayoutDashboard,
    items: mainMenuItems,
  },
  {
    id: "editorial",
    title: "Editorial",
    icon: Newspaper,
    items: editorialItems,
  },
  {
    id: "streaming",
    title: "Conexão Streaming",
    icon: Satellite,
    items: [{ title: "Hub Central", url: "/admin/stream", icon: Satellite }],
    subGroups: [
      { id: "ao-vivo", title: "Ao Vivo", icon: Play, items: broadcastItems },
      { id: "studio", title: "Studio", icon: Video, items: conexaoStudioItems },
    ],
  },
  {
    id: "negocios",
    title: "Negócios",
    icon: Briefcase,
    items: businessItems,
  },
  {
    id: "transporte",
    title: "Transporte Escolar",
    icon: Bus,
    items: transporteEscolarItems,
  },
  {
    id: "config-portal",
    title: "Configurações do Portal",
    icon: Palette,
    items: templateSettingsItems,
    adminOnly: true,
  },
  {
    id: "admin",
    title: "Administração",
    icon: Shield,
    items: adminOnlyItems,
    adminOnly: true,
  },
];

export function AdminSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const { isAdmin } = useUserRole();
  const { openModal } = useNewsCreationModal();
  const { navigateToGcotia, isLoading: isSsoLoading } = useSsoNavigation();
  const location = useLocation();
  
  const { openGroup, toggleGroup } = useSidebarPersistence();

  const handleMenuClick = (item: MenuItem, e: React.MouseEvent) => {
    if (item.action) {
      e.preventDefault();
      if (item.url === "#create-news") {
        openModal();
      } else if (item.url === "#sso-gcotia") {
        navigateToGcotia();
      }
    }
  };

  const isItemActive = (url: string) => {
    if (url === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(url);
  };

  const isGroupActive = (group: SidebarGroupConfig) => {
    const hasActiveItem = group.items.some((item) => isItemActive(item.url));
    const hasActiveSubItem = group.subGroups?.some((sub) =>
      sub.items.some((item) => isItemActive(item.url))
    );
    return hasActiveItem || hasActiveSubItem;
  };

  const renderMenuItem = (item: MenuItem, indentLevel: number = 0) => {
    const isActive = isItemActive(item.url);
    const paddingClass = indentLevel > 0 ? "ml-4" : "";
    
    if (collapsed) {
      return (
        <TooltipProvider key={item.title} delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  {item.action ? (
                    <button
                      onClick={(e) => handleMenuClick(item, e)}
                      disabled={item.url === "#sso-gcotia" && isSsoLoading}
                      className={cn(
                        "flex w-full items-center justify-center p-2",
                        isActive && "bg-primary/10 text-primary"
                      )}
                    >
                      {item.url === "#sso-gcotia" && isSsoLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <item.icon className="h-4 w-4" />
                      )}
                    </button>
                  ) : (
                    <NavLink
                      to={item.url}
                      end={item.url === "/admin"}
                      className="flex items-center justify-center p-2"
                      activeClassName="bg-primary/10 text-primary"
                    >
                      <item.icon className="h-4 w-4" />
                    </NavLink>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={10}>
              <p>{item.title}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <SidebarMenuItem key={item.title} className={paddingClass}>
        <SidebarMenuButton asChild>
          {item.action ? (
            <button
              onClick={(e) => handleMenuClick(item, e)}
              disabled={item.url === "#sso-gcotia" && isSsoLoading}
              className="flex w-full items-center gap-2 text-left text-sm disabled:opacity-50"
            >
              {item.url === "#sso-gcotia" && isSsoLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <item.icon className="h-4 w-4" />
              )}
              <span>{item.title}</span>
            </button>
          ) : (
            <NavLink
              to={item.url}
              end={item.url === "/admin" || item.url === "/admin/transporte-escolar"}
              className="flex items-center gap-2 text-sm"
              activeClassName="bg-primary/10 text-primary font-medium"
            >
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </NavLink>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  const renderGroup = (group: SidebarGroupConfig) => {
    if (group.adminOnly && !isAdmin) return null;

    const isOpen = openGroup === group.id;
    const groupActive = isGroupActive(group);

    // Collapsed mode: show only icon with tooltip
    if (collapsed) {
      return (
        <TooltipProvider key={group.id} delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => {
                  toggleSidebar();
                  toggleGroup(group.id);
                }}
                className={cn(
                  "flex w-full items-center justify-center p-2 my-1 rounded-md transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  groupActive && "bg-primary/10 text-primary"
                )}
              >
                <group.icon className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={10}>
              <p>{group.title}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    // Expanded mode: full accordion
    return (
      <Collapsible key={group.id} open={isOpen} onOpenChange={() => toggleGroup(group.id)}>
        <CollapsibleTrigger
          className={cn(
            "flex w-full items-center justify-between px-2 py-2 text-sm font-medium rounded-md transition-colors",
            "text-muted-foreground hover:text-foreground hover:bg-accent/50",
            isOpen && "text-foreground bg-accent/30",
            groupActive && "text-primary"
          )}
        >
          <span className="flex items-center gap-2">
            <group.icon className="h-4 w-4" />
            <span>{group.title}</span>
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-1">
          <SidebarMenu className="pl-2 border-l border-border/50 ml-2">
            {/* Render main items */}
            {group.items.map((item) => renderMenuItem(item))}
            
            {/* Render sub-groups (for Streaming) */}
            {group.subGroups?.map((subGroup) => (
              <SubAccordion
                key={subGroup.id}
                id={subGroup.id}
                title={subGroup.title}
                icon={subGroup.icon}
                items={subGroup.items}
                handleMenuClick={handleMenuClick}
                isItemActive={isItemActive}
              />
            ))}

            {/* Special case: Config items for Streaming */}
            {group.id === "streaming" && (
              <div className="border-t border-border/50 mt-2 pt-2">
                {streamingConfigItems.map((item) => renderMenuItem(item))}
              </div>
            )}
          </SidebarMenu>
        </CollapsibleContent>
      </Collapsible>
    );
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b p-3">
        <div className="flex items-center justify-between">
          <NavLink to="/admin" className="flex items-center">
            {collapsed ? (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow">
                <Newspaper className="h-4 w-4" />
              </div>
            ) : (
              <img 
                src={logoFull} 
                alt="Conexão na Cidade" 
                className="h-12 w-auto transition-all duration-200"
              />
            )}
          </NavLink>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8 shrink-0"
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-2 space-y-1">
        {sidebarGroups.map(renderGroup)}
      </SidebarContent>
    </Sidebar>
  );
}

// Sub-accordion component for nested groups (Ao Vivo, Studio)
interface SubAccordionProps {
  id: string;
  title: string;
  icon: LucideIcon;
  items: MenuItem[];
  handleMenuClick: (item: MenuItem, e: React.MouseEvent) => void;
  isItemActive: (url: string) => boolean;
}

function SubAccordion({ id, title, icon: Icon, items, handleMenuClick, isItemActive }: SubAccordionProps) {
  const hasActiveItem = items.some((item) => isItemActive(item.url));
  
  return (
    <Collapsible defaultOpen={hasActiveItem}>
      <CollapsibleTrigger
        className={cn(
          "flex w-full items-center justify-between px-2 py-1.5 text-sm rounded-md transition-colors",
          "text-muted-foreground hover:text-foreground hover:bg-accent/50",
          hasActiveItem && "text-primary"
        )}
      >
        <span className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5" />
          <span>{title}</span>
        </span>
        <ChevronDown className="h-3 w-3 transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SidebarMenu className="pl-4 mt-1">
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink
                  to={item.url}
                  end={item.url.includes("/admin/broadcast") && item.url === "/admin/broadcast"}
                  className="flex items-center gap-2 text-xs"
                  activeClassName="bg-primary/10 text-primary font-medium"
                >
                  <item.icon className="h-3 w-3" />
                  <span>{item.title}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </CollapsibleContent>
    </Collapsible>
  );
}
