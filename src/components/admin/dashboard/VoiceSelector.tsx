import { useState, useEffect } from "react";
import { Play, Square, User, Settings2, ChevronDown, ChevronUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { VOICES, DEFAULT_VOICE_ID, getVoiceById } from "@/constants/voices";
import { toast } from "sonner";

export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style: number;
  speed: number;
}

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  stability: 0.4,
  similarity_boost: 0.7,
  style: 0.45,
  speed: 1.0,
};

interface VoiceSelectorProps {
  storageKeyVoice: string;
  storageKeySettings: string;
  label: string;
}

function loadSettings(key: string): VoiceSettings {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return { ...DEFAULT_VOICE_SETTINGS, ...JSON.parse(stored) };
  } catch {}
  return DEFAULT_VOICE_SETTINGS;
}

export function VoiceSelector({ storageKeyVoice, storageKeySettings, label }: VoiceSelectorProps) {
  const [selectedVoice, setSelectedVoice] = useState(() => {
    return localStorage.getItem(storageKeyVoice) || DEFAULT_VOICE_ID;
  });
  const [settings, setSettings] = useState<VoiceSettings>(() => loadSettings(storageKeySettings));
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
  const [showSettings, setShowSettings] = useState(false);

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
    localStorage.setItem(storageKeyVoice, voiceId);
    const voice = getVoiceById(voiceId);
    toast.success(`${label}: ${voice?.name || "Desconhecido"}`);
  };

  const updateSetting = (key: keyof VoiceSettings, value: number) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    localStorage.setItem(storageKeySettings, JSON.stringify(next));
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
            text: "Olá, eu sou o seu narrador. Esta é uma prévia da minha voz.",
            voiceSettings: settings,
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

  const SLIDERS: { key: keyof VoiceSettings; label: string; min: number; max: number; step: number; hint: string }[] = [
    { key: "stability", label: "Estabilidade", min: 0, max: 1, step: 0.05, hint: "Menor = mais expressivo, maior = mais consistente" },
    { key: "similarity_boost", label: "Semelhança", min: 0, max: 1, step: 0.05, hint: "Fidelidade à voz original" },
    { key: "style", label: "Estilo", min: 0, max: 1, step: 0.05, hint: "Exagero estilístico da entonação" },
    { key: "speed", label: "Velocidade", min: 0.7, max: 1.2, step: 0.05, hint: "Velocidade da fala" },
  ];

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-foreground">{label}</p>

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

      <Collapsible open={showSettings} onOpenChange={setShowSettings}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full justify-between text-xs text-muted-foreground px-1">
            <span className="flex items-center gap-1.5">
              <Settings2 className="h-3.5 w-3.5" />
              Configurações de entonação
            </span>
            {showSettings ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-2">
          {SLIDERS.map(({ key, label: sliderLabel, min, max, step, hint }) => (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs">{sliderLabel}</Label>
                <span className="text-xs font-mono text-muted-foreground">
                  {settings[key].toFixed(2)}
                </span>
              </div>
              <Slider
                min={min}
                max={max}
                step={step}
                value={[settings[key]]}
                onValueChange={([v]) => updateSetting(key, v)}
                className="w-full"
              />
              <p className="text-[10px] text-muted-foreground">{hint}</p>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={() => {
              setSettings(DEFAULT_VOICE_SETTINGS);
              localStorage.setItem(storageKeySettings, JSON.stringify(DEFAULT_VOICE_SETTINGS));
              toast.info("Configurações restauradas ao padrão");
            }}
          >
            Restaurar padrão
          </Button>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
