import { useState } from "react";
import { useModuleEnabled } from "@/hooks/useModuleEnabled";
import { Link } from "react-router-dom";
import { Menu, X, Search, Sun, Moon, LogOut, LayoutDashboard, Newspaper, FolderOpen, Megaphone, Settings, ShieldCheck, Bus, MapPin, Accessibility, Users, Radio, Tv, GraduationCap, Trophy, Home, ChevronDown, Store, BookOpen } from "lucide-react";
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
import { useBranding } from "@/hooks/useBranding";

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { role, loading: roleLoading, isAdmin, isEditor } = useUserRole();
  const { data: categories } = useCategories();
  const branding = useBranding();
  const isRadioEnabled = useModuleEnabled('web_radio');
  const isTvEnabled = useModuleEnabled('web_tv');
  const isMenuGoogleEnabled = useModuleEnabled('menu_google');
  const isMenuBrasileiraoEnabled = useModuleEnabled('menu_brasileirao');
  const isMenuCensoEnabled = useModuleEnabled('menu_censo');
  const isMenuConexoesEnabled = useModuleEnabled('menu_conexoes');
  const isMenuEnemEnabled = useModuleEnabled('menu_enem');
  const isMenuFakenewsEnabled = useModuleEnabled('menu_fakenews');
  const isMenuEscolarEnabled = useModuleEnabled('menu_escolar');
  const isMenuImoveisEnabled = useModuleEnabled('menu_imoveis');
  const isMenuGuiaEnabled = useModuleEnabled('menu_guia');
  
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
        <div className="container flex items-center justify-between py-2">
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
                  {/* 1. Você no Google - blue */}
                  {isMenuGoogleEnabled && (
                  <Link
                    to="/voce-no-google"
                    className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <MapPin className="h-4 w-4" />
                    <VocabText term="google_maps_cta" fallback="Você no Google" />
                  </Link>
                  )}
                  {/* 2. Brasileirão - emerald */}
                  {isMenuBrasileiraoEnabled && (
                  <Link
                    to="/esportes/brasileirao"
                    className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    <Trophy className="h-4 w-4" />
                    Brasileirão
                  </Link>
                  )}
                  {/* 3. Censo SP - purple */}
                  {isMenuCensoEnabled && (
                  <Link
                    to="/censo-pcd"
                    className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    <Accessibility className="h-4 w-4" />
                    <VocabText term="pcd_census" fallback="Censo SP" />
                  </Link>
                  )}
                  {/* 4. Conexões - pink */}
                  {isMenuConexoesEnabled && (
                  <Link
                    to="/comunidade"
                    className="flex items-center gap-2 text-pink-600 dark:text-pink-400 hover:underline"
                  >
                    <Users className="h-4 w-4" />
                    <VocabText term="community" fallback="Conexões" />
                  </Link>
                  )}
                  {/* 5. ENEM - indigo */}
                  {isMenuEnemEnabled && (
                  <Link
                    to="/enem-2026"
                    className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                  >
                    <GraduationCap className="h-4 w-4" />
                    ENEM
                  </Link>
                  )}
                  {/* 6. Fake News - green */}
                  {isMenuFakenewsEnabled && (
                  <Link
                    to="/anti-fake-news"
                    className="flex items-center gap-2 text-green-600 dark:text-green-400 hover:underline"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <VocabText term="fake_news" fallback="Fake News" />
                  </Link>
                  )}
                  {/* 7. Escolar - amber */}
                  {isMenuEscolarEnabled && (
                  <Link
                    to="/transporte-escolar"
                    className="flex items-center gap-2 text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    <Bus className="h-4 w-4" />
                    <VocabText term="school_transport" fallback="Escolar" />
                  </Link>
                  )}
                  {/* 8. Web Live - red (destaque) */}
                  {(isRadioEnabled || isTvEnabled) && (
                  <Link
                    to="/web-radio-tv"
                    className="flex items-center gap-2 text-red-600 dark:text-red-400 hover:underline font-semibold"
                  >
                    <Radio className="h-4 w-4" />
                    <Tv className="h-4 w-4 -ml-2" />
                    Web Live
                  </Link>
                  )}
                  {/* 9. Imóveis - teal */}
                  {isMenuImoveisEnabled && (
                  <Link
                    to="/imoveis"
                    className="flex items-center gap-2 text-teal-600 dark:text-teal-400 hover:underline font-semibold"
                  >
                    <Home className="h-4 w-4" />
                    Imóveis
                  </Link>
                  )}
                  {/* 10. Guia Comercial - orange */}
                  {isMenuGuiaEnabled && (
                  <Link
                    to="/guia"
                    className="flex items-center gap-2 text-orange-600 dark:text-orange-400 hover:underline font-semibold"
                  >
                    <Store className="h-4 w-4" />
                    Guia Comercial
                  </Link>
                  )}
                  {/* 11. Blog - cyan */}
                  <Link
                    to="/blog"
                    className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 hover:underline"
                  >
                    <BookOpen className="h-4 w-4" />
                    Blog
                  </Link>
                </div>
                {/* Admin Links for Mobile */}
                {hasAdminAccess && (
                  <div className="mt-4 border-t pt-4 space-y-3">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      <VocabText term="admin" fallback="Administração" />
                    </p>
                    <Link
                      to="/spah/painel"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <VocabText term="dashboard" fallback="Dashboard" />
                    </Link>
                    <Link
                      to="/spah/painel/news"
                      className="flex items-center gap-2 text-muted-foreground hover:text-primary"
                    >
                      <Newspaper className="h-4 w-4" />
                      <VocabText term="manage_news" fallback="Gerenciar Notícias" />
                    </Link>
                    <Link
                      to="/spah/painel/categories"
                      className="flex items-center gap-2 text-muted-foreground hover:text-primary"
                    >
                      <FolderOpen className="h-4 w-4" />
                      Categorias
                    </Link>
                  </div>
                )}
                
                {!user && (
                  <div className="mt-4 border-t pt-4">
                    <Link to="/spah" className="text-primary hover:underline">
                      <VocabText term="login" fallback="Entrar / Cadastrar" />
                    </Link>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo - Dynamic size from branding config */}
          <Link to="/" className="flex items-center">
            <img 
              src={logoFull} 
              alt="Conexão na Cidade" 
              className="w-auto max-w-[520px] object-contain"
              style={{ height: `${Math.round((branding?.logo_size ?? 240) * 0.58)}px` }}
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
                        <Link to="/spah/painel">
                          <LayoutDashboard className="h-4 w-4 mr-2" />
                          <VocabText term="dashboard" fallback="Dashboard" />
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/spah/painel/news">
                          <Newspaper className="h-4 w-4 mr-2" />
                          <VocabText term="manage_news" fallback="Gerenciar Notícias" />
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/spah/painel/categories">
                          <FolderOpen className="h-4 w-4 mr-2" />
                          Categorias
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/spah/painel/ads">
                          <Megaphone className="h-4 w-4 mr-2" />
                          Anúncios
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/spah/painel/settings">
                          <Settings className="h-4 w-4 mr-2" />
                          <VocabText term="settings" fallback="Configurações" />
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={async () => {
                    await signOut();
                    window.location.href = "https://conexaoncidade.lovable.app/spah";
                  }}>
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
        <div className="hidden border-t bg-background lg:block">
          <div className="container flex items-center justify-center gap-3 py-1">
            {/* 1. Você no Google - blue */}
            {isMenuGoogleEnabled && (
            <Link
              to="/voce-no-google"
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/60 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors border border-blue-200 dark:border-blue-800"
            >
              <MapPin className="h-4 w-4" />
              <VocabText term="google_maps_cta" fallback="Você no Google" />
            </Link>
            )}
            {/* 2. Brasileirão - emerald */}
            {isMenuBrasileiraoEnabled && (
            <Link
              to="/esportes/brasileirao"
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-900/60 transition-colors border border-emerald-200 dark:border-emerald-800"
            >
              <Trophy className="h-4 w-4" />
              Brasileirão
            </Link>
            )}
            {/* 3. Censo SP - purple */}
            {isMenuCensoEnabled && (
            <Link
              to="/censo-pcd"
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/60 rounded-full hover:bg-purple-200 dark:hover:bg-purple-900/60 transition-colors border border-purple-200 dark:border-purple-800"
            >
              <Accessibility className="h-4 w-4" />
              <VocabText term="pcd_census" fallback="Censo SP" />
            </Link>
            )}
            {/* 4. Conexões - pink */}
            {isMenuConexoesEnabled && (
            <Link
              to="/comunidade"
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-pink-700 dark:text-pink-400 bg-pink-100 dark:bg-pink-950/60 rounded-full hover:bg-pink-200 dark:hover:bg-pink-900/60 transition-colors border border-pink-200 dark:border-pink-800"
            >
              <Users className="h-4 w-4" />
              <VocabText term="community" fallback="Conexões" />
            </Link>
            )}
            {/* 5. ENEM - indigo */}
            {isMenuEnemEnabled && (
            <Link
              to="/enem-2026"
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950/60 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-900/60 transition-colors border border-indigo-200 dark:border-indigo-800"
            >
              <GraduationCap className="h-4 w-4" />
              ENEM
            </Link>
            )}
            {/* 6. Fake News - green */}
            {isMenuFakenewsEnabled && (
            <Link
              to="/anti-fake-news"
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-950/60 rounded-full hover:bg-green-200 dark:hover:bg-green-900/60 transition-colors border border-green-200 dark:border-green-800"
            >
              <ShieldCheck className="h-4 w-4" />
              <VocabText term="fake_news" fallback="Fake News" />
            </Link>
            )}
            {/* 7. Escolar - amber */}
            {isMenuEscolarEnabled && (
            <Link
              to="/transporte-escolar"
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 rounded-full hover:bg-amber-200 dark:hover:bg-amber-900/60 transition-colors border border-amber-200 dark:border-amber-800"
            >
              <Bus className="h-4 w-4" />
              <VocabText term="school_transport" fallback="Escolar" />
            </Link>
            )}
            {/* 8. Web Live - red (destaque com pulse) */}
            {(isRadioEnabled || isTvEnabled) && (
            <Link
              to="/web-radio-tv"
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-950/60 rounded-full hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors border border-red-200 dark:border-red-800 animate-pulse"
            >
              <Radio className="h-4 w-4" />
              <Tv className="h-4 w-4 -ml-1" />
              Web Live
            </Link>
            )}
            {/* 9. Imóveis - teal with submenu */}
            {isMenuImoveisEnabled && (
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-teal-700 dark:text-teal-400 bg-teal-100 dark:bg-teal-950/60 rounded-full hover:bg-teal-200 dark:hover:bg-teal-900/60 transition-colors border border-teal-200 dark:border-teal-800">
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
            )}
            {/* 10. Guia Comercial - orange */}
            {isMenuGuiaEnabled && (
            <Link
              to="/guia"
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/60 rounded-full hover:bg-orange-200 dark:hover:bg-orange-900/60 transition-colors border border-orange-200 dark:border-orange-800"
            >
              <Store className="h-4 w-4" />
              Guia Comercial
            </Link>
            )}
            {/* 11. Blog - cyan */}
            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-cyan-700 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-950/60 rounded-full hover:bg-cyan-200 dark:hover:bg-cyan-900/60 transition-colors border border-cyan-200 dark:border-cyan-800"
            >
              <BookOpen className="h-4 w-4" />
              Blog
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
                    className="inline-block px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
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
