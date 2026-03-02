import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Download, MoreVertical, Loader2, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { WebSpeechPlayer } from './WebSpeechPlayer';
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
  categoryColor?: string;
  onAudioPlay?: () => void;
  onAudioStop?: () => void;
  onPodcastPlay?: () => void;
}

const PLAYBACK_SPEEDS = [0.75, 1, 1.25, 1.5, 2];

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
  categoryColor,
  onAudioPlay,
  onAudioStop,
  onPodcastPlay,
}: NewsAudioBlockProps) {
  const effectiveAudioUrl = audioUrl || podcastAudioUrl;
  const isReady = (audioStatus === 'ready' && audioUrl) || 
                  ((podcastStatus === 'ready' || podcastStatus === 'published') && podcastAudioUrl);
  const isGenerating = audioStatus === 'generating';
  const hasFailed = audioStatus === 'failed';
  const notGenerated = !audioStatus || audioStatus === 'not_generated';
  const showFallback = !isReady && !isGenerating;

  return (
    <div className={cn("", className)}>
      <section 
        className="rounded-lg overflow-hidden"
        style={{
          background: '#f6f7fb',
          border: '1px solid #e1e3f0',
        }}
        aria-label="Versão em áudio da matéria"
      >
        {isReady && effectiveAudioUrl && (
          <CompactAudioPlayer
            audioUrl={effectiveAudioUrl}
            duration={audioDuration || 0}
            newsId={newsId}
            spotifyUrl={spotifyUrl}
            categoryColor={categoryColor}
            onPlay={onAudioPlay}
            onPause={onAudioStop}
          />
        )}

        {isGenerating && (
          <div className="px-5 py-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">Preparando áudio...</p>
              <p className="text-xs text-muted-foreground">Versão em áudio será disponibilizada em breve</p>
            </div>
          </div>
        )}

        {hasFailed && (
          <div className="px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                <Headphones className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">Áudio indisponível</p>
                <p className="text-xs text-muted-foreground">Use o leitor do navegador abaixo</p>
              </div>
            </div>
            {contentHtml && (
              <div className="mt-3">
                <WebSpeechPlayer text={contentHtml} />
              </div>
            )}
          </div>
        )}

        {showFallback && !hasFailed && contentHtml && (
          <div className="px-5 py-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Headphones className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">Ouça pelo navegador</p>
                <p className="text-xs text-muted-foreground">
                  {notGenerated ? 'Áudio em preparação' : 'Use o leitor do navegador'}
                </p>
              </div>
            </div>
            <WebSpeechPlayer text={contentHtml} />
          </div>
        )}
      </section>
    </div>
  );
}

// ============================================
// Compact Audio Player - Agência Brasil Style
// ============================================

interface CompactAudioPlayerProps {
  audioUrl: string;
  duration?: number;
  newsId: string;
  spotifyUrl?: string | null;
  categoryColor?: string;
  onPlay?: () => void;
  onPause?: () => void;
}

function CompactAudioPlayer({
  audioUrl,
  duration = 0,
  newsId,
  spotifyUrl,
  categoryColor,
  onPlay,
  onPause,
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

  useEffect(() => {
    if (isPlaying && !hasStartedTracking) {
      setHasStartedTracking(true);
    }
  }, [isPlaying, hasStartedTracking]);

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

  const playButtonStyle = categoryColor
    ? { backgroundColor: categoryColor, color: '#fff' }
    : undefined;

  return (
    <div>
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="metadata"
      />

      {/* Compact Header - "VERSÃO EM ÁUDIO" */}
      <div className="px-5 py-3 flex items-center gap-3">
        <Button
          variant="default"
          size="icon"
          className="h-10 w-10 rounded-full shrink-0 shadow-md"
          style={playButtonStyle}
          onClick={togglePlay}
          aria-label={isPlaying ? "Pausar áudio" : "Reproduzir áudio"}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4 ml-0.5" />
          )}
        </Button>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-widest text-foreground/70 mb-1.5">
            Versão em áudio
          </p>
          {/* Progress Bar - thin */}
          <Slider
            value={[currentTime]}
            max={audioDuration || 100}
            step={1}
            onValueChange={handleSeek}
            className="cursor-pointer"
          />
        </div>
        <span className="text-xs tabular-nums text-muted-foreground font-medium shrink-0">
          {formatTime(currentTime)} / {formatTime(audioDuration)}
        </span>
      </div>

      {/* Controls Row - compact inline */}
      <div className="px-5 pb-3 flex items-center justify-end gap-1">
        {/* Speed Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button 
              className="px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-black/5 rounded transition-colors"
              aria-label="Velocidade de reprodução"
            >
              {playbackSpeed}x
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-24">
            {PLAYBACK_SPEEDS.map((speed) => (
              <DropdownMenuItem
                key={speed}
                onClick={() => handleSpeedChange(speed)}
                className={cn(
                  "text-sm justify-center",
                  playbackSpeed === speed && "bg-muted font-medium"
                )}
              >
                {speed}x
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Volume */}
        <button 
          onClick={toggleMute} 
          className="p-1.5 hover:bg-black/5 rounded transition-colors shrink-0"
          aria-label={isMuted ? "Ativar som" : "Silenciar"}
        >
          {isMuted ? (
            <VolumeX className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </button>

        {/* More Options */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button 
              className="p-1.5 hover:bg-black/5 rounded transition-colors shrink-0" 
              aria-label="Mais opções"
            >
              <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem asChild>
              <a href={audioUrl} download target="_blank" rel="noopener noreferrer" className="gap-2">
                <Download className="h-3.5 w-3.5" />
                Baixar MP3
              </a>
            </DropdownMenuItem>
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
    </div>
  );
}
