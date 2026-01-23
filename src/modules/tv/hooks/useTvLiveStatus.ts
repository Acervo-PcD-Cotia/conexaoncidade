import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tvApiClient } from "../apiClient";

export function useTvLiveStatus() {
  return useQuery({
    queryKey: ["tv", "live", "status"],
    queryFn: () => tvApiClient.getLiveStatus(),
    refetchInterval: 10000,
    staleTime: 5000,
  });
}

export function useStartTvLive() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => tvApiClient.startLive(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tv", "live", "status"] });
    },
  });
}

export function useStopTvLive() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => tvApiClient.stopLive(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tv", "live", "status"] });
    },
  });
}
