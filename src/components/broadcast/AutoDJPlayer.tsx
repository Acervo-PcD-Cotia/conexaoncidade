import { useEffect } from "react";
import { useAutoDJ } from "@/hooks/useAutoDJ";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Shuffle,
  Music,
  Radio,
} from "lucide-react";

interface AutoDJPlayerProps {
  channelId: string | undefined;
  channelName?: string;
  autoPlay?: boolean;
  compact?: boolean;
  className?: string;
  onTrackChange?: (track: { title: string; artist: string | null }) => void;
}

export function AutoDJPlayer({
  channelId,
  channelName = "Web Rádio",
  autoPlay = false,
  compact = false,
  className = "",
  onTrackChange,
}: AutoDJPlayerProps) {
  const {
    state,
    audioRef,
    isLoading,
    error,
    play,
    pause,
    next,
    previous,
    setVolume,
    shuffle,
    isPlaying,
    volume,
    currentTime,
    duration,
  } = useAutoDJ({ channelId, enabled: !!channelId, autoPlay });

  // Notify parent of track changes
  useEffect(() => {
    if (state?.currentTrack && onTrackChange) {
      onTrackChange({
        title: state.currentTrack.title,
        artist: state.currentTrack.artist,
      });
    }
  }, [state?.currentTrack?.id, onTrackChange]);

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!channelId) {
    return null;
  }

  if (isLoading && !state) {
    return (
      <div className={`rounded-lg border bg-card p-4 ${className}`}>
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded" />
          <div className="flex-1">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !state?.isPlaying) {
    return (
      <div className={`flex items-center justify-center gap-3 rounded-lg border bg-card p-4 text-muted-foreground ${className}`}>
        <Radio className="h-5 w-5" />
        <span className="text-sm">
          {error ? "Erro ao carregar Auto DJ" : "Auto DJ não está ativo neste canal"}
        </span>
      </div>
    );
  }

  const currentTrack = state.currentTrack;
  const nextTrack = state.nextTrack;

  if (compact) {
    return (
      <div className={`flex items-center gap-3 rounded-lg border bg-card p-3 ${className}`}>
        {/* Hidden audio element */}
        <audio ref={audioRef} />

        {/* Album art / placeholder */}
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded bg-muted">
          {currentTrack?.cover_image_url ? (
            <img
              src={currentTrack.cover_image_url}
              alt={currentTrack.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <Music className="h-5 w-5 text-muted-foreground" />
          )}
        </div>

        {/* Track info */}
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium">{currentTrack?.title || "Auto DJ"}</p>
          <p className="truncate text-xs text-muted-foreground">
            {currentTrack?.artist || channelName}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={isPlaying ? pause : play}>
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={next}>
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border bg-card ${className}`}>
      {/* Hidden audio element */}
      <audio ref={audioRef} />

      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">{channelName}</span>
        </div>
        <Badge variant="secondary" className="text-xs">
          <span className="mr-1 h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          Auto DJ
        </Badge>
      </div>

      {/* Main content */}
      <div className="p-4">
        <div className="flex gap-4">
          {/* Album art */}
          <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
            {currentTrack?.cover_image_url ? (
              <img
                src={currentTrack.cover_image_url}
                alt={currentTrack.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <Music className="h-8 w-8 text-muted-foreground" />
            )}
          </div>

          {/* Track info */}
          <div className="flex-1 min-w-0">
            <p className="truncate font-semibold">{currentTrack?.title || "Carregando..."}</p>
            <p className="truncate text-sm text-muted-foreground">
              {currentTrack?.artist || "Artista desconhecido"}
            </p>
            {currentTrack?.genre && (
              <Badge variant="outline" className="mt-2 text-xs">
                {currentTrack.genre}
              </Badge>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 space-y-1">
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={shuffle}
            className={state.settings?.shuffle_mode ? "text-primary" : ""}
          >
            <Shuffle className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={previous}>
            <SkipBack className="h-5 w-5" />
          </Button>
          <Button
            variant="default"
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={isPlaying ? pause : play}
          >
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={next}>
            <SkipForward className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setVolume(volume === 0 ? 100 : 0)}
            >
              {volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Slider
              value={[volume]}
              onValueChange={(v) => setVolume(v[0])}
              max={100}
              step={1}
              className="w-20"
            />
          </div>
        </div>

        {/* Next up */}
        {nextTrack && (
          <div className="mt-4 flex items-center gap-2 rounded bg-muted/50 px-3 py-2">
            <span className="text-xs text-muted-foreground">A seguir:</span>
            <span className="text-xs font-medium truncate">{nextTrack.title}</span>
            {nextTrack.artist && (
              <span className="text-xs text-muted-foreground truncate">- {nextTrack.artist}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
