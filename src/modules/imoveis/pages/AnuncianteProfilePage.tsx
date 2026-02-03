import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { 
  Loader2, MapPin, Phone, Mail, Globe, Instagram, Facebook, Star, 
  Building2, Home, MessageCircle, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAnunciante, useAnuncianteImoveis } from "../hooks/useAnunciantes";
import { ImovelCard } from "../components/ImovelCard";
import { PLANO_LABELS } from "../types";

export default function AnuncianteProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: anunciante, isLoading, error } = useAnunciante(slug || "");
  const { data: imoveis, isLoading: loadingImoveis } = useAnuncianteImoveis(anunciante?.id || "");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !anunciante) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold">Perfil não encontrado</h1>
        <p className="mt-2 text-muted-foreground">Este corretor ou imobiliária pode ter sido desativado.</p>
        <Button asChild className="mt-4">
          <Link to="/imoveis">Ver imóveis</Link>
        </Button>
      </div>
    );
  }

  const whatsappLink = anunciante.whatsapp 
    ? `https://wa.me/55${anunciante.whatsapp.replace(/\D/g, '')}`
    : null;

  const imoveisVenda = imoveis?.filter(i => i.finalidade === 'venda' || i.finalidade === 'venda_aluguel') || [];
  const imoveisAluguel = imoveis?.filter(i => i.finalidade === 'aluguel' || i.finalidade === 'venda_aluguel') || [];

  return (
    <>
      <Helmet>
        <title>{anunciante.nome} | Corretor de Imóveis em {anunciante.cidade_base || 'Cotia'}</title>
        <meta 
          name="description" 
          content={`${anunciante.nome} - ${anunciante.tipo === 'imobiliaria' ? 'Imobiliária' : 'Corretor de Imóveis'} em ${anunciante.cidade_base || 'Cotia e região'}. ${anunciante.total_imoveis} imóveis disponíveis.`} 
        />
        {anunciante.creci && <meta name="keywords" content={`CRECI ${anunciante.creci}, corretor cotia, imobiliária cotia`} />}
      </Helmet>

      {/* Cover */}
      <div className="relative h-48 bg-gradient-to-r from-primary/20 to-primary/5 md:h-64">
        {anunciante.capa_url && (
          <img 
            src={anunciante.capa_url} 
            alt="" 
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
      </div>

      <div className="container">
        {/* Profile Header */}
        <div className="-mt-16 mb-8 flex flex-col items-center gap-4 md:-mt-20 md:flex-row md:items-end">
          <div className="relative">
            {anunciante.logo_url ? (
              <img 
                src={anunciante.logo_url} 
                alt={anunciante.nome}
                className="h-32 w-32 rounded-full border-4 border-background object-cover shadow-lg"
              />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-background bg-primary/10 shadow-lg">
                <Building2 className="h-16 w-16 text-primary" />
              </div>
            )}
            {anunciante.is_verified && (
              <div className="absolute -right-1 bottom-2 rounded-full bg-background p-1">
                <CheckCircle2 className="h-6 w-6 text-blue-500" />
              </div>
            )}
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
              <h1 className="text-2xl font-bold md:text-3xl">{anunciante.nome}</h1>
              {anunciante.is_verified && (
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Verificado
                </Badge>
              )}
            </div>
            
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground md:justify-start">
              <Badge variant="outline">
                {anunciante.tipo === 'imobiliaria' ? 'Imobiliária' : 'Corretor'}
              </Badge>
              {anunciante.creci && (
                <span>CRECI: {anunciante.creci}</span>
              )}
              {anunciante.cidade_base && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {anunciante.cidade_base}
                </span>
              )}
            </div>

            {/* Stats */}
            <div className="mt-4 flex flex-wrap justify-center gap-6 md:justify-start">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{anunciante.total_imoveis}</p>
                <p className="text-xs text-muted-foreground">Imóveis</p>
              </div>
              {anunciante.rating_count > 0 && (
                <div className="text-center">
                  <p className="flex items-center gap-1 text-2xl font-bold text-amber-500">
                    <Star className="h-5 w-5 fill-current" />
                    {anunciante.rating_avg.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">{anunciante.rating_count} avaliações</p>
                </div>
              )}
            </div>
          </div>

          {/* Contact buttons */}
          <div className="flex gap-2">
            {whatsappLink && (
              <Button asChild className="gap-2">
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              </Button>
            )}
            {anunciante.telefone && (
              <Button variant="outline" asChild>
                <a href={`tel:${anunciante.telefone}`}>
                  <Phone className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-8 pb-12 lg:grid-cols-4">
          {/* Sidebar */}
          <aside className="space-y-4">
            {/* Contact Card */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold">Contato</h3>
                
                {anunciante.telefone && (
                  <a 
                    href={`tel:${anunciante.telefone}`}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
                  >
                    <Phone className="h-4 w-4" />
                    {anunciante.telefone}
                  </a>
                )}
                
                {anunciante.email && (
                  <a 
                    href={`mailto:${anunciante.email}`}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
                  >
                    <Mail className="h-4 w-4" />
                    {anunciante.email}
                  </a>
                )}
                
                {anunciante.website && (
                  <a 
                    href={anunciante.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
                  >
                    <Globe className="h-4 w-4" />
                    Website
                  </a>
                )}

                <div className="flex gap-2 pt-2">
                  {anunciante.instagram && (
                    <Button variant="ghost" size="icon" asChild>
                      <a href={anunciante.instagram} target="_blank" rel="noopener noreferrer">
                        <Instagram className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {anunciante.facebook && (
                    <Button variant="ghost" size="icon" asChild>
                      <a href={anunciante.facebook} target="_blank" rel="noopener noreferrer">
                        <Facebook className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Bairros */}
            {anunciante.bairros_atuacao && anunciante.bairros_atuacao.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="mb-3 font-semibold">Áreas de Atuação</h3>
                  <div className="flex flex-wrap gap-1">
                    {anunciante.bairros_atuacao.map((bairro) => (
                      <Badge key={bairro} variant="secondary" className="text-xs">
                        {bairro}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* About */}
            {anunciante.sobre_html && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="mb-3 font-semibold">Sobre</h3>
                  <div 
                    className="prose prose-sm dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: anunciante.sobre_html }}
                  />
                </CardContent>
              </Card>
            )}
          </aside>

          {/* Main Content - Listings */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="todos">
              <TabsList>
                <TabsTrigger value="todos">
                  Todos ({imoveis?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="venda">
                  Venda ({imoveisVenda.length})
                </TabsTrigger>
                <TabsTrigger value="aluguel">
                  Aluguel ({imoveisAluguel.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="todos" className="mt-6">
                {loadingImoveis ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : imoveis && imoveis.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {imoveis.map((imovel: any) => (
                      <ImovelCard key={imovel.id} imovel={{
                        ...imovel,
                        features: Array.isArray(imovel.features) ? imovel.features : [],
                        proximidades: Array.isArray(imovel.proximidades) ? imovel.proximidades : [],
                      }} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-12 text-center">
                    <Home className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-4 text-muted-foreground">Nenhum imóvel cadastrado</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="venda" className="mt-6">
                {imoveisVenda.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {imoveisVenda.map((imovel: any) => (
                      <ImovelCard key={imovel.id} imovel={{
                        ...imovel,
                        features: Array.isArray(imovel.features) ? imovel.features : [],
                        proximidades: Array.isArray(imovel.proximidades) ? imovel.proximidades : [],
                      }} />
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-12">Nenhum imóvel à venda</p>
                )}
              </TabsContent>

              <TabsContent value="aluguel" className="mt-6">
                {imoveisAluguel.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {imoveisAluguel.map((imovel: any) => (
                      <ImovelCard key={imovel.id} imovel={{
                        ...imovel,
                        features: Array.isArray(imovel.features) ? imovel.features : [],
                        proximidades: Array.isArray(imovel.proximidades) ? imovel.proximidades : [],
                      }} />
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-12">Nenhum imóvel para alugar</p>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
}
