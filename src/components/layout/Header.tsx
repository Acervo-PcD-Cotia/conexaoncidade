import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Search, Sun, Moon, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "@/hooks/useTheme";
import { SearchBar } from "./SearchBar";

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
  
  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

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
          <div className="flex items-center gap-2">
            <Link to="/auth" className="hover:underline">
              Entrar
            </Link>
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

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              <span className="font-heading text-xl font-extrabold tracking-tight text-primary sm:text-2xl">
                Conexão
              </span>
              <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Na Cidade
              </span>
            </div>
          </Link>

          {/* Desktop search */}
          <div className="hidden flex-1 justify-center px-8 lg:flex">
            <SearchBar />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </Button>
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
