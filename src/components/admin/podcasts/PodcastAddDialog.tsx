import { useState, useCallback } from "react";
import { Plus, Mic, Upload, Youtube, Cloud, Loader2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDropzone } from "react-dropzone";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface PodcastAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newsId: string;
  newsTitle: string;
}

const VOICES = [
  { id: "onwK4e9ZLuTAKqWW03F9", name: "Daniel", desc: "Masculina, natural e confiante" },
  { id: "nPczCjzI2devNBz1zQrb", name: "Brian", desc: "Masculina, madura e autoridade" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah", desc: "Feminina, clara e profissional" },
  { id: "FGY2WhTYpPnrIDTdsKH5", name: "Laura", desc: "Feminina, elegante e suave" },
  { id: "JBFqnCBsd6RMkjVDRZzb", name: "George", desc: "Masculina, clássica" },
  { id: "CwhRBWXzGAHq8TQ4Fs17", name: "Roger", desc: "Masculina, grave" },
  { id: "Xb7hH8MSUJpSbSDYk0k2", name: "Alice", desc: "Feminina, jovem" },
  { id: "pFZP5JQG7iQjIQuC4Bku", name: "Lily", desc: "Feminina, suave" },
];

export function PodcastAddDialog({ open, onOpenChange, newsId, newsTitle }: PodcastAddDialogProps) {
  const [tab, setTab] = useState("tts");
  const [voiceId, setVoiceId] = useState("onwK4e9ZLuTAKqWW03F9");
  const [externalUrl, setExternalUrl] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setUploadFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "audio/mpeg": [".mp3"],
      "audio/mp4": [".m4a"],
      "audio/x-m4a": [".m4a"],
      "video/mp4": [".mp4"],
    },
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024, // 100MB
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (tab === "tts") {
        // Generate via ElevenLabs with selected voice
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-podcast`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({ newsId, voiceId }),
          }
        );

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || "Falha ao gerar podcast");
        }

        // Update media type and voice
        await supabase
          .from("news")
          .update({
            podcast_media_type: "tts",
            audio_voice_id: voiceId,
          } as any)
          .eq("id", newsId);

        toast.success("Podcast TTS gerado com sucesso!");
      } else if (tab === "upload") {
        if (!uploadFile) {
          toast.error("Selecione um arquivo");
          return;
        }

        const isVideo = uploadFile.type.startsWith("video/");
        const bucket = "podcast-audio";
        const fileName = `${isVideo ? "video" : "podcast"}-${newsId}-${Date.now()}.${uploadFile.name.split(".").pop()}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, uploadFile, {
            contentType: uploadFile.type,
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(fileName);

        const updateData: any = {
          podcast_media_type: "upload",
          podcast_status: "ready",
          podcast_generated_at: new Date().toISOString(),
        };

        if (isVideo) {
          updateData.podcast_video_url = urlData.publicUrl;
        } else {
          updateData.podcast_audio_url = urlData.publicUrl;
        }

        await supabase.from("news").update(updateData).eq("id", newsId);

        await supabase.from("podcast_logs").insert({
          news_id: newsId,
          action: "upload",
          details: `Arquivo ${isVideo ? "vídeo" : "áudio"} enviado: ${uploadFile.name}`,
        });

        toast.success(`${isVideo ? "Vídeo" : "Áudio"} enviado com sucesso!`);
      } else if (tab === "link") {
        if (!externalUrl.trim()) {
          toast.error("Informe uma URL");
          return;
        }

        const isYoutube = externalUrl.includes("youtube.com") || externalUrl.includes("youtu.be") || externalUrl.includes("music.youtube.com");
        const isGoogleDrive = externalUrl.includes("drive.google.com");

        const mediaType = isYoutube ? "youtube" : isGoogleDrive ? "google_drive" : "youtube";

        await supabase
          .from("news")
          .update({
            podcast_media_type: mediaType,
            podcast_external_url: externalUrl.trim(),
            podcast_status: "ready",
            podcast_generated_at: new Date().toISOString(),
          } as any)
          .eq("id", newsId);

        await supabase.from("podcast_logs").insert({
          news_id: newsId,
          action: "link",
          details: `Link externo adicionado (${mediaType}): ${externalUrl}`,
        });

        toast.success("Link externo adicionado!");
      }

      queryClient.invalidateQueries({ queryKey: ["podcasts"] });
      onOpenChange(false);
      resetForm();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(`Erro: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTab("tts");
    setVoiceId("onwK4e9ZLuTAKqWW03F9");
    setExternalUrl("");
    setUploadFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); onOpenChange(o); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Adicionar Podcast
          </DialogTitle>
          <p className="text-sm text-muted-foreground truncate">{newsTitle}</p>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="py-2">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="tts" className="flex items-center gap-1.5 text-xs">
              <Mic className="h-3.5 w-3.5" />
              Narração IA
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-1.5 text-xs">
              <Upload className="h-3.5 w-3.5" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="link" className="flex items-center gap-1.5 text-xs">
              <Youtube className="h-3.5 w-3.5" />
              Link Externo
            </TabsTrigger>
          </TabsList>

          {/* TTS Tab - Voice Selection */}
          <TabsContent value="tts" className="space-y-4 mt-4">
            <div>
              <Label className="text-sm font-medium">Locutor(a)</Label>
              <Select value={voiceId} onValueChange={setVoiceId}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Escolha a voz" />
                </SelectTrigger>
                <SelectContent>
                  {VOICES.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      <span className="font-medium">{v.name}</span>
                      <span className="text-muted-foreground ml-2 text-xs">— {v.desc}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
              <p>A narração será gerada automaticamente a partir do conteúdo da notícia usando ElevenLabs.</p>
            </div>
          </TabsContent>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-4 mt-4">
            <div>
              <Label className="text-sm font-medium">Arquivo de Áudio ou Vídeo</Label>
              <div
                {...getRootProps()}
                className={`mt-1.5 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                  ${isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
              >
                <input {...getInputProps()} />
                {uploadFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm font-medium">{uploadFile.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({(uploadFile.size / (1024 * 1024)).toFixed(1)} MB)
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => { e.stopPropagation(); setUploadFile(null); }}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Arraste ou clique para enviar
                    </p>
                    <p className="text-xs text-muted-foreground">
                      MP3, M4A ou MP4 • Máx. 100MB
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* External Link Tab */}
          <TabsContent value="link" className="space-y-4 mt-4">
            <div>
              <Label className="text-sm font-medium">URL do Podcast</Label>
              <Input
                className="mt-1.5"
                placeholder="https://youtube.com/watch?v=... ou link do Google Drive"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                Suporta YouTube, YouTube Music e Google Drive
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground border rounded-md p-2">
                <Youtube className="h-4 w-4 text-red-500" />
                YouTube
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground border rounded-md p-2">
                <Youtube className="h-4 w-4 text-red-600" />
                YT Music
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground border rounded-md p-2">
                <Cloud className="h-4 w-4 text-blue-500" />
                Google Drive
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : tab === "tts" ? (
              <Mic className="mr-2 h-4 w-4" />
            ) : tab === "upload" ? (
              <Upload className="mr-2 h-4 w-4" />
            ) : (
              <Youtube className="mr-2 h-4 w-4" />
            )}
            {tab === "tts" ? "Gerar Narração" : tab === "upload" ? "Enviar Arquivo" : "Adicionar Link"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
