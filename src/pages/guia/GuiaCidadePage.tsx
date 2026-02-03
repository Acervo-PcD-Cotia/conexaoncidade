/**
 * Guia Comercial - City SEO Page
 * Programmatic page for city listings with full SEO
 */

import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBusinesses, useBusinessCategories } from "@/hooks/useGuiaComercial";
import {
  PLAN_COLORS,
  getBusinessUrl,
  getCategoryUrl,
  type Business,
  type BusinessFilters,
} from "@/types/guia-comercial";
import {
  MapPin,
  Star,
  Phone,
  MessageCircle,
  BadgeCheck,
  Filter,
  Building2,
} from "lucide-react";

export default function GuiaCidadePage() {
  const { cidade } = useParams<{ cidade: string }>();
  const cityName = cidade?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) ?? "";
  
  const [filters, setFilters] = useState<BusinessFilters>({
    city: cityName,
    sort: 'relevance',
    limit: 24,
  });

  const { data: businesses, isLoading: loadingBusinesses } = useBusinesses(filters);
  const { data: categories } = useBusinessCategories();

  const pageTitle = `Empresas e Serviços em ${cityName} | Guia Comercial`;
  const pageDescription = `Encontre os melhores profissionais e empresas em ${cityName}. Restaurantes, serviços, saúde, beleza e muito mais.`;

  // Count businesses by category
  const categoryCounts = businesses?.reduce((acc, b) => {
    acc[b.category_main] = (acc[b.category_main] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) ?? {};

  // JSON-LD for city page
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Empresas em ${cityName}`,
    "description": pageDescription,
    "numberOfItems": businesses?.length ?? 0,
    "itemListElement": businesses?.slice(0, 10).map((b, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "item": {
        "@type": "LocalBusiness",
        "name": b.name,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": cityName,
        },
        "url": `https://conexaonacidade.com.br${getBusinessUrl(b)}`,
      },
    })),
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={`https://conexaonacidade.com.br/guia/cidade/${cidade}`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary/10 to-background py-8 md:py-12">
          <div className="container mx-auto px-4">
            <Breadcrumb className="mb-4">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/">Início</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/guia">Guia Comercial</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{cityName}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">
                  Empresas em {cityName}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {businesses?.length ?? 0} empresas encontradas
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Quick Nav */}
        {categories && categories.length > 0 && (
          <div className="border-b">
            <div className="container mx-auto px-4 py-4">
              <div className="flex gap-2 overflow-x-auto pb-2">
                <Button
                  variant={!filters.category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters(prev => ({ ...prev, category: undefined }))}
                >
                  Todas
                </Button>
                {categories.slice(0, 8).map((cat) => (
                  <Button
                    key={cat.id}
                    variant={filters.category === cat.slug ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilters(prev => ({ ...prev, category: cat.slug }))}
                    className="whitespace-nowrap"
                  >
                    {cat.icon} {cat.name}
                    {categoryCounts[cat.slug] && (
                      <Badge variant="secondary" className="ml-2">
                        {categoryCounts[cat.slug]}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Filters & Results */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Ordenar:</span>
            </div>

            <Select
              value={filters.sort ?? 'relevance'}
              onValueChange={(v) => setFilters((prev) => ({ ...prev, sort: v as BusinessFilters['sort'] }))}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevância</SelectItem>
                <SelectItem value="rating">Melhor avaliados</SelectItem>
                <SelectItem value="reviews">Mais avaliações</SelectItem>
                <SelectItem value="newest">Mais recentes</SelectItem>
                <SelectItem value="name">A-Z</SelectItem>
              </SelectContent>
            </Select>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.verified_only ?? false}
                onChange={(e) => setFilters((prev) => ({ ...prev, verified_only: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm">Apenas verificados</span>
            </label>
          </div>

          {loadingBusinesses ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          ) : businesses?.length === 0 ? (
            <div className="text-center py-16">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Nenhuma empresa encontrada em {cityName}
              </p>
              <Button asChild>
                <Link to="/guia/cadastrar">Seja o primeiro a cadastrar</Link>
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {businesses?.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
          )}

          {businesses && businesses.length >= (filters.limit ?? 24) && (
            <div className="text-center mt-8">
              <Button
                variant="outline"
                onClick={() => setFilters((prev) => ({ ...prev, limit: (prev.limit ?? 24) + 24 }))}
              >
                Carregar mais
              </Button>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="bg-primary/5 py-12">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-xl font-bold mb-2">
              Tem uma empresa em {cityName}?
            </h2>
            <p className="text-muted-foreground mb-4">
              Cadastre-se gratuitamente e aumente sua visibilidade
            </p>
            <Button asChild>
              <Link to="/guia/cadastrar">Cadastrar Minha Empresa</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

function BusinessCard({ business }: { business: Business }) {
  const isPremium = business.plan === 'premium';
  const isPro = business.plan === 'pro';

  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-shadow ${isPremium ? 'ring-2 ring-amber-400' : ''}`}>
      <Link to={getBusinessUrl(business)}>
        <div className="relative h-40 bg-muted">
          {business.cover_url ? (
            <img src={business.cover_url} alt={business.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
          )}
          {(isPremium || isPro) && (
            <Badge className={`absolute top-3 right-3 ${PLAN_COLORS[business.plan]}`}>
              {isPremium ? '⭐ Premium' : 'Pro'}
            </Badge>
          )}
          {business.logo_url && (
            <div className="absolute -bottom-6 left-4">
              <img
                src={business.logo_url}
                alt=""
                className="w-16 h-16 rounded-xl border-4 border-background object-cover bg-white"
              />
            </div>
          )}
        </div>

        <CardContent className={`pt-${business.logo_url ? '8' : '4'}`}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold line-clamp-1 flex items-center gap-1">
                {business.name}
                {business.verification_status === 'verified' && (
                  <BadgeCheck className="h-4 w-4 text-primary flex-shrink-0" />
                )}
              </h3>
              <p className="text-sm text-muted-foreground">{business.category_main}</p>
            </div>
            {business.avg_rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-medium">{business.avg_rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          {business.tagline && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{business.tagline}</p>
          )}

          <div className="flex items-center gap-1 mt-3 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">
              {business.neighborhoods?.[0] || business.city}
            </span>
          </div>

          <div className="flex gap-2 mt-4">
            {business.whatsapp && (
              <Button size="sm" variant="outline" className="flex-1">
                <MessageCircle className="h-4 w-4 mr-1" />
                WhatsApp
              </Button>
            )}
            {business.phone && (
              <Button size="sm" variant="outline" className="flex-1">
                <Phone className="h-4 w-4 mr-1" />
                Ligar
              </Button>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
