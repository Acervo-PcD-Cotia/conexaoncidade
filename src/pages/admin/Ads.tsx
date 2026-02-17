import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Eye, EyeOff, Link as LinkIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdImageUploader, getFormatFromSlot } from "@/components/admin/AdImageUploader";
import { Switch } from "@/components/ui/switch";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { AD_SLOTS as OFFICIAL_SLOTS } from '@/lib/adSlots';

// Use official slot definitions from adSlots.ts (ads channel only)
const AD_SLOTS = OFFICIAL_SLOTS
  .filter(s => s.channel === 'ads')
  .map(s => ({ value: s.id, label: s.label, size: s.key }));

interface AdForm {
  id?: string;
  name: string;
  advertiser: string;
  slot_type: string;
  size: string;
  image_url: string;
  link_url: string;
  link_target: string;
  alt_text: string;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  sort_order: number;
  campaign_id: string;
  managed_by_campaign: boolean;
}

const defaultForm: AdForm = {
  name: "",
  advertiser: "",
  slot_type: "leaderboard",
  size: "728x90",
  image_url: "",
  link_url: "",
  link_target: "_blank",
  alt_text: "",
  starts_at: "",
  ends_at: "",
  is_active: true,
  sort_order: 0,
  campaign_id: "",
  managed_by_campaign: false,
};

export default function Ads() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<AdForm>(defaultForm);
  const queryClient = useQueryClient();

  const { data: ads, isLoading } = useQuery({
    queryKey: ["admin-ads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ads")
        .select("*")
        .order("slot_type")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  // Fetch campaigns 360 for integration
  const { data: campaigns360 } = useQuery({
    queryKey: ["campaigns-360-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns_unified")
        .select("id, name, status")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: AdForm) => {
      const payload = {
        name: data.name,
        advertiser: data.advertiser || null,
        slot_type: data.slot_type,
        size: data.size,
        image_url: data.image_url,
        link_url: data.link_url || null,
        link_target: data.link_target,
        alt_text: data.alt_text || null,
        starts_at: data.starts_at || null,
        ends_at: data.ends_at || null,
        is_active: data.is_active,
        sort_order: data.sort_order,
        campaign_id: data.campaign_id || null,
        managed_by_campaign: data.managed_by_campaign,
      };

      if (data.id) {
        const { error } = await supabase
          .from("ads")
          .update(payload)
          .eq("id", data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("ads").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ads"] });
      toast.success("Anúncio salvo!");
      setOpen(false);
      setForm(defaultForm);
    },
    onError: (error) => {
      toast.error("Erro: " + (error as Error).message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ads").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ads"] });
      toast.success("Anúncio excluído!");
    },
    onError: () => {
      toast.error("Erro ao excluir anúncio");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("ads")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ads"] });
      toast.success("Status atualizado!");
    },
  });

  const handleEdit = (ad: NonNullable<typeof ads>[number]) => {
    setForm({
      id: ad.id,
      name: ad.name,
      advertiser: ad.advertiser || "",
      slot_type: ad.slot_type,
      size: ad.size,
      image_url: ad.image_url,
      link_url: ad.link_url || "",
      link_target: ad.link_target || "_blank",
      alt_text: ad.alt_text || "",
      starts_at: ad.starts_at ? ad.starts_at.slice(0, 16) : "",
      ends_at: ad.ends_at ? ad.ends_at.slice(0, 16) : "",
      is_active: ad.is_active ?? true,
      sort_order: ad.sort_order ?? 0,
      campaign_id: (ad as typeof ad & { campaign_id?: string }).campaign_id || "",
      managed_by_campaign: (ad as typeof ad & { managed_by_campaign?: boolean }).managed_by_campaign || false,
    });
    setOpen(true);
  };

  const handleSlotChange = (slotType: string) => {
    const slot = AD_SLOTS.find((s) => s.value === slotType);
    setForm({
      ...form,
      slot_type: slotType,
      size: slot?.size || form.size,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.image_url) {
      toast.error("Nome e imagem são obrigatórios");
      return;
    }
    saveMutation.mutate(form);
  };

  const getSlotLabel = (slotType: string) => {
    return AD_SLOTS.find((s) => s.value === slotType)?.label || slotType;
  };

  const getStatusBadge = (ad: NonNullable<typeof ads>[number]) => {
    const now = new Date();
    const startsAt = ad.starts_at ? new Date(ad.starts_at) : null;
    const endsAt = ad.ends_at ? new Date(ad.ends_at) : null;

    if (!ad.is_active) {
      return <Badge variant="secondary">Pausado</Badge>;
    }
    if (endsAt && now > endsAt) {
      return <Badge variant="destructive">Expirado</Badge>;
    }
    if (startsAt && now < startsAt) {
      return <Badge variant="outline">Agendado</Badge>;
    }
    return <Badge className="bg-green-500">Ativo</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">Anúncios</h1>
          <p className="text-muted-foreground">
            Gerencie os anúncios e slots publicitários do portal
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setForm(defaultForm)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Anúncio
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{form.id ? "Editar" : "Novo"} Anúncio</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Identificador do anúncio"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="advertiser">Anunciante</Label>
                  <Input
                    id="advertiser"
                    value={form.advertiser}
                    onChange={(e) => setForm({ ...form, advertiser: e.target.value })}
                    placeholder="Nome do anunciante"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="slot_type">Local do Anúncio</Label>
                  <Select value={form.slot_type} onValueChange={handleSlotChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AD_SLOTS.map((slot) => (
                        <SelectItem key={slot.value} value={slot.value}>
                          {slot.label} ({slot.size})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="size">Tamanho</Label>
                  <Input
                    id="size"
                    value={form.size}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              <AdImageUploader
                value={form.image_url}
                onChange={(url) => setForm({ ...form, image_url: url })}
                onAltChange={(alt) => setForm({ ...form, alt_text: alt })}
                alt={form.alt_text}
                format={getFormatFromSlot(form.slot_type)}
                label="Imagem do Anúncio"
                required
              />

              <div>
                <Label htmlFor="link_url">URL de Destino</Label>
                <Input
                  id="link_url"
                  value={form.link_url}
                  onChange={(e) => setForm({ ...form, link_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="starts_at">Data Início</Label>
                  <Input
                    id="starts_at"
                    type="datetime-local"
                    value={form.starts_at}
                    onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="ends_at">Data Fim</Label>
                  <Input
                    id="ends_at"
                    type="datetime-local"
                    value={form.ends_at}
                    onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="sort_order">Ordem de Exibição</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                  />
                </div>
              <div className="flex items-center gap-2 pt-6">
                  <Switch
                    checked={form.is_active}
                    onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
                  />
                  <Label>Ativo</Label>
                </div>
              </div>

              {/* Integração 360 */}
              <div className="rounded-lg border p-4 bg-muted/50">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  Vincular a Campanha 360
                </h4>
                <div className="flex items-center gap-4 mb-3">
                  <Switch
                    checked={form.managed_by_campaign}
                    onCheckedChange={(checked) => {
                      setForm({ ...form, managed_by_campaign: checked, campaign_id: checked ? form.campaign_id : "" });
                    }}
                  />
                  <Label>Gerenciado por campanha</Label>
                </div>
                {form.managed_by_campaign && (
                  <Select 
                    value={form.campaign_id} 
                    onValueChange={(v) => setForm({...form, campaign_id: v})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar campanha" />
                    </SelectTrigger>
                    <SelectContent>
                      {campaigns360?.map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} {c.status === 'active' ? '(Ativa)' : `(${c.status})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Quando vinculado, métricas são consolidadas no painel de Campanhas 360.
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Slot overview cards */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {AD_SLOTS.map((slot) => {
          const slotAds = ads?.filter((a) => a.slot_type === slot.value) || [];
          const activeCount = slotAds.filter((a) => a.is_active).length;
          return (
            <div
              key={slot.value}
              className="rounded-lg border bg-card p-4 text-center"
            >
              <p className="text-sm font-medium">{slot.label}</p>
              <p className="text-xs text-muted-foreground">{slot.size}</p>
              <p className="mt-2 text-2xl font-bold">{activeCount}</p>
              <p className="text-xs text-muted-foreground">
                {activeCount === 1 ? "ativo" : "ativos"}
              </p>
            </div>
          );
        })}
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">Preview</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Local</TableHead>
              <TableHead>Anunciante</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Cliques</TableHead>
              <TableHead className="w-32"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : ads?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center">
                  Nenhum anúncio cadastrado
                </TableCell>
              </TableRow>
            ) : (
              ads?.map((ad) => (
                <TableRow key={ad.id}>
                  <TableCell>
                    <div className="h-12 w-20 overflow-hidden rounded border bg-muted">
                      <img
                        src={ad.image_url}
                        alt={ad.alt_text || ""}
                        className="h-full w-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{ad.name}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{getSlotLabel(ad.slot_type)}</p>
                      <p className="text-xs text-muted-foreground">{ad.size}</p>
                    </div>
                  </TableCell>
                  <TableCell>{ad.advertiser || "-"}</TableCell>
                  <TableCell>{getStatusBadge(ad)}</TableCell>
                  <TableCell>{ad.click_count}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          toggleMutation.mutate({
                            id: ad.id,
                            is_active: !ad.is_active,
                          })
                        }
                        title={ad.is_active ? "Pausar" : "Ativar"}
                      >
                        {ad.is_active ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(ad)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => {
                          if (confirm("Excluir anúncio?")) {
                            deleteMutation.mutate(ad.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
