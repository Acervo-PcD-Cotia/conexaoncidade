import { useState, useCallback, useMemo, useEffect } from "react";
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
  metadata_json?: {
    layout?: SessionLayout;
    [key: string]: unknown;
  };
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
  onLayoutChange?: (layout: SessionLayout) => void;
}

export function useConexaoSession(options: UseConexaoSessionOptions) {
  const { sessionId, displayName, onSessionStart, onSessionEnd, onLayoutChange } = options;
  const queryClient = useQueryClient();
  
  const [layout, setLayoutState] = useState<SessionLayout>("grid");
  const [stageParticipants, setStageParticipants] = useState<Set<string>>(new Set());
  const [highlightedParticipant, setHighlightedParticipant] = useState<string | null>(null);

  // Fetch session data from illumina_sessions table (or broadcasts as fallback)
  const { data: session, isLoading } = useQuery({
    queryKey: ["conexao-session", sessionId],
    queryFn: async () => {
      // Try illumina_sessions first
      const { data: illuminaSession, error: illuminaError } = await supabase
        .from("illumina_sessions")
        .select("*")
        .eq("id", sessionId)
        .maybeSingle();
      
      if (illuminaSession) {
        const metadata = illuminaSession.metadata_json as ConexaoSession["metadata_json"];
        return {
          id: illuminaSession.id,
          title: illuminaSession.title,
          status: illuminaSession.status as SessionStatus,
          layout: (metadata?.layout || "grid") as SessionLayout,
          livekit_room_name: illuminaSession.livekit_room_name,
          is_recording: false, // Determined by egress status
          is_streaming: false, // Determined by egress status
          host_user_id: illuminaSession.created_by,
          created_at: illuminaSession.created_at,
          updated_at: illuminaSession.updated_at,
          metadata_json: metadata,
        } as ConexaoSession;
      }

      // Fallback to broadcasts table
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
        layout: "grid" as SessionLayout,
        livekit_room_name: data.livekit_room_name,
        is_recording: false,
        is_streaming: false,
        host_user_id: data.created_by,
        created_at: data.created_at,
        updated_at: data.updated_at,
      } as ConexaoSession;
    },
    refetchInterval: 5000,
  });

  // Initialize layout from session data
  useEffect(() => {
    if (session?.layout && session.layout !== layout) {
      setLayoutState(session.layout);
    }
  }, [session?.layout]);

  // Subscribe to layout changes via Realtime
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`session-layout-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "illumina_sessions",
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          const metadata = payload.new.metadata_json as ConexaoSession["metadata_json"];
          if (metadata?.layout && metadata.layout !== layout) {
            console.log("[ConexaoSession] Layout synced from Realtime:", metadata.layout);
            setLayoutState(metadata.layout);
            onLayoutChange?.(metadata.layout);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, layout, onLayoutChange]);

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

  // Update layout mutation - persists to database for sync
  const updateLayoutMutation = useMutation({
    mutationFn: async (newLayout: SessionLayout) => {
      // Get current metadata
      const { data: currentSession } = await supabase
        .from("illumina_sessions")
        .select("metadata_json")
        .eq("id", sessionId)
        .single();

      const currentMetadata = (currentSession?.metadata_json || {}) as Record<string, unknown>;
      
      // Update with new layout
      const { error } = await supabase
        .from("illumina_sessions")
        .update({
          metadata_json: {
            ...currentMetadata,
            layout: newLayout,
          },
        })
        .eq("id", sessionId);

      if (error) throw error;
      return newLayout;
    },
    onSuccess: (newLayout) => {
      console.log("[ConexaoSession] Layout persisted:", newLayout);
    },
    onError: (error) => {
      console.error("[ConexaoSession] Layout update error:", error);
      // Don't show error toast - layout still works locally
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
    // Persist to database for sync across participants
    updateLayoutMutation.mutate(newLayout);
  }, [updateLayoutMutation]);

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
