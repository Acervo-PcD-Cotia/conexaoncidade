import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Broadcast } from "@/hooks/useBroadcast";

interface MiniPlayerState {
  isVisible: boolean;
  broadcast: Broadcast | null;
  isPlaying: boolean;
  volume: number;
}

interface MiniPlayerContextType extends MiniPlayerState {
  showMiniPlayer: (broadcast: Broadcast) => void;
  hideMiniPlayer: () => void;
  togglePlayPause: () => void;
  setVolume: (volume: number) => void;
  setIsPlaying: (playing: boolean) => void;
}

const MiniPlayerContext = createContext<MiniPlayerContextType | undefined>(undefined);

export function MiniPlayerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MiniPlayerState>({
    isVisible: false,
    broadcast: null,
    isPlaying: true,
    volume: 80,
  });

  const showMiniPlayer = useCallback((broadcast: Broadcast) => {
    setState((prev) => ({
      ...prev,
      isVisible: true,
      broadcast,
      isPlaying: true,
    }));
  }, []);

  const hideMiniPlayer = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isVisible: false,
      broadcast: null,
      isPlaying: false,
    }));
  }, []);

  const togglePlayPause = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isPlaying: !prev.isPlaying,
    }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    setState((prev) => ({
      ...prev,
      volume,
    }));
  }, []);

  const setIsPlaying = useCallback((playing: boolean) => {
    setState((prev) => ({
      ...prev,
      isPlaying: playing,
    }));
  }, []);

  return (
    <MiniPlayerContext.Provider
      value={{
        ...state,
        showMiniPlayer,
        hideMiniPlayer,
        togglePlayPause,
        setVolume,
        setIsPlaying,
      }}
    >
      {children}
    </MiniPlayerContext.Provider>
  );
}

export function useMiniPlayer() {
  const context = useContext(MiniPlayerContext);
  if (context === undefined) {
    throw new Error("useMiniPlayer must be used within a MiniPlayerProvider");
  }
  return context;
}
