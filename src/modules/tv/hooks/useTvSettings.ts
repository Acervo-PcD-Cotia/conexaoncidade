import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tvApiClient } from "../apiClient";
import type { TvSettings } from "../types";

export function useTvSettings() {
  return useQuery({
    queryKey: ["tv", "settings"],
    queryFn: () => tvApiClient.getSettings(),
    staleTime: 60000,
  });
}

export function useUpdateTvSettings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<TvSettings>) => tvApiClient.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tv", "settings"] });
    },
  });
}
