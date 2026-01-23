import { useQuery } from "@tanstack/react-query";
import { radioApiClient } from "../apiClient";

export function useRadioStats(period: "day" | "week" | "month" = "day") {
  return useQuery({
    queryKey: ["radio", "stats", period],
    queryFn: () => radioApiClient.getStats(period),
    staleTime: 60000,
  });
}
