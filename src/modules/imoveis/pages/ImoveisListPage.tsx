import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Loader2, Home } from "lucide-react";
import { useImoveis } from "../hooks/useImoveis";
import { ImovelCard, ImovelSearchFilters } from "../components";
import type { ImovelFilters } from "../types";

export default function ImoveisListPage() {
  const [searchParams] = useSearchParams();
  
  const [filters, setFilters] = useState<ImovelFilters>({
    finalidade: searchParams.get("finalidade") as "venda" | "aluguel" | undefined,
    cidade: searchParams.get("cidade") || undefined,
    busca: searchParams.get("busca") || undefined,
  });

  const { data: imoveis, isLoading } = useImoveis({ filters });

  return (
    <>
      <Helmet>
        <title>Imóveis em Cotia e Região | Conexão na Cidade</title>
        <meta
          name="description"
          content="Encontre casas, apartamentos e terrenos à venda e para alugar em Cotia, Vargem Grande Paulista e região. Portal imobiliário regional."
        />
      </Helmet>

      <div className="container py-8">
        <div className="mb-6">
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <Home className="h-8 w-8 text-primary" />
            Imóveis
          </h1>
          <p className="mt-2 text-muted-foreground">
            Encontre o imóvel ideal em Cotia e região
          </p>
        </div>

        {/* Compact filters for mobile */}
        <div className="mb-6 lg:hidden">
          <ImovelSearchFilters filters={filters} onFiltersChange={setFilters} compact />
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Sidebar filters for desktop */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <ImovelSearchFilters filters={filters} onFiltersChange={setFilters} />
            </div>
          </aside>

          {/* Results */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : imoveis && imoveis.length > 0 ? (
              <>
                <p className="mb-4 text-sm text-muted-foreground">
                  {imoveis.length} imóveis encontrados
                </p>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {imoveis.map((imovel) => (
                    <ImovelCard key={imovel.id} imovel={imovel} />
                  ))}
                </div>
              </>
            ) : (
              <div className="rounded-lg border border-dashed p-12 text-center">
                <Home className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 font-semibold">Nenhum imóvel encontrado</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Tente ajustar os filtros de busca
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
