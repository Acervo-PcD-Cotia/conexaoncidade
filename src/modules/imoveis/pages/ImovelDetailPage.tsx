import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { sanitizeHtml } from "@/hooks/useSanitizedHtml";
import { Helmet } from "react-helmet-async";
import { 
  Loader2, MapPin, Bed, Bath, Car, Square, Calendar, Eye, Heart, Share2, 
  ChevronLeft, ChevronRight, Phone, MessageCircle, Building2, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useImovel } from "../hooks/useImoveis";
import { LeadForm } from "../components/LeadForm";
import { TIPO_LABELS, FINALIDADE_LABELS } from "../types";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ImovelDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: imovel, isLoading, error } = useImovel(slug || "");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLeadForm, setShowLeadForm] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !imovel) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold">Imóvel não encontrado</h1>
        <p className="mt-2 text-muted-foreground">Este imóvel pode ter sido removido ou o link está incorreto.</p>
        <Button asChild className="mt-4">
          <Link to="/imoveis">Ver todos os imóveis</Link>
        </Button>
      </div>
    );
  }

  const images = imovel.imagens || [];
  const currentImage = images[currentImageIndex]?.url || "/placeholder.svg";

  const formatPrice = (value?: number) => {
    if (!value) return "Consulte";
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    });
  };

  const nextImage = () => setCurrentImageIndex((i) => (i + 1) % images.length);
  const prevImage = () => setCurrentImageIndex((i) => (i - 1 + images.length) % images.length);

  const whatsappMessage = encodeURIComponent(
    `Olá! Tenho interesse no imóvel: ${imovel.titulo} - ${window.location.href}`
  );

  return (
    <>
      <Helmet>
        <title>{imovel.seo_title || `${imovel.titulo} | Imóveis Conexão na Cidade`}</title>
        <meta name="description" content={imovel.seo_description || `${TIPO_LABELS[imovel.tipo]} ${imovel.finalidade === 'aluguel' ? 'para alugar' : 'à venda'} em ${imovel.bairro}, ${imovel.cidade}. ${imovel.quartos} quartos, ${imovel.area_construida}m².`} />
        <meta property="og:title" content={imovel.titulo} />
        <meta property="og:image" content={currentImage} />
        <link rel="canonical" href={`https://conexaoncidade.lovable.app/imoveis/${imovel.slug}`} />
      </Helmet>

      <div className="container py-6">
        {/* Breadcrumb */}
        <nav className="mb-4 text-sm text-muted-foreground">
          <Link to="/imoveis" className="hover:text-primary">Imóveis</Link>
          <span className="mx-2">/</span>
          <Link to={`/imoveis?cidade=${imovel.cidade}`} className="hover:text-primary">{imovel.cidade}</Link>
          <span className="mx-2">/</span>
          <span>{imovel.bairro}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="relative overflow-hidden rounded-xl bg-muted">
              <Dialog>
                <DialogTrigger asChild>
                  <img
                    src={currentImage}
                    alt={imovel.titulo}
                    className="aspect-[16/10] w-full cursor-zoom-in object-cover"
                  />
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <img src={currentImage} alt={imovel.titulo} className="w-full rounded-lg" />
                </DialogContent>
              </Dialog>

              {images.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </>
              )}

              {/* Badges */}
              <div className="absolute left-3 top-3 flex gap-2">
                <Badge className="bg-primary">{FINALIDADE_LABELS[imovel.finalidade]}</Badge>
                {imovel.destaque && <Badge className="bg-amber-500">Destaque</Badge>}
                {imovel.lancamento && <Badge className="bg-green-500">Lançamento</Badge>}
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`flex-shrink-0 overflow-hidden rounded-lg border-2 ${idx === currentImageIndex ? 'border-primary' : 'border-transparent'}`}
                  >
                    <img src={img.url} alt="" className="h-16 w-24 object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Title & Location */}
            <div>
              <Badge variant="outline" className="mb-2">{TIPO_LABELS[imovel.tipo]}</Badge>
              <h1 className="text-2xl font-bold lg:text-3xl">{imovel.titulo}</h1>
              <p className="mt-2 flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {imovel.endereco && imovel.mostrar_endereco_exato 
                  ? `${imovel.endereco}, ${imovel.numero || ''} - ` 
                  : ''
                }
                {imovel.bairro}, {imovel.cidade}
              </p>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {imovel.quartos > 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center p-4">
                    <Bed className="h-6 w-6 text-primary" />
                    <span className="mt-1 text-lg font-semibold">{imovel.quartos}</span>
                    <span className="text-xs text-muted-foreground">Quartos</span>
                  </CardContent>
                </Card>
              )}
              {imovel.banheiros > 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center p-4">
                    <Bath className="h-6 w-6 text-primary" />
                    <span className="mt-1 text-lg font-semibold">{imovel.banheiros}</span>
                    <span className="text-xs text-muted-foreground">Banheiros</span>
                  </CardContent>
                </Card>
              )}
              {imovel.vagas > 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center p-4">
                    <Car className="h-6 w-6 text-primary" />
                    <span className="mt-1 text-lg font-semibold">{imovel.vagas}</span>
                    <span className="text-xs text-muted-foreground">Vagas</span>
                  </CardContent>
                </Card>
              )}
              {imovel.area_construida && (
                <Card>
                  <CardContent className="flex flex-col items-center p-4">
                    <Square className="h-6 w-6 text-primary" />
                    <span className="mt-1 text-lg font-semibold">{imovel.area_construida}</span>
                    <span className="text-xs text-muted-foreground">m² útil</span>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Description */}
            {imovel.descricao_html && (
              <Card>
                <CardHeader>
                  <CardTitle>Descrição</CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(imovel.descricao_html) }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Features */}
            {imovel.features && imovel.features.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Características</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {imovel.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Nearby */}
            {imovel.proximidades && imovel.proximidades.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Proximidades</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {imovel.proximidades.map((item) => (
                      <Badge key={item} variant="secondary">{item}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Price Card */}
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <div className="mb-4">
                  <p className="text-3xl font-bold text-primary">
                    {formatPrice(imovel.preco)}
                    {imovel.finalidade === "aluguel" && (
                      <span className="text-base font-normal text-muted-foreground">/mês</span>
                    )}
                  </p>
                  {imovel.preco_anterior && imovel.preco_anterior > (imovel.preco || 0) && (
                    <p className="text-sm text-muted-foreground line-through">
                      {formatPrice(imovel.preco_anterior)}
                    </p>
                  )}
                </div>

                {(imovel.condominio_valor || imovel.iptu_valor) && (
                  <div className="mb-4 space-y-1 text-sm">
                    {imovel.condominio_valor && (
                      <p>Condomínio: <strong>{formatPrice(imovel.condominio_valor)}</strong></p>
                    )}
                    {imovel.iptu_valor && (
                      <p>IPTU: <strong>{formatPrice(imovel.iptu_valor)}</strong>/ano</p>
                    )}
                  </div>
                )}

                <Separator className="my-4" />

                {/* CTA Buttons */}
                <div className="space-y-2">
                  {imovel.anunciante?.whatsapp && (
                    <Button className="w-full gap-2" asChild>
                      <a 
                        href={`https://wa.me/55${imovel.anunciante.whatsapp.replace(/\D/g, '')}?text=${whatsappMessage}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="h-4 w-4" />
                        WhatsApp
                      </a>
                    </Button>
                  )}
                  
                  <Button variant="outline" className="w-full" onClick={() => setShowLeadForm(true)}>
                    Enviar mensagem
                  </Button>

                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="flex-1">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="flex-1"
                      onClick={() => navigator.share?.({ title: imovel.titulo, url: window.location.href })}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Advertiser */}
                {imovel.anunciante && (
                  <Link 
                    to={`/imoveis/corretor/${imovel.anunciante.slug}`}
                    className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
                  >
                    {imovel.anunciante.logo_url ? (
                      <img 
                        src={imovel.anunciante.logo_url} 
                        alt={imovel.anunciante.nome}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold">{imovel.anunciante.nome}</p>
                      {imovel.anunciante.creci && (
                        <p className="text-xs text-muted-foreground">CRECI: {imovel.anunciante.creci}</p>
                      )}
                    </div>
                  </Link>
                )}

                {/* Stats */}
                <div className="mt-4 flex justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {imovel.views_count || 0} visualizações
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {imovel.published_at && formatDistanceToNow(new Date(imovel.published_at), { addSuffix: true, locale: ptBR })}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Lead Form Modal */}
        <Dialog open={showLeadForm} onOpenChange={setShowLeadForm}>
          <DialogContent className="max-w-md">
            <LeadForm 
              imovelId={imovel.id} 
              anuncianteId={imovel.anunciante_id}
              imovelTitulo={imovel.titulo}
              onSuccess={() => setShowLeadForm(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
