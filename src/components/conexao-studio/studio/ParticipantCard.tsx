import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  Star,
  ArrowUp,
  ArrowDown,
  UserX,
  MoreVertical,
  MonitorPlay,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Track, Participant } from "livekit-client";
import type { ConexaoParticipant } from "@/hooks/useConexaoSession";

interface ParticipantCardProps {
  participant: ConexaoParticipant;
  isLocal?: boolean;
  size?: "sm" | "md" | "lg";
  showControls?: boolean;
  showVolume?: boolean;
  isSpotlight?: boolean;
  onMuteAudio?: () => void;
  onMuteVideo?: () => void;
  onSetVolume?: (volume: number) => void;
  onSpotlight?: () => void;
  onMoveToStage?: () => void;
  onMoveToBackstage?: () => void;
  onRemove?: () => void;
}

export function ParticipantCard({
  participant,
  isLocal = false,
  size = "md",
  showControls = true,
  showVolume = false,
  isSpotlight = false,
  onMuteAudio,
  onMuteVideo,
  onSetVolume,
  onSpotlight,
  onMoveToStage,
  onMoveToBackstage,
  onRemove,
}: ParticipantCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [volume, setVolume] = useState(100);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  // Attach video track
  useEffect(() => {
    const track = participant.videoTrack;
    if (videoRef.current && track) {
      track.attach(videoRef.current);
      return () => {
        track.detach(videoRef.current!);
      };
    }
  }, [participant.videoTrack]);

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    onSetVolume?.(newVolume / 100);
  };

  const sizeClasses = {
    sm: "h-24 w-36",
    md: "h-40 w-60",
    lg: "h-full w-full",
  };

  const getRoleBadge = () => {
    switch (participant.role) {
      case "host":
        return (
          <Badge className="bg-primary/80 text-primary-foreground text-[10px] px-1.5 py-0">
            Host
          </Badge>
        );
      case "guest":
        return (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            Convidado
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "relative bg-zinc-800 rounded-lg overflow-hidden group",
        sizeClasses[size],
        isSpotlight && "ring-2 ring-yellow-500",
        participant.isSpeaking && "ring-2 ring-emerald-500"
      )}
    >
      {/* Video */}
      {participant.isCameraEnabled && participant.videoTrack ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={cn(
            "w-full h-full object-cover",
            isLocal && "transform scale-x-[-1]"
          )}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
          <div className="w-16 h-16 bg-zinc-700 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-zinc-300">
              {participant.name.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      )}

      {/* Screen Share Indicator */}
      {participant.isScreenShareEnabled && (
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="gap-1 bg-blue-600">
            <MonitorPlay className="h-3 w-3" />
            Tela
          </Badge>
        </div>
      )}

      {/* Spotlight Indicator */}
      {isSpotlight && (
        <div className="absolute top-2 left-2">
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
        </div>
      )}

      {/* Bottom Info Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-medium text-white truncate">
              {participant.name}
              {isLocal && " (você)"}
            </span>
            {getRoleBadge()}
          </div>

          <div className="flex items-center gap-1">
            {!participant.isMicrophoneEnabled && (
              <div className="bg-red-600 rounded-full p-1">
                <MicOff className="h-3 w-3 text-white" />
              </div>
            )}
            {!participant.isCameraEnabled && (
              <div className="bg-red-600 rounded-full p-1">
                <VideoOff className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hover Controls */}
      {showControls && !isLocal && (
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          {/* Mute Audio */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8"
                onClick={onMuteAudio}
              >
                {participant.isMicrophoneEnabled ? (
                  <Mic className="h-4 w-4" />
                ) : (
                  <MicOff className="h-4 w-4 text-red-500" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {participant.isMicrophoneEnabled ? "Mutar" : "Desmutar"}
            </TooltipContent>
          </Tooltip>

          {/* Volume Control */}
          {showVolume && (
            <div className="relative">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                  >
                    {volume > 0 ? (
                      <Volume2 className="h-4 w-4" />
                    ) : (
                      <VolumeX className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Volume</TooltipContent>
              </Tooltip>

              {showVolumeSlider && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-zinc-800 rounded-lg shadow-lg">
                  <Slider
                    orientation="vertical"
                    value={[volume]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={handleVolumeChange}
                    className="h-20"
                  />
                </div>
              )}
            </div>
          )}

          {/* Spotlight */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isSpotlight ? "default" : "secondary"}
                size="icon"
                className="h-8 w-8"
                onClick={onSpotlight}
              >
                <Star className={cn("h-4 w-4", isSpotlight && "fill-current")} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isSpotlight ? "Remover destaque" : "Destacar"}
            </TooltipContent>
          </Tooltip>

          {/* More Options */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              {participant.isOnStage ? (
                <DropdownMenuItem onClick={onMoveToBackstage}>
                  <ArrowDown className="h-4 w-4 mr-2" />
                  Mover para Backstage
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={onMoveToStage}>
                  <ArrowUp className="h-4 w-4 mr-2" />
                  Adicionar ao Palco
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={onMuteVideo}>
                {participant.isCameraEnabled ? (
                  <>
                    <VideoOff className="h-4 w-4 mr-2" />
                    Desligar Câmera
                  </>
                ) : (
                  <>
                    <Video className="h-4 w-4 mr-2" />
                    Ligar Câmera
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onRemove}
                className="text-red-500 focus:text-red-500"
              >
                <UserX className="h-4 w-4 mr-2" />
                Remover do Estúdio
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
