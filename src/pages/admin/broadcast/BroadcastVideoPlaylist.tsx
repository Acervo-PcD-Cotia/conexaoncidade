import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Video,
  Plus,
  Upload,
  GripVertical,
  Play,
  Trash2,
  Edit2,
  Tv,
  Youtube,
  Link,
  ExternalLink,
} from "lucide-react";
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

interface VideoItem {
  id: string;
  channel_id: string;
  title: string;
  video_url: string;
  video_type: "upload" | "youtube" | "external";
  youtube_id: string | null;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  sort_order: number | null;
  is_active: boolean | null;
}

interface Channel {
  id: string;
  name: string;
  slug: string;
  type: string;
}

function SortableVideo({
  video,
  onEdit,
  onDelete,
  onPreview,
}: {
  video: VideoItem;
  onEdit: (video: VideoItem) => void;
  onDelete: (video: VideoItem) => void;
  onPreview: (video: VideoItem) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: video.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getTypeIcon = () => {
    switch (video.video_type) {
      case "youtube":
        return <Youtube className="h-4 w-4 text-red-500" />;
      case "upload":
        return <Upload className="h-4 w-4 text-blue-500" />;
      default:
        return <ExternalLink className="h-4 w-4 text-green-500" />;
    }
  };

  const getThumbnail = () => {
    if (video.thumbnail_url) return video.thumbnail_url;
    if (video.youtube_id) return `https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`;
    return null;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50 ${
        isDragging ? "shadow-lg" : ""
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <div className="flex h-16 w-28 items-center justify-center overflow-hidden rounded bg-muted">
        {getThumbnail() ? (
          <img src={getThumbnail()!} alt={video.title} className="h-full w-full object-cover" />
        ) : (
          <Video className="h-6 w-6 text-muted-foreground" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="truncate font-medium">{video.title}</p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {getTypeIcon()}
          <span className="capitalize">{video.video_type}</span>
        </div>
      </div>

      <span className="text-sm text-muted-foreground">{formatDuration(video.duration_seconds)}</span>

      <Badge variant={video.is_active ? "default" : "secondary"}>
        {video.is_active ? "Ativo" : "Inativo"}
      </Badge>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={() => onPreview(video)}>
          <Play className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onEdit(video)}>
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(video)} className="text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function BroadcastVideoPlaylist() {
  const queryClient = useQueryClient();

  const [selectedChannelId, setSelectedChannelId] = useState<string>("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [previewVideo, setPreviewVideo] = useState<VideoItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formVideoType, setFormVideoType] = useState<"upload" | "youtube" | "external">("youtube");
  const [formVideoUrl, setFormVideoUrl] = useState("");
  const [formYoutubeId, setFormYoutubeId] = useState("");
  const [formThumbnailUrl, setFormThumbnailUrl] = useState("");
  const [formFile, setFormFile] = useState<File | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Fetch TV channels
  const { data: channels, isLoading: isLoadingChannels } = useQuery({
    queryKey: ["broadcast-channels-tv"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("broadcast_channels")
        .select("*")
        .eq("type", "tv")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data as Channel[];
    },
  });

  useEffect(() => {
    if (channels && channels.length > 0 && !selectedChannelId) {
      setSelectedChannelId(channels[0].id);
    }
  }, [channels, selectedChannelId]);

  // Fetch video items
  const { data: videoItems, isLoading: isLoadingVideos } = useQuery({
    queryKey: ["broadcast-videos", selectedChannelId],
    queryFn: async () => {
      if (!selectedChannelId) return [];
      const { data, error } = await supabase
        .from("broadcast_video_items" as any)
        .select("*")
        .eq("channel_id", selectedChannelId)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data as unknown) as VideoItem[];
    },
    enabled: !!selectedChannelId,
  });

  // Extract YouTube ID from URL
  const extractYoutubeId = (url: string): string | null => {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&?/]+)/);
    return match ? match[1] : null;
  };

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: { video: Partial<VideoItem>; file?: File }) => {
      let videoUrl = data.video.video_url;

      // Upload video file if provided
      if (data.file) {
        const fileExt = data.file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `tv/${selectedChannelId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("broadcast-recordings")
          .upload(filePath, data.file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from("broadcast-recordings").getPublicUrl(filePath);
        videoUrl = urlData.publicUrl;
      }

      const videoData = {
        ...data.video,
        video_url: videoUrl,
        channel_id: selectedChannelId,
      };

      if (data.video.id) {
        const { error } = await supabase
          .from("broadcast_video_items" as any)
          .update(videoData)
          .eq("id", data.video.id);
        if (error) throw error;
      } else {
        const maxOrder = videoItems?.reduce((max, item) => Math.max(max, item.sort_order || 0), 0) || 0;
        const { error } = await supabase.from("broadcast_video_items" as any).insert([{
          title: data.video.title || "",
          video_url: videoUrl || "",
          video_type: data.video.video_type || "youtube",
          youtube_id: data.video.youtube_id || null,
          thumbnail_url: data.video.thumbnail_url || null,
          channel_id: selectedChannelId,
          sort_order: maxOrder + 1,
          is_active: true,
        }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["broadcast-videos", selectedChannelId] });
      toast.success(editingVideo ? "Vídeo atualizado!" : "Vídeo adicionado!");
      resetForm();
    },
    onError: (error) => {
      toast.error("Erro ao salvar vídeo: " + error.message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("broadcast_video_items" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["broadcast-videos", selectedChannelId] });
      toast.success("Vídeo removido!");
    },
    onError: (error) => {
      toast.error("Erro ao remover vídeo: " + error.message);
    },
  });

  // Reorder mutation
  const reorderMutation = useMutation({
    mutationFn: async (items: { id: string; sort_order: number }[]) => {
      for (const item of items) {
        await supabase
          .from("broadcast_video_items" as any)
          .update({ sort_order: item.sort_order })
          .eq("id", item.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["broadcast-videos", selectedChannelId] });
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !videoItems) return;

    const oldIndex = videoItems.findIndex((item) => item.id === active.id);
    const newIndex = videoItems.findIndex((item) => item.id === over.id);

    const reordered = arrayMove(videoItems, oldIndex, newIndex);
    const updates = reordered.map((item, index) => ({
      id: item.id,
      sort_order: index + 1,
    }));

    reorderMutation.mutate(updates);
  };

  const resetForm = () => {
    setFormTitle("");
    setFormVideoType("youtube");
    setFormVideoUrl("");
    setFormYoutubeId("");
    setFormThumbnailUrl("");
    setFormFile(null);
    setEditingVideo(null);
    setShowAddDialog(false);
    setIsUploading(false);
  };

  const openEditDialog = (video: VideoItem) => {
    setEditingVideo(video);
    setFormTitle(video.title);
    setFormVideoType(video.video_type);
    setFormVideoUrl(video.video_url);
    setFormYoutubeId(video.youtube_id || "");
    setFormThumbnailUrl(video.thumbnail_url || "");
    setShowAddDialog(true);
  };

  const handleSubmit = async () => {
    if (!formTitle) {
      toast.error("Título é obrigatório");
      return;
    }
    if (!selectedChannelId) {
      toast.error("Selecione um canal primeiro");
      return;
    }

    let videoUrl = formVideoUrl;
    let youtubeId = formYoutubeId;

    if (formVideoType === "youtube") {
      if (!formYoutubeId && !formVideoUrl) {
        toast.error("URL ou ID do YouTube é obrigatório");
        return;
      }
      // Extract YouTube ID if URL provided
      if (formVideoUrl && !formYoutubeId) {
        youtubeId = extractYoutubeId(formVideoUrl) || formVideoUrl;
      }
      videoUrl = `https://www.youtube.com/watch?v=${youtubeId}`;
    } else if (formVideoType === "external" && !editingVideo && !formVideoUrl) {
      toast.error("URL do vídeo é obrigatória");
      return;
    } else if (formVideoType === "upload" && !editingVideo && !formFile) {
      toast.error("Arquivo de vídeo é obrigatório");
      return;
    }

    setIsUploading(true);
    saveMutation.mutate({
      video: {
        id: editingVideo?.id,
        title: formTitle,
        video_type: formVideoType,
        video_url: videoUrl,
        youtube_id: youtubeId || null,
        thumbnail_url: formThumbnailUrl || null,
      },
      file: formVideoType === "upload" ? (formFile || undefined) : undefined,
    });
  };

  const handleDelete = (video: VideoItem) => {
    if (confirm(`Remover "${video.title}" da grade?`)) {
      deleteMutation.mutate(video.id);
    }
  };

  const selectedChannel = channels?.find((c) => c.id === selectedChannelId);

  if (isLoadingChannels) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!channels || channels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
        <Tv className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Nenhum canal de TV encontrado</h2>
        <p className="text-muted-foreground">Crie um canal do tipo "tv" para configurar a grade de vídeos.</p>
        <Button onClick={() => window.location.href = "/admin/broadcast/channels"}>
          Criar Canal
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Grade de Vídeos - TV</h1>
          <p className="text-muted-foreground">
            Gerencie os vídeos que serão exibidos no canal de TV
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={selectedChannelId} onValueChange={setSelectedChannelId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Selecione o canal" />
            </SelectTrigger>
            <SelectContent>
              {channels.map((channel) => (
                <SelectItem key={channel.id} value={channel.id}>
                  <div className="flex items-center gap-2">
                    <Tv className="h-4 w-4" />
                    {channel.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Vídeo
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Grade de Vídeos - {selectedChannel?.name}
          </CardTitle>
          <CardDescription>
            Arraste para reordenar os vídeos. {videoItems?.length || 0} vídeo(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingVideos ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : videoItems && videoItems.length > 0 ? (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext
                items={videoItems.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {videoItems.map((video) => (
                    <SortableVideo
                      key={video.id}
                      video={video}
                      onEdit={openEditDialog}
                      onDelete={handleDelete}
                      onPreview={setPreviewVideo}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
              <Video className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">Nenhum vídeo na grade</p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Primeiro Vídeo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingVideo ? "Editar Vídeo" : "Adicionar Vídeo"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Nome do vídeo/programa"
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo de Vídeo *</Label>
              <Tabs value={formVideoType} onValueChange={(v) => setFormVideoType(v as typeof formVideoType)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="youtube" className="gap-2">
                    <Youtube className="h-4 w-4" />
                    YouTube
                  </TabsTrigger>
                  <TabsTrigger value="external" className="gap-2">
                    <Link className="h-4 w-4" />
                    Link
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Upload
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="youtube" className="mt-3 space-y-3">
                  <div className="space-y-2">
                    <Label>URL ou ID do YouTube</Label>
                    <Input
                      placeholder="https://youtube.com/watch?v=xxx ou apenas o ID"
                      value={formYoutubeId || formVideoUrl}
                      onChange={(e) => {
                        const value = e.target.value;
                        const extracted = extractYoutubeId(value);
                        if (extracted) {
                          setFormYoutubeId(extracted);
                          setFormVideoUrl(value);
                        } else {
                          setFormYoutubeId(value);
                          setFormVideoUrl("");
                        }
                      }}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="external" className="mt-3 space-y-3">
                  <div className="space-y-2">
                    <Label>URL do Vídeo</Label>
                    <Input
                      placeholder="https://exemplo.com/video.mp4"
                      value={formVideoUrl}
                      onChange={(e) => setFormVideoUrl(e.target.value)}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="upload" className="mt-3 space-y-3">
                  <div className="space-y-2">
                    <Label>Arquivo de Vídeo</Label>
                    <Input
                      type="file"
                      accept="video/*"
                      onChange={(e) => setFormFile(e.target.files?.[0] || null)}
                    />
                    {editingVideo && (
                      <p className="text-xs text-muted-foreground">
                        Deixe vazio para manter o vídeo atual
                      </p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-2">
              <Label>URL da Thumbnail (opcional)</Label>
              <Input
                placeholder="https://exemplo.com/thumb.jpg"
                value={formThumbnailUrl}
                onChange={(e) => setFormThumbnailUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Para YouTube, a thumbnail é gerada automaticamente
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isUploading || saveMutation.isPending}>
              {isUploading ? "Enviando..." : editingVideo ? "Salvar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewVideo} onOpenChange={(open) => !open && setPreviewVideo(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>{previewVideo?.title}</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            {previewVideo?.video_type === "youtube" && previewVideo.youtube_id ? (
              <div className="aspect-video w-full">
                <iframe
                  src={`https://www.youtube.com/embed/${previewVideo.youtube_id}?autoplay=1`}
                  className="w-full h-full rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
                <video
                  src={previewVideo?.video_url}
                  controls
                  autoPlay
                  className="w-full h-full"
                  poster={previewVideo?.thumbnail_url || undefined}
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
