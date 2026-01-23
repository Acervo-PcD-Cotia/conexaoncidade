import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tvApiClient } from "../apiClient";
import { useState, useEffect, useCallback } from "react";

export function useTvIngest() {
  return useQuery({
    queryKey: ["tv", "ingest"],
    queryFn: () => tvApiClient.getIngestCredentials(),
    staleTime: 60000,
  });
}

export function useRevealTvStreamKey() {
  const [streamKey, setStreamKey] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const REVEAL_TIMEOUT = 15000; // 15 segundos

  const mutation = useMutation({
    mutationFn: () => tvApiClient.revealStreamKey(),
    onSuccess: (data) => {
      setStreamKey(data.streamKey);
      setExpiresAt(Date.now() + REVEAL_TIMEOUT);
    },
  });

  // Auto-hide após timeout
  useEffect(() => {
    if (!expiresAt) return;
    
    const timeout = setTimeout(() => {
      setStreamKey(null);
      setExpiresAt(null);
    }, expiresAt - Date.now());

    return () => clearTimeout(timeout);
  }, [expiresAt]);

  const reveal = useCallback(() => {
    mutation.mutate();
  }, [mutation]);

  const hide = useCallback(() => {
    setStreamKey(null);
    setExpiresAt(null);
  }, []);

  return {
    streamKey,
    expiresAt,
    isRevealed: !!streamKey,
    reveal,
    hide,
    isLoading: mutation.isPending,
  };
}

export function useRegenerateTvCredentials() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => tvApiClient.regenerateCredentials(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tv", "ingest"] });
    },
  });
}
