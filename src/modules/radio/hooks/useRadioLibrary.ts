import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { radioApiClient } from "../apiClient";
import type { RadioTrack } from "../types";

export function useRadioLibrary(params?: {
  page?: number;
  limit?: number;
  search?: string;
  genre?: string;
}) {
  return useQuery({
    queryKey: ["radio", "library", params],
    queryFn: () => radioApiClient.getTracks(params),
    staleTime: 30000,
  });
}

export function useUploadRadioTrack() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ file, metadata }: { file: File; metadata?: Partial<RadioTrack> }) =>
      radioApiClient.uploadTrack(file, metadata),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["radio", "library"] });
    },
  });
}

export function useDeleteRadioTrack() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => radioApiClient.deleteTrack(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["radio", "library"] });
    },
  });
}
