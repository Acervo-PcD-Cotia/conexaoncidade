import { useGlobalRadio } from "@/contexts/GlobalRadioContext";
import { RADIO_CONFIG } from "@/config/radio";
import { useRadioConfig } from "@/hooks/useBroadcastConfig";
import { Play, Pause, Volume2, VolumeX, Radio, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

export function TopAudioPlayer() {
  const {
    isPlaying,
    volume,
    isMuted,
    isLoading,
    hasError,
    errorMessage,
    togglePlay,
    setVolume,
    toggleMute,
  } = useGlobalRadio();
  
  const dynamicConfig = useRadioConfig();
  
  // Merge static defaults with dynamic config
  const config = {
    name: dynamicConfig?.name || RADIO_CONFIG.NAME,
    statusLabel: dynamicConfig?.status_label || RADIO_CONFIG.STATUS_LABEL,
  };

  return (
    <div className="sticky top-0 z-50 h-12 bg-gradient-to-r from-primary via-primary/95 to-primary border-b border-primary-foreground/10 shadow-md">
      <div className="container h-full flex items-center justify-between gap-4">
        {/* Left: Status + Name */}
        <div className="flex items-center gap-2 min-w-0">
          {/* Live Badge */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-600 text-white text-xs font-bold shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            {config.statusLabel}
          </div>
          
          {/* Radio Icon + Name */}
          <div className="flex items-center gap-1.5 text-primary-foreground truncate">
            <Radio className="h-4 w-4 shrink-0" />
            <span className="font-semibold text-sm truncate hidden sm:inline">
              {config.name}
            </span>
          </div>
          
          {/* Sound Wave Animation (when playing) */}
          {isPlaying && !hasError && (
            <div className="hidden md:flex items-end gap-0.5 h-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "w-0.5 bg-primary-foreground/80 rounded-full",
                    i % 2 === 0 ? "animate-pulse" : "animate-bounce"
                  )}
                  style={{
                    height: `${Math.random() * 12 + 4}px`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: `${0.5 + i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Center: Error Message (if any) */}
        {hasError && (
          <div className="flex items-center gap-1.5 text-xs text-red-200">
            <AlertCircle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{errorMessage}</span>
          </div>
        )}

        {/* Right: Controls */}
        <div className="flex items-center gap-2">
          {/* Play/Pause Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground"
            onClick={togglePlay}
            disabled={isLoading}
            aria-label={isPlaying ? "Pausar rádio" : "Tocar rádio"}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>

          {/* Volume Controls */}
          <div className="hidden sm:flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground"
              onClick={toggleMute}
              aria-label={isMuted ? "Ativar som" : "Desativar som"}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            
            <Slider
              value={[isMuted ? 0 : volume]}
              onValueChange={(values) => setVolume(values[0])}
              max={100}
              step={5}
              className="w-20 [&_[role=slider]]:bg-primary-foreground [&_.bg-primary]:bg-primary-foreground/60"
              aria-label="Volume"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
