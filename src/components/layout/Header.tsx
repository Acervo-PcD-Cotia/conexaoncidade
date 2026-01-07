import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Search, Sun, Moon, MapPin, Calendar, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { SearchBar } from "./SearchBar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logoFull from "@/assets/logo-full.png";

const categories = [
  { name: "Política", slug: "politica", color: "category-politics" },
  { name: "Esportes", slug: "esportes", color: "category-sports" },
  { name: "Cultura", slug: "cultura", color: "category-culture" },
  { name: "Economia", slug: "economia", color: "category-economy" },
  { name: "Polícia", slug: "policia", color: "category-police" },
  { name: "Saúde", slug: "saude", color: "category-health" },
  { name: "Educação", slug: "educacao", color: "category-education" },
];

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  
  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const userInitials = user?.user_metadata?.full_name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="container flex items-center justify-between py-1.5 text-xs">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Região Metropolitana
            </span>
            <span className="hidden items-center gap-1 sm:flex">
              <Calendar className="h-3 w-3" />
              <span className="capitalize">{today}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="glass border-b">
        <div className="container flex items-center justify-between py-3">
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
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    to={`/categoria/${cat.slug}`}
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    {cat.name}
                  </Link>
                ))}
                <div className="mt-4 border-t pt-4">
                  <Link to="/auth" className="text-primary hover:underline">
                    Entrar / Cadastrar
                  </Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo - Increased size for visual hierarchy */}
          <Link to="/" className="flex items-center">
            <img 
              src={logoFull} 
              alt="Conexão na Cidade" 
              className="h-12 w-auto sm:h-14 md:h-16"
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
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="text-xs">
                  Entrar
                </Button>
              </Link>
            )}
            
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

        {/* Categories navigation */}
        <nav className="hidden border-t lg:block">
          <div className="container">
            <ul className="flex items-center justify-center gap-1">
              {categories.map((cat) => (
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
