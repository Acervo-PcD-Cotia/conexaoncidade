import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Package } from "lucide-react";
import { useClassifieds } from "@/hooks/useClassifieds";
import { ClassifiedCard } from "@/components/classifieds/ClassifiedCard";
import { ClassifiedFilters } from "@/components/classifieds/ClassifiedFilters";
import { useAuth } from "@/contexts/AuthContext";

export default function ClassifiedsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [neighborhood, setNeighborhood] = useState("");

  const { data: classifieds, isLoading } = useClassifieds({
    search: search || undefined,
    category: category && category !== 'all' ? category : undefined,
    neighborhood: neighborhood && neighborhood !== 'all' ? neighborhood : undefined,
  });

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setNeighborhood("");
  };

  return (
    <>
      <Helmet>
        <title>Classificados - Conexão na Cidade</title>
        <meta name="description" content="Encontre e anuncie produtos e serviços na região de Cotia. Veículos, imóveis, eletrônicos e muito mais." />
      </Helmet>

      <div className="container py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Classificados</h1>
            <p className="text-muted-foreground">
              Compre, venda e anuncie na região de Cotia
            </p>
          </div>
          
          <Button asChild>
            <Link to={user ? "/classificados/novo" : "/auth?redirect=/classificados/novo"}>
              <Plus className="h-4 w-4 mr-2" />
              Anunciar
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <ClassifiedFilters
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
          neighborhood={neighborhood}
          onNeighborhoodChange={setNeighborhood}
          onClear={clearFilters}
        />

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] rounded-lg" />
            ))}
          </div>
        ) : classifieds && classifieds.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {classifieds.map((classified) => (
              <ClassifiedCard key={classified.id} classified={classified} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Package className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum anúncio encontrado</h3>
            <p className="text-muted-foreground mb-6">
              {search || category || neighborhood
                ? "Tente ajustar os filtros para ver mais resultados"
                : "Seja o primeiro a anunciar!"}
            </p>
            <Button asChild>
              <Link to={user ? "/classificados/novo" : "/auth?redirect=/classificados/novo"}>
                <Plus className="h-4 w-4 mr-2" />
                Criar anúncio
              </Link>
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
