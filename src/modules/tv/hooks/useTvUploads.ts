import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tvApiClient } from "../apiClient";

export function useTvUploads() {
  return useQuery({
    queryKey: ["tv", "uploads"],
    queryFn: () => tvApiClient.getUploadJobs(),
    refetchInterval: 5000, // Polling para atualizar progresso
    staleTime: 3000,
  });
}

export function useStartTvUpload() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ file, metadata }: { file: File; metadata?: { title?: string; description?: string } }) =>
      tvApiClient.startUpload(file, metadata),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tv", "uploads"] });
    },
  });
}

export function useCancelTvUpload() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => tvApiClient.cancelUpload(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tv", "uploads"] });
    },
  });
}
