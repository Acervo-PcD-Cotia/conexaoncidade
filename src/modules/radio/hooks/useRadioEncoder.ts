import { useQuery, useMutation } from "@tanstack/react-query";
import { radioApiClient } from "../apiClient";
import { useState, useEffect, useCallback } from "react";

export function useRadioEncoder() {
  return useQuery({
    queryKey: ["radio", "encoder"],
    queryFn: () => radioApiClient.getEncoderConfig(),
    staleTime: 60000,
  });
}

export function useRevealRadioPassword() {
  const [password, setPassword] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const REVEAL_TIMEOUT = 15000; // 15 segundos

  const mutation = useMutation({
    mutationFn: () => radioApiClient.revealPassword(),
    onSuccess: (data) => {
      setPassword(data.password);
      setExpiresAt(Date.now() + REVEAL_TIMEOUT);
    },
  });

  // Auto-hide após timeout
  useEffect(() => {
    if (!expiresAt) return;
    
    const timeout = setTimeout(() => {
      setPassword(null);
      setExpiresAt(null);
    }, expiresAt - Date.now());

    return () => clearTimeout(timeout);
  }, [expiresAt]);

  const reveal = useCallback(() => {
    mutation.mutate();
  }, [mutation]);

  const hide = useCallback(() => {
    setPassword(null);
    setExpiresAt(null);
  }, []);

  return {
    password,
    expiresAt,
    isRevealed: !!password,
    reveal,
    hide,
    isLoading: mutation.isPending,
  };
}
