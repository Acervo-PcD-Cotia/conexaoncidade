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
  onAudioPlay,
  onAudioStop,
  onPodcastPlay,
}: NewsAudioBlockProps) {
  // Determine audio state - unified player (prioritize TTS, fallback to podcast)
  const effectiveAudioUrl = audioUrl || podcastAudioUrl;
  const isReady = (audioStatus === 'ready' && audioUrl) || 
                  ((podcastStatus === 'ready' || podcastStatus === 'published') && podcastAudioUrl);
  const isGenerating = audioStatus === 'generating';
  const hasFailed = audioStatus === 'failed';
  const notGenerated = !audioStatus || audioStatus === 'not_generated';

  // Show fallback (Web Speech) when audio is not ready
  const showFallback = !isReady && !isGenerating;

  return (
    <div className={cn("", className)}>
      {/* =========================================== */}
      {/* 🎧 PLAYER UOL/TRINITY AUDIO STYLE          */}
      {/* =========================================== */}
      <section 
        className="border rounded-lg overflow-hidden bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800"
        aria-label="Versão em áudio da matéria"
      >
        {/* Audio Player - Ready State */}
        {isReady && effectiveAudioUrl && (
          <UOLAudioPlayer
            audioUrl={effectiveAudioUrl}
            duration={audioDuration || 0}
            newsId={newsId}
            spotifyUrl={spotifyUrl}
            onPlay={onAudioPlay}
            onPause={onAudioStop}
          />
        )}

        {/* Generating State */}
        {isGenerating && (
          <div className="p-6">
            <div className="flex items-center justify-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Preparando áudio...</p>
                <p className="text-sm text-muted-foreground">Versão em áudio será disponibilizada em breve</p>
              </div>
            </div>
          </div>
        )}

        {/* Failed State */}
        {hasFailed && (
          <div className="p-6">
            <div className="flex items-center justify-center gap-3">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <Headphones className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Áudio indisponível</p>
                <p className="text-sm text-muted-foreground">Use o leitor do navegador abaixo</p>
              </div>
            </div>
            {contentHtml && (
              <div className="mt-4">
                <WebSpeechPlayer text={contentHtml} />
              </div>
            )}
          </div>
        )}

        {/* Fallback: Web Speech API */}
        {showFallback && !hasFailed && contentHtml && (
          <div className="p-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Headphones className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Ouça pelo navegador</p>
                <p className="text-sm text-muted-foreground">
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
// UOL/Trinity Audio Style Player
// ============================================

interface UOLAudioPlayerProps {
  audioUrl: string;
  duration?: number;
  newsId: string;
  spotifyUrl?: string | null;
  onPlay?: () => void;
  onPause?: () => void;
}

function UOLAudioPlayer({
  audioUrl,
  duration = 0,
  newsId,
  spotifyUrl,
  onPlay,
  onPause,
}: UOLAudioPlayerProps) {
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
    <div>
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="metadata"
      />

      {/* Header with "Ouça agora" */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          {/* Large Play Button */}
          <Button
            variant="default"
            size="icon"
            className="h-12 w-12 rounded-full shrink-0 shadow-lg"
            onClick={togglePlay}
            aria-label={isPlaying ? "Pausar áudio" : "Reproduzir áudio"}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ml-0.5" />
            )}
          </Button>
          <div>
            <p className="font-semibold text-foreground">Ouça agora</p>
            <p className="text-xs text-muted-foreground">Versão em áudio desta matéria</p>
          </div>
        </div>
        <span className="text-sm tabular-nums text-muted-foreground font-medium">
          {formatTime(audioDuration)}
        </span>
      </div>

      {/* Progress Bar and Controls */}
      <div className="px-4 py-4 space-y-3">
        {/* Progress Slider */}
        <Slider
          value={[currentTime]}
          max={audioDuration || 100}
          step={1}
          onValueChange={handleSeek}
          className="cursor-pointer"
        />
        
        {/* Time + Controls Row */}
        <div className="flex items-center justify-between">
          {/* Current Time / Duration */}
          <span className="text-xs tabular-nums text-muted-foreground">
            {formatTime(currentTime)} / {formatTime(audioDuration)}
          </span>
          
          {/* Controls */}
          <div className="flex items-center gap-1">
            {/* Speed Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
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

            {/* Volume Button */}
            <button 
              onClick={toggleMute} 
              className="p-2 hover:bg-muted rounded transition-colors shrink-0"
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
                <button 
                  className="p-2 hover:bg-muted rounded transition-colors shrink-0" 
                  aria-label="Mais opções"
                >
                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
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
        </div>
      </div>

      {/* Footer Attribution */}
      <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-700 bg-slate-100/50 dark:bg-slate-800/50">
        <p className="text-xs text-muted-foreground text-center">
          Powered by Portal Conexão
        </p>
      </div>
    </div>
  );
}
