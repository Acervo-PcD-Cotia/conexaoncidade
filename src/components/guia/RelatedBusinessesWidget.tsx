/**
 * Guia Comercial - Related Businesses Widget
 * For integration with news articles
 */

import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBusinesses } from "@/hooks/useGuiaComercial";
import { getBusinessUrl, PLAN_COLORS, type Business } from "@/types/guia-comercial";
import {
  Star,
  MapPin,
  MessageCircle,
  BadgeCheck,
  ArrowRight,
} from "lucide-react";

interface RelatedBusinessesWidgetProps {
  /** Category slug to filter businesses */
  category?: string;
  /** City to filter businesses */
  city?: string;
  /** Keywords to match (from article tags) */
  keywords?: string[];
  /** Maximum businesses to show */
  limit?: number;
  /** Title override */
  title?: string;
}

export function RelatedBusinessesWidget({
  category,
  city,
  keywords,
  limit = 3,
  title = "Empresas Relacionadas",
}: RelatedBusinessesWidgetProps) {
  const { data: businesses, isLoading } = useBusinesses({
    category,
    city,
    limit,
    sort: 'relevance',
  });

  // Filter by keywords if provided
  const filteredBusinesses = keywords?.length
    ? businesses?.filter(b =>
        keywords.some(k =>
          b.tags?.some(t => t.toLowerCase().includes(k.toLowerCase())) ||
          b.name.toLowerCase().includes(k.toLowerCase()) ||
          b.category_main.toLowerCase().includes(k.toLowerCase())
        )
      )
    : businesses;

  const displayBusinesses = filteredBusinesses?.slice(0, limit);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(limit)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!displayBusinesses?.length) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <span className="text-xl">🏢</span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayBusinesses.map((business) => (
          <BusinessMiniCard key={business.id} business={business} />
        ))}

        <Button variant="outline" className="w-full" asChild>
          <Link to={category ? `/guia/categoria/${category}` : "/guia"}>
            Ver mais empresas
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function BusinessMiniCard({ business }: { business: Business }) {
  const isPremium = business.plan === 'premium';
  const isPro = business.plan === 'pro';

  return (
    <Link
      to={getBusinessUrl(business)}
      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
    >
      {/* Logo */}
      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
        {business.logo_url ? (
          <img
            src={business.logo_url}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-xl">🏢</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="font-medium text-sm line-clamp-1">{business.name}</span>
          {business.verification_status === 'verified' && (
            <BadgeCheck className="h-3.5 w-3.5 text-primary flex-shrink-0" />
          )}
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
          {business.avg_rating > 0 && (
            <span className="flex items-center gap-0.5">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {business.avg_rating.toFixed(1)}
            </span>
          )}
          <span className="flex items-center gap-0.5">
            <MapPin className="h-3 w-3" />
            {business.city}
          </span>
        </div>
      </div>

      {/* Badge */}
      {(isPremium || isPro) && (
        <Badge
          variant="secondary"
          className={`text-xs ${PLAN_COLORS[business.plan]}`}
        >
          {isPremium ? '⭐' : 'Pro'}
        </Badge>
      )}
    </Link>
  );
}

/**
 * Compact version for sidebar use
 */
export function RelatedBusinessesSidebar({
  category,
  city,
  limit = 4,
}: {
  category?: string;
  city?: string;
  limit?: number;
}) {
  const { data: businesses, isLoading } = useBusinesses({
    category,
    city,
    limit,
    sort: 'relevance',
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        {[...Array(limit)].map((_, i) => (
          <Skeleton key={i} className="h-14" />
        ))}
      </div>
    );
  }

  if (!businesses?.length) return null;

  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-sm flex items-center gap-2">
        🏢 Empresas na Região
      </h4>
      
      {businesses.map((b) => (
        <Link
          key={b.id}
          to={getBusinessUrl(b)}
          className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors"
        >
          <div className="h-8 w-8 rounded bg-muted flex items-center justify-center overflow-hidden">
            {b.logo_url ? (
              <img src={b.logo_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-sm">🏢</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium line-clamp-1">{b.name}</span>
            <span className="text-xs text-muted-foreground">{b.category_main}</span>
          </div>
        </Link>
      ))}

      <Button variant="ghost" size="sm" className="w-full" asChild>
        <Link to="/guia">Ver mais →</Link>
      </Button>
    </div>
  );
}

/**
 * Inline CTA for within article content
 */
export function GuiaInlineCTA({ category }: { category?: string }) {
  return (
    <div className="my-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <MessageCircle className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">Procurando um profissional?</p>
          <p className="text-xs text-muted-foreground">
            Encontre empresas verificadas na sua região
          </p>
        </div>
        <Button size="sm" asChild>
          <Link to={category ? `/guia/categoria/${category}` : "/guia"}>
            Ver empresas
          </Link>
        </Button>
      </div>
    </div>
  );
}
