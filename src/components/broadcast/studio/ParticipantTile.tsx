import React from "react";
import { LiveKitParticipant } from "@/hooks/useLiveKit";
import { VideoTrackRenderer, AudioTrackRenderer } from "../LiveKitRoom";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  MoreVertical, 
  Star, 
  Volume2, 
  VolumeX,
  UserX,
  Crown
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ParticipantTileProps {
  participant: LiveKitParticipant;
  isSpotlight?: boolean;
  isMuted?: boolean;
  onMute?: () => void;
  onUnmute?: () => void;
  onSpotlight?: () => void;
  onRemove?: () => void;
  onLowerThird?: () => void;
  showControls?: boolean;
  className?: string;
}

export function ParticipantTile({
  participant,
  isSpotlight = false,
  isMuted = false,
  onMute,
  onUnmute,
  onSpotlight,
  onRemove,
  onLowerThird,
  showControls = true,
  className,
}: ParticipantTileProps) {
  const hasVideo = participant.isCameraEnabled || participant.isScreenShareEnabled;
  const videoTrack = participant.screenTrack || participant.videoTrack;

  return (
    <div
      className={cn(
        "relative rounded-lg overflow-hidden bg-muted group",
        isSpotlight && "ring-2 ring-primary",
        className
      )}
    >
      {/* Video or placeholder */}
      {hasVideo ? (
        <VideoTrackRenderer
          track={videoTrack}
          className="absolute inset-0"
          muted
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/10">
          <div className="flex flex-col items-center gap-2">
            <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-2xl font-semibold text-primary">
                {participant.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <VideoOff className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      )}

      {/* Audio track (hidden, just for playback) */}
      {!participant.isLocal && !isMuted && (
        <AudioTrackRenderer track={participant.audioTrack} />
      )}

      {/* Speaking indicator ring */}
      {participant.isSpeaking && (
        <div className="absolute inset-0 ring-2 ring-green-500 animate-pulse rounded-lg" />
      )}

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

      {/* Top badges */}
      <div className="absolute top-2 left-2 flex gap-1">
        {/* Role badge */}
        {participant.role === "host" && (
          <span className="flex items-center gap-1 rounded-full bg-red-500 px-2 py-0.5 text-xs font-medium text-white">
            <Crown className="h-3 w-3" />
            Host
          </span>
        )}
        {participant.role === "guest" && (
          <span className="rounded-full bg-blue-500 px-2 py-0.5 text-xs font-medium text-white">
            Convidado
          </span>
        )}
        {participant.isLocal && (
          <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
            Você
          </span>
        )}
      </div>

      {/* Top right - status icons */}
      <div className="absolute top-2 right-2 flex gap-1">
        {!participant.isCameraEnabled && (
          <span className="rounded-full bg-black/50 p-1">
            <VideoOff className="h-3 w-3 text-white" />
          </span>
        )}
        {!participant.isMicrophoneEnabled && (
          <span className="rounded-full bg-black/50 p-1">
            <MicOff className="h-3 w-3 text-red-400" />
          </span>
        )}
        {isMuted && (
          <span className="rounded-full bg-black/50 p-1">
            <VolumeX className="h-3 w-3 text-orange-400" />
          </span>
        )}
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Audio indicator */}
            {participant.isMicrophoneEnabled && (
              <div className="flex items-center gap-1">
                <Mic className={cn(
                  "h-3 w-3",
                  participant.isSpeaking ? "text-green-400" : "text-white"
                )} />
                {participant.isSpeaking && (
                  <div className="flex gap-0.5">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="w-0.5 bg-green-400 rounded-full animate-pulse"
                        style={{
                          height: `${Math.random() * 8 + 4}px`,
                          animationDelay: `${i * 0.1}s`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
            <span className="text-sm font-medium text-white truncate max-w-[150px]">
              {participant.name}
            </span>
          </div>

          {/* Spotlight indicator */}
          {isSpotlight && (
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
          )}
        </div>
      </div>

      {/* Host controls (visible on hover) */}
      {showControls && !participant.isLocal && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="secondary" 
                size="icon" 
                className="h-7 w-7 bg-black/50 hover:bg-black/70"
              >
                <MoreVertical className="h-4 w-4 text-white" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onSpotlight && (
                <DropdownMenuItem onClick={onSpotlight}>
                  <Star className="mr-2 h-4 w-4" />
                  {isSpotlight ? "Remover destaque" : "Destacar"}
                </DropdownMenuItem>
              )}
              {isMuted ? (
                onUnmute && (
                  <DropdownMenuItem onClick={onUnmute}>
                    <Volume2 className="mr-2 h-4 w-4" />
                    Desmutar para mim
                  </DropdownMenuItem>
                )
              ) : (
                onMute && (
                  <DropdownMenuItem onClick={onMute}>
                    <VolumeX className="mr-2 h-4 w-4" />
                    Mutar para mim
                  </DropdownMenuItem>
                )
              )}
              {onLowerThird && (
                <DropdownMenuItem onClick={onLowerThird}>
                  <Mic className="mr-2 h-4 w-4" />
                  Mostrar lower third
                </DropdownMenuItem>
              )}
              {onRemove && (
                <DropdownMenuItem 
                  onClick={onRemove}
                  className="text-destructive focus:text-destructive"
                >
                  <UserX className="mr-2 h-4 w-4" />
                  Remover da transmissão
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
