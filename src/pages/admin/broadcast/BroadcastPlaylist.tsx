import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Music,
  Plus,
  Upload,
  GripVertical,
  Play,
  Pause,
  Trash2,
  Edit2,
  Radio,
  Settings,
  Volume2,
  Shuffle,
  RotateCcw,
  Clock,
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

interface PlaylistItem {
  id: string;
  channel_id: string;
  title: string;
  artist: string | null;
  audio_url: string;
  duration_seconds: number | null;
  sort_order: number | null;
  is_active: boolean | null;
  cover_image_url: string | null;
  genre: string | null;
  played_count: number | null;
}

interface AutoDJSettings {
  id: string;
  channel_id: string;
  is_enabled: boolean;
  shuffle_mode: boolean;
  crossfade_seconds: number;
  fallback_enabled: boolean;
  volume_level: number;
}

interface Channel {
  id: string;
  name: string;
  slug: string;
  type: string;
}

// Sortable Item Component
function SortableTrack({
  track,
  isPlaying,
  onPlay,
  onEdit,
  onDelete,
}: {
  track: PlaylistItem;
  isPlaying: boolean;
  onPlay: (track: PlaylistItem) => void;
  onEdit: (track: PlaylistItem) => void;
  onDelete: (track: PlaylistItem) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: track.id,
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

      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded bg-muted">
        {track.cover_image_url ? (
          <img src={track.cover_image_url} alt={track.title} className="h-full w-full object-cover" />
        ) : (
          <Music className="h-5 w-5 text-muted-foreground" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="truncate font-medium">{track.title}</p>
        <p className="truncate text-sm text-muted-foreground">{track.artist || "Artista desconhecido"}</p>
      </div>

      {track.genre && (
        <Badge variant="outline" className="hidden sm:flex">
          {track.genre}
        </Badge>
      )}

      <span className="text-sm text-muted-foreground">{formatDuration(track.duration_seconds)}</span>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={() => onPlay(track)}>
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onEdit(track)}>
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(track)} className="text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function BroadcastPlaylist() {
  const queryClient = useQueryClient();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedChannelId, setSelectedChannelId] = useState<string>("");
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTrack, setEditingTrack] = useState<PlaylistItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formArtist, setFormArtist] = useState("");
  const [formGenre, setFormGenre] = useState("");
  const [formFile, setFormFile] = useState<File | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Fetch channels (only radio type)
  const { data: channels, isLoading: isLoadingChannels } = useQuery({
    queryKey: ["broadcast-channels-radio"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("broadcast_channels")
        .select("*")
        .eq("type", "radio")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data as Channel[];
    },
  });

  // Set default channel
  useState(() => {
    if (channels && channels.length > 0 && !selectedChannelId) {
      setSelectedChannelId(channels[0].id);
    }
  });

  // Fetch playlist items for selected channel
  const { data: playlistItems, isLoading: isLoadingPlaylist } = useQuery({
    queryKey: ["broadcast-playlist", selectedChannelId],
    queryFn: async () => {
      if (!selectedChannelId) return [];
      const { data, error } = await supabase
        .from("broadcast_playlist_items")
        .select("*")
        .eq("channel_id", selectedChannelId)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as PlaylistItem[];
    },
    enabled: !!selectedChannelId,
  });

  // Fetch Auto DJ settings
  const { data: autoDJSettings } = useQuery({
    queryKey: ["autodj-settings", selectedChannelId],
    queryFn: async () => {
      if (!selectedChannelId) return null;
      const { data, error } = await supabase
        .from("broadcast_autodj_settings")
        .select("*")
        .eq("channel_id", selectedChannelId)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return data as AutoDJSettings | null;
    },
    enabled: !!selectedChannelId,
  });

  // Save playlist item mutation
  const saveMutation = useMutation({
    mutationFn: async (data: { track: Partial<PlaylistItem>; file?: File }) => {
      let audioUrl = data.track.audio_url;

      // Upload audio file if provided
      if (data.file) {
        const fileExt = data.file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `playlist/${selectedChannelId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("broadcast-audio")
          .upload(filePath, data.file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from("broadcast-audio").getPublicUrl(filePath);
        audioUrl = urlData.publicUrl;
      }

      const trackData = {
        ...data.track,
        audio_url: audioUrl,
        channel_id: selectedChannelId,
      };

      if (data.track.id) {
        // Update existing
        const { error } = await supabase
          .from("broadcast_playlist_items")
          .update(trackData)
          .eq("id", data.track.id);
        if (error) throw error;
      } else {
        // Insert new
        const maxOrder = playlistItems?.reduce((max, item) => Math.max(max, item.sort_order || 0), 0) || 0;
        const { error } = await supabase.from("broadcast_playlist_items").insert([{
          title: data.track.title || "",
          audio_url: audioUrl || "",
          channel_id: selectedChannelId,
          artist: data.track.artist || null,
          genre: data.track.genre || null,
          sort_order: maxOrder + 1,
          is_active: true,
        }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["broadcast-playlist", selectedChannelId] });
      toast.success(editingTrack ? "Faixa atualizada!" : "Faixa adicionada!");
      resetForm();
    },
    onError: (error) => {
      toast.error("Erro ao salvar faixa: " + error.message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("broadcast_playlist_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["broadcast-playlist", selectedChannelId] });
      toast.success("Faixa removida!");
    },
    onError: (error) => {
      toast.error("Erro ao remover faixa: " + error.message);
    },
  });

  // Update Auto DJ settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<AutoDJSettings>) => {
      const { error } = await supabase
        .from("broadcast_autodj_settings")
        .upsert({
          ...autoDJSettings,
          ...settings,
          channel_id: selectedChannelId,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["autodj-settings", selectedChannelId] });
      toast.success("Configurações salvas!");
    },
  });

  // Reorder mutation
  const reorderMutation = useMutation({
    mutationFn: async (items: { id: string; sort_order: number }[]) => {
      for (const item of items) {
        await supabase
          .from("broadcast_playlist_items")
          .update({ sort_order: item.sort_order })
          .eq("id", item.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["broadcast-playlist", selectedChannelId] });
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !playlistItems) return;

    const oldIndex = playlistItems.findIndex((item) => item.id === active.id);
    const newIndex = playlistItems.findIndex((item) => item.id === over.id);

    const reordered = arrayMove(playlistItems, oldIndex, newIndex);
    const updates = reordered.map((item, index) => ({
      id: item.id,
      sort_order: index + 1,
    }));

    reorderMutation.mutate(updates);
  };

  const handlePlay = (track: PlaylistItem) => {
    if (playingTrackId === track.id) {
      audioRef.current?.pause();
      setPlayingTrackId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = track.audio_url;
        audioRef.current.play();
        setPlayingTrackId(track.id);
      }
    }
  };

  const resetForm = () => {
    setFormTitle("");
    setFormArtist("");
    setFormGenre("");
    setFormFile(null);
    setEditingTrack(null);
    setShowAddDialog(false);
    setIsUploading(false);
  };

  const openEditDialog = (track: PlaylistItem) => {
    setEditingTrack(track);
    setFormTitle(track.title);
    setFormArtist(track.artist || "");
    setFormGenre(track.genre || "");
    setShowAddDialog(true);
  };

  const handleSubmit = async () => {
    if (!formTitle) {
      toast.error("Título é obrigatório");
      return;
    }
    if (!editingTrack && !formFile) {
      toast.error("Arquivo de áudio é obrigatório");
      return;
    }

    setIsUploading(true);
    saveMutation.mutate({
      track: {
        id: editingTrack?.id,
        title: formTitle,
        artist: formArtist || null,
        genre: formGenre || null,
        audio_url: editingTrack?.audio_url || "",
      },
      file: formFile || undefined,
    });
  };

  const handleDelete = (track: PlaylistItem) => {
    if (confirm(`Remover "${track.title}" da playlist?`)) {
      deleteMutation.mutate(track.id);
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
        <Radio className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Nenhum canal de rádio encontrado</h2>
        <p className="text-muted-foreground">Crie um canal do tipo "radio" para configurar a playlist.</p>
        <Button onClick={() => window.location.href = "/admin/broadcast/channels"}>
          Criar Canal
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onEnded={() => setPlayingTrackId(null)}
        onError={() => setPlayingTrackId(null)}
      />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Playlist - Auto DJ</h1>
          <p className="text-muted-foreground">
            Gerencie as faixas que tocam automaticamente quando não há transmissão ao vivo
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
                    <Radio className="h-4 w-4" />
                    {channel.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Faixa
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Playlist */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5" />
                Playlist - {selectedChannel?.name}
              </CardTitle>
              <CardDescription>
                Arraste para reordenar as faixas. {playlistItems?.length || 0} faixa(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingPlaylist ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : playlistItems && playlistItems.length > 0 ? (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext
                    items={playlistItems.map((i) => i.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {playlistItems.map((track) => (
                        <SortableTrack
                          key={track.id}
                          track={track}
                          isPlaying={playingTrackId === track.id}
                          onPlay={handlePlay}
                          onEdit={openEditDialog}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                  <Music className="h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">Nenhuma faixa na playlist</p>
                  <Button onClick={() => setShowAddDialog(true)}>
                    <Upload className="mr-2 h-4 w-4" />
                    Adicionar Primeira Faixa
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Settings */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações Auto DJ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto DJ Ativo</Label>
                  <p className="text-sm text-muted-foreground">
                    Ativar reprodução automática
                  </p>
                </div>
                <Switch
                  checked={autoDJSettings?.is_enabled ?? false}
                  onCheckedChange={(checked) =>
                    updateSettingsMutation.mutate({ is_enabled: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Shuffle className="h-4 w-4" />
                    Modo Aleatório
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Embaralhar ordem das faixas
                  </p>
                </div>
                <Switch
                  checked={autoDJSettings?.shuffle_mode ?? false}
                  onCheckedChange={(checked) =>
                    updateSettingsMutation.mutate({ shuffle_mode: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Fallback Automático
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Tocar quando não há apresentador
                  </p>
                </div>
                <Switch
                  checked={autoDJSettings?.fallback_enabled ?? true}
                  onCheckedChange={(checked) =>
                    updateSettingsMutation.mutate({ fallback_enabled: checked })
                  }
                />
              </div>

              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Crossfade: {autoDJSettings?.crossfade_seconds ?? 3}s
                </Label>
                <Slider
                  value={[autoDJSettings?.crossfade_seconds ?? 3]}
                  onValueChange={(value) =>
                    updateSettingsMutation.mutate({ crossfade_seconds: value[0] })
                  }
                  min={0}
                  max={10}
                  step={1}
                />
              </div>

              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  Volume: {autoDJSettings?.volume_level ?? 100}%
                </Label>
                <Slider
                  value={[autoDJSettings?.volume_level ?? 100]}
                  onValueChange={(value) =>
                    updateSettingsMutation.mutate({ volume_level: value[0] })
                  }
                  min={0}
                  max={100}
                  step={5}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total de faixas:</span>
                  <span className="font-medium">{playlistItems?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Auto DJ:</span>
                  <Badge variant={autoDJSettings?.is_enabled ? "default" : "secondary"}>
                    {autoDJSettings?.is_enabled ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTrack ? "Editar Faixa" : "Adicionar Faixa"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Nome da faixa"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="artist">Artista</Label>
              <Input
                id="artist"
                value={formArtist}
                onChange={(e) => setFormArtist(e.target.value)}
                placeholder="Nome do artista"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="genre">Gênero</Label>
              <Input
                id="genre"
                value={formGenre}
                onChange={(e) => setFormGenre(e.target.value)}
                placeholder="Ex: Vinheta, Música, Comercial"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="audio">Arquivo de Áudio {!editingTrack && "*"}</Label>
              <div className="flex gap-2">
                <Input
                  ref={fileInputRef}
                  id="audio"
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setFormFile(e.target.files?.[0] || null)}
                  className="flex-1"
                />
              </div>
              {editingTrack && (
                <p className="text-xs text-muted-foreground">
                  Deixe vazio para manter o áudio atual
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isUploading || saveMutation.isPending}>
              {isUploading ? "Enviando..." : editingTrack ? "Salvar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
