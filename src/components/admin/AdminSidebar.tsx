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
  Building2,
  Plus,
  CheckCircle,
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
  PlayCircle,
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
  FileText,
  TrendingUp,
  DollarSign,
  Bell,
  ImageIcon,
  Globe,
  Trophy,
  Wrench,
  Cpu,
  Store,
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
  badge?: string;
  badgeColor?: string;
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

// ============ NOVA ARQUITETURA DE 6 MÓDULOS SEMÂNTICOS ============

// 1️⃣ CONTEÚDO - Produção editorial
const contentItems: MenuItem[] = [
  { title: "Dashboard", url: "/spah/painel", icon: LayoutDashboard },
  { title: "Notícias", url: "/spah/painel/news", icon: Newspaper },
  { title: "Nova Notícia", url: "#create-news", icon: FilePlus2, action: true },
  { title: "Notícias IA", url: "/spah/painel/noticias-ai", icon: Sparkles, badge: "IA", badgeColor: "bg-ai" },
  { title: "Notas Rápidas", url: "/spah/painel/quick-notes", icon: Zap },
  { title: "Web Stories", url: "/spah/painel/stories", icon: PlaySquare },
  { title: "Podcasts", url: "/spah/painel/podcasts", icon: Mic },
  { title: "Edição Digital", url: "/spah/painel/editions", icon: BookOpen },
  { title: "Auto Post Regional", url: "/spah/painel/autopost-regional", icon: MapPin, badge: "Grande Cotia", badgeColor: "bg-amber-500" },
  { title: "Correção de Conteúdo", url: "/spah/painel/content-fix", icon: Wrench, badge: "Novo", badgeColor: "bg-primary" },
];

// 2️⃣ DISTRIBUIÇÃO & ALCANCE - Audiência e tráfego
const distributionItems: MenuItem[] = [
  { title: "Distribuição Social", url: "/spah/painel/social", icon: Share2 },
  { title: "Gerador de Links", url: "/spah/painel/links", icon: Link2 },
  { title: "SEO & Performance", url: "/spah/painel/analytics", icon: TrendingUp },
  { title: "Check Fake News", url: "/spah/painel/anti-fake-news", icon: ShieldCheck },
];

// 3️⃣ PUBLICIDADE & MONETIZAÇÃO - Receita
const monetizationItems: MenuItem[] = [
  { title: "Campanhas 360", url: "/spah/painel/campaigns/unified", icon: Megaphone, badge: "Novo", badgeColor: "bg-primary" },
  { title: "Mídia Kit", url: "/spah/painel/campaigns/media-kit", icon: FileText },
  { title: "Comprovantes", url: "/spah/painel/comprovantes", icon: FileText },
  { title: "Anúncios", url: "/spah/painel/ads", icon: Megaphone },
  { title: "Super Banners", url: "/spah/painel/banners", icon: Image },
  { title: "Banner Intro", url: "/spah/painel/campaigns/unified?channel=banner_intro", icon: PanelTop },
  { title: "Destaque Flutuante", url: "/spah/painel/campaigns/unified?channel=floating_ad", icon: PanelTop },
  { title: "Exit-Intent", url: "/spah/painel/campaigns/unified?channel=exit_intent", icon: PanelTop },
  { title: "Painel de Login", url: "/spah/painel/campaigns/unified?channel=login_panel", icon: PanelTop },
  { title: "Publidoor", url: "/spah/painel/publidoor", icon: Building2, badge: "Premium", badgeColor: "bg-money" },
  { title: "Parceiros", url: "/spah/painel/partners", icon: Handshake },
];

// 4️⃣ STREAMING & MÍDIA - Transmissão
const broadcastItems: MenuItem[] = [
  { title: "Dashboard", url: "/spah/painel/broadcast", icon: Radio },
  { title: "Transmissões", url: "/spah/painel/broadcast/list", icon: Play },
  { title: "Canais", url: "/spah/painel/broadcast/channels", icon: Tv },
  { title: "Programas", url: "/spah/painel/broadcast/programs", icon: Calendar },
  { title: "Playlist Rádio", url: "/spah/painel/broadcast/playlist", icon: Music },
  { title: "Grade de Vídeos", url: "/spah/painel/broadcast/videos", icon: Tv },
];

const conexaoStudioItems: MenuItem[] = [
  { title: "Dashboard", url: "/spah/painel/conexao-studio", icon: Video },
  { title: "Estúdios", url: "/spah/painel/conexao-studio/studios", icon: Tv },
  { title: "Biblioteca", url: "/spah/painel/conexao-studio/library", icon: FolderOpen },
  { title: "Destinos", url: "/spah/painel/conexao-studio/destinations", icon: Share2 },
  { title: "Webinários", url: "/spah/painel/conexao-studio/webinars", icon: Presentation },
  { title: "Branding", url: "/spah/painel/conexao-studio/branding", icon: Palette },
  { title: "Equipe", url: "/spah/painel/conexao-studio/team", icon: Users },
];

const streamingConfigItems: MenuItem[] = [
  { title: "Rádio Web", url: "/spah/painel/streaming/radio", icon: Radio },
  { title: "TV Web", url: "/spah/painel/streaming/tv", icon: Tv },
];

// 5️⃣ GESTÃO DO PORTAL - Governança
const portalManagementItems: MenuItem[] = [
  { title: "Editor da Home", url: "/spah/painel/home-editor", icon: PanelTop },
  { title: "Categorias", url: "/spah/painel/categories", icon: FolderTree },
  { title: "Tags", url: "/spah/painel/tags", icon: Tag },
  { title: "Logo do Site", url: "/spah/painel/settings/logo", icon: ImageIcon },
  { title: "Provedores de IA", url: "/spah/painel/settings/ai-providers", icon: Bot },
  { title: "Aparência", url: "/spah/painel/settings/appearance", icon: Palette },
  { title: "Modelo do Portal", url: "/spah/painel/settings/template", icon: Settings },
  { title: "Vocabulário", url: "/spah/painel/settings/vocabulary", icon: Languages },
  { title: "Módulos", url: "/spah/painel/settings/modules", icon: ToggleLeft },
  { title: "Menus do Site", url: "/spah/painel/settings/menus", icon: ToggleLeft },
];

// CORE ENGINE - Motor proprietário
const coreEngineItems: MenuItem[] = [
  { title: "Dashboard", url: "/spah/painel/core-engine", icon: LayoutDashboard },
  { title: "SEO Profissional", url: "/spah/painel/core-engine/seo", icon: TrendingUp },
  { title: "Monetização", url: "/spah/painel/core-engine/ads", icon: DollarSign },
  { title: "Performance", url: "/spah/painel/core-engine/performance", icon: Zap },
  { title: "Segurança", url: "/spah/painel/core-engine/security", icon: Shield },
  { title: "Analytics", url: "/spah/painel/core-engine/analytics", icon: BarChart3 },
  { title: "Push", url: "/spah/painel/core-engine/push", icon: Bell },
  { title: "Editorial", url: "/spah/painel/core-engine/editorial", icon: FileText },
  { title: "Mídia", url: "/spah/painel/core-engine/media", icon: ImageIcon },
  { title: "Leads", url: "/spah/painel/core-engine/leads", icon: UsersRound },
  { title: "Redirecionamento", url: "/spah/painel/core-engine/redirect", icon: Link2, badge: "Novo", badgeColor: "bg-primary" },
  { title: "Schema", url: "/spah/painel/core-engine/schema", icon: Globe },
  { title: "Backup", url: "/spah/painel/core-engine/backup", icon: Settings },
  { title: "Controle Acesso", url: "/spah/painel/core-engine/roles", icon: Users },
  { title: "Automação", url: "/spah/painel/core-engine/automation", icon: Bot },
];

// 6️⃣ INTELIGÊNCIA & MÉTRICAS - Dados
const intelligenceItems: MenuItem[] = [
  { title: "Analytics", url: "/spah/painel/analytics", icon: BarChart3 },
  { title: "Relatórios Editoriais", url: "/spah/painel/reading-analytics", icon: FileText },
  { title: "Relatório Semanal", url: "/spah/painel/relatorio-semanal", icon: TrendingUp, badge: "Novo", badgeColor: "bg-primary" },
  { title: "Métricas Comerciais", url: "/spah/painel/publidoor/metricas", icon: DollarSign },
];

// Conexão Academy - Primeiro nível
const academyItems: MenuItem[] = [
  { title: "Dashboard", url: "/spah/painel/academy", icon: LayoutDashboard },
  { title: "Categorias", url: "/spah/painel/academy/admin/categorias", icon: FolderTree },
  { title: "Cursos", url: "/spah/painel/academy/admin/cursos", icon: BookOpen },
];

// Conexão.AI - Primeiro nível
const conexaoAIItems: MenuItem[] = [
  { title: "Dashboard", url: "/spah/painel/conexao-ai", icon: LayoutDashboard },
  { title: "Assistente", url: "/spah/painel/conexao-ai/assistente", icon: Bot },
  { title: "Criador", url: "/spah/painel/conexao-ai/criador", icon: FilePlus2 },
  { title: "Ferramentas", url: "/spah/painel/conexao-ai/ferramentas", icon: Zap },
  { title: "Automações", url: "/spah/painel/conexao-ai/automacoes", icon: Play },
  { title: "Insights", url: "/spah/painel/conexao-ai/insights", icon: BarChart3 },
];

// Negócios - Módulos especiais
const businessItems: MenuItem[] = [
  { title: "Guia Empresário", url: "/guia/anunciante", icon: Store },
  { title: "Soluções", url: "/spah/painel/solutions", icon: Puzzle },
  { title: "Financeiro", url: "/spah/painel/financial", icon: Receipt },
  { title: "Auto Post PRO", url: "/spah/painel/autopost", icon: Bot },
  { title: "Campanhas", url: "/spah/painel/campaigns/google-maps", icon: MapPin },
  { title: "Censo PcD", url: "/spah/painel/censo-pcd", icon: Accessibility },
  { title: "Geração Cotia", url: "#sso-gcotia", icon: ExternalLink, action: true },
];

// Educação & Esportes - Módulos educacionais e esportivos
const educationSportsItems: MenuItem[] = [
  { title: "Esportes", url: "/spah/painel/esportes", icon: Trophy },
  { title: "Brasileirão", url: "/spah/painel/esportes/brasileirao", icon: Trophy },
  { title: "ENEM 2026", url: "/spah/painel/academy/enem", icon: GraduationCap, badge: "Novo", badgeColor: "bg-primary" },
];

// Transporte Escolar
const transporteEscolarItems: MenuItem[] = [
  { title: "Dashboard", url: "/spah/painel/transporte-escolar", icon: LayoutDashboard },
  { title: "Escolas", url: "/spah/painel/transporte-escolar/escolas", icon: School },
  { title: "Transportadores", url: "/spah/painel/transporte-escolar/transportadores", icon: Bus },
  { title: "Leads", url: "/spah/painel/transporte-escolar/leads", icon: Users },
  { title: "Denúncias", url: "/spah/painel/transporte-escolar/reports", icon: AlertTriangle },
];

// Admin only
const adminOnlyItems: MenuItem[] = [
  { title: "Franquias & White Label", url: "/spah/painel/tenants", icon: Building2 },
  { title: "Usuários", url: "/spah/painel/users", icon: Users },
  { title: "Conexões", url: "/spah/painel/community", icon: UsersRound },
  { title: "Cadastro Assistido", url: "/spah/painel/community/phone-import", icon: Smartphone },
  { title: "Monitor SSO", url: "/spah/painel/sso-monitor", icon: Shield },
  { title: "Logs", url: "/spah/painel/logs", icon: History },
  { title: "Configurações", url: "/spah/painel/settings", icon: Settings },
];

// ============ GRUPOS CONSOLIDADOS ============

const sidebarGroups: SidebarGroupConfig[] = [
  {
    id: "conteudo",
    title: "Conteúdo",
    icon: FileText,
    items: contentItems,
  },
  {
    id: "distribuicao",
    title: "Distribuição & Alcance",
    icon: Globe,
    items: distributionItems,
  },
  {
    id: "monetizacao",
    title: "Publicidade & Monetização",
    icon: DollarSign,
    items: monetizationItems,
  },
  {
    id: "streaming",
    title: "Streaming & Mídia",
    icon: Satellite,
    items: [{ title: "Hub Central", url: "/spah/painel/stream", icon: Satellite }],
    subGroups: [
      { id: "ao-vivo", title: "Ao Vivo", icon: Play, items: broadcastItems },
      { id: "studio", title: "Studio", icon: Video, items: conexaoStudioItems },
    ],
  },
  {
    id: "gestao",
    title: "Gestão do Portal",
    icon: Settings,
    items: portalManagementItems,
    adminOnly: true,
  },
  {
    id: "core-engine",
    title: "Core Engine",
    icon: Cpu,
    items: coreEngineItems,
    adminOnly: true,
  },
  {
    id: "inteligencia",
    title: "Inteligência & Métricas",
    icon: BarChart3,
    items: intelligenceItems,
  },
  // Produtos standalone
  {
    id: "academy",
    title: "Conexão Academy",
    icon: GraduationCap,
    items: academyItems,
  },
  {
    id: "conexao-ai",
    title: "Conexão.AI",
    icon: Sparkles,
    items: conexaoAIItems,
  },
  {
    id: "negocios",
    title: "Negócios",
    icon: Briefcase,
    items: businessItems,
  },
  {
    id: "educacao-esportes",
    title: "Educação & Esportes",
    icon: Trophy,
    items: educationSportsItems,
  },
  {
    id: "transporte",
    title: "Transporte Escolar",
    icon: Bus,
    items: transporteEscolarItems,
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
    if (url === "/spah/painel") {
      return location.pathname === "/spah/painel";
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
                        <item.icon className={cn(
                          "h-4 w-4",
                          item.icon === Sparkles && "text-ai"
                        )} />
                      )}
                    </button>
                  ) : (
                    <NavLink
                      to={item.url}
                      end={item.url === "/spah/painel"}
                      className="flex items-center justify-center p-2"
                      activeClassName="bg-sidebar-active-bg text-cta"
                    >
                      <item.icon className={cn(
                        "h-4 w-4",
                        item.icon === Sparkles && "text-ai"
                      )} />
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
                <item.icon className={cn(
                  "h-4 w-4",
                  item.icon === Sparkles && "text-ai"
                )} />
              )}
              <span className="flex-1">{item.title}</span>
              {item.badge && (
                <span className={cn(
                  "text-[9px] font-semibold px-1.5 py-0.5 rounded-full text-white",
                  item.badgeColor || "bg-cta"
                )}>
                  {item.badge}
                </span>
              )}
            </button>
          ) : (
            <NavLink
              to={item.url}
              end={item.url === "/spah/painel" || item.url === "/spah/painel/transporte-escolar"}
              className="relative flex items-center gap-2 text-sm group"
              activeClassName="bg-sidebar-active-bg text-sidebar-foreground font-medium before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-6 before:w-1 before:rounded-r-full before:bg-cta"
            >
              <item.icon className={cn(
                "h-4 w-4",
                item.icon === Sparkles && "text-ai"
              )} />
              <span className="flex-1">{item.title}</span>
              {item.badge && (
                <span className={cn(
                  "text-[9px] font-semibold px-1.5 py-0.5 rounded-full text-white",
                  item.badgeColor || "bg-cta"
                )}>
                  {item.badge}
                </span>
              )}
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
                  "hover:bg-sidebar-hover hover:text-sidebar-foreground",
                  groupActive && "bg-sidebar-active-bg text-cta"
                )}
              >
                <group.icon className={cn(
                  "h-4 w-4",
                  group.icon === Sparkles && "text-ai"
                )} />
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
            "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-hover",
            isOpen && "text-sidebar-foreground bg-sidebar-accent",
            groupActive && "text-cta"
          )}
        >
          <span className="flex items-center gap-2">
            <group.icon className={cn(
              "h-4 w-4",
              group.icon === Sparkles && "text-ai"
            )} />
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
          <NavLink to="/spah/painel" className="flex items-center">
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
          "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-hover",
          hasActiveItem && "text-cta"
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
                  end={item.url.includes("/spah/painel/broadcast") && item.url === "/spah/painel/broadcast"}
                  className="relative flex items-center gap-2 text-xs"
                  activeClassName="bg-sidebar-active-bg text-sidebar-foreground font-medium before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-4 before:w-0.5 before:rounded-r-full before:bg-cta"
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
