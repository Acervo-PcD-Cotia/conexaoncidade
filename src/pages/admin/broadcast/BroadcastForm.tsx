import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useChannels, usePrograms, useCreateBroadcast, useUpdateBroadcast } from "@/hooks/useBroadcast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Broadcast } from "@/hooks/useBroadcast";

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function BroadcastForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const { data: channels } = useChannels();
  const { data: programs } = usePrograms();
  const createBroadcast = useCreateBroadcast();
  const updateBroadcast = useUpdateBroadcast();

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    channel_id: "",
    program_id: "",
    description: "",
    type: "live" as "live" | "scheduled" | "replay" | "playlist",
    scheduled_start: "",
    scheduled_end: "",
    thumbnail_url: "",
    allow_chat: true,
    has_captions: true,
    is_public: true,
    is_featured: false,
  });

  // Load existing broadcast if editing
  const { data: existingBroadcast } = useQuery({
    queryKey: ["broadcast-edit", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("broadcasts")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Broadcast;
    },
    enabled: isEditing,
  });

  useEffect(() => {
    if (existingBroadcast) {
      setFormData({
        title: existingBroadcast.title,
        slug: existingBroadcast.slug,
        channel_id: existingBroadcast.channel_id || "",
        program_id: existingBroadcast.program_id || "",
        description: existingBroadcast.description || "",
        type: existingBroadcast.type,
        scheduled_start: existingBroadcast.scheduled_start?.slice(0, 16) || "",
        scheduled_end: existingBroadcast.scheduled_end?.slice(0, 16) || "",
        thumbnail_url: existingBroadcast.thumbnail_url || "",
        allow_chat: existingBroadcast.allow_chat,
        has_captions: existingBroadcast.has_captions,
        is_public: existingBroadcast.is_public,
        is_featured: existingBroadcast.is_featured,
      });
    }
  }, [existingBroadcast]);

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: isEditing ? prev.slug : generateSlug(title),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.channel_id) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    const broadcastData = {
      title: formData.title,
      slug: formData.slug,
      channel_id: formData.channel_id || null,
      program_id: formData.program_id || null,
      description: formData.description,
      type: formData.type,
      scheduled_start: formData.scheduled_start ? new Date(formData.scheduled_start).toISOString() : null,
      scheduled_end: formData.scheduled_end ? new Date(formData.scheduled_end).toISOString() : null,
      thumbnail_url: formData.thumbnail_url,
      allow_chat: formData.allow_chat,
      has_captions: formData.has_captions,
      is_public: formData.is_public,
      is_featured: formData.is_featured,
      status: "scheduled" as const,
    };

    try {
      if (isEditing && id) {
        await updateBroadcast.mutateAsync({ id, ...broadcastData });
      } else {
        const result = await createBroadcast.mutateAsync(broadcastData);
        navigate(`/admin/broadcast/studio/${result.id}`);
        return;
      }
      navigate("/admin/broadcast/list");
    } catch (error) {
      console.error("Error saving broadcast:", error);
    }
  };

  const filteredPrograms = programs?.filter(
    (p) => !formData.channel_id || p.channel_id === formData.channel_id
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEditing ? "Editar Transmissão" : "Nova Transmissão"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing
              ? "Atualize os dados da transmissão"
              : "Configure sua nova transmissão ao vivo"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Ex: Jornal da Manhã - Edição 15/01"
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
                    placeholder="jornal-da-manha-edicao-15-01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Descreva o conteúdo da transmissão..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Agendamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Transmissão</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        type: value as "live" | "scheduled" | "replay" | "playlist",
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="live">Ao Vivo</SelectItem>
                      <SelectItem value="scheduled">Agendada</SelectItem>
                      <SelectItem value="replay">Reprise</SelectItem>
                      <SelectItem value="playlist">Playlist</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="scheduled_start">Data/Hora Início</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="scheduled_start"
                        type="datetime-local"
                        value={formData.scheduled_start}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            scheduled_start: e.target.value,
                          }))
                        }
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="scheduled_end">Data/Hora Fim</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="scheduled_end"
                        type="datetime-local"
                        value={formData.scheduled_end}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            scheduled_end: e.target.value,
                          }))
                        }
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Canal e Programa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Canal *</Label>
                  <Select
                    value={formData.channel_id}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, channel_id: value, program_id: "" }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um canal" />
                    </SelectTrigger>
                    <SelectContent>
                      {channels?.map((channel) => (
                        <SelectItem key={channel.id} value={channel.id}>
                          {channel.type === "radio" ? "📻" : "📺"} {channel.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Programa (opcional)</Label>
                  <Select
                    value={formData.program_id}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, program_id: value }))
                    }
                    disabled={!formData.channel_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um programa" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredPrograms?.map((program) => (
                        <SelectItem key={program.id} value={program.id}>
                          {program.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Opções</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_public">Pública</Label>
                  <Switch
                    id="is_public"
                    checked={formData.is_public}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, is_public: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="allow_chat">Permitir Chat</Label>
                  <Switch
                    id="allow_chat"
                    checked={formData.allow_chat}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, allow_chat: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="has_captions">Legendas Automáticas</Label>
                  <Switch
                    id="has_captions"
                    checked={formData.has_captions}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, has_captions: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="is_featured">Destaque</Label>
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, is_featured: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Button
              type="submit"
              className="w-full"
              disabled={createBroadcast.isPending || updateBroadcast.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {isEditing ? "Salvar Alterações" : "Criar e Ir ao Estúdio"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
