import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PodcastNews {
  id: string;
  title: string;
  slug: string;
  published_at: string | null;
  podcast_status: string | null;
  podcast_audio_url: string | null;
  podcast_generated_at: string | null;
  auto_generate_podcast: boolean;
  auto_publish_podcast: boolean;
  audio_duration_seconds: number | null;
  category: {
    name: string;
    color: string;
  } | null;
}

export interface PodcastLog {
  id: string;
  news_id: string;
  action: string;
  details: string | null;
  created_by: string | null;
  created_at: string;
}

export function usePodcasts(limit = 50) {
  return useQuery({
    queryKey: ["podcasts", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news")
        .select(`
          id,
          title,
          slug,
          published_at,
          podcast_status,
          podcast_audio_url,
          podcast_generated_at,
          auto_generate_podcast,
          auto_publish_podcast,
          audio_duration_seconds,
          category:category_id(name, color)
        `)
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as PodcastNews[];
    },
  });
}

export function usePodcastLogs(newsId: string | null) {
  return useQuery({
    queryKey: ["podcast-logs", newsId],
    queryFn: async () => {
      if (!newsId) return [];
      const { data, error } = await supabase
        .from("podcast_logs")
        .select("*")
        .eq("news_id", newsId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PodcastLog[];
    },
    enabled: !!newsId,
  });
}

export function usePodcastFeeds() {
  return useQuery({
    queryKey: ["podcast-feeds"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("podcast_feeds")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useGeneratePodcast() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newsId: string) => {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-podcast`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ newsId }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Falha ao gerar podcast");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["podcasts"] });
      toast.success("Podcast gerado com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao gerar podcast: ${error.message}`);
    },
  });
}

export function usePublishPodcast() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newsId: string) => {
      const { error } = await supabase
        .from("news")
        .update({ podcast_status: "published" })
        .eq("id", newsId);

      if (error) throw error;

      // Log the action
      await supabase.from("podcast_logs").insert({
        news_id: newsId,
        action: "publish",
        details: "Podcast publicado no feed RSS",
      });

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["podcasts"] });
      toast.success("Podcast publicado no feed RSS!");
    },
    onError: (error) => {
      toast.error(`Erro ao publicar: ${(error as Error).message}`);
    },
  });
}

export function useDeletePodcast() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newsId: string) => {
      const { error } = await supabase
        .from("news")
        .update({
          podcast_status: "not_generated",
          podcast_audio_url: null,
          podcast_generated_at: null,
        })
        .eq("id", newsId);

      if (error) throw error;

      // Log the action
      await supabase.from("podcast_logs").insert({
        news_id: newsId,
        action: "delete",
        details: "Podcast excluído",
      });

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["podcasts"] });
      toast.success("Podcast excluído!");
    },
    onError: (error) => {
      toast.error(`Erro ao excluir: ${(error as Error).message}`);
    },
  });
}

export function useUpdatePodcastSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (feeds: { spotify_url?: string; apple_url?: string; google_url?: string; deezer_url?: string; amazon_url?: string }) => {
      // Update or create the main portal feed
      const { data: existingFeed } = await supabase
        .from("podcast_feeds")
        .select("id")
        .eq("feed_type", "portal")
        .single();

      if (existingFeed) {
        const { error } = await supabase
          .from("podcast_feeds")
          .update({
            spotify_url: feeds.spotify_url,
            apple_url: feeds.apple_url,
            google_url: feeds.google_url,
            deezer_url: feeds.deezer_url,
            amazon_url: feeds.amazon_url,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingFeed.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("podcast_feeds").insert({
          title: "Conexão na Cidade - Podcast",
          description: "Notícias em áudio do portal Conexão na Cidade",
          feed_type: "portal",
          is_active: true,
          spotify_url: feeds.spotify_url,
          apple_url: feeds.apple_url,
          google_url: feeds.google_url,
          deezer_url: feeds.deezer_url,
          amazon_url: feeds.amazon_url,
        });

        if (error) throw error;
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["podcast-feeds"] });
      toast.success("Configurações salvas!");
    },
    onError: (error) => {
      toast.error(`Erro ao salvar: ${(error as Error).message}`);
    },
  });
}
