import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLiveKit, LiveKitParticipant } from "./useLiveKit";
import { toast } from "sonner";

export type SessionLayout = "grid" | "spotlight" | "pip" | "audio-only";
export type SessionStatus = "idle" | "starting" | "live" | "ending" | "ended";

export interface ConexaoSession {
  id: string;
  title: string;
  status: SessionStatus;
  layout: SessionLayout;
  livekit_room_name: string | null;
  is_recording: boolean;
  is_streaming: boolean;
  host_user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConexaoParticipant extends LiveKitParticipant {
  isOnStage: boolean;
  isHighlighted: boolean;
  titleLabel?: string;
}

export interface UseConexaoSessionOptions {
  sessionId: string;
  displayName?: string;
  onSessionStart?: () => void;
  onSessionEnd?: () => void;
}

export function useConexaoSession(options: UseConexaoSessionOptions) {
  const { sessionId, displayName, onSessionStart, onSessionEnd } = options;
  const queryClient = useQueryClient();
  
  const [layout, setLayoutState] = useState<SessionLayout>("grid");
  const [stageParticipants, setStageParticipants] = useState<Set<string>>(new Set());
  const [highlightedParticipant, setHighlightedParticipant] = useState<string | null>(null);

  // Fetch session data from broadcasts table
  const { data: session, isLoading } = useQuery({
    queryKey: ["conexao-session", sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("broadcasts")
        .select("*")
        .eq("id", sessionId)
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        title: data.title,
        status: data.status === "live" ? "live" : "idle" as SessionStatus,
        layout: "grid" as SessionLayout, // Default layout
        livekit_room_name: data.livekit_room_name,
        is_recording: false, // Will be updated by egress status
        is_streaming: false, // Will be updated by egress status
        host_user_id: data.created_by,
        created_at: data.created_at,
        updated_at: data.updated_at,
      } as ConexaoSession;
    },
    refetchInterval: 5000, // Refresh every 5s
  });

  // LiveKit connection
  const livekit = useLiveKit({
    broadcastId: sessionId,
    role: "host",
    displayName,
    onConnected: () => {
      console.log("[ConexaoSession] LiveKit connected");
    },
    onDisconnected: () => {
      console.log("[ConexaoSession] LiveKit disconnected");
    },
  });

  // Map LiveKit participants to Conexao participants
  const participants = useMemo<ConexaoParticipant[]>(() => {
    const allParticipants: ConexaoParticipant[] = [];
    
    // Add local participant
    if (livekit.localParticipant) {
      allParticipants.push({
        ...livekit.localParticipant,
        isOnStage: stageParticipants.has(livekit.localParticipant.identity),
        isHighlighted: highlightedParticipant === livekit.localParticipant.identity,
      });
    }
    
    // Add remote participants
    for (const p of livekit.participants) {
      allParticipants.push({
        ...p,
        isOnStage: stageParticipants.has(p.identity),
        isHighlighted: highlightedParticipant === p.identity,
      });
    }
    
    return allParticipants;
  }, [livekit.localParticipant, livekit.participants, stageParticipants, highlightedParticipant]);

  // Start session mutation
  const startSessionMutation = useMutation({
    mutationFn: async () => {
      const response = await supabase.functions.invoke("conexao-session-start", {
        body: { session_id: sessionId },
      });
      
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["conexao-session", sessionId] });
      toast.success("Sessão iniciada!");
      onSessionStart?.();
    },
    onError: (error) => {
      console.error("[ConexaoSession] Start error:", error);
      toast.error("Erro ao iniciar sessão");
    },
  });

  // End session mutation
  const endSessionMutation = useMutation({
    mutationFn: async () => {
      const response = await supabase.functions.invoke("conexao-session-end", {
        body: { session_id: sessionId },
      });
      
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conexao-session", sessionId] });
      livekit.disconnect();
      toast.success("Sessão encerrada!");
      onSessionEnd?.();
    },
    onError: (error) => {
      console.error("[ConexaoSession] End error:", error);
      toast.error("Erro ao encerrar sessão");
    },
  });

  // Actions
  const startSession = useCallback(async () => {
    await startSessionMutation.mutateAsync();
    await livekit.connect();
  }, [startSessionMutation, livekit]);

  const endSession = useCallback(async () => {
    await endSessionMutation.mutateAsync();
  }, [endSessionMutation]);

  const setLayout = useCallback((newLayout: SessionLayout) => {
    setLayoutState(newLayout);
    // Could persist to database if needed
  }, []);

  const moveToStage = useCallback((participantId: string) => {
    setStageParticipants(prev => new Set(prev).add(participantId));
  }, []);

  const moveToBackstage = useCallback((participantId: string) => {
    setStageParticipants(prev => {
      const next = new Set(prev);
      next.delete(participantId);
      return next;
    });
  }, []);

  const highlightParticipant = useCallback((participantId: string | null) => {
    setHighlightedParticipant(participantId);
  }, []);

  const inviteGuest = useCallback(async (email: string, name: string) => {
    const response = await supabase.functions.invoke("conexao-invite-guest", {
      body: { session_id: sessionId, email, name },
    });
    
    if (response.error) {
      toast.error("Erro ao convidar convidado");
      throw new Error(response.error.message);
    }
    
    toast.success(`Convite enviado para ${email}`);
    return response.data;
  }, [sessionId]);

  const removeParticipant = useCallback(async (participantId: string) => {
    // Remove from stage first
    moveToBackstage(participantId);
    
    // Could implement kick via LiveKit API
    toast.info("Participante removido");
  }, [moveToBackstage]);

  return {
    // Session data
    session,
    isLoading,
    isLive: session?.status === "live",
    isRecording: session?.is_recording || false,
    isStreaming: session?.is_streaming || false,
    
    // Layout
    layout,
    setLayout,
    
    // Participants
    participants,
    stageParticipants: participants.filter(p => p.isOnStage),
    backstageParticipants: participants.filter(p => !p.isOnStage),
    highlightedParticipant,
    
    // LiveKit state
    isConnected: livekit.isConnected,
    isConnecting: livekit.isConnecting,
    connectionError: livekit.error,
    
    // Local controls
    toggleCamera: livekit.toggleCamera,
    toggleMicrophone: livekit.toggleMicrophone,
    toggleScreenShare: livekit.toggleScreenShare,
    isCameraEnabled: livekit.isCameraEnabled,
    isMicrophoneEnabled: livekit.isMicrophoneEnabled,
    isScreenShareEnabled: livekit.isScreenShareEnabled,
    
    // Actions
    startSession,
    endSession,
    moveToStage,
    moveToBackstage,
    highlightParticipant,
    inviteGuest,
    removeParticipant,
    connect: livekit.connect,
    disconnect: livekit.disconnect,
    
    // Mutation states
    isStarting: startSessionMutation.isPending,
    isEnding: endSessionMutation.isPending,
  };
}
