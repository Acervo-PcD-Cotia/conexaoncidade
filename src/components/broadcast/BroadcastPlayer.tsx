import { useState, useEffect, useRef, useMemo } from "react";
import { Radio, Tv, Users, Volume2, VolumeX, Maximize, Minimize, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Broadcast } from "@/hooks/useBroadcast";
import { useLiveKit, LiveKitParticipant } from "@/hooks/useLiveKit";
import { VideoTrackRenderer, AudioTrackRenderer } from "./LiveKitRoom";
import BroadcastCaptions from "./BroadcastCaptions";

interface BroadcastPlayerProps {
  broadcast: Broadcast;
  autoConnect?: boolean;
  isAudioOnly?: boolean;
  showCaptions?: boolean;
  className?: string;
  onMinimize?: () => void;
}

export default function BroadcastPlayer({
  broadcast,
  autoConnect = false,
  isAudioOnly = false,
  showCaptions = true,
  className,
  onMinimize,
}: BroadcastPlayerProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  const isLive = broadcast.status === "live";
  const isRadio = broadcast.channel?.type === "radio";

  // LiveKit connection for auto-connect mode
  const livekit = useLiveKit({
    broadcastId: broadcast.id,
    role: "viewer",
    displayName: "Espectador",
  });

  // Auto-connect when enabled and broadcast is live
  useEffect(() => {
    if (autoConnect && isLive && !livekit.isConnected) {
      livekit.connect();
    }

    return () => {
      if (autoConnect) {
        livekit.disconnect();
      }
    };
  }, [autoConnect, isLive]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (!isRadio) setShowControls(false);
    }, 3000);
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await containerRef.current.requestFullscreen();
    }
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    setIsMuted(value[0] === 0);
  };

  // Find the main video track (prioritize host, then screen share)
  const mainParticipant = useMemo((): LiveKitParticipant | undefined => {
    if (!livekit.participants.length) return undefined;
    
    // First, look for a host with video
    const hostWithVideo = livekit.participants.find(
      (p) => p.role === "host" && (p.videoTrack || p.screenTrack)
    );
    if (hostWithVideo) return hostWithVideo;

    // Then, any participant with screen share
    const withScreenShare = livekit.participants.find((p) => p.screenTrack);
    if (withScreenShare) return withScreenShare;

    // Then, any participant with video
    const withVideo = livekit.participants.find((p) => p.videoTrack);
    if (withVideo) return withVideo;

    // Finally, just the first participant
    return livekit.participants[0];
  }, [livekit.participants]);

  // Get the track to display
  const mainTrack = mainParticipant?.screenTrack || mainParticipant?.videoTrack;

  // Get all audio participants (excluding local)
  const audioParticipants = useMemo(() => {
    return livekit.participants.filter((p) => !p.isLocal && p.audioTrack);
  }, [livekit.participants]);

  // Computed volume for audio tracks
  const computedVolume = isMuted ? 0 : volume / 100;

  // Should show real LiveKit content
  const showLiveKitContent = autoConnect && livekit.isConnected && (mainTrack || audioParticipants.length > 0);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative bg-black rounded-lg overflow-hidden",
        isRadio ? "aspect-[4/1]" : "aspect-video",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => !isRadio && setShowControls(false)}
    >
      {/* Video/Audio Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {showLiveKitContent ? (
          <>
            {/* Render main video track */}
            {mainTrack && !isRadio && !isAudioOnly ? (
              <VideoTrackRenderer
                track={mainTrack}
                className="w-full h-full"
                objectFit="contain"
                muted
              />
            ) : (
              /* Audio-only layout */
              <div className="flex flex-col items-center gap-4 text-white">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
                    <Radio className="w-12 h-12" />
                  </div>
                  {isLive && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                      AO VIVO
                    </span>
                  )}
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-lg">{broadcast.title}</h3>
                  {broadcast.program && (
                    <p className="text-sm text-white/70">{broadcast.program.name}</p>
                  )}
                </div>
                {/* Audio waveform visualization */}
                <div className="flex items-end gap-1 h-8">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-primary/80 rounded-full animate-pulse"
                      style={{
                        height: `${Math.random() * 100}%`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Render all audio tracks */}
            {audioParticipants.map((participant) => (
              <AudioTrackRenderer
                key={participant.identity}
                track={participant.audioTrack}
                volume={computedVolume}
              />
            ))}
          </>
        ) : (
          /* Placeholder when not connected */
          <>
            {isRadio || isAudioOnly ? (
              <div className="flex flex-col items-center gap-4 text-white">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center animate-pulse">
                    <Radio className="w-12 h-12" />
                  </div>
                  {isLive && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                      AO VIVO
                    </span>
                  )}
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-lg">{broadcast.title}</h3>
                  {broadcast.program && (
                    <p className="text-sm text-white/70">{broadcast.program.name}</p>
                  )}
                </div>
                {/* Audio waveform visualization placeholder */}
                <div className="flex items-end gap-1 h-8">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-primary/80 rounded-full animate-pulse"
                      style={{
                        height: `${Math.random() * 100}%`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                <div className="text-center text-white">
                  <Tv className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  {isLive ? (
                    <p className="text-lg">
                      {livekit.connectionState === "connecting" 
                        ? "Conectando ao vivo..." 
                        : "Aguardando transmissão..."}
                    </p>
                  ) : (
                    <p className="text-lg">Carregando transmissão...</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Captions overlay */}
      {showCaptions && broadcast.has_captions && (
        <BroadcastCaptions broadcastId={broadcast.id} />
      )}

      {/* Live badge */}
      {isLive && !isRadio && (
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            AO VIVO
          </span>
          <span className="bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <Users className="w-3 h-3" />
            {broadcast.viewer_count}
          </span>
        </div>
      )}

      {/* Connection indicator */}
      {autoConnect && livekit.connectionState === "connecting" && (
        <div className="absolute top-4 right-4">
          <span className="bg-yellow-500/80 text-white text-xs px-2 py-1 rounded animate-pulse">
            Conectando...
          </span>
        </div>
      )}

      {/* Controls overlay */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300",
          showControls || isRadio ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="flex items-center gap-4">
          {/* Volume controls */}
          <div className="flex items-center gap-2 flex-1 max-w-[200px]">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={100}
              step={1}
              onValueChange={handleVolumeChange}
              className="w-24"
            />
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Info */}
          <div className="text-white text-sm hidden sm:block">
            <span className="font-medium">{broadcast.channel?.name}</span>
            {broadcast.program && (
              <span className="text-white/70"> • {broadcast.program.name}</span>
            )}
          </div>

          {/* Settings and fullscreen */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <Settings className="w-5 h-5" />
            </Button>
            
            {!isRadio && (
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? (
                  <Minimize className="w-5 h-5" />
                ) : (
                  <Maximize className="w-5 h-5" />
                )}
              </Button>
            )}

            {onMinimize && (
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={onMinimize}
              >
                Minimizar
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
