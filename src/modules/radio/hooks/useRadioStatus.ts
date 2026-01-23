import { useQuery } from "@tanstack/react-query";
import { radioApiClient } from "../apiClient";

export function useRadioStatus() {
  return useQuery({
    queryKey: ["radio", "status"],
    queryFn: () => radioApiClient.getStatus(),
    refetchInterval: 10000, // Polling a cada 10s
    staleTime: 5000,
  });
}
