/**
 * Business Detail Page - Full profile view
 * SEO optimized with structured data
 */

import { useEffect } from "react";
import { sanitizeHtml } from "@/hooks/useSanitizedHtml";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  useBusiness, 
  useBusinessReviews, 
  useIncrementBusinessViews,
  useLogBusinessClick,
} from "@/hooks/useGuiaComercial";
import {
  PLAN_COLORS,
  PLAN_LABELS,
  formatWhatsAppUrl,
  formatPhoneUrl,
  formatPrice,
  getOpeningStatus,
  getCategoryUrl,
  type Business,
} from "@/types/guia-comercial";
import {
  MapPin,
  Phone,
  MessageCircle,
  Globe,
  Instagram,
  Star,
  Clock,
  BadgeCheck,
  ChevronRight,
  ExternalLink,
  Navigation,
  Share2,
  Heart,
} from "lucide-react";

export default function BusinessDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: business, isLoading, error } = useBusiness(slug ?? '');
  const { data: reviews } = useBusinessReviews(business?.id ?? '');
  const incrementViews = useIncrementBusinessViews();
  const logClick = useLogBusinessClick();

  // Track view on mount
  useEffect(() => {
    if (business?.id) {
      incrementViews.mutate(business.id);
    }
  }, [business?.id]);

  const handleClick = (type: 'whatsapp' | 'phone' | 'website' | 'directions' | 'instagram') => {
    if (business) {
      logClick.mutate({ businessId: business.id, clickType: type });
    }
  };

  if (isLoading) {
    return <BusinessDetailSkeleton />;
  }

  if (error || !business) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Empresa não encontrada</h1>
        <p className="text-muted-foreground mb-6">
          A empresa que você procura não existe ou foi removida.
        </p>
        <Button asChild>
          <Link to="/guia">Voltar ao Guia</Link>
        </Button>
      </div>
    );
  }

  const openingStatus = getOpeningStatus(business.opening_hours);
  const isPremium = business.plan === 'premium';

  // Structured Data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.name,
    description: business.description_short,
    image: business.logo_url,
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address,
      addressLocality: business.city,
      addressRegion: business.state,
      postalCode: business.cep,
    },
    telephone: business.phone,
    url: business.website,
    aggregateRating: business.review_count > 0 ? {
      "@type": "AggregateRating",
      ratingValue: business.avg_rating,
      reviewCount: business.review_count,
    } : undefined,
  };

  return (
    <>
      <Helmet>
        <title>{business.seo_title ?? `${business.name} | Guia Comercial`}</title>
        <meta 
          name="description" 
          content={business.seo_description ?? business.description_short ?? ''} 
        />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Cover Image */}
        <div className="relative h-48 md:h-64 bg-muted">
          {business.cover_url ? (
            <img
              src={business.cover_url}
              alt={business.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        </div>

        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="relative -mt-16 mb-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Logo */}
              <div className="flex-shrink-0">
                {business.logo_url ? (
                  <img
                    src={business.logo_url}
                    alt=""
                    className="w-28 h-28 rounded-2xl border-4 border-background object-cover bg-white shadow-lg"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-2xl border-4 border-background bg-primary/10 flex items-center justify-center text-4xl">
                    🏢
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-start gap-2 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold">
                    {business.name}
                  </h1>
                  {business.verification_status === 'verified' && (
                    <BadgeCheck className="h-6 w-6 text-primary" />
                  )}
                  {isPremium && (
                    <Badge className={PLAN_COLORS.premium}>
                      ⭐ {PLAN_LABELS.premium}
                    </Badge>
                  )}
                </div>

                {business.tagline && (
                  <p className="text-lg text-muted-foreground mb-3">
                    {business.tagline}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <Link 
                    to={getCategoryUrl({ slug: business.category_main })}
                    className="text-primary hover:underline"
                  >
                    {business.category_main}
                  </Link>

                  {business.avg_rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="font-medium">{business.avg_rating.toFixed(1)}</span>
                      <span className="text-muted-foreground">
                        ({business.review_count} avaliações)
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {business.city}
                  </div>

                  <Badge variant={openingStatus.isOpen ? "default" : "secondary"}>
                    <Clock className="h-3 w-3 mr-1" />
                    {openingStatus.text}
                  </Badge>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-8 pb-12">
            {/* Left Column - Details */}
            <div className="lg:col-span-2 space-y-6">
              <Tabs defaultValue="about">
                <TabsList>
                  <TabsTrigger value="about">Sobre</TabsTrigger>
                  {business.services && business.services.length > 0 && (
                    <TabsTrigger value="services">Serviços</TabsTrigger>
                  )}
                  <TabsTrigger value="reviews">
                    Avaliações ({business.review_count})
                  </TabsTrigger>
                  {business.promotions && business.promotions.length > 0 && (
                    <TabsTrigger value="promotions">Promoções</TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="about" className="space-y-6 mt-6">
                  {business.description_full && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Sobre a empresa</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div 
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: sanitizeHtml(business.description_full) }}
                        />
                      </CardContent>
                    </Card>
                  )}

                  {/* Gallery */}
                  {business.gallery_urls.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Fotos</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {business.gallery_urls.map((url, i) => (
                            <img
                              key={i}
                              src={url}
                              alt=""
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Payment & Amenities */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {business.payment_methods.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Formas de pagamento</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {business.payment_methods.map((method) => (
                              <Badge key={method} variant="secondary">
                                {method}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {business.amenities.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Comodidades</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {business.amenities.map((amenity) => (
                              <Badge key={amenity} variant="outline">
                                {amenity}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="services" className="mt-6">
                  <div className="space-y-3">
                    {business.services?.map((service) => (
                      <Card key={service.id}>
                        <CardContent className="py-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{service.name}</h4>
                              {service.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {service.description}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-primary">
                                {formatPrice(service.price_min, service.price_max, service.price_unit)}
                              </p>
                              {service.duration_minutes && (
                                <p className="text-xs text-muted-foreground">
                                  ~{service.duration_minutes} min
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="reviews" className="mt-6">
                  {reviews && reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <Card key={review.id}>
                          <CardContent className="py-4">
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  {review.author_name?.[0]?.toUpperCase() ?? '?'}
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium">
                                    {review.author_name ?? 'Anônimo'}
                                  </span>
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-4 w-4 ${
                                          i < review.rating
                                            ? 'fill-amber-400 text-amber-400'
                                            : 'text-muted'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                {review.title && (
                                  <h4 className="font-medium">{review.title}</h4>
                                )}
                                {review.content && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {review.content}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="py-8 text-center text-muted-foreground">
                        Ainda não há avaliações. Seja o primeiro a avaliar!
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="promotions" className="mt-6">
                  <div className="space-y-3">
                    {business.promotions?.map((promo) => (
                      <Card key={promo.id} className="border-amber-200 bg-amber-50/50">
                        <CardContent className="py-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-amber-500">
                              {promo.discount_type === 'percentage' 
                                ? `${promo.discount_value}% OFF`
                                : promo.discount_type === 'fixed'
                                ? `R$ ${promo.discount_value} OFF`
                                : 'Oferta especial'}
                            </Badge>
                            {promo.code && (
                              <code className="bg-background px-2 py-1 rounded text-sm">
                                {promo.code}
                              </code>
                            )}
                          </div>
                          <h4 className="font-medium">{promo.title}</h4>
                          {promo.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {promo.description}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Column - Contact Card */}
            <div className="space-y-6">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Entre em contato</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {business.whatsapp && (
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={() => handleClick('whatsapp')}
                      asChild
                    >
                      <a 
                        href={formatWhatsAppUrl(business.whatsapp, `Olá! Vi ${business.name} no Guia Comercial e gostaria de mais informações.`)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="mr-2 h-5 w-5" />
                        WhatsApp
                      </a>
                    </Button>
                  )}

                  {business.phone && (
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      size="lg"
                      onClick={() => handleClick('phone')}
                      asChild
                    >
                      <a href={formatPhoneUrl(business.phone)}>
                        <Phone className="mr-2 h-5 w-5" />
                        {business.phone}
                      </a>
                    </Button>
                  )}

                  {business.website && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleClick('website')}
                      asChild
                    >
                      <a href={business.website} target="_blank" rel="noopener noreferrer">
                        <Globe className="mr-2 h-4 w-4" />
                        Visitar site
                        <ExternalLink className="ml-auto h-4 w-4" />
                      </a>
                    </Button>
                  )}

                  {business.instagram && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleClick('instagram')}
                      asChild
                    >
                      <a 
                        href={`https://instagram.com/${business.instagram.replace('@', '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <Instagram className="mr-2 h-4 w-4" />
                        {business.instagram}
                      </a>
                    </Button>
                  )}

                  {business.address && (
                    <>
                      <hr />
                      <div className="text-sm">
                        <p className="font-medium mb-1">Endereço</p>
                        <p className="text-muted-foreground">
                          {business.address}
                          {business.address_complement && `, ${business.address_complement}`}
                        </p>
                        <p className="text-muted-foreground">
                          {business.neighborhoods?.[0] && `${business.neighborhoods[0]}, `}
                          {business.city} - {business.state}
                          {business.cep && `, CEP ${business.cep}`}
                        </p>
                      </div>
                      {business.google_maps_url && (
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => handleClick('directions')}
                          asChild
                        >
                          <a href={business.google_maps_url} target="_blank" rel="noopener noreferrer">
                            <Navigation className="mr-2 h-4 w-4" />
                            Ver no mapa
                          </a>
                        </Button>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Tags */}
              {business.tags.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {business.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function BusinessDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <Skeleton className="h-48 md:h-64 w-full" />
      <div className="container mx-auto px-4">
        <div className="relative -mt-16 mb-6">
          <div className="flex gap-6">
            <Skeleton className="w-28 h-28 rounded-2xl" />
            <div className="flex-1">
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-5 w-48 mb-4" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Skeleton className="h-10 w-full mb-6" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div>
            <Skeleton className="h-80 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
