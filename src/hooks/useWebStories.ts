import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface WebStory {
  id: string;
  title: string;
  slug: string;
  cover_image_url: string | null;
  status: "draft" | "published" | "archived";
  published_at: string | null;
  author_id: string | null;
  view_count: number;
}

export interface WebStorySlide {
  id: string;
  story_id: string;
  sort_order: number;
  background_image_url: string | null;
  background_color: string | null;
  content_html: string | null;
  duration_seconds: number | null;
  animation_type: string | null;
  cta_text: string | null;
  cta_url: string | null;
}

export interface WebStoryWithSlides extends WebStory {
  slides: WebStorySlide[];
}

export function useWebStories(limit = 10) {
  return useQuery({
    queryKey: ["web-stories", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("web_stories")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as WebStory[];
    },
  });
}

export function useStoryBySlug(slug: string) {
  return useQuery({
    queryKey: ["web-story", slug],
    queryFn: async () => {
      const { data: story, error: storyError } = await supabase
        .from("web_stories")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single();

      if (storyError) throw storyError;

      const { data: slides, error: slidesError } = await supabase
        .from("web_story_slides")
        .select("*")
        .eq("story_id", story.id)
        .order("sort_order", { ascending: true });

      if (slidesError) throw slidesError;

      return {
        ...story,
        slides: slides || [],
      } as WebStoryWithSlides;
    },
    enabled: !!slug,
  });
}

export function useStorySlides(storyId: string) {
  return useQuery({
    queryKey: ["web-story-slides", storyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("web_story_slides")
        .select("*")
        .eq("story_id", storyId)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as WebStorySlide[];
    },
    enabled: !!storyId,
  });
}

export async function incrementStoryViewCount(storyId: string) {
  // Update view count directly instead of using RPC
  const { error } = await supabase
    .from("web_stories")
    .update({ view_count: supabase.rpc ? undefined : undefined })
    .eq("id", storyId);
  
  // Alternative: fetch current count and increment
  if (error) {
    const { data } = await supabase
      .from("web_stories")
      .select("view_count")
      .eq("id", storyId)
      .single();
    
    if (data) {
      await supabase
        .from("web_stories")
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq("id", storyId);
    }
  }
}
