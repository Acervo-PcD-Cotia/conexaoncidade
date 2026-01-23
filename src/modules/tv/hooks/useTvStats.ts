import { useQuery } from "@tanstack/react-query";
import { tvApiClient } from "../apiClient";

export function useTvStats(period: "day" | "week" | "month" = "day") {
  return useQuery({
    queryKey: ["tv", "stats", period],
    queryFn: () => tvApiClient.getStats(period),
    staleTime: 60000,
  });
}
