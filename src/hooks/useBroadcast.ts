import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface BroadcastChannel {
  id: string;
  tenant_id: string | null;
  name: string;
  slug: string;
  type: "radio" | "tv";
  description: string | null;
  cover_image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BroadcastProgram {
  id: string;
  tenant_id: string | null;
  channel_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  host_name: string | null;
  host_user_id: string | null;
  category: string | null;
  default_day_of_week: number | null;
  default_start_time: string | null;
  default_duration_minutes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  channel?: BroadcastChannel;
}

export interface Broadcast {
  id: string;
  tenant_id: string | null;
  program_id: string | null;
  channel_id: string | null;
  title: string;
  slug: string;
  description: string | null;
  type: "live" | "scheduled" | "replay" | "playlist";
  status: "scheduled" | "live" | "ended" | "cancelled";
  scheduled_start: string | null;
  scheduled_end: string | null;
  actual_start: string | null;
  actual_end: string | null;
  livekit_room_name: string | null;
  livekit_room_id: string | null;
  recording_url: string | null;
  podcast_url: string | null;
  thumbnail_url: string | null;
  viewer_count: number;
  peak_viewers: number;
  total_views: number;
  category_id: string | null;
  news_id: string | null;
  is_featured: boolean;
  has_captions: boolean;
  allow_chat: boolean;
  is_public: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  program?: BroadcastProgram;
  channel?: BroadcastChannel;
}

export interface BroadcastSchedule {
  id: string;
  tenant_id: string | null;
  channel_id: string | null;
  program_id: string | null;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_live: boolean;
  is_recurring: boolean;
  fallback_content_url: string | null;
  fallback_content_type: string | null;
  created_at: string;
  updated_at: string;
  program?: BroadcastProgram;
  channel?: BroadcastChannel;
}

export interface BroadcastChatMessage {
  id: string;
  broadcast_id: string | null;
  user_id: string | null;
  user_name: string;
  user_avatar_url: string | null;
  message: string;
  is_pinned: boolean;
  is_deleted: boolean;
  deleted_by: string | null;
  created_at: string;
}

// Fetch active channels
export function useChannels() {
  return useQuery({
    queryKey: ["broadcast-channels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("broadcast_channels")
        .select("*")
        .eq("is_active", true)
        .order("name");
      
      if (error) throw error;
      return data as BroadcastChannel[];
    },
  });
}

// Fetch programs
export function usePrograms(channelId?: string) {
  return useQuery({
    queryKey: ["broadcast-programs", channelId],
    queryFn: async () => {
      let query = supabase
        .from("broadcast_programs")
        .select("*, channel:broadcast_channels(*)")
        .eq("is_active", true)
        .order("name");
      
      if (channelId) {
        query = query.eq("channel_id", channelId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as BroadcastProgram[];
    },
  });
}

// Fetch live broadcasts
export function useLiveBroadcasts() {
  return useQuery({
    queryKey: ["broadcasts-live"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("broadcasts")
        .select("*, program:broadcast_programs(*), channel:broadcast_channels(*)")
        .eq("status", "live")
        .eq("is_public", true)
        .order("actual_start", { ascending: false });
      
      if (error) throw error;
      return data as Broadcast[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

// Fetch upcoming broadcasts
export function useUpcomingBroadcasts(limit = 10) {
  return useQuery({
    queryKey: ["broadcasts-upcoming", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("broadcasts")
        .select("*, program:broadcast_programs(*), channel:broadcast_channels(*)")
        .eq("status", "scheduled")
        .eq("is_public", true)
        .gte("scheduled_start", new Date().toISOString())
        .order("scheduled_start")
        .limit(limit);
      
      if (error) throw error;
      return data as Broadcast[];
    },
  });
}

// Fetch broadcast by slug
export function useBroadcastBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ["broadcast", slug],
    queryFn: async () => {
      if (!slug) return null;
      
      const { data, error } = await supabase
        .from("broadcasts")
        .select("*, program:broadcast_programs(*), channel:broadcast_channels(*)")
        .eq("slug", slug)
        .single();
      
      if (error) throw error;
      return data as Broadcast;
    },
    enabled: !!slug,
  });
}

// Fetch archived broadcasts (replays)
export function useArchivedBroadcasts(channelType?: "radio" | "tv", limit = 20) {
  return useQuery({
    queryKey: ["broadcasts-archived", channelType, limit],
    queryFn: async () => {
      let query = supabase
        .from("broadcasts")
        .select("*, program:broadcast_programs(*), channel:broadcast_channels(*)")
        .eq("status", "ended")
        .eq("is_public", true)
        .not("recording_url", "is", null)
        .order("actual_end", { ascending: false })
        .limit(limit);
      
      // Filter by channel type if specified
      if (channelType) {
        query = query.eq("channel.type", channelType);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Broadcast[];
    },
  });
}

// Fetch weekly schedule
export function useWeeklySchedule() {
  return useQuery({
    queryKey: ["broadcast-schedule"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("broadcast_schedule")
        .select("*, program:broadcast_programs(*), channel:broadcast_channels(*)")
        .order("day_of_week")
        .order("start_time");
      
      if (error) throw error;
      return data as BroadcastSchedule[];
    },
  });
}

// Fetch chat messages for a broadcast
export function useBroadcastChat(broadcastId: string | undefined) {
  return useQuery({
    queryKey: ["broadcast-chat", broadcastId],
    queryFn: async () => {
      if (!broadcastId) return [];
      
      const { data, error } = await supabase
        .from("broadcast_chat_messages")
        .select("*")
        .eq("broadcast_id", broadcastId)
        .eq("is_deleted", false)
        .order("created_at", { ascending: true })
        .limit(100);
      
      if (error) throw error;
      return data as BroadcastChatMessage[];
    },
    enabled: !!broadcastId,
  });
}

// Send chat message
export function useSendChatMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ broadcastId, message, userName, userAvatarUrl }: {
      broadcastId: string;
      message: string;
      userName: string;
      userAvatarUrl?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("broadcast_chat_messages")
        .insert({
          broadcast_id: broadcastId,
          user_id: user?.id,
          user_name: userName,
          user_avatar_url: userAvatarUrl,
          message,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["broadcast-chat", variables.broadcastId] });
    },
    onError: (error) => {
      toast.error("Erro ao enviar mensagem");
      console.error("Chat message error:", error);
    },
  });
}

// Track viewer analytics
export function useTrackViewer() {
  return useMutation({
    mutationFn: async ({ broadcastId, sessionId, deviceType, platform }: {
      broadcastId: string;
      sessionId: string;
      deviceType?: string;
      platform?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("broadcast_analytics")
        .insert({
          broadcast_id: broadcastId,
          user_id: user?.id,
          session_id: sessionId,
          device_type: deviceType,
          platform,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
  });
}

// Update viewer left
export function useUpdateViewerLeft() {
  return useMutation({
    mutationFn: async ({ analyticsId, watchDuration }: {
      analyticsId: string;
      watchDuration: number;
    }) => {
      const { error } = await supabase
        .from("broadcast_analytics")
        .update({
          left_at: new Date().toISOString(),
          watch_duration_seconds: watchDuration,
        })
        .eq("id", analyticsId);
      
      if (error) throw error;
    },
  });
}

// Admin: Create/update broadcast
export function useCreateBroadcast() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (broadcast: Partial<Broadcast>) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Build insert object with proper typing
      const insertData = {
        title: broadcast.title || "",
        slug: broadcast.slug || "",
        channel_id: broadcast.channel_id,
        program_id: broadcast.program_id,
        description: broadcast.description,
        type: broadcast.type,
        status: broadcast.status,
        scheduled_start: broadcast.scheduled_start,
        scheduled_end: broadcast.scheduled_end,
        thumbnail_url: broadcast.thumbnail_url,
        category_id: broadcast.category_id,
        news_id: broadcast.news_id,
        is_featured: broadcast.is_featured,
        has_captions: broadcast.has_captions,
        allow_chat: broadcast.allow_chat,
        is_public: broadcast.is_public,
        created_by: user?.id,
      };
      
      const { data, error } = await supabase
        .from("broadcasts")
        .insert(insertData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["broadcasts"] });
      toast.success("Transmissão criada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar transmissão");
      console.error("Create broadcast error:", error);
    },
  });
}

export function useUpdateBroadcast() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Broadcast> & { id: string }) => {
      const { data, error } = await supabase
        .from("broadcasts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["broadcasts"] });
      queryClient.invalidateQueries({ queryKey: ["broadcast", data.slug] });
      toast.success("Transmissão atualizada!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar transmissão");
      console.error("Update broadcast error:", error);
    },
  });
}

// Get current live broadcast for a channel type
export function useCurrentLive(channelType: "radio" | "tv") {
  return useQuery({
    queryKey: ["current-live", channelType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("broadcasts")
        .select("*, program:broadcast_programs(*), channel:broadcast_channels!inner(*)")
        .eq("status", "live")
        .eq("is_public", true)
        .eq("channel.type", channelType)
        .order("actual_start", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data as Broadcast | null;
    },
    refetchInterval: 15000,
  });
}

// Admin: Pin/unpin chat message
export function usePinMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ messageId, isPinned }: { messageId: string; isPinned: boolean }) => {
      const { error } = await supabase
        .from("broadcast_chat_messages")
        .update({ is_pinned: isPinned })
        .eq("id", messageId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["broadcast-chat"] });
      toast.success("Mensagem atualizada");
    },
    onError: () => {
      toast.error("Erro ao atualizar mensagem");
    },
  });
}

// Admin: Delete chat message (soft delete)
export function useDeleteChatMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (messageId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("broadcast_chat_messages")
        .update({ 
          is_deleted: true,
          deleted_by: user?.id 
        })
        .eq("id", messageId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["broadcast-chat"] });
      toast.success("Mensagem removida");
    },
    onError: () => {
      toast.error("Erro ao remover mensagem");
    },
  });
}

// Fetch all broadcasts for admin list
export function useAllBroadcasts(status?: string) {
  return useQuery({
    queryKey: ["broadcasts-admin", status],
    queryFn: async () => {
      let query = supabase
        .from("broadcasts")
        .select("*, program:broadcast_programs(*), channel:broadcast_channels(*)")
        .order("created_at", { ascending: false });
      
      if (status && status !== "all") {
        query = query.eq("status", status);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Broadcast[];
    },
  });
}

// Fetch broadcast by ID
export function useBroadcastById(id: string | undefined) {
  return useQuery({
    queryKey: ["broadcast-by-id", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("broadcasts")
        .select("*, program:broadcast_programs(*), channel:broadcast_channels(*)")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data as Broadcast;
    },
    enabled: !!id,
  });
}

// Delete broadcast
export function useDeleteBroadcast() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("broadcasts")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["broadcasts"] });
      queryClient.invalidateQueries({ queryKey: ["broadcasts-admin"] });
      toast.success("Transmissão excluída");
    },
    onError: () => {
      toast.error("Erro ao excluir transmissão");
    },
  });
}
