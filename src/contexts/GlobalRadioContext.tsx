import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import { RADIO_CONFIG } from "@/config/radio";

interface GlobalRadioContextType {
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string | null;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
}

const GlobalRadioContext = createContext<GlobalRadioContextType | null>(null);

export function GlobalRadioProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(RADIO_CONFIG.DEFAULT_VOLUME);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio(RADIO_CONFIG.STREAM_URL);
    audioRef.current.preload = "none";
    
    const audio = audioRef.current;
    
    const handleCanPlay = () => {
      setIsLoading(false);
      setHasError(false);
      setErrorMessage(null);
    };
    
    const handleError = () => {
      setIsLoading(false);
      setHasError(true);
      setErrorMessage(RADIO_CONFIG.FALLBACK_MESSAGE);
      setIsPlaying(false);
    };
    
    const handleWaiting = () => {
      setIsLoading(true);
    };
    
    const handlePlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
    };
    
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("error", handleError);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("playing", handlePlaying);
    
    return () => {
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("playing", handlePlaying);
      audio.pause();
      audio.src = "";
    };
  }, []);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      setHasError(false);
      audioRef.current.load();
      audioRef.current.play().catch(() => {
        setHasError(true);
        setErrorMessage(RADIO_CONFIG.FALLBACK_MESSAGE);
        setIsLoading(false);
      });
    }
  }, [isPlaying]);

  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(Math.max(0, Math.min(100, newVolume)));
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  return (
    <GlobalRadioContext.Provider
      value={{
        isPlaying,
        volume,
        isMuted,
        isLoading,
        hasError,
        errorMessage,
        togglePlay,
        setVolume,
        toggleMute,
      }}
    >
      {children}
    </GlobalRadioContext.Provider>
  );
}

export function useGlobalRadio() {
  const context = useContext(GlobalRadioContext);
  if (!context) {
    throw new Error("useGlobalRadio must be used within a GlobalRadioProvider");
  }
  return context;
}
