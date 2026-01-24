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

// Item principal do Conexão Stream (central hub)
const streamHubItem: MenuItem = { 
  title: "Conexão Stream", 
  url: "/admin/stream", 
  icon: Satellite 
};

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

const radioWebItems: MenuItem[] = [
  { title: "Visão Geral", url: "/admin/radio", icon: Radio },
  { title: "Status do Stream", url: "/admin/radio/status", icon: Activity },
  { title: "Encoder/Chaves", url: "/admin/radio/encoder", icon: Key },
  { title: "AutoDJ Avançado", url: "/admin/radio/autodj", icon: ListMusic },
  { title: "Biblioteca", url: "/admin/radio/library", icon: Music },
  { title: "Estatísticas", url: "/admin/radio/stats", icon: BarChart3 },
  { title: "Players", url: "/admin/radio/players", icon: Layout },
  { title: "Configurações", url: "/admin/radio/settings", icon: Settings },
];

const tvWebItems: MenuItem[] = [
  { title: "Visão Geral", url: "/admin/tv", icon: Tv },
  { title: "Live (RTMP/SRT)", url: "/admin/tv/live", icon: Satellite },
  { title: "Grade Linear", url: "/admin/tv/schedule", icon: CalendarDays },
  { title: "VOD", url: "/admin/tv/vod", icon: Film },
  { title: "Uploads", url: "/admin/tv/uploads", icon: Upload },
  { title: "Estatísticas", url: "/admin/tv/stats", icon: BarChart3 },
  { title: "Players", url: "/admin/tv/players", icon: Layout },
  { title: "Configurações", url: "/admin/tv/settings", icon: Settings },
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

        {/* Conexão Stream - Central Hub */}
        <SidebarGroup>
          <SidebarGroupLabel>Central de Streaming</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to={streamHubItem.url}
                    className="flex items-center gap-2 font-medium"
                    activeClassName="bg-primary/10 text-primary"
                  >
                    <streamHubItem.icon className="h-4 w-4" />
                    {!collapsed && <span>{streamHubItem.title}</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Conexão Ao Vivo</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {broadcastItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/admin/broadcast"}
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
          <SidebarGroupLabel>Conexão Studio</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {conexaoStudioItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/admin/conexao-studio"}
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
          <SidebarGroupLabel>Rádio Web</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {radioWebItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/admin/radio"}
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
          <SidebarGroupLabel>TV Web</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {tvWebItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/admin/tv"}
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
