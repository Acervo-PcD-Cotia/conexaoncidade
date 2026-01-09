import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Ticket, 
  Share2, 
  ExternalLink,
  CheckCircle,
  Tag,
  Globe,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  useEventBySlug, 
  useEventTickets, 
  useCreateAttendee,
  useEventCoupons,
  EventCoupon
} from "@/hooks/useEvents";

const EventDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  
  const { data: event, isLoading: loadingEvent } = useEventBySlug(slug);
  const { data: tickets } = useEventTickets(event?.id);
  const { data: coupons } = useEventCoupons(event?.id);
  const createAttendee = useCreateAttendee();

  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<EventCoupon | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  if (loadingEvent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando evento...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Evento não encontrado</h1>
        <Link to="/">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao início
          </Button>
        </Link>
      </div>
    );
  }

  const eventDate = event.start_date ? new Date(event.start_date) : null;
  const endDate = event.end_date ? new Date(event.end_date) : null;
  const isOnline = event.location_type === "online" || event.location_type === "hybrid";
  const isInPerson = event.location_type === "presential" || event.location_type === "hybrid";

  const selectedTicketData = tickets?.find(t => t.id === selectedTicket);
  
  const calculateFinalPrice = () => {
    if (!selectedTicketData) return 0;
    let price = selectedTicketData.price || 0;
    if (appliedCoupon) {
      if (appliedCoupon.discount_type === "percentage") {
        price = price * (1 - (appliedCoupon.discount_value || 0) / 100);
      } else {
        price = Math.max(0, price - (appliedCoupon.discount_value || 0));
      }
    }
    return price;
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    
    const coupon = coupons?.find(
      c => c.code.toLowerCase() === couponCode.toLowerCase() && c.is_active
    );
    
    if (coupon) {
      if (coupon.max_uses && coupon.used_count && coupon.used_count >= coupon.max_uses) {
        toast({ title: "Cupom esgotado", variant: "destructive" });
        return;
      }
      if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
        toast({ title: "Cupom expirado", variant: "destructive" });
        return;
      }
      setAppliedCoupon(coupon);
      toast({ title: "Cupom aplicado com sucesso!" });
    } else {
      toast({ title: "Cupom inválido", variant: "destructive" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTicket || !formData.name || !formData.email) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await createAttendee.mutateAsync({
        event_id: event.id,
        ticket_id: selectedTicket,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        user_id: null,
        document: null,
        qr_code_url: null,
        status: "confirmed",
        payment_status: calculateFinalPrice() > 0 ? "pending" : "free",
        payment_method: null,
        payment_amount: calculateFinalPrice(),
        checked_in: false,
        checked_in_at: null,
        notes: appliedCoupon ? `Cupom: ${appliedCoupon.code}` : null
      });
      
      setRegistrationSuccess(true);
      toast({ title: "Inscrição realizada com sucesso!" });
    } catch (error) {
      toast({ title: "Erro ao realizar inscrição", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: event.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copiado!" });
    }
  };

  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <Helmet>
          <title>{event.title} - Inscrição Confirmada</title>
        </Helmet>
        
        <div className="container mx-auto px-4 py-16 text-center">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">Inscrição Confirmada!</h1>
          <p className="text-muted-foreground mb-8">
            Você receberá um e-mail com os detalhes da sua inscrição em breve.
          </p>
          <div className="space-x-4">
            <Link to="/">
              <Button variant="outline">Voltar ao início</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{event.title}</title>
        <meta name="description" content={event.description || ""} />
        {event.hero_image_url && <meta property="og:image" content={event.hero_image_url} />}
      </Helmet>

      {/* Hero */}
      <div className="relative h-[40vh] min-h-[300px] bg-muted">
        {event.hero_image_url ? (
          <img 
            src={event.hero_image_url} 
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="container mx-auto">
            <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
            <div className="flex flex-wrap gap-2 mb-3">
              {event.is_free && <Badge variant="secondary">Gratuito</Badge>}
              {event.location_type && (
                <Badge variant="outline" className="capitalize">
                  {event.location_type === "presential" ? "Presencial" : 
                   event.location_type === "online" ? "Online" : "Híbrido"}
                </Badge>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2">
              {event.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Info */}
            <Card>
              <CardContent className="p-6 space-y-4">
                {eventDate && (
                  <div className="flex items-start gap-4">
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">
                        {format(eventDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </p>
                      {endDate && eventDate.toDateString() !== endDate.toDateString() && (
                        <p className="text-sm text-muted-foreground">
                          até {format(endDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {eventDate && (
                  <div className="flex items-center gap-4">
                    <Clock className="h-5 w-5 text-primary" />
                    <p>{format(eventDate, "HH:mm", { locale: ptBR })}</p>
                  </div>
                )}

                {isInPerson && event.location && (
                  <div className="flex items-start gap-4">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">{event.location}</p>
                    </div>
                  </div>
                )}

                {isOnline && event.online_url && (
                  <div className="flex items-center gap-4">
                    <Globe className="h-5 w-5 text-primary" />
                    <a 
                      href={event.online_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      Link do evento online
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                )}

                {event.max_attendees && (
                  <div className="flex items-center gap-4">
                    <Users className="h-5 w-5 text-primary" />
                    <p>{event.max_attendees} vagas</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            {event.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Sobre o evento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: event.content_html || event.description }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Share */}
            <Button variant="outline" onClick={handleShare} className="w-full sm:w-auto">
              <Share2 className="mr-2 h-4 w-4" />
              Compartilhar evento
            </Button>
          </div>

          {/* Sidebar - Registration */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="h-5 w-5" />
                  Inscrição
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Ticket Selection */}
                  {tickets && tickets.length > 0 && (
                    <div className="space-y-2">
                      <Label>Tipo de ingresso *</Label>
                      <div className="space-y-2">
                        {tickets.map((ticket) => {
                          const available = ticket.quantity 
                            ? ticket.quantity - (ticket.sold_count || 0) 
                            : null;
                          const soldOut = available !== null && available <= 0;
                          
                          return (
                            <div
                              key={ticket.id}
                              onClick={() => !soldOut && setSelectedTicket(ticket.id)}
                              className={`
                                p-3 border rounded-lg cursor-pointer transition-colors
                                ${selectedTicket === ticket.id 
                                  ? "border-primary bg-primary/5" 
                                  : "border-border hover:border-primary/50"}
                                ${soldOut ? "opacity-50 cursor-not-allowed" : ""}
                              `}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">{ticket.name}</p>
                                  {ticket.description && (
                                    <p className="text-sm text-muted-foreground">{ticket.description}</p>
                                  )}
                                  {available !== null && !soldOut && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {available} disponíveis
                                    </p>
                                  )}
                                </div>
                                <div className="text-right">
                                  {soldOut ? (
                                    <Badge variant="secondary">Esgotado</Badge>
                                  ) : ticket.price && ticket.price > 0 ? (
                                    <span className="font-bold text-primary">
                                      R$ {ticket.price.toFixed(2)}
                                    </span>
                                  ) : (
                                    <Badge variant="secondary">Gratuito</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Form Fields */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  {/* Coupon */}
                  {selectedTicketData?.price && selectedTicketData.price > 0 && (
                    <div className="space-y-2">
                      <Label htmlFor="coupon">Cupom de desconto</Label>
                      <div className="flex gap-2">
                        <Input
                          id="coupon"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="Digite o código"
                          disabled={!!appliedCoupon}
                        />
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={handleApplyCoupon}
                          disabled={!!appliedCoupon}
                        >
                          <Tag className="h-4 w-4" />
                        </Button>
                      </div>
                      {appliedCoupon && (
                        <p className="text-sm text-green-600">
                          Cupom "{appliedCoupon.code}" aplicado!
                        </p>
                      )}
                    </div>
                  )}

                  {/* Price Summary */}
                  {selectedTicketData && (
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Ingresso</span>
                        <span>R$ {(selectedTicketData.price || 0).toFixed(2)}</span>
                      </div>
                      {appliedCoupon && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Desconto</span>
                          <span>
                            -{appliedCoupon.discount_type === "percentage" 
                              ? `${appliedCoupon.discount_value}%`
                              : `R$ ${appliedCoupon.discount_value?.toFixed(2)}`}
                          </span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>R$ {calculateFinalPrice().toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={isSubmitting || !selectedTicket}
                  >
                    {isSubmitting ? "Processando..." : "Confirmar inscrição"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
