import {
  LayoutDashboard,
  Newspaper,
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
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useUserRole } from "@/hooks/useRequireRole";
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

const mainMenuItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Notícias", url: "/admin/news", icon: Newspaper },
  { title: "Central IA", url: "/admin/noticias-ai", icon: Sparkles },
  { title: "Notas Rápidas", url: "/admin/quick-notes", icon: Zap },
  { title: "Categorias", url: "/admin/categories", icon: FolderTree },
  { title: "Tags", url: "/admin/tags", icon: Tag },
  { title: "Web Stories", url: "/admin/stories", icon: PlaySquare },
];

const editorialItems = [
  { title: "Editor da Home", url: "/admin/home-editor", icon: PanelTop },
  { title: "Banners", url: "/admin/banners", icon: Image },
  { title: "Anúncios", url: "/admin/ads", icon: Megaphone },
  { title: "Parceiros & Sindicação", url: "/admin/partners", icon: Handshake },
  { title: "Distribuição Social", url: "/admin/social", icon: Share2 },
  { title: "Gerador de Links", url: "/admin/links", icon: Link2 },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
  { title: "Edição Digital", url: "/admin/editions", icon: BookOpen },
];

const businessItems = [
  { title: "Soluções", url: "/admin/solutions", icon: Puzzle },
  { title: "Treinamento", url: "/admin/training", icon: GraduationCap },
  { title: "Financeiro", url: "/admin/financial", icon: Receipt },
];

const adminOnlyItems = [
  { title: "Usuários", url: "/admin/users", icon: Users },
  { title: "Logs", url: "/admin/logs", icon: History },
  { title: "Configurações", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { isAdmin } = useUserRole();

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
              className="h-8 w-auto"
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
                    <NavLink
                      to={item.url}
                      end={item.url === "/admin"}
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

      <SidebarFooter className="border-t p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink to="/" className="flex items-center gap-2 text-muted-foreground">
                <Home className="h-4 w-4" />
                {!collapsed && <span>Voltar ao site</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
