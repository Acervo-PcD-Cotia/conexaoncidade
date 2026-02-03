import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, ExternalLink, GripVertical, AlertTriangle, Calendar, Clock, Link as LinkIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { BannerMetrics } from "@/components/admin/BannerMetrics";
import { BannerABTests } from "@/components/admin/BannerABTests";
import { BannerAlerts } from "@/components/admin/BannerAlerts";
import { BannerHeatmap } from "@/components/admin/BannerHeatmap";
import { BannerCampaigns } from "@/components/admin/BannerCampaigns";
import { BannerPreview } from "@/components/admin/BannerPreview";
import { format } from "date-fns";

const MAX_BANNERS = 7;

interface BannerForm {
  id?: string;
  title: string;
  image_url: string;
  link_url: string;
  link_target: string;
  alt_text: string;
  is_active: boolean;
  starts_at: string;
  ends_at: string;
  campaign_id: string;
  managed_by_campaign: boolean;
}

const defaultForm: BannerForm = {
  title: "",
  image_url: "",
  link_url: "",
  link_target: "_blank",
  alt_text: "",
  is_active: true,
  starts_at: "",
  ends_at: "",
  campaign_id: "",
  managed_by_campaign: false,
};

interface SortableRowProps {
  banner: {
    id: string;
    title: string | null;
    image_url: string;
    link_url: string | null;
    link_target: string | null;
    alt_text: string | null;
    is_active: boolean;
    click_count: number | null;
    sort_order: number | null;
    starts_at: string | null;
    ends_at: string | null;
  };
  onEdit: () => void;
  onDelete: () => void;
}

function getBannerStatus(banner: SortableRowProps["banner"]) {
  const now = new Date();

  if (banner.starts_at && new Date(banner.starts_at) > now) {
    return { label: "Agendado", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" };
  }
  if (banner.ends_at && new Date(banner.ends_at) < now) {
    return { label: "Expirado", className: "bg-gray-100 text-gray-500 dark:bg-gray-800/50 dark:text-gray-400" };
  }
  if (banner.is_active) {
    return { label: "Ativo", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" };
  }
  return { label: "Inativo", className: "bg-muted text-muted-foreground" };
}

function SortableRow({ banner, onEdit, onDelete }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: banner.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const status = getBannerStatus(banner);

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell className="w-10">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none rounded p-1 hover:bg-muted active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      </TableCell>
      <TableCell>
        <div className="h-16 w-28 overflow-hidden rounded border">
          <img
            src={banner.image_url}
            alt={banner.alt_text || ""}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
        </div>
      </TableCell>
      <TableCell className="font-medium">{banner.title || "-"}</TableCell>
      <TableCell>
        {banner.link_url ? (
          <div className="flex items-center gap-2">
            <a
              href={banner.link_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              Link
            </a>
            <span className="text-xs text-muted-foreground">
              ({banner.link_target === "_self" ? "mesma aba" : "nova aba"})
            </span>
          </div>
        ) : (
          "-"
        )}
      </TableCell>
      <TableCell>
        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}>
          {status.label}
        </span>
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
          {banner.starts_at ? (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(banner.starts_at), "dd/MM/yyyy HH:mm")}
            </span>
          ) : (
            <span>Início: Imediato</span>
          )}
          {banner.ends_at ? (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {format(new Date(banner.ends_at), "dd/MM/yyyy HH:mm")}
            </span>
          ) : (
            <span>Fim: Indefinido</span>
          )}
        </div>
      </TableCell>
      <TableCell>{banner.click_count || 0}</TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function Banners() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<BannerForm>(defaultForm);
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data: banners, isLoading } = useQuery({
    queryKey: ["admin-banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("super_banners")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const activeBannerCount = banners?.filter((b) => b.is_active).length || 0;
  const isAtLimit = activeBannerCount >= MAX_BANNERS;

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
    mutationFn: async (data: BannerForm) => {
      const payload = {
        title: data.title,
        image_url: data.image_url,
        link_url: data.link_url,
        link_target: data.link_target,
        alt_text: data.alt_text,
        is_active: data.is_active,
        starts_at: data.starts_at || null,
        ends_at: data.ends_at || null,
        campaign_id: data.campaign_id || null,
        managed_by_campaign: data.managed_by_campaign,
      };

      if (data.id) {
        const { error } = await supabase
          .from("super_banners")
          .update(payload)
          .eq("id", data.id);
        if (error) throw error;
      } else {
        const maxOrder = banners?.reduce((max, b) => Math.max(max, b.sort_order || 0), 0) || 0;
        const { error } = await supabase.from("super_banners").insert({
          ...payload,
          sort_order: maxOrder + 1,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      queryClient.invalidateQueries({ queryKey: ["super-banners"] });
      toast.success("Banner salvo!");
      setOpen(false);
      setForm(defaultForm);
    },
    onError: (error) => {
      toast.error("Erro: " + (error as Error).message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("super_banners").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      queryClient.invalidateQueries({ queryKey: ["super-banners"] });
      toast.success("Banner excluído!");
    },
    onError: () => {
      toast.error("Erro ao excluir banner");
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (updates: { id: string; sort_order: number }[]) => {
      for (const update of updates) {
        const { error } = await supabase
          .from("super_banners")
          .update({ sort_order: update.sort_order })
          .eq("id", update.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      queryClient.invalidateQueries({ queryKey: ["super-banners"] });
    },
  });

  const handleEdit = (banner: NonNullable<typeof banners>[number]) => {
    setForm({
      id: banner.id,
      title: banner.title || "",
      image_url: banner.image_url,
      link_url: banner.link_url || "",
      link_target: banner.link_target || "_blank",
      alt_text: banner.alt_text || "",
      is_active: banner.is_active,
      starts_at: banner.starts_at ? format(new Date(banner.starts_at), "yyyy-MM-dd'T'HH:mm") : "",
      ends_at: banner.ends_at ? format(new Date(banner.ends_at), "yyyy-MM-dd'T'HH:mm") : "",
      campaign_id: (banner as typeof banner & { campaign_id?: string }).campaign_id || "",
      managed_by_campaign: (banner as typeof banner & { managed_by_campaign?: boolean }).managed_by_campaign || false,
    });
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.image_url) {
      toast.error("URL da imagem é obrigatória");
      return;
    }
    if (!form.id && form.is_active && isAtLimit) {
      toast.error(`Limite de ${MAX_BANNERS} banners ativos atingido`);
      return;
    }
    saveMutation.mutate(form);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !banners) return;

    const oldIndex = banners.findIndex((b) => b.id === active.id);
    const newIndex = banners.findIndex((b) => b.id === over.id);

    const newOrder = arrayMove(banners, oldIndex, newIndex);
    const updates = newOrder.map((banner, index) => ({
      id: banner.id,
      sort_order: index + 1,
    }));

    queryClient.setQueryData(
      ["admin-banners"],
      newOrder.map((b, i) => ({ ...b, sort_order: i + 1 }))
    );

    reorderMutation.mutate(updates);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">Super Banners</h1>
          <p className="text-muted-foreground">
            Gerencie os banners promocionais do topo da home
          </p>
        </div>
      </div>

      <Tabs defaultValue="list">
        <TabsList className="flex-wrap">
          <TabsTrigger value="list">Banners</TabsTrigger>
          <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
          <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
          <TabsTrigger value="ab-tests">Testes A/B</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {activeBannerCount} de {MAX_BANNERS} banners ativos
            </span>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setForm(defaultForm)} disabled={isAtLimit}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Banner
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{form.id ? "Editar" : "Novo"} Banner</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Título (identificador interno)</Label>
                    <Input
                      id="title"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="Ex: Promoção Janeiro"
                    />
                  </div>

                  <div>
                    <Label>Imagem do Banner *</Label>
                    <p className="mb-2 text-xs text-muted-foreground">
                      Recomendado: 1920x640px (proporção 21:9). Arraste ou clique para fazer upload.
                    </p>
                    <ImageUploader
                      value={form.image_url}
                      onChange={(url) => setForm({ ...form, image_url: url })}
                      onAltChange={(alt) => setForm({ ...form, alt_text: alt })}
                      bucket="banners"
                      path="banners"
                    />
                  </div>

                  {form.image_url && (
                    <BannerPreview imageUrl={form.image_url} title={form.title} />
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="link_url">URL de Destino</Label>
                      <Input
                        id="link_url"
                        value={form.link_url}
                        onChange={(e) => setForm({ ...form, link_url: e.target.value })}
                        placeholder="https://... ou /pagina-interna"
                      />
                    </div>
                    <div>
                      <Label htmlFor="link_target">Abrir em</Label>
                      <Select
                        value={form.link_target}
                        onValueChange={(v) => setForm({ ...form, link_target: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_self">Mesma janela (link interno)</SelectItem>
                          <SelectItem value="_blank">Nova aba (link externo)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Scheduling Section */}
                  <div className="rounded-lg border p-4">
                    <h4 className="mb-3 flex items-center gap-2 font-medium">
                      <Calendar className="h-4 w-4" />
                      Agendamento de Campanha
                    </h4>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="starts_at">Início da Campanha</Label>
                        <Input
                          id="starts_at"
                          type="datetime-local"
                          value={form.starts_at}
                          onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                        />
                        <p className="mt-1 text-xs text-muted-foreground">
                          Deixe vazio para exibir imediatamente
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="ends_at">Fim da Campanha</Label>
                        <Input
                          id="ends_at"
                          type="datetime-local"
                          value={form.ends_at}
                          onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
                        />
                        <p className="mt-1 text-xs text-muted-foreground">
                          Deixe vazio para exibir indefinidamente
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="alt_text">Texto Alternativo (SEO/Acessibilidade)</Label>
                    <Input
                      id="alt_text"
                      value={form.alt_text}
                      onChange={(e) => setForm({ ...form, alt_text: e.target.value })}
                      placeholder="Descrição da imagem para acessibilidade"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={form.is_active}
                      onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
                    />
                    <Label>Banner ativo</Label>
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
                    {saveMutation.isPending ? "Salvando..." : "Salvar Banner"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {isAtLimit && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Limite de {MAX_BANNERS} banners ativos atingido. Desative ou exclua um banner para adicionar novos.
              </AlertDescription>
            </Alert>
          )}

          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead className="w-32">Preview</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Cliques</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : banners?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center">
                      Nenhum banner cadastrado
                    </TableCell>
                  </TableRow>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={banners?.map((b) => b.id) || []}
                      strategy={verticalListSortingStrategy}
                    >
                      {banners?.map((banner) => (
                        <SortableRow
                          key={banner.id}
                          banner={banner}
                          onEdit={() => handleEdit(banner)}
                          onDelete={() => {
                            if (confirm("Excluir banner?")) {
                              deleteMutation.mutate(banner.id);
                            }
                          }}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                )}
              </TableBody>
            </Table>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Arraste os banners pela alça ☰ para reordenar. A ordem define a sequência de exibição no slider.
          </p>
        </TabsContent>

        <TabsContent value="campaigns">
          <BannerCampaigns />
        </TabsContent>

        <TabsContent value="metrics">
          <BannerMetrics />
        </TabsContent>

        <TabsContent value="heatmap">
          <BannerHeatmap />
        </TabsContent>

        <TabsContent value="ab-tests">
          <BannerABTests />
        </TabsContent>

        <TabsContent value="alerts">
          <BannerAlerts />
        </TabsContent>
      </Tabs>
    </div>
  );
}
