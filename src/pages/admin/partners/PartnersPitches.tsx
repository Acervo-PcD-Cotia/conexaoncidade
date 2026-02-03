import { useState } from "react";
import { 
  Lightbulb, 
  Plus, 
  Send, 
  Clock,
  Check,
  X,
  MessageSquare,
  Eye,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  usePitchRequests, 
  useCreatePitchRequest, 
  useRespondToPitch,
  usePartnerRelationships 
} from "@/hooks/usePartnerNetwork";
import { useTenantContext } from "@/contexts/TenantContext";
import { useAuth } from "@/contexts/AuthContext";

export default function PartnersPitches() {
  const { currentTenantId: siteId } = useTenantContext();
  const { user } = useAuth();
  

  const [isNewPitchOpen, setIsNewPitchOpen] = useState(false);
  const [newPitch, setNewPitch] = useState({
    to_site_id: "",
    title: "",
    description: "",
  });

  // Real hooks
  const { data: receivedPitches = [], isLoading: loadingReceived } = usePitchRequests(siteId, "received");
  const { data: sentPitches = [], isLoading: loadingSent } = usePitchRequests(siteId, "sent");
  const { data: partners = [] } = usePartnerRelationships(siteId);
  const createPitch = useCreatePitchRequest();
  const respondToPitch = useRespondToPitch();

  const activePartners = partners.filter(p => p.status === "active");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      case "approved":
        return <Badge className="bg-green-100 text-green-800"><Check className="h-3 w-3 mr-1" />Aceito</Badge>;
      case "rejected":
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Recusado</Badge>;
      case "needs_info":
        return <Badge variant="outline"><MessageSquare className="h-3 w-3 mr-1" />Precisa Info</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleCreatePitch = async () => {
    if (!siteId || !newPitch.to_site_id || !newPitch.title) return;

    await createPitch.mutateAsync({
      from_site_id: siteId,
      to_site_id: newPitch.to_site_id,
      title: newPitch.title,
      description: newPitch.description || undefined,
    });

    setIsNewPitchOpen(false);
    setNewPitch({ to_site_id: "", title: "", description: "" });
  };

  const handleAcceptPitch = async (id: string) => {
    if (!user?.id) return;
    await respondToPitch.mutateAsync({
      id,
      status: "approved",
      responded_by: user.id,
    });
  };

  const handleRejectPitch = async (id: string) => {
    if (!user?.id) return;
    await respondToPitch.mutateAsync({
      id,
      status: "rejected",
      responded_by: user.id,
    });
  };

  // Calculate stats from real data
  const pendingReceived = receivedPitches.filter(p => p.status === "sent").length;
  const pendingSent = sentPitches.filter(p => p.status === "sent").length;
  const acceptedCount = [...receivedPitches, ...sentPitches].filter(p => p.status === "approved").length;
  const totalPitches = receivedPitches.length + sentPitches.length;
  const acceptRate = totalPitches > 0 ? Math.round((acceptedCount / totalPitches) * 100) : 0;

  const getPartnerName = (pitch: typeof receivedPitches[0], direction: "from" | "to") => {
    if (direction === "from") {
      return pitch.from_site?.name || "Parceiro";
    }
    return pitch.to_site?.name || "Parceiro";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sugestões de Pauta</h1>
          <p className="text-muted-foreground">Troque sugestões de pauta com seus parceiros</p>
        </div>
        <Dialog open={isNewPitchOpen} onOpenChange={setIsNewPitchOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Sugestão
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Nova Sugestão de Pauta</DialogTitle>
              <DialogDescription>
                Envie uma sugestão de pauta para um parceiro
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Título da Pauta</Label>
                <Input 
                  placeholder="Ex: Cobertura especial..." 
                  value={newPitch.title}
                  onChange={(e) => setNewPitch(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea 
                  placeholder="Descreva sua proposta de pauta..."
                  rows={4}
                  value={newPitch.description}
                  onChange={(e) => setNewPitch(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Enviar para</Label>
                <Select 
                  value={newPitch.to_site_id}
                  onValueChange={(value) => setNewPitch(prev => ({ ...prev, to_site_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um parceiro" />
                  </SelectTrigger>
                  <SelectContent>
                    {activePartners.map((partner) => {
                      const partnerSiteId = partner.source_site_id === siteId 
                        ? partner.target_site_id 
                        : partner.source_site_id;
                      const partnerName = partner.source_site_id === siteId 
                        ? partner.target_site?.name 
                        : partner.source_site?.name;
                      return (
                        <SelectItem key={partner.id} value={partnerSiteId}>
                          {partnerName || "Parceiro"}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewPitchOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleCreatePitch}
                disabled={createPitch.isPending || !newPitch.title || !newPitch.to_site_id}
              >
                {createPitch.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Enviar Sugestão
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats - Dynamic from DB */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Recebidas Pendentes</CardDescription>
            <CardTitle className="text-2xl">{pendingReceived}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Enviadas Pendentes</CardDescription>
            <CardTitle className="text-2xl">{pendingSent}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Aceitas (Total)</CardDescription>
            <CardTitle className="text-2xl">{acceptedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Taxa de Aceite</CardDescription>
            <CardTitle className="text-2xl">{acceptRate}%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="received" className="space-y-4">
        <TabsList>
          <TabsTrigger value="received">
            Recebidas
            <Badge variant="secondary" className="ml-2">{receivedPitches.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="sent">
            Enviadas
            <Badge variant="secondary" className="ml-2">{sentPitches.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="space-y-4">
          {loadingReceived ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : receivedPitches.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhuma sugestão recebida</p>
              </CardContent>
            </Card>
          ) : (
            receivedPitches.map((pitch) => (
              <Card key={pitch.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{getPartnerName(pitch, "from").slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{pitch.title}</h3>
                          {getStatusBadge(pitch.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          De: <span className="font-medium">{getPartnerName(pitch, "from")}</span>
                          {" • "}
                          {format(new Date(pitch.created_at), "dd 'de' MMMM", { locale: ptBR })}
                        </p>
                        {pitch.description && (
                          <p className="text-sm">{pitch.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {pitch.status === "sent" && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-600"
                            onClick={() => handleRejectPitch(pitch.id)}
                            disabled={respondToPitch.isPending}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleAcceptPitch(pitch.id)}
                            disabled={respondToPitch.isPending}
                          >
                            {respondToPitch.isPending ? (
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4 mr-1" />
                            )}
                            Aceitar
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          {loadingSent ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : sentPitches.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhuma sugestão enviada</p>
                <Button variant="outline" className="mt-4" onClick={() => setIsNewPitchOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Sugestão
                </Button>
              </CardContent>
            </Card>
          ) : (
            sentPitches.map((pitch) => (
              <Card key={pitch.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Lightbulb className="h-5 w-5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{pitch.title}</h3>
                          {getStatusBadge(pitch.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Para: <span className="font-medium">{getPartnerName(pitch, "to")}</span>
                          {" • "}
                          {format(new Date(pitch.created_at), "dd 'de' MMMM", { locale: ptBR })}
                        </p>
                        {pitch.description && (
                          <p className="text-sm">{pitch.description}</p>
                        )}
                        {pitch.response_message && (
                          <Badge variant="secondary" className="mt-2">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Resposta recebida
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}