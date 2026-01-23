import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tvApiClient } from "../apiClient";
import type { TvScheduleItem } from "../types";

export function useTvSchedule() {
  return useQuery({
    queryKey: ["tv", "schedule"],
    queryFn: () => tvApiClient.getSchedule(),
    staleTime: 30000,
  });
}

export function useTvScheduleItem(id: string) {
  return useQuery({
    queryKey: ["tv", "schedule", id],
    queryFn: () => tvApiClient.getScheduleItem(id),
    enabled: !!id,
    staleTime: 30000,
  });
}

export function useCreateTvScheduleItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<TvScheduleItem>) => tvApiClient.createScheduleItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tv", "schedule"] });
    },
  });
}

export function useUpdateTvScheduleItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TvScheduleItem> }) =>
      tvApiClient.updateScheduleItem(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tv", "schedule"] });
      queryClient.invalidateQueries({ queryKey: ["tv", "schedule", variables.id] });
    },
  });
}

export function useDeleteTvScheduleItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => tvApiClient.deleteScheduleItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tv", "schedule"] });
    },
  });
}
