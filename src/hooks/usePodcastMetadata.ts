import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PodcastFeedMetadata {
  id: string;
  feed_type: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  author_id: string | null;
  itunes_category: string | null;
  itunes_subcategory: string | null;
  explicit: boolean;
  owner_name: string | null;
  owner_email: string | null;
  language: string;
  copyright: string | null;
  spotify_url: string | null;
  apple_url: string | null;
  google_url: string | null;
  deezer_url: string | null;
  amazon_url: string | null;
}

export interface ManualPodcastEpisode {
  id: string;
  feed_id: string;
  title: string;
  description: string | null;
  audio_url: string;
  duration_seconds: number | null;
  file_size_bytes: number | null;
  published_at: string;
  is_published: boolean;
  episode_number: number | null;
  season_number: number | null;
  episode_type: "full" | "trailer" | "bonus";
}

// iTunes categories for podcast feeds
export const ITUNES_CATEGORIES = [
  "Arts",
  "Business",
  "Comedy",
  "Education",
  "Fiction",
  "Government",
  "Health & Fitness",
  "History",
  "Kids & Family",
  "Leisure",
  "Music",
  "News",
  "Religion & Spirituality",
  "Science",
  "Society & Culture",
  "Sports",
  "Technology",
  "True Crime",
  "TV & Film",
];

export function usePodcastFeedMetadata(feedId?: string) {
  return useQuery({
    queryKey: ["podcast-feed-metadata", feedId],
    queryFn: async () => {
      if (!feedId) return null;

      const { data, error } = await supabase
        .from("podcast_feeds")
        .select("*")
        .eq("id", feedId)
        .single();

      if (error) throw error;
      return data as PodcastFeedMetadata;
    },
    enabled: !!feedId,
  });
}

export function useUpdatePodcastMetadata() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      feedId,
      metadata,
    }: {
      feedId: string;
      metadata: Partial<PodcastFeedMetadata>;
    }) => {
      const { data, error } = await supabase
        .from("podcast_feeds")
        .update(metadata)
        .eq("id", feedId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["podcast-feed-metadata", variables.feedId] });
      queryClient.invalidateQueries({ queryKey: ["podcast-feeds"] });
      toast.success("Metadados do podcast atualizados");
    },
    onError: (error) => {
      console.error("Error updating podcast metadata:", error);
      toast.error("Erro ao atualizar metadados");
    },
  });
}

export function useManualPodcastEpisodes(feedId?: string) {
  return useQuery({
    queryKey: ["podcast-manual-episodes", feedId],
    queryFn: async () => {
      if (!feedId) return [];

      const { data, error } = await supabase
        .from("podcast_manual_episodes")
        .select("*")
        .eq("feed_id", feedId)
        .order("published_at", { ascending: false });

      if (error) throw error;
      return data as ManualPodcastEpisode[];
    },
    enabled: !!feedId,
  });
}

export function useUploadPodcastEpisode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      feedId,
      title,
      description,
      episodeNumber,
      seasonNumber,
      episodeType = "full",
    }: {
      file: File;
      feedId: string;
      title: string;
      description?: string;
      episodeNumber?: number;
      seasonNumber?: number;
      episodeType?: "full" | "trailer" | "bonus";
    }) => {
      // Upload to storage
      const fileExt = file.name.split(".").pop();
      const fileName = `manual/${feedId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("podcast-audio")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Store storage path (not public URL) since bucket is now private
      // Create episode record with storage path
      const { data: user } = await supabase.auth.getUser();

      const { data, error: insertError } = await supabase
        .from("podcast_manual_episodes")
        .insert({
          feed_id: feedId,
          title,
          description: description || null,
          audio_url: fileName, // Store the storage path, not public URL
          file_size_bytes: file.size,
          episode_number: episodeNumber || null,
          season_number: seasonNumber || null,
          episode_type: episodeType,
          created_by: user.user?.id,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["podcast-manual-episodes", variables.feedId] });
      toast.success("Episódio enviado com sucesso");
    },
    onError: (error) => {
      console.error("Error uploading podcast episode:", error);
      toast.error("Erro ao enviar episódio");
    },
  });
}

export function useDeletePodcastEpisode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ episodeId, feedId }: { episodeId: string; feedId: string }) => {
      const { error } = await supabase
        .from("podcast_manual_episodes")
        .delete()
        .eq("id", episodeId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["podcast-manual-episodes", variables.feedId] });
      toast.success("Episódio removido");
    },
    onError: (error) => {
      console.error("Error deleting podcast episode:", error);
      toast.error("Erro ao remover episódio");
    },
  });
}

export function useToggleEpisodePublished() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      episodeId, 
      feedId, 
      isPublished 
    }: { 
      episodeId: string; 
      feedId: string;
      isPublished: boolean;
    }) => {
      const { error } = await supabase
        .from("podcast_manual_episodes")
        .update({ is_published: isPublished })
        .eq("id", episodeId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["podcast-manual-episodes", variables.feedId] });
      toast.success(variables.isPublished ? "Episódio publicado" : "Episódio despublicado");
    },
    onError: (error) => {
      console.error("Error toggling episode published:", error);
      toast.error("Erro ao atualizar episódio");
    },
  });
}
