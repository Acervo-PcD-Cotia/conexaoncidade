import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, ExternalLink, GripVertical, AlertTriangle } from "lucide-react";
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

const MAX_BANNERS = 7;

interface BannerForm {
  id?: string;
  title: string;
  image_url: string;
  link_url: string;
  link_target: string;
  alt_text: string;
  is_active: boolean;
}

const defaultForm: BannerForm = {
  title: "",
  image_url: "",
  link_url: "",
  link_target: "_blank",
  alt_text: "",
  is_active: true,
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
  };
  onEdit: () => void;
  onDelete: () => void;
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
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
            banner.is_active
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {banner.is_active ? "Ativo" : "Inativo"}
        </span>
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

  const saveMutation = useMutation({
    mutationFn: async (data: BannerForm) => {
      if (data.id) {
        const { error } = await supabase
          .from("super_banners")
          .update({
            title: data.title,
            image_url: data.image_url,
            link_url: data.link_url,
            link_target: data.link_target,
            alt_text: data.alt_text,
            is_active: data.is_active,
          })
          .eq("id", data.id);
        if (error) throw error;
      } else {
        // Get the next sort_order
        const maxOrder = banners?.reduce((max, b) => Math.max(max, b.sort_order || 0), 0) || 0;
        const { error } = await supabase.from("super_banners").insert({
          title: data.title,
          image_url: data.image_url,
          link_url: data.link_url,
          link_target: data.link_target,
          alt_text: data.alt_text,
          is_active: data.is_active,
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
    });
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.image_url) {
      toast.error("URL da imagem é obrigatória");
      return;
    }
    // Check limit when activating a new banner
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

    // Optimistically update the UI
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
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {activeBannerCount} de {MAX_BANNERS} banners ativos
          </span>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => setForm(defaultForm)}
                disabled={isAtLimit}
              >
                <Plus className="mr-2 h-4 w-4" />
                Novo Banner
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                    Recomendado: 1920x640px (proporção 21:9)
                  </p>
                  <ImageUploader
                    value={form.image_url}
                    onChange={(url) => setForm({ ...form, image_url: url })}
                    onAltChange={(alt) => setForm({ ...form, alt_text: alt })}
                  />
                </div>

                {form.image_url && (
                  <div className="overflow-hidden rounded-lg border">
                    <div className="aspect-[21/9] w-full">
                      <img
                        src={form.image_url}
                        alt="Preview"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                    </div>
                  </div>
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

                <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "Salvando..." : "Salvar Banner"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
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
              <TableHead>Cliques</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : banners?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center">
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
    </div>
  );
}
