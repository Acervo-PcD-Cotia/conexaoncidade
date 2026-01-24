import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface WaitingGuest {
  id: string;
  session_id: string;
  user_id: string | null;
  display_name: string;
  avatar_url: string | null;
  role: string;
  is_on_stage: boolean;
  is_muted: boolean;
  is_camera_off: boolean;
  invite_token: string | null;
  status: "waiting" | "approved" | "rejected" | "invited" | "joined";
  created_at: string;
  joined_at: string | null;
  waitingTime?: number; // Calculated field in seconds
}

export interface UseWaitingGuestsReturn {
  waitingGuests: WaitingGuest[];
  isLoading: boolean;
  approveGuest: (guestId: string) => Promise<void>;
  rejectGuest: (guestId: string, message?: string) => Promise<void>;
  isApproving: boolean;
  isRejecting: boolean;
  newGuestAlert: boolean;
  dismissAlert: () => void;
}

export function useWaitingGuests(sessionId: string): UseWaitingGuestsReturn {
  const queryClient = useQueryClient();
  const [newGuestAlert, setNewGuestAlert] = useState(false);

  // Query waiting guests
  const { data: waitingGuests = [], isLoading } = useQuery({
    queryKey: ["waiting-guests", sessionId],
    queryFn: async () => {
      if (!sessionId) return [];

      const { data, error } = await supabase
        .from("illumina_session_participants")
        .select("*")
        .eq("session_id", sessionId)
        .eq("status", "waiting")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("[useWaitingGuests] Query error:", error);
        throw error;
      }

      // Calculate waiting time for each guest
      const now = Date.now();
      return (data || []).map((guest) => ({
        ...guest,
        status: guest.status as WaitingGuest["status"],
        waitingTime: Math.floor((now - new Date(guest.created_at).getTime()) / 1000),
      }));
    },
    enabled: !!sessionId,
    refetchInterval: 10000, // Refresh every 10s to update waiting times
  });

  // Subscribe to realtime changes
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`waiting-guests-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "illumina_session_participants",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          if (payload.new.status === "waiting") {
            console.log("[useWaitingGuests] New waiting guest:", payload.new);
            setNewGuestAlert(true);
            
            // Play notification sound (optional)
            try {
              const audio = new Audio("/sounds/notification.mp3");
              audio.volume = 0.5;
              audio.play().catch(() => {});
            } catch {}
            
            queryClient.invalidateQueries({ queryKey: ["waiting-guests", sessionId] });
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "illumina_session_participants",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          console.log("[useWaitingGuests] Guest updated:", payload.new);
          queryClient.invalidateQueries({ queryKey: ["waiting-guests", sessionId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, queryClient]);

  // Approve guest mutation
  const approveMutation = useMutation({
    mutationFn: async (guestId: string) => {
      const { error } = await supabase
        .from("illumina_session_participants")
        .update({
          status: "approved",
          joined_at: new Date().toISOString(),
        })
        .eq("id", guestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waiting-guests", sessionId] });
      toast.success("Participante aprovado!");
    },
    onError: (error) => {
      console.error("[useWaitingGuests] Approve error:", error);
      toast.error("Erro ao aprovar participante");
    },
  });

  // Reject guest mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ guestId, message }: { guestId: string; message?: string }) => {
      const { error } = await supabase
        .from("illumina_session_participants")
        .update({
          status: "rejected",
          left_at: new Date().toISOString(),
          // Could store rejection message in lower_third_text temporarily
          lower_third_text: message || null,
        })
        .eq("id", guestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waiting-guests", sessionId] });
      toast.info("Participante rejeitado");
    },
    onError: (error) => {
      console.error("[useWaitingGuests] Reject error:", error);
      toast.error("Erro ao rejeitar participante");
    },
  });

  const approveGuest = useCallback(
    async (guestId: string) => {
      await approveMutation.mutateAsync(guestId);
    },
    [approveMutation]
  );

  const rejectGuest = useCallback(
    async (guestId: string, message?: string) => {
      await rejectMutation.mutateAsync({ guestId, message });
    },
    [rejectMutation]
  );

  const dismissAlert = useCallback(() => {
    setNewGuestAlert(false);
  }, []);

  return {
    waitingGuests,
    isLoading,
    approveGuest,
    rejectGuest,
    isApproving: approveMutation.isPending,
    isRejecting: rejectMutation.isPending,
    newGuestAlert,
    dismissAlert,
  };
}
