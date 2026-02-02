import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ContentFixStats } from "../types";

export function useContentFixStats() {
  return useQuery({
    queryKey: ["content-fix-stats"],
    queryFn: async (): Promise<ContentFixStats> => {
      // Count news without valid images
      const { count: missingImages } = await supabase
        .from("news")
        .select("*", { count: "exact", head: true })
        .eq("status", "published")
        .or("featured_image_url.is.null,featured_image_url.eq.");

      // Count news with placeholder images (invalid)
      const { count: invalidImages } = await supabase
        .from("news")
        .select("*", { count: "exact", head: true })
        .eq("status", "published")
        .like("featured_image_url", "%_0001%");

      // Count news with future dates
      const { count: futureDates } = await supabase
        .from("news")
        .select("*", { count: "exact", head: true })
        .eq("status", "published")
        .gt("published_at", new Date().toISOString());

      // Count news missing original_published_at
      const { count: missingOriginalDate } = await supabase
        .from("news")
        .select("*", { count: "exact", head: true })
        .eq("status", "published")
        .is("original_published_at", null)
        .not("source", "is", null);

      // Count news missing source
      const { count: missingSource } = await supabase
        .from("news")
        .select("*", { count: "exact", head: true })
        .eq("status", "published")
        .is("source", null);

      // Count news missing category
      const { count: missingCategory } = await supabase
        .from("news")
        .select("*", { count: "exact", head: true })
        .eq("status", "published")
        .is("category_id", null);

      return {
        missingImages: (missingImages || 0),
        invalidImages: (invalidImages || 0),
        futureDates: (futureDates || 0),
        missingOriginalDate: (missingOriginalDate || 0),
        missingSource: (missingSource || 0),
        missingCategory: (missingCategory || 0),
      };
    },
    refetchInterval: 30000,
  });
}
