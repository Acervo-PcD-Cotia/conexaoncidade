import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CommunityNotification {
  id: string;
  user_id: string;
  type: "new_post" | "mention" | "reply" | "like";
  title: string;
  body: string | null;
  reference_id: string | null;
  reference_type: "post" | "comment" | null;
  actor_id: string | null;
  is_read: boolean;
  created_at: string;
  actor?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export function useNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [realtimeEnabled, setRealtimeEnabled] = useState(false);

  // Fetch notifications
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["community-notifications", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("community_notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      // Fetch actor profiles
      const actorIds = [...new Set(data.map((n) => n.actor_id).filter(Boolean))];
      if (actorIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", actorIds);

        const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);
        return data.map((n) => ({
          ...n,
          actor: n.actor_id ? profileMap.get(n.actor_id) || null : null,
        })) as CommunityNotification[];
      }

      return data as CommunityNotification[];
    },
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Realtime subscription
  useEffect(() => {
    if (!user || realtimeEnabled) return;

    const channel = supabase
      .channel("community-notifications-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "community_notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("New notification:", payload);
          queryClient.invalidateQueries({
            queryKey: ["community-notifications", user.id],
          });
        }
      )
      .subscribe();

    setRealtimeEnabled(true);

    return () => {
      supabase.removeChannel(channel);
      setRealtimeEnabled(false);
    };
  }, [user, queryClient, realtimeEnabled]);

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("community_notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["community-notifications", user?.id],
      });
    },
  });

  // Mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;

      const { error } = await supabase
        .from("community_notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["community-notifications", user?.id],
      });
    },
  });

  // Delete notification
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("community_notifications")
        .delete()
        .eq("id", notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["community-notifications", user?.id],
      });
    },
  });

  const unreadCount = notifications?.filter((n) => !n.is_read).length || 0;

  return {
    notifications: notifications || [],
    isLoading,
    unreadCount,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate,
  };
}
