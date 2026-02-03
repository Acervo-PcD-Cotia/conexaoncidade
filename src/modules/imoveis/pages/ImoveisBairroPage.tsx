import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Loader2, Home, MapPin, Info } from "lucide-react";
import { useImoveis } from "../hooks/useImoveis";
import { useBairroGuia } from "../hooks/useBairrosGuia";
import { ImovelCard, ImovelSearchFilters } from "../components";
import type { ImovelFilters } from "../types";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// SEO-optimized neighborhood page
export default function ImoveisBairroPage() {
  const { cidade, bairro } = useParams<{ cidade: string; bairro: string }>();
  const cidadeFormatted = cidade?.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()) || "";
  const bairroFormatted = bairro?.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()) || "";
  
  const [filters, setFilters] = useState<ImovelFilters>({
    cidade: cidadeFormatted,
    bairro: [bairroFormatted],
  });

  const { data: imoveis, isLoading } = useImoveis({ filters });
  const { data: guia } = useBairroGuia(bairro || "");

  const formatPrice = (value?: number) => {
    if (!value) return null;
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    });
  };

  return (
    <>
      <Helmet>
        <title>Imóveis no {bairroFormatted}, {cidadeFormatted} | Venda e Aluguel</title>
        <meta 
          name="description" 
          content={`${imoveis?.length || 0} imóveis no bairro ${bairroFormatted} em ${cidadeFormatted}. Casas e apartamentos à venda e para alugar. Conheça o bairro e encontre seu novo lar.`}
        />
        <meta name="keywords" content={`imóveis ${bairroFormatted} ${cidadeFormatted}, casas ${bairroFormatted}, apartamentos ${bairroFormatted}, alugar ${bairroFormatted}`} />
        <link rel="canonical" href={`https://conexaoncidade.lovable.app/imoveis/cidade/${cidade}/bairro/${bairro}`} />
      </Helmet>

      <div className="container py-8">
        {/* Hero Section */}
        <div className="mb-8 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 p-6 md:p-10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <MapPin className="h-4 w-4" />
            <span>{cidadeFormatted}</span>
          </div>
          <h1 className="text-3xl font-bold md:text-4xl">
            Imóveis no {bairroFormatted}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {imoveis?.length || 0} imóveis disponíveis neste bairro
          </p>
        </div>

        {/* Neighborhood Guide */}
        {guia && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Guia do Bairro: {bairroFormatted}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {guia.perfil_publico && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Perfil</p>
                    <p className="text-sm">{guia.perfil_publico}</p>
                  </div>
                )}
                {guia.infraestrutura && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Infraestrutura</p>
                    <p className="text-sm">{guia.infraestrutura}</p>
                  </div>
                )}
                {guia.mobilidade && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Mobilidade</p>
                    <p className="text-sm">{guia.mobilidade}</p>
                  </div>
                )}
                {guia.lazer && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Lazer</p>
                    <p className="text-sm">{guia.lazer}</p>
                  </div>
                )}
                {guia.comercio && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Comércio</p>
                    <p className="text-sm">{guia.comercio}</p>
                  </div>
                )}
                {(guia.faixa_preco_venda_min || guia.faixa_preco_venda_max) && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Faixa de Preço (Venda)</p>
                    <p className="text-sm">
                      {formatPrice(guia.faixa_preco_venda_min)} - {formatPrice(guia.faixa_preco_venda_max)}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-4">
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <ImovelSearchFilters 
                filters={filters} 
                onFiltersChange={(f) => setFilters({ ...f, cidade: cidadeFormatted, bairro: [bairroFormatted] })} 
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
                <h3 className="mt-4 font-semibold">Nenhum imóvel no {bairroFormatted}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Seja o primeiro a anunciar neste bairro
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
