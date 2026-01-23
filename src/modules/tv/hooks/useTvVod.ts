import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tvApiClient } from "../apiClient";
import type { TvVodItem } from "../types";

export function useTvVods(params?: {
  page?: number;
  limit?: number;
  status?: TvVodItem["status"];
  search?: string;
}) {
  return useQuery({
    queryKey: ["tv", "vod", params],
    queryFn: () => tvApiClient.getVods(params),
    staleTime: 30000,
  });
}

export function useTvVod(id: string) {
  return useQuery({
    queryKey: ["tv", "vod", id],
    queryFn: () => tvApiClient.getVod(id),
    enabled: !!id,
    staleTime: 30000,
  });
}

export function useUpdateTvVod() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TvVodItem> }) =>
      tvApiClient.updateVod(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tv", "vod"] });
      queryClient.invalidateQueries({ queryKey: ["tv", "vod", variables.id] });
    },
  });
}

export function useDeleteTvVod() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => tvApiClient.deleteVod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tv", "vod"] });
    },
  });
}
