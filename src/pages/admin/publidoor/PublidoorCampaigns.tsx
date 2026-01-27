import { useState } from "react";
import { Plus, Search, MoreHorizontal, Play, Pause, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { usePublidoorCampaigns, useCreatePublidoorCampaign, useUpdatePublidoorCampaignStatus, useDeletePublidoorCampaign } from "@/hooks/usePublidoor";
import { PUBLIDOOR_CAMPAIGN_STATUS_LABELS, PublidoorCampaignFormData, PublidoorCampaignStatus } from "@/types/publidoor";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const STATUS_COLORS: Record<PublidoorCampaignStatus, string> = {
  draft: "bg-gray-100 text-gray-700",
  active: "bg-green-100 text-green-700",
  paused: "bg-amber-100 text-amber-700",
  ended: "bg-red-100 text-red-700",
};

export default function PublidoorCampaigns() {
  const { data: campaigns, isLoading } = usePublidoorCampaigns();
  const createMutation = useCreatePublidoorCampaign();
  const updateStatusMutation = useUpdatePublidoorCampaignStatus();
  const deleteMutation = useDeletePublidoorCampaign();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<PublidoorCampaignFormData>({
    name: "",
    theme: "",
    starts_at: null,
    ends_at: null,
    priority: 5,
    is_exclusive: false,
  });

  const filteredCampaigns = campaigns?.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.theme?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    if (!formData.name) return;
    await createMutation.mutateAsync(formData);
    setDialogOpen(false);
    setFormData({ name: "", theme: "", starts_at: null, ends_at: null, priority: 5, is_exclusive: false });
  };

  const handleStatusChange = (id: string, status: PublidoorCampaignStatus) => {
    updateStatusMutation.mutate({ id, status });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campanhas</h1>
          <p className="text-muted-foreground">Agrupe seus Publidoors em campanhas temáticas</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Campanha
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Campanha</DialogTitle>
              <DialogDescription>Crie uma campanha para agrupar Publidoors</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Campanha *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Black Friday 2024"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="theme">Tema</Label>
                <Input
                  id="theme"
                  value={formData.theme || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, theme: e.target.value }))}
                  placeholder="Ex: Promoções, Natal, Volta às Aulas"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="starts_at">Data de Início</Label>
                  <Input
                    id="starts_at"
                    type="datetime-local"
                    value={formData.starts_at?.slice(0, 16) || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, starts_at: e.target.value || null }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ends_at">Data de Término</Label>
                  <Input
                    id="ends_at"
                    type="datetime-local"
                    value={formData.ends_at?.slice(0, 16) || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, ends_at: e.target.value || null }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Prioridade (1-10)</Label>
                <Input
                  id="priority"
                  type="number"
                  min={1}
                  max={10}
                  value={formData.priority}
                  onChange={(e) => setFormData((prev) => ({ ...prev, priority: parseInt(e.target.value) || 5 }))}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_exclusive"
                  checked={formData.is_exclusive}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_exclusive: checked }))}
                />
                <Label htmlFor="is_exclusive">Exclusividade de exibição</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>Criar Campanha</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar campanhas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Carregando...</div>
      ) : filteredCampaigns?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Nenhuma campanha encontrada.</p>
            <Button variant="outline" className="mt-4" onClick={() => setDialogOpen(true)}>
              Criar primeira campanha
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCampaigns?.map((campaign) => (
            <Card key={campaign.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{campaign.name}</CardTitle>
                    {campaign.theme && (
                      <CardDescription>{campaign.theme}</CardDescription>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {campaign.status === "draft" && (
                        <DropdownMenuItem onClick={() => handleStatusChange(campaign.id, "active")}>
                          <Play className="mr-2 h-4 w-4" /> Ativar
                        </DropdownMenuItem>
                      )}
                      {campaign.status === "active" && (
                        <DropdownMenuItem onClick={() => handleStatusChange(campaign.id, "paused")}>
                          <Pause className="mr-2 h-4 w-4" /> Pausar
                        </DropdownMenuItem>
                      )}
                      {campaign.status === "paused" && (
                        <DropdownMenuItem onClick={() => handleStatusChange(campaign.id, "active")}>
                          <Play className="mr-2 h-4 w-4" /> Retomar
                        </DropdownMenuItem>
                      )}
                      {campaign.status !== "ended" && (
                        <DropdownMenuItem onClick={() => handleStatusChange(campaign.id, "ended")}>
                          <StopCircle className="mr-2 h-4 w-4" /> Encerrar
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={STATUS_COLORS[campaign.status]}>
                    {PUBLIDOOR_CAMPAIGN_STATUS_LABELS[campaign.status]}
                  </Badge>
                  {campaign.is_exclusive && (
                    <Badge variant="outline">Exclusiva</Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  {campaign.starts_at && (
                    <p>Início: {format(new Date(campaign.starts_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
                  )}
                  {campaign.ends_at && (
                    <p>Término: {format(new Date(campaign.ends_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
                  )}
                  <p>Prioridade: {campaign.priority}/10</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
