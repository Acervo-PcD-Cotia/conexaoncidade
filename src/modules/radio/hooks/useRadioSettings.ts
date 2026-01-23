import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { radioApiClient } from "../apiClient";
import type { RadioSettings } from "../types";

export function useRadioSettings() {
  return useQuery({
    queryKey: ["radio", "settings"],
    queryFn: () => radioApiClient.getSettings(),
    staleTime: 60000,
  });
}

export function useUpdateRadioSettings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<RadioSettings>) => radioApiClient.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["radio", "settings"] });
    },
  });
}
