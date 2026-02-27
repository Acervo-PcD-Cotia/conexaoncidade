import { useState, useEffect } from "react";
import { Mic, Play, Square, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { VOICES, DEFAULT_VOICE_ID, getVoiceById } from "@/constants/voices";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const STORAGE_KEY = "default_voice_id";

export function DefaultVoicePanel() {
  const [selectedVoice, setSelectedVoice] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_VOICE_ID;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef) {
        audioRef.pause();
        URL.revokeObjectURL(audioRef.src);
      }
    };
  }, [audioRef]);

  const handleVoiceChange = (voiceId: string) => {
    setSelectedVoice(voiceId);
    localStorage.setItem(STORAGE_KEY, voiceId);
    const voice = getVoiceById(voiceId);
    toast.success(`Narrador padrão: ${voice?.name || "Desconhecido"}`);
  };

  const handlePreview = async () => {
    if (isPlaying && audioRef) {
      audioRef.pause();
      URL.revokeObjectURL(audioRef.src);
      setIsPlaying(false);
      setAudioRef(null);
      return;
    }

    setIsPlaying(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-podcast`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            previewVoice: true,
            voiceId: selectedVoice,
            text: "Olá, eu sou o seu narrador. Esta é uma prévia da minha voz para o Conexão na Cidade.",
          }),
        }
      );

      if (!response.ok) throw new Error("Falha ao gerar preview");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      setAudioRef(audio);
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(url);
        setAudioRef(null);
      };
      await audio.play();
    } catch {
      toast.error("Erro ao reproduzir preview da voz");
      setIsPlaying(false);
    }
  };

  const voice = getVoiceById(selectedVoice);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Mic className="h-5 w-5 text-primary" />
          Narrador Padrão
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Voz usada para gerar podcasts e narração de notícias.
        </p>

        <div className="flex items-center gap-2">
          <Select value={selectedVoice} onValueChange={handleVoiceChange}>
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VOICES.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3" />
                    <span>{v.name}</span>
                    <span className="text-muted-foreground text-xs">
                      ({v.gender}) – {v.desc}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={handlePreview}
            className="shrink-0"
            title={isPlaying ? "Parar" : "Ouvir voz"}
          >
            {isPlaying ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
        </div>

        {voice && (
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-primary" />
            {voice.name} – {voice.desc} ({voice.gender})
          </div>
        )}
      </CardContent>
    </Card>
  );
}
