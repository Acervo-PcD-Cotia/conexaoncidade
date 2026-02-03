import { useState } from "react";
import { 
  Handshake, 
  Plus, 
  Search, 
  MoreVertical,
  ExternalLink,
  Settings,
  Trash2,
  Check,
  Clock,
  X,
  Loader2,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  usePartnerRelationships, 
  useCreatePartnership, 
  useUpdatePartnership 
} from "@/hooks/usePartnerNetwork";
import { useTenantContext } from "@/contexts/TenantContext";

export default function PartnersManage() {
  const { currentTenantId: siteId } = useTenantContext();
  
  const [search, setSearch] = useState("");
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    partner_site_id: "",
    default_mode: "teaser" as "teaser" | "full" | "rewrite",
    allow_full_content: false,
    allow_rewrite: false,
    require_approval: true,
  });

  // Use real hooks
  const { data: relationships = [], isLoading } = usePartnerRelationships(siteId);
  const createPartnership = useCreatePartnership();
  const updatePartnership = useUpdatePartnership();

  // Separate active partners from pending requests
  const activePartners = relationships.filter(r => r.status === "active");
  const pendingRequests = relationships.filter(r => r.status === "pending");
  const suspendedPartners = relationships.filter(r => r.status === "suspended");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case "pending":
        return <Badge variant="secondary">Pendente</Badge>;
      case "suspended":
        return <Badge variant="destructive">Suspenso</Badge>;
      case "rejected":
        return <Badge variant="outline">Recusado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (mode: string) => {
    switch (mode) {
      case "full":
        return <Badge variant="outline">Conteúdo Completo</Badge>;
      case "teaser":
        return <Badge variant="outline">Resumo</Badge>;
      case "rewrite":
        return <Badge variant="outline">Reescrita</Badge>;
      default:
        return <Badge variant="outline">{mode}</Badge>;
    }
  };

  const filteredPartners = activePartners.filter(partner => {
    const partnerName = partner.source_site?.name || partner.target_site?.name || "";
    return partnerName.toLowerCase().includes(search.toLowerCase());
  });

  const handleInvite = async () => {
    if (!siteId || !inviteForm.partner_site_id) return;
    
    await createPartnership.mutateAsync({
      source_site_id: siteId,
      target_site_id: inviteForm.partner_site_id,
      default_mode: inviteForm.default_mode,
      allow_full_content: inviteForm.allow_full_content,
      allow_rewrite: inviteForm.allow_rewrite,
      require_approval: inviteForm.require_approval,
    });
    
    setIsInviteOpen(false);
    setInviteForm({
      partner_site_id: "",
      default_mode: "teaser",
      allow_full_content: false,
      allow_rewrite: false,
      require_approval: true,
    });
  };

  const handleAccept = async (id: string) => {
    await updatePartnership.mutateAsync({ id, status: "active" });
  };

  const handleReject = async (id: string) => {
    await updatePartnership.mutateAsync({ id, status: "rejected" });
  };

  const handleSuspend = async (id: string) => {
    await updatePartnership.mutateAsync({ id, status: "suspended" });
  };

  const handleReactivate = async (id: string) => {
    await updatePartnership.mutateAsync({ id, status: "active" });
  };

  const getPartnerName = (relationship: typeof relationships[0]) => {
    if (relationship.source_site_id === siteId) {
      return relationship.target_site?.name || "Parceiro";
    }
    return relationship.source_site?.name || "Parceiro";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gerenciar Parcerias</h1>
          <p className="text-muted-foreground">Configure e monitore suas parcerias de sindicação</p>
        </div>
        <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Convidar Parceiro
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Convidar Novo Parceiro</DialogTitle>
              <DialogDescription>
                Envie um convite de parceria para outro portal
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>ID do Site Parceiro</Label>
                <Input
                  placeholder="UUID do site parceiro"
                  value={inviteForm.partner_site_id}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, partner_site_id: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Modo Padrão de Entrega</Label>
                <Select 
                  value={inviteForm.default_mode} 
                  onValueChange={(value: "teaser" | "full" | "rewrite") => 
                    setInviteForm(prev => ({ ...prev, default_mode: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teaser">Resumo (Teaser)</SelectItem>
                    <SelectItem value="full">Conteúdo Completo</SelectItem>
                    <SelectItem value="rewrite">Reescrita</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsInviteOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleInvite}
                disabled={createPartnership.isPending || !inviteForm.partner_site_id}
              >
                {createPartnership.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4 mr-2" />
                )}
                Enviar Convite
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="partners" className="space-y-4">
        <TabsList>
          <TabsTrigger value="partners">
            Parceiros Ativos
            <Badge variant="secondary" className="ml-2">{activePartners.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="pending">
            Solicitações
            <Badge variant="secondary" className="ml-2">{pendingRequests.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="partners" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar parceiro..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPartners.map((partner) => (
                <Card key={partner.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{getPartnerName(partner).slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base">{getPartnerName(partner)}</CardTitle>
                          <CardDescription className="flex items-center gap-1">
                            Parceria ativa
                          </CardDescription>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Settings className="h-4 w-4 mr-2" />
                            Configurar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleSuspend(partner.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Suspender
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(partner.status)}
                      {getTypeBadge(partner.default_mode)}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Modo</p>
                        <p className="font-medium capitalize">{partner.default_mode}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Aprovação</p>
                        <p className="font-medium">{partner.require_approval ? "Obrigatória" : "Automática"}</p>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Desde: {new Date(partner.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && filteredPartners.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Handshake className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum parceiro encontrado</p>
                <Button variant="outline" className="mt-4" onClick={() => setIsInviteOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Convidar Primeiro Parceiro
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {pendingRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{getPartnerName(request).slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{getPartnerName(request)}</p>
                          <p className="text-sm text-muted-foreground">
                            Solicitado em {new Date(request.created_at).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        {getTypeBadge(request.default_mode)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleReject(request.id)}
                          disabled={updatePartnership.isPending}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Recusar
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleAccept(request.id)}
                          disabled={updatePartnership.isPending}
                        >
                          {updatePartnership.isPending ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4 mr-1" />
                          )}
                          Aceitar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {pendingRequests.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Nenhuma solicitação pendente</p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}