import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { radioApiClient } from "../apiClient";
import type { RadioPlaylist } from "../types";

export function useRadioPlaylists() {
  return useQuery({
    queryKey: ["radio", "playlists"],
    queryFn: () => radioApiClient.getPlaylists(),
    staleTime: 30000,
  });
}

export function useRadioPlaylist(id: string) {
  return useQuery({
    queryKey: ["radio", "playlists", id],
    queryFn: () => radioApiClient.getPlaylist(id),
    enabled: !!id,
    staleTime: 30000,
  });
}

export function useCreateRadioPlaylist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<RadioPlaylist>) =>
      radioApiClient.createPlaylist(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["radio", "playlists"] });
    },
  });
}

export function useUpdateRadioPlaylist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RadioPlaylist> }) =>
      radioApiClient.updatePlaylist(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["radio", "playlists"] });
      queryClient.invalidateQueries({ queryKey: ["radio", "playlists", variables.id] });
    },
  });
}

export function useDeleteRadioPlaylist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => radioApiClient.deletePlaylist(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["radio", "playlists"] });
    },
  });
}
