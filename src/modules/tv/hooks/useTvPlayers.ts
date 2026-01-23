import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tvApiClient } from "../apiClient";
import type { TvPlayerEmbed } from "../types";

export function useTvPlayers() {
  return useQuery({
    queryKey: ["tv", "players"],
    queryFn: () => tvApiClient.getPlayers(),
    staleTime: 60000,
  });
}

export function useGenerateTvPlayer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (config: {
      name: string;
      kind: TvPlayerEmbed["kind"];
      theme: TvPlayerEmbed["theme"];
      autoplay?: boolean;
      muted?: boolean;
      controls?: boolean;
    }) => tvApiClient.generatePlayer(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tv", "players"] });
    },
  });
}

export function useDeleteTvPlayer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => tvApiClient.deletePlayer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tv", "players"] });
    },
  });
}
