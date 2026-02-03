import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Search, Sun, Moon, LogOut, LayoutDashboard, Newspaper, FolderOpen, Megaphone, Settings, ShieldCheck, Bus, MapPin, Accessibility, Users, Radio, Tv, GraduationCap, Trophy, Home, ChevronDown } from "lucide-react";
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
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import logoFull from "@/assets/logo-full.png";
import { AccessibilityMenuButton } from "@/components/accessibility/AccessibilityMenuButton";
import { CommunityButton } from "@/components/community/CommunityButton";
import { NotificationBell } from "@/components/community/NotificationBell";
import { VocabText } from "@/components/ui/VocabText";
import { ModuleGuard } from "@/components/guards/ModuleGuard";

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
                  <VocabText term="home" fallback="Início" />
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
                    <VocabText term="services" fallback="Serviços" />
                  </p>
                  {/* 1. Apareça no Google - blue */}
                  <Link
                    to="/google-maps"
                    className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <MapPin className="h-4 w-4" />
                    <VocabText term="google_maps_cta" fallback="Apareça no Google" />
                  </Link>
                  {/* 2. Brasileirão - emerald */}
                  <Link
                    to="/esportes/brasileirao"
                    className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    <Trophy className="h-4 w-4" />
                    Brasileirão
                  </Link>
                  {/* 3. Censo PcD - purple */}
                  <Link
                    to="/censo-pcd"
                    className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    <Accessibility className="h-4 w-4" />
                    <VocabText term="pcd_census" fallback="Censo PcD" />
                  </Link>
                  {/* 4. Conexões - pink */}
                  <Link
                    to="/comunidade"
                    className="flex items-center gap-2 text-pink-600 dark:text-pink-400 hover:underline"
                  >
                    <Users className="h-4 w-4" />
                    <VocabText term="community" fallback="Conexões" />
                  </Link>
                  {/* 5. ENEM 2026 - indigo */}
                  <Link
                    to="/enem-2026"
                    className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                  >
                    <GraduationCap className="h-4 w-4" />
                    ENEM 2026
                  </Link>
                  {/* 6. Fake News - green */}
                  <Link
                    to="/anti-fake-news"
                    className="flex items-center gap-2 text-green-600 dark:text-green-400 hover:underline"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <VocabText term="fake_news" fallback="Fake News" />
                  </Link>
                  {/* 7. Transporte Escolar - amber */}
                  <Link
                    to="/transporte-escolar"
                    className="flex items-center gap-2 text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    <Bus className="h-4 w-4" />
                    <VocabText term="school_transport" fallback="Transporte Escolar" />
                  </Link>
                  {/* 8. Web Rádio / TV - red (destaque) */}
                  <Link
                    to="/web-radio-tv"
                    className="flex items-center gap-2 text-red-600 dark:text-red-400 hover:underline font-semibold"
                  >
                    <Radio className="h-4 w-4" />
                    <Tv className="h-4 w-4 -ml-2" />
                    Web Rádio / TV
                  </Link>
                  {/* 9. Imóveis - teal */}
                  <Link
                    to="/imoveis"
                    className="flex items-center gap-2 text-teal-600 dark:text-teal-400 hover:underline font-semibold"
                  >
                    <Home className="h-4 w-4" />
                    Imóveis
                  </Link>
                </div>
                
                {/* Admin Links for Mobile */}
                {hasAdminAccess && (
                  <div className="mt-4 border-t pt-4 space-y-3">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      <VocabText term="admin" fallback="Administração" />
                    </p>
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <VocabText term="dashboard" fallback="Dashboard" />
                    </Link>
                    <Link
                      to="/admin/news"
                      className="flex items-center gap-2 text-muted-foreground hover:text-primary"
                    >
                      <Newspaper className="h-4 w-4" />
                      <VocabText term="manage_news" fallback="Gerenciar Notícias" />
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
                      <VocabText term="login" fallback="Entrar / Cadastrar" />
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
                          <VocabText term="dashboard" fallback="Dashboard" />
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/news">
                          <Newspaper className="h-4 w-4 mr-2" />
                          <VocabText term="manage_news" fallback="Gerenciar Notícias" />
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
                          <VocabText term="settings" fallback="Configurações" />
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="h-4 w-4 mr-2" />
                    <VocabText term="logout" fallback="Sair" />
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

        {/* Services Bar - Individual Links */}
        <div className="hidden border-t bg-muted/50 lg:block">
          <div className="container flex items-center justify-center gap-3 py-2">
            {/* 1. Apareça no Google - blue */}
            <Link
              to="/campanha/google-maps"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/60 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors border border-blue-200 dark:border-blue-800"
            >
              <MapPin className="h-4 w-4" />
              <VocabText term="google_maps_cta" fallback="Apareça no Google" />
            </Link>
            {/* 2. Brasileirão - emerald */}
            <Link
              to="/esportes/brasileirao"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-900/60 transition-colors border border-emerald-200 dark:border-emerald-800"
            >
              <Trophy className="h-4 w-4" />
              Brasileirão
            </Link>
            {/* 3. Censo PcD - purple */}
            <Link
              to="/censo-pcd"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/60 rounded-full hover:bg-purple-200 dark:hover:bg-purple-900/60 transition-colors border border-purple-200 dark:border-purple-800"
            >
              <Accessibility className="h-4 w-4" />
              <VocabText term="pcd_census" fallback="Censo PcD" />
            </Link>
            {/* 4. Conexões - pink */}
            <Link
              to="/comunidade"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-pink-700 dark:text-pink-400 bg-pink-100 dark:bg-pink-950/60 rounded-full hover:bg-pink-200 dark:hover:bg-pink-900/60 transition-colors border border-pink-200 dark:border-pink-800"
            >
              <Users className="h-4 w-4" />
              <VocabText term="community" fallback="Conexões" />
            </Link>
            {/* 5. ENEM 2026 - indigo */}
            <Link
              to="/enem-2026"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-indigo-700 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950/60 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-900/60 transition-colors border border-indigo-200 dark:border-indigo-800"
            >
              <GraduationCap className="h-4 w-4" />
              ENEM 2026
            </Link>
            {/* 6. Fake News - green */}
            <Link
              to="/anti-fake-news"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-950/60 rounded-full hover:bg-green-200 dark:hover:bg-green-900/60 transition-colors border border-green-200 dark:border-green-800"
            >
              <ShieldCheck className="h-4 w-4" />
              <VocabText term="fake_news" fallback="Fake News" />
            </Link>
            {/* 7. Transporte Escolar - amber */}
            <Link
              to="/transporte-escolar"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 rounded-full hover:bg-amber-200 dark:hover:bg-amber-900/60 transition-colors border border-amber-200 dark:border-amber-800"
            >
              <Bus className="h-4 w-4" />
              <VocabText term="school_transport" fallback="Transporte Escolar" />
            </Link>
            {/* 8. Web Rádio / TV - red (destaque com pulse) */}
            <Link
              to="/web-radio-tv"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-950/60 rounded-full hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors border border-red-200 dark:border-red-800 animate-pulse"
            >
              <Radio className="h-4 w-4" />
              <Tv className="h-4 w-4 -ml-1" />
              Web Rádio / TV
            </Link>
            {/* 9. Imóveis - teal with submenu */}
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-teal-700 dark:text-teal-400 bg-teal-100 dark:bg-teal-950/60 rounded-full hover:bg-teal-200 dark:hover:bg-teal-900/60 transition-colors border border-teal-200 dark:border-teal-800">
                    <Home className="h-4 w-4" />
                    Imóveis
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                      <NavigationMenuLink asChild>
                        <Link
                          to="/imoveis?finalidade=venda"
                          className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">Comprar</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Casas e apartamentos à venda
                          </p>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/imoveis?finalidade=aluguel"
                          className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">Alugar</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Imóveis para locação
                          </p>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/imoveis?lancamento=true"
                          className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">Lançamentos</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Empreendimentos novos
                          </p>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/imoveis?tipo=comercial,galpao,sala_comercial"
                          className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">Comerciais</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Salas, galpões e lojas
                          </p>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/imoveis?tipo=terreno"
                          className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">Terrenos</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Lotes e áreas
                          </p>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/imoveis/corretores"
                          className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">Corretores</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Profissionais da região
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
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
