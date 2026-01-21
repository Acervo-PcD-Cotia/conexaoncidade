import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, MapPin, Eye, Clock, Phone, Mail, MessageCircle,
  Share2, Heart, AlertTriangle, Star
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useClassifiedById, CLASSIFIED_CATEGORIES } from "@/hooks/useClassifieds";
import { useTrackClassifiedInterest } from "@/hooks/useClassifiedInterest";
import { useAuth } from "@/contexts/AuthContext";
export default function ClassifiedDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data: classified, isLoading, error } = useClassifiedById(id);
  const trackInterest = useTrackClassifiedInterest();

  const isOwner = user && classified?.user_id === user.id;

  const handleContactClick = (clickType: 'whatsapp' | 'phone' | 'email') => {
    if (id) {
      trackInterest.mutate({ classifiedId: id, clickType });
    }
  };
  if (isLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="aspect-video rounded-lg" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error || !classified) {
    return (
      <div className="container py-16 text-center">
        <AlertTriangle className="h-16 w-16 mx-auto text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Anúncio não encontrado</h1>
        <p className="text-muted-foreground mb-6">
          Este anúncio pode ter sido removido ou expirado.
        </p>
        <Button asChild>
          <Link to="/classificados">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar aos classificados
          </Link>
        </Button>
      </div>
    );
  }

  const categoryLabel = CLASSIFIED_CATEGORIES.find(c => c.value === classified.category)?.label || classified.category;

  const formatPrice = (price: number | null) => {
    if (!price) return 'Preço a combinar';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const shareUrl = window.location.href;
  const shareText = `${classified.title} - ${formatPrice(classified.price)}`;

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: classified.title, url: shareUrl });
    } else {
      await navigator.clipboard.writeText(shareUrl);
    }
  };

  return (
    <>
      <Helmet>
        <title>{classified.title} - Classificados | Conexão na Cidade</title>
        <meta name="description" content={classified.description.slice(0, 160)} />
        <meta property="og:title" content={classified.title} />
        <meta property="og:description" content={classified.description.slice(0, 160)} />
        {classified.images?.[0] && <meta property="og:image" content={classified.images[0]} />}
      </Helmet>

      <div className="container py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/classificados" className="hover:text-primary">
            Classificados
          </Link>
          <span>/</span>
          <Link to={`/classificados?category=${classified.category}`} className="hover:text-primary">
            {categoryLabel}
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            {classified.images && classified.images.length > 0 ? (
              <div className="space-y-4">
                <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                  <img
                    src={classified.images[0]}
                    alt={classified.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                {classified.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {classified.images.slice(1, 5).map((img, i) => (
                      <div key={i} className="aspect-square rounded-lg overflow-hidden bg-muted">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
                <span className="text-muted-foreground">Sem imagens</span>
              </div>
            )}

            {/* Title and Price */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <h1 className="text-2xl font-bold">{classified.title}</h1>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <p className="text-3xl font-bold text-primary">
                {formatPrice(classified.price)}
                {classified.is_negotiable && (
                  <Badge variant="secondary" className="ml-3 text-sm font-normal">
                    Negociável
                  </Badge>
                )}
              </p>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {classified.neighborhood && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {classified.neighborhood}
                  {classified.location && `, ${classified.location}`}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {classified.views_count} visualizações
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Publicado {formatDistanceToNow(new Date(classified.created_at), { 
                  addSuffix: true,
                  locale: ptBR 
                })}
              </span>
            </div>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Descrição</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{classified.description}</p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Contact */}
          <div className="space-y-4">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Contato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {classified.contact_name && (
                  <p className="font-medium">{classified.contact_name}</p>
                )}

                {classified.contact_whatsapp && (
                  <Button className="w-full" asChild onClick={() => handleContactClick('whatsapp')}>
                    <a
                      href={`https://wa.me/55${classified.contact_whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá! Vi seu anúncio "${classified.title}" no Conexão na Cidade e tenho interesse.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      WhatsApp
                    </a>
                  </Button>
                )}

                {classified.contact_phone && (
                  <Button variant="outline" className="w-full" asChild onClick={() => handleContactClick('phone')}>
                    <a href={`tel:${classified.contact_phone}`}>
                      <Phone className="h-4 w-4 mr-2" />
                      {classified.contact_phone}
                    </a>
                  </Button>
                )}

                {classified.contact_email && (
                  <Button variant="outline" className="w-full" asChild onClick={() => handleContactClick('email')}>
                    <a href={`mailto:${classified.contact_email}?subject=Interesse: ${classified.title}`}>
                      <Mail className="h-4 w-4 mr-2" />
                      Enviar e-mail
                    </a>
                  </Button>
                )}

                {isOwner && !classified.is_featured && (
                  <div className="pt-4 border-t">
                    <Button variant="secondary" className="w-full" asChild>
                      <Link to={`/classificados/${id}/destacar`}>
                        <Star className="h-4 w-4 mr-2" />
                        Destacar Anúncio
                      </Link>
                    </Button>
                  </div>
                )}

                {classified.is_featured && (
                  <Badge className="w-full justify-center py-2 bg-amber-500 hover:bg-amber-600">
                    <Star className="h-4 w-4 mr-2 fill-current" />
                    Anúncio em Destaque
                  </Badge>
                )}

                <p className="text-xs text-muted-foreground text-center pt-4 border-t">
                  Anúncio válido até {format(new Date(classified.expires_at), "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
