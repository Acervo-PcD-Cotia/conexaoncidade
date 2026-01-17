import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Search, Sun, Moon, LogOut, LayoutDashboard, Newspaper, FolderOpen, Megaphone, Settings, ShieldCheck, Bus, MapPin, Accessibility, Users, Package, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useRequireRole";
import { useCategories } from "@/hooks/useCategories";
import { SearchBar } from "./SearchBar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logoFull from "@/assets/logo-full.png";
import { AccessibilityMenuButton } from "@/components/accessibility/AccessibilityMenuButton";
import { CommunityButton } from "@/components/community/CommunityButton";
import { NotificationBell } from "@/components/community/NotificationBell";

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { role, loading: roleLoading, isAdmin, isEditor } = useUserRole();
  const { data: categories } = useCategories();
  
  const hasAdminAccess = !roleLoading && (isAdmin || isEditor || ['editor_chief', 'reporter', 'columnist', 'moderator'].includes(role || ''));
  

  const userInitials = user?.user_metadata?.full_name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Main header */}
      <div className="glass border-b shadow-sm">
        <div className="container flex items-center justify-between py-4">
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <nav className="mt-8 flex flex-col gap-4">
                <Link to="/" className="text-lg font-semibold text-primary">
                  Início
                </Link>
                {categories?.map((cat) => (
                  <Link
                    key={cat.slug}
                    to={`/categoria/${cat.slug}`}
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    {cat.name}
                  </Link>
                ))}
                
                {/* Special Links for Mobile */}
                <div className="mt-4 border-t pt-4 space-y-3">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    Serviços
                  </p>
                  <Link
                    to="/google-maps"
                    className="flex items-center gap-2 text-blue-600 dark:text-blue-500 hover:underline"
                  >
                    <MapPin className="h-4 w-4" />
                    Apareça no Google
                  </Link>
                  <Link
                    to="/censo-pcd"
                    className="flex items-center gap-2 text-purple-600 dark:text-purple-500 hover:underline"
                  >
                    <Accessibility className="h-4 w-4" />
                    Censo PcD Cotia
                  </Link>
                  <Link
                    to="/comunidade"
                    className="flex items-center gap-2 text-pink-600 dark:text-pink-500 hover:underline"
                  >
                    <Users className="h-4 w-4" />
                    Comunidade
                  </Link>
                  <Link
                    to="/anti-fake-news"
                    className="flex items-center gap-2 text-green-600 dark:text-green-500 hover:underline"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Check Fake News
                  </Link>
                  <Link
                    to="/transporte-escolar"
                    className="flex items-center gap-2 text-orange-600 dark:text-orange-500 hover:underline"
                  >
                    <Bus className="h-4 w-4" />
                    Transporte Escolar
                  </Link>
                </div>
                
                {/* Admin Links for Mobile */}
                {hasAdminAccess && (
                  <div className="mt-4 border-t pt-4 space-y-3">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      Administração
                    </p>
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <Link
                      to="/admin/news"
                      className="flex items-center gap-2 text-muted-foreground hover:text-primary"
                    >
                      <Newspaper className="h-4 w-4" />
                      Gerenciar Notícias
                    </Link>
                    <Link
                      to="/admin/categories"
                      className="flex items-center gap-2 text-muted-foreground hover:text-primary"
                    >
                      <FolderOpen className="h-4 w-4" />
                      Categorias
                    </Link>
                  </div>
                )}
                
                {!user && (
                  <div className="mt-4 border-t pt-4">
                    <Link to="/auth" className="text-primary hover:underline">
                      Entrar / Cadastrar
                    </Link>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo - Increased size for visual hierarchy */}
          <Link to="/" className="flex items-center">
            <img 
              src={logoFull} 
              alt="Conexão na Cidade" 
              className="h-[80px] w-auto sm:h-[120px] md:h-[150px] max-w-[450px] object-contain"
            />
          </Link>

          {/* Desktop search */}
          <div className="hidden flex-1 justify-center px-8 lg:flex">
            <SearchBar />
          </div>

          {/* Actions - Login + Dark Mode grouped together */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </Button>
            
            {/* Accessibility Button */}
            <AccessibilityMenuButton />
            
            {/* Community Button */}
            <CommunityButton />
            
            {/* Notifications */}
            {user && <NotificationBell />}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {hasAdminAccess && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/admin">
                          <LayoutDashboard className="h-4 w-4 mr-2" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/news">
                          <Newspaper className="h-4 w-4 mr-2" />
                          Gerenciar Notícias
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/categories">
                          <FolderOpen className="h-4 w-4 mr-2" />
                          Categorias
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/ads">
                          <Megaphone className="h-4 w-4 mr-2" />
                          Anúncios
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/settings">
                          <Settings className="h-4 w-4 mr-2" />
                          Configurações
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
            
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile search */}
        {isSearchOpen && (
          <div className="border-t px-4 py-3 lg:hidden">
            <SearchBar />
          </div>
        )}

        {/* Special Services Bar - Below search, above categories */}
        <div className="hidden border-t bg-muted/50 lg:block">
          <div className="container flex items-center justify-center gap-4 py-2">
            <Link
              to="/google-maps"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-500 bg-blue-50 dark:bg-blue-950/50 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
            >
              <MapPin className="h-4 w-4" />
              Apareça no Google
            </Link>
            <Link
              to="/censo-pcd"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-purple-600 dark:text-purple-500 bg-purple-50 dark:bg-purple-950/50 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
            >
              <Accessibility className="h-4 w-4" />
              Censo PcD Cotia
            </Link>
            <Link
              to="/comunidade"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-pink-600 dark:text-pink-500 bg-pink-50 dark:bg-pink-950/50 rounded-full hover:bg-pink-100 dark:hover:bg-pink-900/50 transition-colors"
            >
              <Users className="h-4 w-4" />
              Comunidade
            </Link>
            <Link
              to="/anti-fake-news"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-950/50 rounded-full hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
            >
              <ShieldCheck className="h-4 w-4" />
              Check Fake News
            </Link>
            <Link
              to="/transporte-escolar"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-orange-600 dark:text-orange-500 bg-orange-50 dark:bg-orange-950/50 rounded-full hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors"
            >
              <Bus className="h-4 w-4" />
              Transporte Escolar
            </Link>
            <Link
              to="/classificados"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-cyan-600 dark:text-cyan-500 bg-cyan-50 dark:bg-cyan-950/50 rounded-full hover:bg-cyan-100 dark:hover:bg-cyan-900/50 transition-colors"
            >
              <Package className="h-4 w-4" />
              Classificados
            </Link>
            <Link
              to="/empregos"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
            >
              <Briefcase className="h-4 w-4" />
              Empregos
            </Link>
          </div>
        </div>

        {/* Categories navigation - Dynamic from database */}
        <nav className="hidden border-t lg:block">
          <div className="container">
            <ul className="flex items-center justify-center gap-1">
              {categories?.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    to={`/categoria/${cat.slug}`}
                    className="inline-block px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>
    </header>
  );
}