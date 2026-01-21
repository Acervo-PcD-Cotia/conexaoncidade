import { useState } from "react";
import { Plus, Edit, Radio, Tv, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { BroadcastChannel } from "@/hooks/useBroadcast";

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function BroadcastChannels() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<BroadcastChannel | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    type: "tv" as "radio" | "tv",
    description: "",
    cover_image_url: "",
    is_active: true,
  });
  const queryClient = useQueryClient();

  const { data: channels, isLoading } = useQuery({
    queryKey: ["broadcast-channels-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("broadcast_channels")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as BroadcastChannel[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (editingChannel) {
        const { error } = await supabase
          .from("broadcast_channels")
          .update(data)
          .eq("id", editingChannel.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("broadcast_channels").insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["broadcast-channels"] });
      toast.success(editingChannel ? "Canal atualizado!" : "Canal criado!");
      resetForm();
    },
    onError: () => {
      toast.error("Erro ao salvar canal");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("broadcast_channels").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["broadcast-channels"] });
      toast.success("Canal excluído!");
    },
    onError: () => {
      toast.error("Erro ao excluir canal");
    },
  });

  const resetForm = () => {
    setIsOpen(false);
    setEditingChannel(null);
    setFormData({
      name: "",
      slug: "",
      type: "tv",
      description: "",
      cover_image_url: "",
      is_active: true,
    });
  };

  const openEdit = (channel: BroadcastChannel) => {
    setEditingChannel(channel);
    setFormData({
      name: channel.name,
      slug: channel.slug,
      type: channel.type,
      description: channel.description || "",
      cover_image_url: channel.cover_image_url || "",
      is_active: channel.is_active,
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("Preencha o nome do canal");
      return;
    }
    saveMutation.mutate({
      ...formData,
      slug: formData.slug || generateSlug(formData.name),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Canais de Transmissão</h1>
          <p className="text-muted-foreground">Gerencie os canais de TV e Rádio</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Canal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingChannel ? "Editar Canal" : "Novo Canal"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                      slug: editingChannel ? prev.slug : generateSlug(e.target.value),
                    }))
                  }
                  placeholder="Ex: Web TV Conexão"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, slug: e.target.value }))
                  }
                  placeholder="web-tv-conexao"
                />
              </div>

              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, type: value as "radio" | "tv" }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tv">📺 Web TV</SelectItem>
                    <SelectItem value="radio">📻 Web Rádio</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Descrição do canal..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cover_image_url">URL da Imagem de Capa</Label>
                <Input
                  id="cover_image_url"
                  value={formData.cover_image_url}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, cover_image_url: e.target.value }))
                  }
                  placeholder="https://..."
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">Ativo</Label>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, is_active: checked }))
                  }
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {editingChannel ? "Salvar" : "Criar Canal"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <p>Carregando...</p>
        ) : channels?.length === 0 ? (
          <p className="text-muted-foreground col-span-full text-center py-8">
            Nenhum canal cadastrado
          </p>
        ) : (
          channels?.map((channel) => (
            <Card key={channel.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {channel.type === "radio" ? (
                      <Radio className="w-5 h-5 text-primary" />
                    ) : (
                      <Tv className="w-5 h-5 text-primary" />
                    )}
                    <CardTitle className="text-lg">{channel.name}</CardTitle>
                  </div>
                  <Badge variant={channel.is_active ? "default" : "secondary"}>
                    {channel.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {channel.description || "Sem descrição"}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(channel)}>
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteMutation.mutate(channel.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
