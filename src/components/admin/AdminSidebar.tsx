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
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useUserRole } from "@/hooks/useRequireRole";
import { useNewsCreationModal } from "@/contexts/NewsCreationModalContext";
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

const broadcastItems: MenuItem[] = [
  { title: "Dashboard", url: "/admin/broadcast", icon: Radio },
  { title: "Transmissões", url: "/admin/broadcast/list", icon: Play },
  { title: "Canais", url: "/admin/broadcast/channels", icon: Tv },
  { title: "Programas", url: "/admin/broadcast/programs", icon: Calendar },
  { title: "Playlist Rádio", url: "/admin/broadcast/playlist", icon: Music },
  { title: "Grade de Vídeos", url: "/admin/broadcast/videos", icon: Tv },
];

const businessItems = [
  { title: "Soluções", url: "/admin/solutions", icon: Puzzle },
  { title: "Treinamento", url: "/admin/training", icon: GraduationCap },
  { title: "Financeiro", url: "/admin/financial", icon: Receipt },
  { title: "Auto Post PRO", url: "/admin/autopost", icon: Bot },
  { title: "Campanhas", url: "/admin/campaigns/google-maps", icon: MapPin },
  { title: "Transporte Escolar", url: "/admin/transporte-escolar", icon: Bus },
  { title: "Censo PcD", url: "/admin/censo-pcd", icon: Accessibility },
];

const transporteEscolarItems = [
  { title: "Dashboard", url: "/admin/transporte-escolar", icon: LayoutDashboard },
  { title: "Escolas", url: "/admin/transporte-escolar/escolas", icon: School },
  { title: "Transportadores", url: "/admin/transporte-escolar/transportadores", icon: Bus },
  { title: "Leads", url: "/admin/transporte-escolar/leads", icon: Users },
  { title: "Denúncias", url: "/admin/transporte-escolar/reports", icon: AlertTriangle },
];

const adminOnlyItems = [
  { title: "Comunidade", url: "/admin/community", icon: UsersRound },
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

  const handleMenuClick = (item: MenuItem, e: React.MouseEvent) => {
    if (item.action) {
      e.preventDefault();
      openModal();
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b p-4">
        <NavLink to="/admin" className="flex items-center gap-2">
          {collapsed ? (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Newspaper className="h-4 w-4" />
            </div>
          ) : (
            <img 
              src={logoFull} 
              alt="Conexão na Cidade" 
              className="h-16 w-auto"
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
            <SidebarGroupLabel>Negócios</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {businessItems.map((item) => (
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
        )}
      </SidebarContent>
    </Sidebar>
  );
}
