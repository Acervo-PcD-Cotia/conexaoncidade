import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { radioApiClient } from "../apiClient";

export function useRadioAutoDJ() {
  return useQuery({
    queryKey: ["radio", "autodj"],
    queryFn: () => radioApiClient.getAutoDJStatus(),
    refetchInterval: 5000,
    staleTime: 3000,
  });
}

export function useToggleRadioAutoDJ() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => radioApiClient.toggleAutoDJ(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["radio", "autodj"] });
    },
  });
}
