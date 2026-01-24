import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type StreamPlatform = "youtube" | "facebook" | "twitch" | "instagram" | "rtmp";
export type StreamStatus = "idle" | "connecting" | "live" | "error" | "ended";

export interface StreamDestination {
  id: string;
  platform: StreamPlatform;
  name: string;
  rtmp_url: string;
  stream_key: string;
  is_enabled: boolean;
  status: StreamStatus;
  egress_id?: string;
  viewers?: number;
  started_at?: string;
  error_message?: string;
}

export interface UseConexaoStreamingOptions {
  sessionId: string;
  teamId?: string;
  onStreamStart?: (destinations: string[]) => void;
  onStreamStop?: () => void;
  onError?: (error: string) => void;
}

export function useConexaoStreaming(options: UseConexaoStreamingOptions) {
  const { sessionId, teamId, onStreamStart, onStreamStop, onError } = options;
  const queryClient = useQueryClient();
  
  const [destinationStatus, setDestinationStatus] = useState<Record<string, StreamStatus>>({});

  // Fetch configured destinations from illumina_destinations table
  const { data: destinations, isLoading, refetch } = useQuery({
    queryKey: ["streaming-destinations", sessionId, teamId],
    queryFn: async (): Promise<StreamDestination[]> => {
      // If no teamId, return empty array
      if (!teamId) {
        return [];
      }
      
      // Query illumina_destinations table with proper filters
      const { data, error } = await supabase
        .from("illumina_destinations")
        .select("*")
        .eq("team_id", teamId)
        .eq("is_enabled", true);
      
      if (error) {
        console.error("[Streaming] Fetch destinations error:", error);
        throw error;
      }
      
      // Map database records to StreamDestination interface
      return (data || []).map((d) => ({
        id: d.id,
        platform: d.type as StreamPlatform,
        name: d.name || d.type,
        rtmp_url: d.rtmp_url || "",
        stream_key: d.stream_key_encrypted || "",
        is_enabled: d.is_enabled ?? true,
        status: destinationStatus[d.id] || "idle",
        egress_id: undefined,
        viewers: 0,
        started_at: undefined,
        error_message: undefined,
      }));
    },
    refetchInterval: 10000,
    enabled: !!teamId,
  });

  // Active destinations (enabled ones)
  const activeDestinations = useMemo(() => {
    return destinations?.filter(d => d.is_enabled) || [];
  }, [destinations]);

  // Check if any destination is streaming
  const isStreaming = useMemo(() => {
    return Object.values(destinationStatus).some(s => s === "live");
  }, [destinationStatus]);

  // Start streaming mutation
  const startMutation = useMutation({
    mutationFn: async (destinationIds: string[]) => {
      // Update status for each destination
      const newStatus: Record<string, StreamStatus> = {};
      destinationIds.forEach(id => {
        newStatus[id] = "connecting";
      });
      setDestinationStatus(prev => ({ ...prev, ...newStatus }));
      
      const response = await supabase.functions.invoke("conexao-stream-start", {
        body: { 
          session_id: sessionId,
          destination_ids: destinationIds,
        },
      });
      
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: (data, destinationIds) => {
      // Update status to live
      const newStatus: Record<string, StreamStatus> = {};
      destinationIds.forEach(id => {
        newStatus[id] = "live";
      });
      setDestinationStatus(prev => ({ ...prev, ...newStatus }));
      
      toast.success(`Streaming iniciado em ${destinationIds.length} destino(s)`);
      onStreamStart?.(destinationIds);
      
      queryClient.invalidateQueries({ queryKey: ["streaming-destinations", sessionId, teamId] });
    },
    onError: (error, destinationIds) => {
      console.error("[Streaming] Start error:", error);
      
      // Update status to error
      const newStatus: Record<string, StreamStatus> = {};
      destinationIds.forEach(id => {
        newStatus[id] = "error";
      });
      setDestinationStatus(prev => ({ ...prev, ...newStatus }));
      
      toast.error("Erro ao iniciar streaming");
      onError?.(error.message);
    },
  });

  // Stop streaming mutation
  const stopMutation = useMutation({
    mutationFn: async (destinationIds?: string[]) => {
      const idsToStop = destinationIds || Object.keys(destinationStatus).filter(
        id => destinationStatus[id] === "live"
      );
      
      const response = await supabase.functions.invoke("conexao-stream-stop", {
        body: { 
          session_id: sessionId,
          destination_ids: idsToStop,
        },
      });
      
      if (response.error) throw new Error(response.error.message);
      return { ...response.data, stoppedIds: idsToStop };
    },
    onSuccess: (data) => {
      // Update status to ended
      const newStatus: Record<string, StreamStatus> = {};
      data.stoppedIds.forEach((id: string) => {
        newStatus[id] = "ended";
      });
      setDestinationStatus(prev => ({ ...prev, ...newStatus }));
      
      toast.success("Streaming encerrado");
      onStreamStop?.();
      
      queryClient.invalidateQueries({ queryKey: ["streaming-destinations", sessionId, teamId] });
    },
    onError: (error) => {
      console.error("[Streaming] Stop error:", error);
      toast.error("Erro ao parar streaming");
      onError?.(error.message);
    },
  });

  // Add new destination
  const addDestinationMutation = useMutation({
    mutationFn: async (destination: {
      platform: StreamPlatform;
      name: string;
      rtmp_url: string;
      stream_key: string;
    }) => {
      if (!teamId) {
        throw new Error("Team ID is required to add destination");
      }
      
      const { data, error } = await supabase
        .from("illumina_destinations")
        .insert({
          team_id: teamId,
          type: destination.platform,
          name: destination.name,
          rtmp_url: destination.rtmp_url,
          stream_key_encrypted: destination.stream_key,
          is_enabled: true,
          is_connected: false,
          connection_status: "disconnected",
        })
        .select()
        .single();
      
      if (error) {
        console.error("[Streaming] Add destination error:", error);
        throw error;
      }
      
      toast.success(`Destino "${destination.name}" adicionado`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["streaming-destinations", sessionId, teamId] });
    },
    onError: () => {
      toast.error("Erro ao adicionar destino");
    },
  });

  // Remove destination
  const removeDestinationMutation = useMutation({
    mutationFn: async (destinationId: string) => {
      // Stop if currently streaming
      if (destinationStatus[destinationId] === "live") {
        await stopMutation.mutateAsync([destinationId]);
      }
      
      // Soft delete by disabling
      const { error } = await supabase
        .from("illumina_destinations")
        .update({ is_enabled: false })
        .eq("id", destinationId);
      
      if (error) {
        console.error("[Streaming] Remove destination error:", error);
        throw error;
      }
      
      toast.success("Destino removido");
      return destinationId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["streaming-destinations", sessionId, teamId] });
    },
  });

  // Toggle destination enabled state
  const toggleDestination = useCallback(async (destinationId: string, enabled: boolean) => {
    const { error } = await supabase
      .from("illumina_destinations")
      .update({ is_enabled: enabled })
      .eq("id", destinationId);
    
    if (error) {
      console.error("[Streaming] Toggle destination error:", error);
      toast.error("Erro ao alterar destino");
      return;
    }
    
    queryClient.invalidateQueries({ queryKey: ["streaming-destinations", sessionId, teamId] });
  }, [queryClient, sessionId, teamId]);

  // Get platform icon color
  const getPlatformColor = useCallback((platform: StreamPlatform) => {
    switch (platform) {
      case "youtube": return "text-red-500";
      case "facebook": return "text-blue-600";
      case "twitch": return "text-purple-500";
      case "instagram": return "text-pink-500";
      case "rtmp": return "text-gray-500";
      default: return "text-muted-foreground";
    }
  }, []);

  return {
    // State
    destinations: destinations || [],
    activeDestinations,
    destinationStatus,
    isStreaming,
    isLoading,
    
    // Mutations state
    isStarting: startMutation.isPending,
    isStopping: stopMutation.isPending,
    isAdding: addDestinationMutation.isPending,
    isRemoving: removeDestinationMutation.isPending,
    
    // Actions
    startStreaming: (destinationIds: string[]) => startMutation.mutate(destinationIds),
    stopStreaming: (destinationIds?: string[]) => stopMutation.mutate(destinationIds),
    startAllStreaming: () => startMutation.mutate(activeDestinations.map(d => d.id)),
    stopAllStreaming: () => stopMutation.mutate(undefined),
    
    // Destination management
    addDestination: (destination: { platform: StreamPlatform; name: string; rtmp_url: string; stream_key: string }) => addDestinationMutation.mutate(destination),
    removeDestination: (id: string) => removeDestinationMutation.mutate(id),
    toggleDestination,
    refetchDestinations: refetch,
    
    // Helpers
    getPlatformColor,
    getDestinationStatus: (id: string) => destinationStatus[id] || "idle",
    
    // Reset state
    reset: useCallback(() => {
      setDestinationStatus({});
    }, []),
  };
}
