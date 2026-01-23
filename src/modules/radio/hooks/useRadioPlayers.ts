import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { radioApiClient } from "../apiClient";
import type { RadioPlayerEmbed } from "../types";

export function useRadioPlayers() {
  return useQuery({
    queryKey: ["radio", "players"],
    queryFn: () => radioApiClient.getPlayers(),
    staleTime: 60000,
  });
}

export function useGenerateRadioPlayer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (config: {
      name: string;
      kind: RadioPlayerEmbed["kind"];
      theme: RadioPlayerEmbed["theme"];
      primaryColor?: string;
    }) => radioApiClient.generatePlayer(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["radio", "players"] });
    },
  });
}

export function useDeleteRadioPlayer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => radioApiClient.deletePlayer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["radio", "players"] });
    },
  });
}
