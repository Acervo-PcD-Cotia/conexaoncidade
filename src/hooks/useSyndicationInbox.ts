import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type SyndicationInboxStatus = "inbox" | "approved" | "rejected" | "published";

export interface SyndicationInboxItem {
  id: string;
  source_id: string;
  tenant_id: string | null;
  external_id: string;
  title: string;
  excerpt: string | null;
  content_html: string | null;
  featured_image_url: string | null;
  author_name: string | null;
  original_url: string;
  pub_date: string | null;
  status: SyndicationInboxStatus;
  target_news_id: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  // Joined data
  source?: {
    name: string;
    feed_url: string;
  };
}

export function useSyndicationInbox(status?: SyndicationInboxStatus) {
  return useQuery({
    queryKey: ["syndication-inbox", status],
    queryFn: async () => {
      let query = supabase
        .from("syndication_inbox")
        .select(`
          *,
          source:syndication_sources(name, feed_url)
        `)
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;
      return data as SyndicationInboxItem[];
    },
  });
}

export function useApproveInboxItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, createDraft = true }: { id: string; createDraft?: boolean }) => {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("syndication_inbox")
        .update({
          status: "approved",
          reviewed_by: user.user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // If createDraft is true, we could also create a news draft here
      // For now, we just mark as approved
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["syndication-inbox"] });
      toast.success("Item aprovado");
    },
    onError: (error) => {
      console.error("Error approving inbox item:", error);
      toast.error("Erro ao aprovar item");
    },
  });
}

export function useRejectInboxItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("syndication_inbox")
        .update({
          status: "rejected",
          reviewed_by: user.user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["syndication-inbox"] });
      toast.success("Item rejeitado");
    },
    onError: (error) => {
      console.error("Error rejecting inbox item:", error);
      toast.error("Erro ao rejeitar item");
    },
  });
}

export function useBulkApproveInboxItems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { data: user } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("syndication_inbox")
        .update({
          status: "approved",
          reviewed_by: user.user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .in("id", ids);

      if (error) throw error;
    },
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: ["syndication-inbox"] });
      toast.success(`${ids.length} itens aprovados`);
    },
    onError: (error) => {
      console.error("Error bulk approving inbox items:", error);
      toast.error("Erro ao aprovar itens");
    },
  });
}

export function useBulkRejectInboxItems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { data: user } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("syndication_inbox")
        .update({
          status: "rejected",
          reviewed_by: user.user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .in("id", ids);

      if (error) throw error;
    },
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: ["syndication-inbox"] });
      toast.success(`${ids.length} itens rejeitados`);
    },
    onError: (error) => {
      console.error("Error bulk rejecting inbox items:", error);
      toast.error("Erro ao rejeitar itens");
    },
  });
}
