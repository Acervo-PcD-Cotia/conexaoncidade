/**
 * Business Detail Page - Full profile view
 * SEO optimized with structured data, Leaflet map, lead form
 */

import { useEffect, useState } from "react";
import { sanitizeHtml } from "@/hooks/useSanitizedHtml";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  useBusiness,
  useBusinessReviews,
  useIncrementBusinessViews,
  useLogBusinessClick,
  useCreateLead,
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
  type OpeningHours,
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
  ExternalLink,
  Navigation,
  Share2,
  Heart,
  ChevronRight,
  Home,
  Send,
  Calendar,
  Facebook,
} from "lucide-react";

// Fix leaflet default marker icon
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const DAY_LABELS: Record<string, string> = {
  monday: "Segunda-feira",
  tuesday: "Terça-feira",
  wednesday: "Quarta-feira",
  thursday: "Quinta-feira",
  friday: "Sexta-feira",
  saturday: "Sábado",
  sunday: "Domingo",
};

const DAY_ORDER = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export default function BusinessDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: business, isLoading, error } = useBusiness(slug ?? "");
  const { data: reviews } = useBusinessReviews(business?.id ?? "");
  const incrementViews = useIncrementBusinessViews();
  const logClick = useLogBusinessClick();
  const createLead = useCreateLead();

  const [leadForm, setLeadForm] = useState({
    name: "",
    phone: "",
    message: "",
  });

  useEffect(() => {
    if (business?.id) {
      incrementViews.mutate(business.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business?.id]);

  const handleClick = (type: "whatsapp" | "phone" | "website" | "directions" | "instagram") => {
    if (business) {
      logClick.mutate({ businessId: business.id, clickType: type });
    }
  };

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!business || !leadForm.name.trim()) return;

    createLead.mutate(
      {
        business_id: business.id,
        name: leadForm.name.trim(),
        phone: leadForm.phone.trim() || undefined,
        message: leadForm.message.trim() || undefined,
        source: "business_page",
      },
      {
        onSuccess: () => {
          setLeadForm({ name: "", phone: "", message: "" });
        },
      }
    );
  };

  const handleShare = async () => {
    if (!business) return;
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: business.name, url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado!");
    }
  };

  if (isLoading) return <BusinessDetailSkeleton />;

  if (error || !business) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Empresa não encontrada</h1>
        <p className="text-muted-foreground mb-6">A empresa que você procura não existe ou foi removida.</p>
        <Button asChild>
          <Link to="/guia">Voltar ao Guia</Link>
        </Button>
      </div>
    );
  }

  const openingStatus = getOpeningStatus(business.opening_hours);
  const isPremium = business.plan === "premium";
  const isPro = business.plan === "pro";
  const hasCoords = business.latitude && business.longitude;

  // Enhanced Structured Data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.name,
    description: business.seo_description ?? business.description_short ?? business.tagline,
    image: business.cover_url ?? business.logo_url,
    logo: business.logo_url,
    url: business.website ?? window.location.href,
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address,
      addressLocality: business.city,
      addressRegion: business.state,
      postalCode: business.cep,
      addressCountry: "BR",
    },
    telephone: business.phone,
    ...(hasCoords && {
      geo: {
        "@type": "GeoCoordinates",
        latitude: business.latitude,
        longitude: business.longitude,
      },
    }),
    ...(business.review_count > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: business.avg_rating,
        reviewCount: business.review_count,
        bestRating: 5,
      },
    }),
    ...(business.opening_hours && {
      openingHoursSpecification: DAY_ORDER.filter(
        (d) => business.opening_hours[d as keyof OpeningHours] && !business.opening_hours[d as keyof OpeningHours]?.closed
      ).map((d) => {
        const h = business.opening_hours[d as keyof OpeningHours]!;
        return {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: d.charAt(0).toUpperCase() + d.slice(1),
          opens: h.open,
          closes: h.close,
        };
      }),
    }),
    sameAs: [business.instagram && `https://instagram.com/${business.instagram.replace("@", "")}`, business.facebook].filter(
      Boolean
    ),
  };

  return (
    <>
      <Helmet>
        <title>{business.seo_title ?? `${business.name} em ${business.city} | Guia Comercial`}</title>
        <meta name="description" content={business.seo_description ?? business.description_short ?? `${business.name} - ${business.category_main} em ${business.city}`} />
        <link rel="canonical" href={window.location.href} />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Category Color Strip */}
        <div className="h-1.5 bg-primary" />

        {/* Breadcrumbs */}
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-foreground transition-colors">
              <Home className="h-3.5 w-3.5" />
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/guia" className="hover:text-foreground transition-colors">
              Guia
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link to={getCategoryUrl({ slug: business.category_main })} className="hover:text-foreground transition-colors">
              {business.category_main}
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium truncate max-w-[200px]">{business.name}</span>
          </nav>
        </div>

        {/* Hero Cover */}
        <div className="relative h-56 md:h-72 lg:h-80 bg-muted overflow-hidden">
          {business.cover_url ? (
            <img src={business.cover_url} alt={`Foto de ${business.name}`} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/10 to-accent/5" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

          {/* Floating actions */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button variant="secondary" size="icon" className="rounded-full bg-background/80 backdrop-blur-sm" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="relative -mt-20 mb-8">
            <div className="flex flex-col md:flex-row gap-5 items-start">
              {/* Logo */}
              <div className="flex-shrink-0 relative">
                {business.logo_url ? (
                  <img
                    src={business.logo_url}
                    alt=""
                    className="w-28 h-28 md:w-32 md:h-32 rounded-2xl border-4 border-background object-cover bg-card shadow-lg"
                  />
                ) : (
                  <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl border-4 border-background bg-card shadow-lg flex items-center justify-center text-5xl">
                    🏢
                  </div>
                )}
                {business.verification_status === "verified" && (
                  <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1">
                    <BadgeCheck className="h-4 w-4" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 pt-2">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">{business.name}</h1>
                  {isPremium && (
                    <Badge className={PLAN_COLORS.premium}>⭐ {PLAN_LABELS.premium}</Badge>
                  )}
                  {isPro && (
                    <Badge className={PLAN_COLORS.pro}>{PLAN_LABELS.pro}</Badge>
                  )}
                </div>

                {business.tagline && (
                  <p className="text-lg text-muted-foreground mb-3">{business.tagline}</p>
                )}

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                  <Link to={getCategoryUrl({ slug: business.category_main })} className="text-primary font-medium hover:underline">
                    {business.category_main}
                  </Link>

                  {business.avg_rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="font-semibold">{business.avg_rating.toFixed(1)}</span>
                      <span className="text-muted-foreground">({business.review_count})</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {business.city}{business.state ? ` - ${business.state}` : ""}
                  </div>

                  <Badge variant={openingStatus.isOpen ? "default" : "secondary"} className="gap-1">
                    <Clock className="h-3 w-3" />
                    {openingStatus.text}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Contact Bar (Mobile-first) */}
          <div className="flex flex-wrap gap-2 mb-8">
            {business.whatsapp && (
              <Button onClick={() => handleClick("whatsapp")} className="flex-1 min-w-[140px]" asChild>
                <a href={formatWhatsAppUrl(business.whatsapp, `Olá! Vi ${business.name} no Guia Comercial e gostaria de mais informações.`)} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  WhatsApp
                </a>
              </Button>
            )}
            {business.phone && (
              <Button variant="outline" onClick={() => handleClick("phone")} className="flex-1 min-w-[140px]" asChild>
                <a href={formatPhoneUrl(business.phone)}>
                  <Phone className="mr-2 h-4 w-4" />
                  Ligar
                </a>
              </Button>
            )}
            {business.google_maps_url && (
              <Button variant="outline" onClick={() => handleClick("directions")} className="flex-1 min-w-[140px]" asChild>
                <a href={business.google_maps_url} target="_blank" rel="noopener noreferrer">
                  <Navigation className="mr-2 h-4 w-4" />
                  Como chegar
                </a>
              </Button>
            )}
          </div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-8 pb-16">
            {/* Left - Content */}
            <div className="lg:col-span-2 space-y-6">
              <Tabs defaultValue="about">
                <TabsList className="w-full justify-start overflow-x-auto">
                  <TabsTrigger value="about">Sobre</TabsTrigger>
                  <TabsTrigger value="hours">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    Horários
                  </TabsTrigger>
                  {business.services && business.services.length > 0 && (
                    <TabsTrigger value="services">Serviços</TabsTrigger>
                  )}
                  <TabsTrigger value="reviews">Avaliações ({business.review_count})</TabsTrigger>
                  {business.promotions && business.promotions.length > 0 && (
                    <TabsTrigger value="promotions">Promoções</TabsTrigger>
                  )}
                </TabsList>

                {/* About */}
                <TabsContent value="about" className="space-y-6 mt-6">
                  {business.description_full && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Sobre a empresa</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: sanitizeHtml(business.description_full) }} />
                      </CardContent>
                    </Card>
                  )}

                  {business.description_short && !business.description_full && (
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-muted-foreground leading-relaxed">{business.description_short}</p>
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
                            <img key={i} src={url} alt={`Foto ${i + 1} de ${business.name}`} className="w-full h-40 object-cover rounded-lg hover:opacity-90 transition-opacity cursor-pointer" loading="lazy" />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Map */}
                  {hasCoords && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-primary" />
                          Localização
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="rounded-lg overflow-hidden border h-64 md:h-80">
                          <MapContainer center={[business.latitude!, business.longitude!]} zoom={16} scrollWheelZoom={false} className="h-full w-full z-0">
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>' />
                            <Marker position={[business.latitude!, business.longitude!]}>
                              <Popup>
                                <strong>{business.name}</strong>
                                <br />
                                {business.address}
                              </Popup>
                            </Marker>
                          </MapContainer>
                        </div>
                        {business.address && (
                          <p className="text-sm text-muted-foreground mt-3">
                            📍 {business.address}
                            {business.address_complement && `, ${business.address_complement}`}
                            {business.neighborhoods?.[0] && ` — ${business.neighborhoods[0]}`}
                            , {business.city}{business.state && ` - ${business.state}`}
                            {business.cep && ` • CEP ${business.cep}`}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Payment & Amenities */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {business.payment_methods.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Formas de pagamento</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {business.payment_methods.map((method) => (
                              <Badge key={method} variant="secondary">{method}</Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    {business.amenities.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Comodidades</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {business.amenities.map((amenity) => (
                              <Badge key={amenity} variant="outline">{amenity}</Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                {/* Hours */}
                <TabsContent value="hours" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Horários de funcionamento
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="divide-y">
                        {DAY_ORDER.map((day) => {
                          const h = business.opening_hours[day as keyof OpeningHours];
                          const isToday = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase() === day;
                          return (
                            <div key={day} className={`flex items-center justify-between py-3 ${isToday ? "font-semibold" : ""}`}>
                              <div className="flex items-center gap-2">
                                {isToday && <div className="w-2 h-2 rounded-full bg-primary" />}
                                <span>{DAY_LABELS[day]}</span>
                              </div>
                              {h && !h.closed ? (
                                <span className="text-foreground">{h.open} — {h.close}</span>
                              ) : (
                                <span className="text-muted-foreground">Fechado</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Services */}
                <TabsContent value="services" className="mt-6">
                  <div className="space-y-3">
                    {business.services?.map((service) => (
                      <Card key={service.id}>
                        <CardContent className="py-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{service.name}</h4>
                              {service.description && <p className="text-sm text-muted-foreground mt-1">{service.description}</p>}
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-primary">{formatPrice(service.price_min, service.price_max, service.price_unit)}</p>
                              {service.duration_minutes && <p className="text-xs text-muted-foreground">~{service.duration_minutes} min</p>}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Reviews */}
                <TabsContent value="reviews" className="mt-6">
                  {reviews && reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <Card key={review.id}>
                          <CardContent className="py-4">
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary flex-shrink-0">
                                {review.author_name?.[0]?.toUpperCase() ?? "?"}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium">{review.author_name ?? "Anônimo"}</span>
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-muted"}`} />
                                    ))}
                                  </div>
                                </div>
                                {review.title && <h4 className="font-medium text-sm">{review.title}</h4>}
                                {review.content && <p className="text-sm text-muted-foreground mt-1">{review.content}</p>}
                                {review.reply && (
                                  <div className="mt-3 pl-3 border-l-2 border-primary/30">
                                    <p className="text-xs font-medium text-primary mb-1">Resposta da empresa</p>
                                    <p className="text-sm text-muted-foreground">{review.reply}</p>
                                  </div>
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

                {/* Promotions */}
                <TabsContent value="promotions" className="mt-6">
                  <div className="space-y-3">
                    {business.promotions?.map((promo) => (
                      <Card key={promo.id} className="border-amber-200 bg-amber-50/50 dark:bg-amber-900/10">
                        <CardContent className="py-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-amber-500 text-white">
                              {promo.discount_type === "percentage" ? `${promo.discount_value}% OFF` : promo.discount_type === "fixed" ? `R$ ${promo.discount_value} OFF` : "Oferta especial"}
                            </Badge>
                            {promo.code && <code className="bg-background px-2 py-1 rounded text-sm font-mono">{promo.code}</code>}
                          </div>
                          <h4 className="font-medium">{promo.title}</h4>
                          {promo.description && <p className="text-sm text-muted-foreground mt-1">{promo.description}</p>}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Contact Card */}
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Entre em contato</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {business.whatsapp && (
                    <Button className="w-full" size="lg" onClick={() => handleClick("whatsapp")} asChild>
                      <a href={formatWhatsAppUrl(business.whatsapp, `Olá! Vi ${business.name} no Guia Comercial e gostaria de mais informações.`)} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="mr-2 h-5 w-5" />
                        WhatsApp
                      </a>
                    </Button>
                  )}

                  {business.phone && (
                    <Button variant="outline" className="w-full" size="lg" onClick={() => handleClick("phone")} asChild>
                      <a href={formatPhoneUrl(business.phone)}>
                        <Phone className="mr-2 h-5 w-5" />
                        {business.phone}
                      </a>
                    </Button>
                  )}

                  {business.website && (
                    <Button variant="outline" className="w-full" onClick={() => handleClick("website")} asChild>
                      <a href={business.website} target="_blank" rel="noopener noreferrer">
                        <Globe className="mr-2 h-4 w-4" />
                        Visitar site
                        <ExternalLink className="ml-auto h-4 w-4" />
                      </a>
                    </Button>
                  )}

                  <div className="flex gap-2">
                    {business.instagram && (
                      <Button variant="outline" className="flex-1" onClick={() => handleClick("instagram")} asChild>
                        <a href={`https://instagram.com/${business.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer">
                          <Instagram className="mr-1.5 h-4 w-4" />
                          Instagram
                        </a>
                      </Button>
                    )}
                    {business.facebook && (
                      <Button variant="outline" className="flex-1" asChild>
                        <a href={business.facebook} target="_blank" rel="noopener noreferrer">
                          <Facebook className="mr-1.5 h-4 w-4" />
                          Facebook
                        </a>
                      </Button>
                    )}
                  </div>

                  {business.address && (
                    <>
                      <hr className="border-border" />
                      <div className="text-sm">
                        <p className="font-medium mb-1 flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-primary" />
                          Endereço
                        </p>
                        <p className="text-muted-foreground">
                          {business.address}
                          {business.address_complement && `, ${business.address_complement}`}
                        </p>
                        <p className="text-muted-foreground">
                          {business.neighborhoods?.[0] && `${business.neighborhoods[0]}, `}
                          {business.city}{business.state && ` - ${business.state}`}
                          {business.cep && ` • CEP ${business.cep}`}
                        </p>
                      </div>
                      {business.google_maps_url && (
                        <Button variant="outline" className="w-full" onClick={() => handleClick("directions")} asChild>
                          <a href={business.google_maps_url} target="_blank" rel="noopener noreferrer">
                            <Navigation className="mr-2 h-4 w-4" />
                            Ver no Google Maps
                          </a>
                        </Button>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Lead Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Solicitar orçamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLeadSubmit} className="space-y-3">
                    <div>
                      <Label htmlFor="lead-name" className="text-sm">Nome *</Label>
                      <Input id="lead-name" placeholder="Seu nome" value={leadForm.name} onChange={(e) => setLeadForm((p) => ({ ...p, name: e.target.value }))} maxLength={100} required />
                    </div>
                    <div>
                      <Label htmlFor="lead-phone" className="text-sm">Telefone</Label>
                      <Input id="lead-phone" placeholder="(11) 99999-9999" value={leadForm.phone} onChange={(e) => setLeadForm((p) => ({ ...p, phone: e.target.value }))} maxLength={20} />
                    </div>
                    <div>
                      <Label htmlFor="lead-message" className="text-sm">Mensagem</Label>
                      <Textarea id="lead-message" placeholder="Descreva o que você precisa..." value={leadForm.message} onChange={(e) => setLeadForm((p) => ({ ...p, message: e.target.value }))} maxLength={500} rows={3} />
                    </div>
                    <Button type="submit" className="w-full" disabled={createLead.isPending || !leadForm.name.trim()}>
                      <Send className="mr-2 h-4 w-4" />
                      {createLead.isPending ? "Enviando..." : "Enviar solicitação"}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">A empresa receberá seus dados e entrará em contato.</p>
                  </form>
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
                        <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
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
      <div className="h-1.5 bg-primary" />
      <div className="container mx-auto px-4 py-3">
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-56 md:h-72 w-full" />
      <div className="container mx-auto px-4">
        <div className="relative -mt-20 mb-8">
          <div className="flex gap-5">
            <Skeleton className="w-28 h-28 md:w-32 md:h-32 rounded-2xl flex-shrink-0" />
            <div className="flex-1 pt-2">
              <Skeleton className="h-9 w-72 mb-2" />
              <Skeleton className="h-5 w-48 mb-4" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>
        </div>
        <div className="flex gap-2 mb-8">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 flex-1" />
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Skeleton className="h-10 w-full mb-6" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
