import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SyndicationSource {
  id: string;
  tenant_id: string | null;
  name: string;
  feed_url: string;
  feed_type: "rss" | "atom" | "json";
  is_active: boolean;
  auto_import: boolean;
  require_approval: boolean;
  category_mapping: Record<string, string>;
  default_category_id: string | null;
  last_fetched_at: string | null;
  last_item_count: number;
  error_count: number;
  last_error: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSyndicationSourceInput {
  name: string;
  feed_url: string;
  feed_type?: "rss" | "atom" | "json";
  is_active?: boolean;
  auto_import?: boolean;
  require_approval?: boolean;
  default_category_id?: string;
}

export interface UpdateSyndicationSourceInput {
  id: string;
  updates: Partial<Omit<SyndicationSource, "id" | "created_at" | "updated_at">>;
}

export function useSyndicationSources() {
  return useQuery({
    queryKey: ["syndication-sources"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("syndication_sources")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as SyndicationSource[];
    },
  });
}

export function useCreateSyndicationSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateSyndicationSourceInput) => {
      const { data, error } = await supabase
        .from("syndication_sources")
        .insert({
          name: input.name,
          feed_url: input.feed_url,
          feed_type: input.feed_type || "rss",
          is_active: input.is_active ?? true,
          auto_import: input.auto_import ?? false,
          require_approval: input.require_approval ?? true,
          default_category_id: input.default_category_id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["syndication-sources"] });
      toast.success("Fonte RSS adicionada com sucesso");
    },
    onError: (error) => {
      console.error("Error creating syndication source:", error);
      toast.error("Erro ao adicionar fonte RSS");
    },
  });
}

export function useUpdateSyndicationSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: UpdateSyndicationSourceInput) => {
      const { data, error } = await supabase
        .from("syndication_sources")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["syndication-sources"] });
      toast.success("Fonte atualizada");
    },
    onError: (error) => {
      console.error("Error updating syndication source:", error);
      toast.error("Erro ao atualizar fonte");
    },
  });
}

export function useDeleteSyndicationSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("syndication_sources")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["syndication-sources"] });
      toast.success("Fonte removida");
    },
    onError: (error) => {
      console.error("Error deleting syndication source:", error);
      toast.error("Erro ao remover fonte");
    },
  });
}

export function useTestSyndicationFeed() {
  return useMutation({
    mutationFn: async (feedUrl: string) => {
      const { data, error } = await supabase.functions.invoke("fetch-syndication-feed", {
        body: { feed_url: feedUrl, test_only: true },
      });

      if (error) throw error;
      return data;
    },
    onError: (error) => {
      console.error("Error testing feed:", error);
      toast.error("Erro ao testar feed RSS");
    },
  });
}
