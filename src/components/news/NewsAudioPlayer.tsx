import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { useTrackAudioListen } from '@/hooks/useNewsAudio';

interface NewsAudioPlayerProps {
  audioUrl: string;
  duration?: number;
  newsId: string;
  spotifyUrl?: string | null;
  className?: string;
  onPlay?: () => void;
  onPause?: () => void;
}

const PLAYBACK_SPEEDS = [0.8, 1, 1.2, 1.5];

export function NewsAudioPlayer({ 
  audioUrl, 
  duration = 0, 
  newsId,
  spotifyUrl,
  className,
  onPlay,
  onPause,
}: NewsAudioPlayerProps) {
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
    
    // Track completed listen
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

  const handleSpeedChange = useCallback(() => {
    const currentIndex = PLAYBACK_SPEEDS.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % PLAYBACK_SPEEDS.length;
    const newSpeed = PLAYBACK_SPEEDS[nextIndex];
    
    setPlaybackSpeed(newSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    }
  }, [playbackSpeed]);

  const handleVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
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

  const progress = audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0;

  return (
    <div className={cn(
      "bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 border border-primary/20",
      className
    )}>
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="metadata"
      />

      <div className="flex items-center gap-4">
        {/* Play/Pause Button */}
        <Button
          variant="default"
          size="icon"
          className="h-12 w-12 rounded-full shrink-0"
          onClick={togglePlay}
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5 ml-0.5" />
          )}
        </Button>

        {/* Progress and Controls */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">🎧 Ouça esta notícia</span>
          </div>
          
          {/* Progress Bar */}
          <Slider
            value={[currentTime]}
            max={audioDuration || 100}
            step={1}
            onValueChange={handleSeek}
            className="cursor-pointer"
          />

          {/* Time and Controls Row */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)} / {formatTime(audioDuration)}</span>
            
            <div className="flex items-center gap-3">
              {/* Speed Control */}
              <button
                onClick={handleSpeedChange}
                className="px-2 py-0.5 rounded bg-muted hover:bg-muted/80 font-medium transition-colors"
              >
                {playbackSpeed}x
              </button>

              {/* Volume */}
              <div className="flex items-center gap-1">
                <button onClick={toggleMute} className="p-1 hover:bg-muted rounded">
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.1}
                  onValueChange={handleVolumeChange}
                  className="w-16"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Spotify CTA */}
        {spotifyUrl && (
          <a
            href={spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-1.5 text-xs text-green-600 hover:text-green-700 font-medium"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Spotify
          </a>
        )}
      </div>
    </div>
  );
}
