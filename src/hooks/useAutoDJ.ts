import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PlaylistItem {
  id: string;
  title: string;
  artist: string | null;
  audio_url: string;
  duration_seconds: number | null;
  sort_order: number;
  cover_image_url: string | null;
  genre: string | null;
}

interface AutoDJSettings {
  is_enabled: boolean;
  shuffle_mode: boolean;
  crossfade_seconds: number;
  fallback_enabled: boolean;
  volume_level: number;
}

interface AutoDJState {
  currentTrack: PlaylistItem | null;
  nextTrack: PlaylistItem | null;
  position: number;
  isPlaying: boolean;
  settings: AutoDJSettings | null;
  playlist: PlaylistItem[];
  currentIndex: number;
}

interface UseAutoDJOptions {
  channelId: string | undefined;
  enabled?: boolean;
  autoPlay?: boolean;
}

interface UseAutoDJReturn {
  state: AutoDJState | null;
  audioRef: React.RefObject<HTMLAudioElement>;
  isLoading: boolean;
  error: string | null;
  play: () => void;
  pause: () => void;
  next: () => void;
  previous: () => void;
  setVolume: (volume: number) => void;
  shuffle: () => void;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
}

export function useAutoDJ({ channelId, enabled = true, autoPlay = false }: UseAutoDJOptions): UseAutoDJReturn {
  const [state, setState] = useState<AutoDJState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(100);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchState = useCallback(async (action: string = "get-current") => {
    if (!channelId || !enabled) return;

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fnError } = await supabase.functions.invoke("autodj-stream", {
        body: { channelId, action },
      });

      if (fnError) throw fnError;

      setState(data);

      // Update volume from settings
      if (data?.settings?.volume_level !== undefined) {
        setVolume(data.settings.volume_level);
      }

      // Auto-play if enabled and we have a track
      if (autoPlay && data?.currentTrack && audioRef.current) {
        if (audioRef.current.src !== data.currentTrack.audio_url) {
          audioRef.current.src = data.currentTrack.audio_url;
          audioRef.current.currentTime = data.position || 0;
        }
        if (data.isPlaying) {
          audioRef.current.play().catch(() => {});
        }
      }

    } catch (err) {
      console.error("AutoDJ fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch AutoDJ state");
    } finally {
      setIsLoading(false);
    }
  }, [channelId, enabled, autoPlay]);

  // Initial fetch
  useEffect(() => {
    if (channelId && enabled) {
      fetchState();
    }
  }, [channelId, enabled, fetchState]);

  // Poll for updates every 30 seconds
  useEffect(() => {
    if (channelId && enabled) {
      pollIntervalRef.current = setInterval(() => {
        fetchState();
      }, 30000);

      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
      };
    }
  }, [channelId, enabled, fetchState]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration || 0);
    const handleEnded = () => {
      // Auto-advance to next track
      next();
    };

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  // Update audio volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const play = useCallback(() => {
    if (audioRef.current && state?.currentTrack) {
      if (!audioRef.current.src || audioRef.current.src !== state.currentTrack.audio_url) {
        audioRef.current.src = state.currentTrack.audio_url;
      }
      audioRef.current.play().catch(console.error);
    }
  }, [state?.currentTrack]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const next = useCallback(async () => {
    await fetchState("next");
  }, [fetchState]);

  const previous = useCallback(async () => {
    await fetchState("previous");
  }, [fetchState]);

  const shuffle = useCallback(async () => {
    await fetchState("shuffle");
  }, [fetchState]);

  const handleSetVolume = useCallback((newVolume: number) => {
    setVolume(Math.max(0, Math.min(100, newVolume)));
  }, []);

  return {
    state,
    audioRef,
    isLoading,
    error,
    play,
    pause,
    next,
    previous,
    setVolume: handleSetVolume,
    shuffle,
    isPlaying,
    volume,
    currentTime,
    duration,
  };
}
