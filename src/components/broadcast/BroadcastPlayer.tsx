import { useState, useEffect, useRef } from "react";
import { Radio, Tv, Users, Volume2, VolumeX, Maximize, Minimize, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Broadcast } from "@/hooks/useBroadcast";
import BroadcastCaptions from "./BroadcastCaptions";

interface BroadcastPlayerProps {
  broadcast: Broadcast;
  isAudioOnly?: boolean;
  showCaptions?: boolean;
  className?: string;
  onMinimize?: () => void;
}

export default function BroadcastPlayer({
  broadcast,
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
      {/* Video/Audio placeholder - In production, this would be LiveKit video */}
      <div className="absolute inset-0 flex items-center justify-center">
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
                <p className="text-lg">Conectando ao vivo...</p>
              ) : (
                <p className="text-lg">Carregando transmissão...</p>
              )}
            </div>
          </div>
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
