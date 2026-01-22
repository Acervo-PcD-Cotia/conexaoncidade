import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { 
  Video, Mic, HardDrive, Cloud, Settings2
} from "lucide-react";

export function SettingsPanel() {
  const [videoQuality, setVideoQuality] = useState('1080p');
  const [audioQuality, setAudioQuality] = useState('high');
  const [recordingMode, setRecordingMode] = useState('cloud');
  const [echoCancellation, setEchoCancellation] = useState(true);
  const [noiseSuppression, setNoiseSuppression] = useState(true);
  const [autoGainControl, setAutoGainControl] = useState(true);

  return (
    <ScrollArea className="h-full">
      <div className="p-3 space-y-6">
        {/* Video Settings */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Video className="h-4 w-4 text-primary" />
            Vídeo
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs text-zinc-400">Qualidade de Saída</Label>
            <Select value={videoQuality} onValueChange={setVideoQuality}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="720p">720p (HD)</SelectItem>
                <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                <SelectItem value="1440p">1440p (2K)</SelectItem>
                <SelectItem value="4k">4K (Ultra HD)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator className="bg-zinc-800" />

        {/* Audio Settings */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Mic className="h-4 w-4 text-primary" />
            Áudio
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs text-zinc-400">Qualidade de Áudio</Label>
            <Select value={audioQuality} onValueChange={setAudioQuality}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baixa (64 kbps)</SelectItem>
                <SelectItem value="medium">Média (128 kbps)</SelectItem>
                <SelectItem value="high">Alta (256 kbps)</SelectItem>
                <SelectItem value="lossless">Sem perda (320 kbps)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs text-zinc-400">Cancelamento de Eco</Label>
            <Switch checked={echoCancellation} onCheckedChange={setEchoCancellation} />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs text-zinc-400">Supressão de Ruído</Label>
            <Switch checked={noiseSuppression} onCheckedChange={setNoiseSuppression} />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs text-zinc-400">Controle Automático de Ganho</Label>
            <Switch checked={autoGainControl} onCheckedChange={setAutoGainControl} />
          </div>
        </div>

        <Separator className="bg-zinc-800" />

        {/* Recording Settings */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <HardDrive className="h-4 w-4 text-primary" />
            Gravação
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs text-zinc-400">Modo de Gravação</Label>
            <Select value={recordingMode} onValueChange={setRecordingMode}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cloud">
                  <div className="flex items-center gap-2">
                    <Cloud className="h-4 w-4" />
                    Nuvem
                  </div>
                </SelectItem>
                <SelectItem value="local">
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4" />
                    Local
                  </div>
                </SelectItem>
                <SelectItem value="both">
                  <div className="flex items-center gap-2">
                    <Settings2 className="h-4 w-4" />
                    Ambos
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[10px] text-zinc-500">
              {recordingMode === 'cloud' && 'Gravações salvas na biblioteca do estúdio'}
              {recordingMode === 'local' && 'Gravações baixadas diretamente para seu computador'}
              {recordingMode === 'both' && 'Gravações salvas na nuvem e baixadas localmente'}
            </p>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
