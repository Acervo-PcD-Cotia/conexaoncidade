import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Loader2, Home, MapPin } from "lucide-react";
import { useImoveis } from "../hooks/useImoveis";
import { ImovelCard, ImovelSearchFilters } from "../components";
import type { ImovelFilters } from "../types";
import { useState } from "react";

// SEO-optimized city page
export default function ImoveisCidadePage() {
  const { cidade } = useParams<{ cidade: string }>();
  const cidadeFormatted = cidade?.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()) || "";
  
  const [filters, setFilters] = useState<ImovelFilters>({
    cidade: cidadeFormatted,
  });

  const { data: imoveis, isLoading } = useImoveis({ filters });

  const totalVenda = imoveis?.filter(i => i.finalidade === 'venda' || i.finalidade === 'venda_aluguel').length || 0;
  const totalAluguel = imoveis?.filter(i => i.finalidade === 'aluguel' || i.finalidade === 'venda_aluguel').length || 0;

  return (
    <>
      <Helmet>
        <title>Imóveis em {cidadeFormatted} | Casas e Apartamentos à Venda e Aluguel</title>
        <meta 
          name="description" 
          content={`Encontre ${imoveis?.length || 0} imóveis em ${cidadeFormatted}. Casas, apartamentos e terrenos à venda e para alugar. ${totalVenda} para venda, ${totalAluguel} para aluguel.`}
        />
        <meta name="keywords" content={`imóveis ${cidadeFormatted}, casas ${cidadeFormatted}, apartamentos ${cidadeFormatted}, alugar ${cidadeFormatted}, comprar casa ${cidadeFormatted}`} />
        <link rel="canonical" href={`https://conexaoncidade.lovable.app/imoveis/cidade/${cidade}`} />
      </Helmet>

      <div className="container py-8">
        {/* Hero Section */}
        <div className="mb-8 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 p-6 md:p-10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <MapPin className="h-4 w-4" />
            <span>Imóveis em</span>
          </div>
          <h1 className="text-3xl font-bold md:text-4xl">
            {cidadeFormatted}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {imoveis?.length || 0} imóveis disponíveis • {totalVenda} à venda • {totalAluguel} para alugar
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <ImovelSearchFilters 
                filters={filters} 
                onFiltersChange={(f) => setFilters({ ...f, cidade: cidadeFormatted })} 
              />
            </div>
          </aside>

          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : imoveis && imoveis.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {imoveis.map((imovel) => (
                  <ImovelCard key={imovel.id} imovel={imovel} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-12 text-center">
                <Home className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 font-semibold">Nenhum imóvel em {cidadeFormatted}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Cadastre seu imóvel ou tente outra cidade
                </p>
              </div>
            )}
          </div>
        </div>

        {/* SEO Content */}
        <section className="mt-12 prose prose-sm dark:prose-invert max-w-none">
          <h2>Imóveis à venda e para alugar em {cidadeFormatted}</h2>
          <p>
            Procurando imóveis em {cidadeFormatted}? No portal Conexão na Cidade você encontra as melhores 
            opções de casas, apartamentos, terrenos e imóveis comerciais na região. Nossa plataforma conecta 
            você diretamente com corretores e imobiliárias locais, facilitando sua busca pelo imóvel ideal.
          </p>
          <p>
            {cidadeFormatted} oferece excelente qualidade de vida, com infraestrutura completa, 
            fácil acesso a São Paulo e opções para todos os perfis: desde apartamentos compactos 
            até casas em condomínio com ampla área de lazer.
          </p>
        </section>
      </div>
    </>
  );
}
