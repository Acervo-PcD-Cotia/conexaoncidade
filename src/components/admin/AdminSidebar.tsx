import { useState } from "react";
import {
  LayoutDashboard,
  Newspaper,
  FilePlus2,
  FolderTree,
  Users,
  Image,
  PlaySquare,
  Settings,
  Home,
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
  Package,
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
  Activity,
  Key,
  ListMusic,
  Layout,
  Film,
  Upload,
  Satellite,
  CalendarDays,
  ExternalLink,
  Loader2,
  ChevronDown,
  Sliders,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useUserRole } from "@/hooks/useRequireRole";
import { useNewsCreationModal } from "@/contexts/NewsCreationModalContext";
import { useSsoNavigation } from "@/hooks/useSsoNavigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import logoFull from "@/assets/logo-full.png";

interface MenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
  action?: boolean;
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

const editorialItems = [
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

// Items do Conexão Ao Vivo (broadcast)
const broadcastItems: MenuItem[] = [
  { title: "Dashboard", url: "/admin/broadcast", icon: Radio },
  { title: "Transmissões", url: "/admin/broadcast/list", icon: Play },
  { title: "Canais", url: "/admin/broadcast/channels", icon: Tv },
  { title: "Programas", url: "/admin/broadcast/programs", icon: Calendar },
  { title: "Playlist Rádio", url: "/admin/broadcast/playlist", icon: Music },
  { title: "Grade de Vídeos", url: "/admin/broadcast/videos", icon: Tv },
];

// Items do Conexão Studio
const conexaoStudioItems: MenuItem[] = [
  { title: "Dashboard", url: "/admin/conexao-studio", icon: Video },
  { title: "Estúdios", url: "/admin/conexao-studio/studios", icon: Tv },
  { title: "Biblioteca", url: "/admin/conexao-studio/library", icon: FolderOpen },
  { title: "Destinos", url: "/admin/conexao-studio/destinations", icon: Share2 },
  { title: "Webinários", url: "/admin/conexao-studio/webinars", icon: Presentation },
  { title: "Branding", url: "/admin/conexao-studio/branding", icon: Palette },
  { title: "Equipe", url: "/admin/conexao-studio/team", icon: Users },
];

const businessItems: MenuItem[] = [
  { title: "Soluções", url: "/admin/solutions", icon: Puzzle },
  { title: "Treinamento", url: "/admin/training", icon: GraduationCap },
  { title: "Financeiro", url: "/admin/financial", icon: Receipt },
  { title: "Auto Post PRO", url: "/admin/autopost", icon: Bot },
  { title: "Campanhas", url: "/admin/campaigns/google-maps", icon: MapPin },
  { title: "Transporte Escolar", url: "/admin/transporte-escolar", icon: Bus },
  { title: "Censo PcD", url: "/admin/censo-pcd", icon: Accessibility },
  { title: "Geração Cotia", url: "#sso-gcotia", icon: ExternalLink, action: true },
];

const transporteEscolarItems = [
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

const adminOnlyItems = [
  { title: "Conexões", url: "/admin/community", icon: UsersRound },
  { title: "Cadastro Assistido", url: "/admin/community/phone-import", icon: Smartphone },
  { title: "Relatório Ofertas", url: "/admin/community/phone-offers-report", icon: BarChart3 },
  { title: "Monitor SSO", url: "/admin/sso-monitor", icon: Shield },
  { title: "Usuários", url: "/admin/users", icon: Users },
  { title: "Logs", url: "/admin/logs", icon: History },
  { title: "Configurações", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { isAdmin } = useUserRole();
  const { openModal } = useNewsCreationModal();
  const { navigateToGcotia, isLoading: isSsoLoading } = useSsoNavigation();
  
  // State for accordion sections
  const [streamingOpen, setStreamingOpen] = useState(true);
  const [aoVivoOpen, setAoVivoOpen] = useState(false);
  const [studioOpen, setStudioOpen] = useState(false);

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

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b p-3">
        <NavLink to="/admin" className="flex items-center justify-center">
          {collapsed ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
              <Newspaper className="h-5 w-5" />
            </div>
          ) : (
            <img 
              src={logoFull} 
              alt="Conexão na Cidade" 
              className="h-20 w-auto transition-all duration-200"
            />
          )}
        </NavLink>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    {item.action ? (
                      <button
                        onClick={(e) => handleMenuClick(item, e)}
                        className="flex w-full items-center gap-2 text-left"
                      >
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </button>
                    ) : (
                      <NavLink
                        to={item.url}
                        end={item.url === "/admin"}
                        className="flex items-center gap-2"
                        activeClassName="bg-primary/10 text-primary"
                      >
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Editorial</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {editorialItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-2"
                      activeClassName="bg-primary/10 text-primary"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Conexão Streaming - Unified Accordion */}
        <SidebarGroup>
          <Collapsible open={streamingOpen} onOpenChange={setStreamingOpen}>
            <CollapsibleTrigger className="flex w-full items-center justify-between px-2 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
              <span className="flex items-center gap-2">
                <Satellite className="h-4 w-4" />
                {!collapsed && "Conexão Streaming"}
              </span>
              {!collapsed && (
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${streamingOpen ? 'rotate-180' : ''}`} />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1">
              {/* Hub Central */}
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/admin/stream"
                      className="flex items-center gap-2 font-medium text-primary"
                      activeClassName="bg-primary/10"
                    >
                      <Satellite className="h-4 w-4" />
                      {!collapsed && <span>Hub Central</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>

              {/* Sub-accordion: Ao Vivo */}
              <Collapsible open={aoVivoOpen} onOpenChange={setAoVivoOpen}>
                <CollapsibleTrigger className="flex w-full items-center justify-between px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground ml-2">
                  <span className="flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    {!collapsed && "Ao Vivo"}
                  </span>
                  {!collapsed && (
                    <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${aoVivoOpen ? 'rotate-180' : ''}`} />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenu className="ml-4">
                    {broadcastItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <NavLink
                            to={item.url}
                            end={item.url === "/admin/broadcast"}
                            className="flex items-center gap-2 text-sm"
                            activeClassName="bg-primary/10 text-primary"
                          >
                            <item.icon className="h-3 w-3" />
                            {!collapsed && <span>{item.title}</span>}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </CollapsibleContent>
              </Collapsible>

              {/* Sub-accordion: Studio */}
              <Collapsible open={studioOpen} onOpenChange={setStudioOpen}>
                <CollapsibleTrigger className="flex w-full items-center justify-between px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground ml-2">
                  <span className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    {!collapsed && "Studio"}
                  </span>
                  {!collapsed && (
                    <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${studioOpen ? 'rotate-180' : ''}`} />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenu className="ml-4">
                    {conexaoStudioItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <NavLink
                            to={item.url}
                            end={item.url === "/admin/conexao-studio"}
                            className="flex items-center gap-2 text-sm"
                            activeClassName="bg-primary/10 text-primary"
                          >
                            <item.icon className="h-3 w-3" />
                            {!collapsed && <span>{item.title}</span>}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </CollapsibleContent>
              </Collapsible>

              {/* Direct links: Radio & TV Config */}
              <SidebarMenu className="ml-2 border-t pt-2 mt-2">
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/admin/streaming/radio"
                      className="flex items-center gap-2"
                      activeClassName="bg-primary/10 text-primary"
                    >
                      <Radio className="h-4 w-4" />
                      {!collapsed && <span>Rádio Web (Config)</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/admin/streaming/tv"
                      className="flex items-center gap-2"
                      activeClassName="bg-primary/10 text-primary"
                    >
                      <Tv className="h-4 w-4" />
                      {!collapsed && <span>TV Web (Config)</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        <SidebarGroup>
            <SidebarGroupLabel>Negócios</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {businessItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    {item.action ? (
                      <button
                        onClick={(e) => handleMenuClick(item, e)}
                        disabled={item.url === "#sso-gcotia" && isSsoLoading}
                        className="flex w-full items-center gap-2 text-left disabled:opacity-50"
                      >
                        {item.url === "#sso-gcotia" && isSsoLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <item.icon className="h-4 w-4" />
                        )}
                        {!collapsed && <span>{item.title}</span>}
                      </button>
                    ) : (
                      <NavLink
                        to={item.url}
                        className="flex items-center gap-2"
                        activeClassName="bg-primary/10 text-primary"
                      >
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Transporte Escolar</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {transporteEscolarItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/admin/transporte-escolar"}
                      className="flex items-center gap-2"
                      activeClassName="bg-primary/10 text-primary"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <>
            <SidebarGroup>
              <SidebarGroupLabel>Configurações do Portal</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {templateSettingsItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          className="flex items-center gap-2"
                          activeClassName="bg-primary/10 text-primary"
                        >
                          <item.icon className="h-4 w-4" />
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Administração</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminOnlyItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          className="flex items-center gap-2"
                          activeClassName="bg-primary/10 text-primary"
                        >
                          <item.icon className="h-4 w-4" />
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
