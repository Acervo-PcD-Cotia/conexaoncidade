import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Download, MoreVertical, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { WebSpeechPlayer } from './WebSpeechPlayer';
import { PodcastPlatformsModal } from './PodcastPlatformsModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useTrackAudioListen } from '@/hooks/useNewsAudio';

interface NewsAudioBlockProps {
  newsId: string;
  audioUrl?: string | null;
  audioStatus?: string | null;
  audioDuration?: number | null;
  transcriptText?: string | null;
  contentHtml?: string | null;
  spotifyUrl?: string | null;
  podcastStatus?: string | null;
  podcastAudioUrl?: string | null;
  className?: string;
  onAudioPlay?: () => void;
  onAudioStop?: () => void;
  onPodcastPlay?: () => void;
}

const PLAYBACK_SPEEDS = [0.8, 1, 1.2, 1.5, 2];

export function NewsAudioBlock({
  newsId,
  audioUrl,
  audioStatus,
  audioDuration,
  transcriptText,
  contentHtml,
  spotifyUrl,
  podcastStatus,
  podcastAudioUrl,
  className,
  onAudioPlay,
  onAudioStop,
  onPodcastPlay,
}: NewsAudioBlockProps) {
  const [showPodcastModal, setShowPodcastModal] = useState(false);

  // Determine audio state
  const isReady = audioStatus === 'ready' && audioUrl;
  const isGenerating = audioStatus === 'generating';
  const hasFailed = audioStatus === 'failed';
  const notGenerated = !audioStatus || audioStatus === 'not_generated';

  // Podcast state
  const isPodcastReady = (podcastStatus === 'ready' || podcastStatus === 'published') && podcastAudioUrl;

  // Show fallback (Web Speech) when audio is not ready
  const showFallback = !isReady && !isGenerating;

  return (
    <div className={cn("space-y-3", className)}>
      {/* =========================================== */}
      {/* 🎧 PLAYER COMPACTO: VERSÃO EM ÁUDIO        */}
      {/* =========================================== */}
      <section 
        className="border rounded-lg overflow-hidden"
        aria-label="Versão em áudio da matéria"
      >
        {/* Header - Centered title */}
        <div className="text-center py-2 border-b bg-muted/30">
          <span className="text-sm font-medium text-foreground">Versão em áudio</span>
        </div>

        {/* Player Content */}
        <div className="p-3">
          {/* Audio Player - Ready State */}
          {isReady && (
            <CompactAudioPlayer
              audioUrl={audioUrl}
              duration={audioDuration || 0}
              newsId={newsId}
              spotifyUrl={spotifyUrl}
              onPlay={onAudioPlay}
              onPause={onAudioStop}
            />
          )}

          {/* Generating State */}
          {isGenerating && (
            <div className="flex items-center justify-center gap-2 py-2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Gerando áudio...</p>
            </div>
          )}

          {/* Failed State */}
          {hasFailed && (
            <p className="text-sm text-muted-foreground text-center py-2">
              Áudio indisponível. Use o leitor do navegador.
            </p>
          )}

          {/* Fallback: Web Speech API */}
          {showFallback && contentHtml && (
            <div className="space-y-2">
              {notGenerated && (
                <p className="text-xs text-muted-foreground text-center">
                  Áudio em preparação. Use o leitor do navegador:
                </p>
              )}
              <WebSpeechPlayer text={contentHtml} />
            </div>
          )}
        </div>
      </section>

      {/* =========================================== */}
      {/* 🎙️ PLAYER 2: PODCAST (se disponível)       */}
      {/* =========================================== */}
      {isPodcastReady && (
        <section 
          className="border rounded-lg overflow-hidden border-purple-200 dark:border-purple-800"
          aria-label="Podcast da notícia"
        >
          <div className="text-center py-2 border-b bg-purple-50 dark:bg-purple-900/20">
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
              Podcast da notícia
            </span>
          </div>

          <div className="p-3">
            <CompactAudioPlayer
              audioUrl={podcastAudioUrl!}
              duration={audioDuration || 0}
              newsId={newsId}
              onPlay={onPodcastPlay}
              isPodcast
            />
          </div>
        </section>
      )}

      {/* Podcast Platforms Modal */}
      <PodcastPlatformsModal 
        open={showPodcastModal} 
        onOpenChange={setShowPodcastModal} 
      />
    </div>
  );
}

// ============================================
// Compact Audio Player Component
// ============================================

interface CompactAudioPlayerProps {
  audioUrl: string;
  duration?: number;
  newsId: string;
  spotifyUrl?: string | null;
  onPlay?: () => void;
  onPause?: () => void;
  isPodcast?: boolean;
}

function CompactAudioPlayer({
  audioUrl,
  duration = 0,
  newsId,
  spotifyUrl,
  onPlay,
  onPause,
  isPodcast = false,
}: CompactAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [hasStartedTracking, setHasStartedTracking] = useState(false);

  const trackListen = useTrackAudioListen();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      onPause?.();
    } else {
      audioRef.current.play();
      onPlay?.();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, onPlay, onPause]);

  const handleTimeUpdate = useCallback(() => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (!audioRef.current) return;
    setAudioDuration(audioRef.current.duration);
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    if (audioRef.current) {
      trackListen.mutate({
        newsId,
        durationListenedSeconds: Math.floor(audioRef.current.duration),
        completed: true,
        platform: 'web',
      });
    }
  }, [newsId, trackListen]);

  const handleSeek = useCallback((value: number[]) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = value[0];
    setCurrentTime(value[0]);
  }, []);

  const handleSpeedChange = useCallback((speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume || 1;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  }, [isMuted, volume]);

  // Track initial play
  useEffect(() => {
    if (isPlaying && !hasStartedTracking) {
      setHasStartedTracking(true);
    }
  }, [isPlaying, hasStartedTracking]);

  // Track when user leaves page
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (hasStartedTracking && audioRef.current && currentTime > 5) {
        trackListen.mutate({
          newsId,
          durationListenedSeconds: Math.floor(currentTime),
          completed: currentTime >= audioDuration * 0.9,
          platform: 'web',
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasStartedTracking, newsId, currentTime, audioDuration, trackListen]);

  return (
    <div className="flex items-center gap-3">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="metadata"
      />

      {/* Play/Pause Button */}
      <Button
        variant="default"
        size="icon"
        className="h-9 w-9 rounded-full shrink-0"
        onClick={togglePlay}
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4 ml-0.5" />
        )}
      </Button>

      {/* Time Display */}
      <span className="text-xs tabular-nums text-muted-foreground shrink-0 w-20">
        {formatTime(currentTime)} / {formatTime(audioDuration)}
      </span>

      {/* Progress Bar */}
      <Slider
        value={[currentTime]}
        max={audioDuration || 100}
        step={1}
        onValueChange={handleSeek}
        className="flex-1 cursor-pointer"
      />

      {/* Volume Button */}
      <button 
        onClick={toggleMute} 
        className="p-1.5 hover:bg-muted rounded shrink-0"
        aria-label={isMuted ? "Ativar som" : "Silenciar"}
      >
        {isMuted ? (
          <VolumeX className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Volume2 className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {/* Options Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="p-1.5 hover:bg-muted rounded shrink-0" aria-label="Mais opções">
            <MoreVertical className="h-4 w-4 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {/* Speed Options */}
          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
            Velocidade
          </div>
          {PLAYBACK_SPEEDS.map((speed) => (
            <DropdownMenuItem
              key={speed}
              onClick={() => handleSpeedChange(speed)}
              className={cn(
                "text-sm",
                playbackSpeed === speed && "bg-muted font-medium"
              )}
            >
              {speed}x
            </DropdownMenuItem>
          ))}
          <div className="h-px bg-border my-1" />
          {/* Download */}
          <DropdownMenuItem asChild>
            <a href={audioUrl} download target="_blank" rel="noopener noreferrer" className="gap-2">
              <Download className="h-3.5 w-3.5" />
              Baixar MP3
            </a>
          </DropdownMenuItem>
          {/* Spotify */}
          {spotifyUrl && (
            <DropdownMenuItem asChild>
              <a href={spotifyUrl} target="_blank" rel="noopener noreferrer" className="gap-2 text-green-600">
                Ouvir no Spotify
              </a>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
