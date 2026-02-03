/**
 * Guia Comercial - Main Directory Page
 * Lists businesses with filters, search, and SEO-focused categories
 */

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
  DEFAULT_CATEGORIES,
  type Business,
  type BusinessFilters,
} from "@/types/guia-comercial";
import { 
  Search, 
  MapPin, 
  Star, 
  Phone, 
  MessageCircle,
  ChevronRight,
  BadgeCheck,
  Filter,
} from "lucide-react";

export default function GuiaComercialPage() {
  const [filters, setFilters] = useState<BusinessFilters>({
    sort: 'relevance',
    limit: 24,
  });
  const [searchQuery, setSearchQuery] = useState("");

  const { data: businesses, isLoading: businessesLoading } = useBusinesses(filters);
  const { data: categories } = useBusinessCategories();

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, search: searchQuery, offset: 0 }));
  };

  const handleCategoryFilter = (categorySlug: string) => {
    setFilters(prev => ({
      ...prev,
      category: categorySlug === 'all' ? undefined : categorySlug,
      offset: 0,
    }));
  };

  const displayCategories = categories?.length ? categories : DEFAULT_CATEGORIES.map((c, i) => ({
    ...c,
    id: `default-${i}`,
    tenant_id: null,
    parent_id: null,
    seo_title: null,
    seo_description: null,
    page_content: null,
    sort_order: i,
    is_active: true,
    created_at: new Date().toISOString(),
  }));

  return (
    <>
      <Helmet>
        <title>Guia Comercial | Encontre empresas e serviços locais</title>
        <meta 
          name="description" 
          content="Encontre os melhores profissionais e empresas da sua região. Restaurantes, serviços, saúde, beleza e muito mais." 
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                Guia Comercial
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Encontre os melhores profissionais e empresas da sua região
              </p>

              {/* Search Bar */}
              <div className="flex gap-2 max-w-2xl mx-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar por nome, serviço ou categoria..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10 h-12"
                  />
                </div>
                <Button size="lg" onClick={handleSearch}>
                  Buscar
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="container mx-auto px-4 -mt-8">
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {displayCategories.map((category) => (
              <Link
                key={category.id}
                to={getCategoryUrl(category)}
                className="flex flex-col items-center p-4 bg-card rounded-xl border hover:border-primary hover:shadow-md transition-all group"
              >
                <span className="text-3xl mb-2">{category.icon}</span>
                <span className="text-sm font-medium text-center line-clamp-2 group-hover:text-primary">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Filters & Results */}
        <div className="container mx-auto px-4 py-8">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtros:</span>
            </div>

            <Select
              value={filters.category ?? 'all'}
              onValueChange={handleCategoryFilter}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {displayCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.slug}>
                    {cat.icon} {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.sort ?? 'relevance'}
              onValueChange={(v) => setFilters(prev => ({ ...prev, sort: v as BusinessFilters['sort'] }))}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Ordenar" />
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
                onChange={(e) => setFilters(prev => ({ ...prev, verified_only: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm">Apenas verificados</span>
            </label>
          </div>

          {/* Results Grid */}
          {businessesLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <BusinessCardSkeleton key={i} />
              ))}
            </div>
          ) : businesses?.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">
                Nenhuma empresa encontrada com os filtros selecionados.
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setFilters({ sort: 'relevance', limit: 24 })}
              >
                Limpar filtros
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {businesses?.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
          )}

          {/* Load More */}
          {businesses && businesses.length >= (filters.limit ?? 24) && (
            <div className="text-center mt-8">
              <Button
                variant="outline"
                onClick={() => setFilters(prev => ({
                  ...prev,
                  limit: (prev.limit ?? 24) + 24,
                }))}
              >
                Carregar mais
              </Button>
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="bg-primary/5 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Cadastre sua empresa gratuitamente
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Aumente sua visibilidade online e receba novos clientes todos os dias. 
              Comece grátis e faça upgrade quando quiser.
            </p>
            <Button size="lg" asChild>
              <Link to="/guia/cadastrar">
                Cadastrar minha empresa
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

// ========================
// COMPONENTS
// ========================

function BusinessCard({ business }: { business: Business }) {
  const isPremium = business.plan === 'premium';
  const isPro = business.plan === 'pro';

  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-shadow ${isPremium ? 'ring-2 ring-amber-400' : ''}`}>
      <Link to={getBusinessUrl(business)}>
        {/* Cover Image */}
        <div className="relative h-40 bg-muted">
          {business.cover_url ? (
            <img
              src={business.cover_url}
              alt={business.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
          )}

          {/* Plan Badge */}
          {(isPremium || isPro) && (
            <Badge className={`absolute top-3 right-3 ${PLAN_COLORS[business.plan]}`}>
              {isPremium ? '⭐ Premium' : 'Pro'}
            </Badge>
          )}

          {/* Logo */}
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
              <p className="text-sm text-muted-foreground line-clamp-1">
                {business.category_main}
              </p>
            </div>

            {business.avg_rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-medium">{business.avg_rating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">
                  ({business.review_count})
                </span>
              </div>
            )}
          </div>

          {business.tagline && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {business.tagline}
            </p>
          )}

          <div className="flex items-center gap-1 mt-3 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">
              {business.neighborhoods?.[0] ? `${business.neighborhoods[0]}, ` : ''}
              {business.city}
            </span>
          </div>

          {/* Quick Contact Buttons */}
          <div className="flex gap-2 mt-4">
            {business.whatsapp && (
              <Button size="sm" variant="outline" className="flex-1" asChild>
                <span>
                  <MessageCircle className="h-4 w-4 mr-1" />
                  WhatsApp
                </span>
              </Button>
            )}
            {business.phone && (
              <Button size="sm" variant="outline" className="flex-1" asChild>
                <span>
                  <Phone className="h-4 w-4 mr-1" />
                  Ligar
                </span>
              </Button>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}

function BusinessCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-40 w-full" />
      <CardContent className="pt-4">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-4" />
        <Skeleton className="h-4 w-full mb-4" />
        <div className="flex gap-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 flex-1" />
        </div>
      </CardContent>
    </Card>
  );
}
