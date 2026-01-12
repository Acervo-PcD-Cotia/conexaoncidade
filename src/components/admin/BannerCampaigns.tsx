import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBannerCampaigns, CampaignFormData } from "@/hooks/useBannerCampaigns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Play,
  Pause,
  Trash2,
  Edit,
  DollarSign,
  TrendingUp,
  Target,
  Calendar,
  Monitor,
  Smartphone,
  Tablet,
} from "lucide-react";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";

const defaultForm: CampaignFormData = {
  name: "",
  banner_id: "",
  budget_total: 1000,
  cost_per_click: 0.5,
  cost_per_impression: 5,
  billing_type: "cpc",
  starts_at: "",
  ends_at: "",
  advertiser_name: "",
  advertiser_email: "",
  targeting_categories: [],
  targeting_locations: [],
  targeting_devices: ["desktop", "mobile", "tablet"],
  max_daily_spend: null,
};

const DEVICE_OPTIONS = [
  { value: "desktop", label: "Desktop", icon: Monitor },
  { value: "mobile", label: "Mobile", icon: Smartphone },
  { value: "tablet", label: "Tablet", icon: Tablet },
];

export function BannerCampaigns() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CampaignFormData>(defaultForm);
  const {
    campaigns,
    isLoading,
    createCampaign,
    updateCampaign,
    updateStatus,
    deleteCampaign,
    isCreating,
    isUpdating,
  } = useBannerCampaigns();

  const { data: banners = [] } = useQuery({
    queryKey: ["banners-for-campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("super_banners")
        .select("id, title, image_url")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories-for-targeting"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;

    if (form.id) {
      updateCampaign(form, { onSuccess: () => { setOpen(false); setForm(defaultForm); } });
    } else {
      createCampaign(form, { onSuccess: () => { setOpen(false); setForm(defaultForm); } });
    }
  };

  const handleEdit = (campaign: (typeof campaigns)[0]) => {
    setForm({
      id: campaign.id,
      name: campaign.name,
      banner_id: campaign.banner_id || "",
      budget_total: Number(campaign.budget_total),
      cost_per_click: Number(campaign.cost_per_click) || 0.5,
      cost_per_impression: Number(campaign.cost_per_impression) || 5,
      billing_type: campaign.billing_type as "cpc" | "cpm" | "fixed",
      starts_at: campaign.starts_at ? format(new Date(campaign.starts_at), "yyyy-MM-dd'T'HH:mm") : "",
      ends_at: campaign.ends_at ? format(new Date(campaign.ends_at), "yyyy-MM-dd'T'HH:mm") : "",
      advertiser_name: campaign.advertiser_name || "",
      advertiser_email: campaign.advertiser_email || "",
      targeting_categories: campaign.targeting_categories || [],
      targeting_locations: campaign.targeting_locations || [],
      targeting_devices: campaign.targeting_devices || ["desktop", "mobile", "tablet"],
      max_daily_spend: campaign.max_daily_spend ? Number(campaign.max_daily_spend) : null,
    });
    setOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: "bg-muted text-muted-foreground",
      active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      paused: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      completed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      depleted: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    };
    const labels: Record<string, string> = {
      draft: "Rascunho",
      active: "Ativa",
      paused: "Pausada",
      completed: "Concluída",
      depleted: "Orçamento Esgotado",
    };
    return <Badge className={styles[status]}>{labels[status]}</Badge>;
  };

  const totalBudget = campaigns.reduce((sum, c) => sum + Number(c.budget_total), 0);
  const totalSpent = campaigns.reduce((sum, c) => sum + Number(c.budget_spent), 0);
  const activeCampaigns = campaigns.filter((c) => c.status === "active").length;

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{campaigns.length}</div>
              <div className="text-xs text-muted-foreground">Total de Campanhas</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
              <Play className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{activeCampaigns}</div>
              <div className="text-xs text-muted-foreground">Campanhas Ativas</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">R$ {totalBudget.toLocaleString("pt-BR")}</div>
              <div className="text-xs text-muted-foreground">Orçamento Total</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900/30">
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">R$ {totalSpent.toLocaleString("pt-BR")}</div>
              <div className="text-xs text-muted-foreground">Total Gasto</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Campanhas Publicitárias</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setForm(defaultForm)}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Campanha
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{form.id ? "Editar" : "Nova"} Campanha</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <Tabs defaultValue="basic">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="basic">Básico</TabsTrigger>
                    <TabsTrigger value="budget">Orçamento</TabsTrigger>
                    <TabsTrigger value="targeting">Targeting</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4 pt-4">
                    <div>
                      <Label>Nome da Campanha *</Label>
                      <Input
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Ex: Black Friday 2024"
                        required
                      />
                    </div>

                    <div>
                      <Label>Banner Vinculado</Label>
                      <Select
                        value={form.banner_id}
                        onValueChange={(v) => setForm({ ...form, banner_id: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um banner" />
                        </SelectTrigger>
                        <SelectContent>
                          {banners.map((banner) => (
                            <SelectItem key={banner.id} value={banner.id}>
                              {banner.title || "Banner sem título"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label>Nome do Anunciante</Label>
                        <Input
                          value={form.advertiser_name}
                          onChange={(e) => setForm({ ...form, advertiser_name: e.target.value })}
                          placeholder="Empresa XYZ"
                        />
                      </div>
                      <div>
                        <Label>Email do Anunciante</Label>
                        <Input
                          type="email"
                          value={form.advertiser_email}
                          onChange={(e) => setForm({ ...form, advertiser_email: e.target.value })}
                          placeholder="contato@empresa.com"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label>Início da Campanha</Label>
                        <Input
                          type="datetime-local"
                          value={form.starts_at}
                          onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Fim da Campanha</Label>
                        <Input
                          type="datetime-local"
                          value={form.ends_at}
                          onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="budget" className="space-y-4 pt-4">
                    <div>
                      <Label>Tipo de Cobrança</Label>
                      <Select
                        value={form.billing_type}
                        onValueChange={(v: "cpc" | "cpm" | "fixed") =>
                          setForm({ ...form, billing_type: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cpc">CPC (Custo por Clique)</SelectItem>
                          <SelectItem value="cpm">CPM (Custo por Mil Impressões)</SelectItem>
                          <SelectItem value="fixed">Valor Fixo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label>Orçamento Total (R$)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.budget_total}
                          onChange={(e) =>
                            setForm({ ...form, budget_total: Number(e.target.value) })
                          }
                        />
                      </div>
                      <div>
                        <Label>Limite Diário (R$)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.max_daily_spend || ""}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              max_daily_spend: e.target.value ? Number(e.target.value) : null,
                            })
                          }
                          placeholder="Sem limite"
                        />
                      </div>
                    </div>

                    {form.billing_type === "cpc" && (
                      <div>
                        <Label>Custo por Clique (R$)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.cost_per_click}
                          onChange={(e) =>
                            setForm({ ...form, cost_per_click: Number(e.target.value) })
                          }
                        />
                      </div>
                    )}

                    {form.billing_type === "cpm" && (
                      <div>
                        <Label>Custo por 1000 Impressões (R$)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.cost_per_impression}
                          onChange={(e) =>
                            setForm({ ...form, cost_per_impression: Number(e.target.value) })
                          }
                        />
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="targeting" className="space-y-4 pt-4">
                    <div>
                      <Label className="mb-2 block">Dispositivos Alvo</Label>
                      <div className="flex gap-4">
                        {DEVICE_OPTIONS.map((device) => (
                          <label
                            key={device.value}
                            className="flex cursor-pointer items-center gap-2"
                          >
                            <Checkbox
                              checked={form.targeting_devices.includes(device.value)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setForm({
                                    ...form,
                                    targeting_devices: [...form.targeting_devices, device.value],
                                  });
                                } else {
                                  setForm({
                                    ...form,
                                    targeting_devices: form.targeting_devices.filter(
                                      (d) => d !== device.value
                                    ),
                                  });
                                }
                              }}
                            />
                            <device.icon className="h-4 w-4" />
                            {device.label}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="mb-2 block">Categorias Alvo (opcional)</Label>
                      <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                        {categories.map((cat) => (
                          <label
                            key={cat.id}
                            className="flex cursor-pointer items-center gap-2 rounded border p-2 hover:bg-muted"
                          >
                            <Checkbox
                              checked={form.targeting_categories.includes(cat.slug)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setForm({
                                    ...form,
                                    targeting_categories: [
                                      ...form.targeting_categories,
                                      cat.slug,
                                    ],
                                  });
                                } else {
                                  setForm({
                                    ...form,
                                    targeting_categories: form.targeting_categories.filter(
                                      (c) => c !== cat.slug
                                    ),
                                  });
                                }
                              }}
                            />
                            <span className="text-sm">{cat.name}</span>
                          </label>
                        ))}
                      </div>
                      {categories.length === 0 && (
                        <p className="text-sm text-muted-foreground">Nenhuma categoria disponível</p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end gap-2 border-t pt-4">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isCreating || isUpdating}>
                    {form.id ? "Salvar" : "Criar Campanha"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">Carregando...</div>
          ) : campaigns.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              Nenhuma campanha cadastrada
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campanha</TableHead>
                  <TableHead>Banner</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Orçamento</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => {
                  const budgetPct =
                    Number(campaign.budget_total) > 0
                      ? (Number(campaign.budget_spent) / Number(campaign.budget_total)) * 100
                      : 0;
                  return (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{campaign.name}</div>
                          {campaign.advertiser_name && (
                            <div className="text-xs text-muted-foreground">
                              {campaign.advertiser_name}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {(campaign as any).super_banners?.title || (
                          <span className="text-muted-foreground">Não vinculado</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">
                            R$ {Number(campaign.budget_spent).toFixed(2)} /{" "}
                            R$ {Number(campaign.budget_total).toFixed(2)}
                          </div>
                          <Progress value={budgetPct} className="h-1.5" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="uppercase">
                          {campaign.billing_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                          {campaign.starts_at ? (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(campaign.starts_at), "dd/MM/yy")}
                            </span>
                          ) : (
                            <span>Início: Imediato</span>
                          )}
                          {campaign.ends_at ? (
                            <span>até {format(new Date(campaign.ends_at), "dd/MM/yy")}</span>
                          ) : (
                            <span>Fim: Indefinido</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {campaign.status === "active" ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateStatus({ id: campaign.id, status: "paused" })}
                              title="Pausar"
                            >
                              <Pause className="h-4 w-4" />
                            </Button>
                          ) : campaign.status !== "completed" && campaign.status !== "depleted" ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateStatus({ id: campaign.id, status: "active" })}
                              title="Ativar"
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          ) : null}
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(campaign)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => deleteCampaign(campaign.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
