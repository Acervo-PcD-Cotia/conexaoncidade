import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { 
  Mic, MicOff, Video, VideoOff, Monitor, MonitorOff,
  Circle, Square, Radio, RadioReceiver
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StudioControlBarProps {
  isMicOn: boolean;
  isCameraOn: boolean;
  isScreenSharing: boolean;
  isRecording: boolean;
  isStreaming: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onGoLive: () => void;
  onStopLive: () => void;
}

export function StudioControlBar({
  isMicOn,
  isCameraOn,
  isScreenSharing,
  isRecording,
  isStreaming,
  onToggleMic,
  onToggleCamera,
  onToggleScreenShare,
  onStartRecording,
  onStopRecording,
  onGoLive,
  onStopLive,
}: StudioControlBarProps) {
  return (
    <div className="shrink-0 h-16 flex items-center justify-center gap-4 px-4 border-t border-zinc-800 bg-zinc-900">
      {/* Media Controls */}
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isMicOn ? "secondary" : "destructive"}
              size="icon"
              onClick={onToggleMic}
              className={cn(
                "h-12 w-12 rounded-full",
                isMicOn ? "bg-zinc-700 hover:bg-zinc-600" : ""
              )}
            >
              {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{isMicOn ? "Desativar microfone" : "Ativar microfone"}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isCameraOn ? "secondary" : "destructive"}
              size="icon"
              onClick={onToggleCamera}
              className={cn(
                "h-12 w-12 rounded-full",
                isCameraOn ? "bg-zinc-700 hover:bg-zinc-600" : ""
              )}
            >
              {isCameraOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{isCameraOn ? "Desativar câmera" : "Ativar câmera"}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isScreenSharing ? "default" : "secondary"}
              size="icon"
              onClick={onToggleScreenShare}
              className={cn(
                "h-12 w-12 rounded-full",
                !isScreenSharing ? "bg-zinc-700 hover:bg-zinc-600" : ""
              )}
            >
              {isScreenSharing ? <MonitorOff className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{isScreenSharing ? "Parar compartilhamento" : "Compartilhar tela"}</TooltipContent>
        </Tooltip>
      </div>

      <Separator orientation="vertical" className="h-8 bg-zinc-700" />

      {/* Recording & Streaming Controls */}
      <div className="flex items-center gap-3">
        {/* Recording Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isRecording ? "destructive" : "outline"}
              size="lg"
              onClick={isRecording ? onStopRecording : onStartRecording}
              className={cn(
                "gap-2 px-6",
                isRecording 
                  ? "animate-pulse" 
                  : "border-zinc-600 bg-zinc-800 hover:bg-zinc-700"
              )}
            >
              {isRecording ? (
                <>
                  <Square className="h-4 w-4 fill-current" />
                  Parar Gravação
                </>
              ) : (
                <>
                  <Circle className="h-4 w-4" />
                  Gravar
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isRecording ? "Parar gravação" : "Iniciar gravação"}
          </TooltipContent>
        </Tooltip>

        {/* Go Live Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isStreaming ? "destructive" : "default"}
              size="lg"
              onClick={isStreaming ? onStopLive : onGoLive}
              className={cn(
                "gap-2 px-6 font-semibold",
                isStreaming 
                  ? "" 
                  : "bg-red-600 hover:bg-red-700 text-white"
              )}
            >
              {isStreaming ? (
                <>
                  <RadioReceiver className="h-4 w-4" />
                  Encerrar Live
                </>
              ) : (
                <>
                  <Radio className="h-4 w-4" />
                  Iniciar Live
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isStreaming ? "Encerrar transmissão" : "Iniciar transmissão ao vivo"}
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
