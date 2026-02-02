import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { NewsWithIssue, IssueType } from "../types";

interface UseNewsWithIssuesOptions {
  issueType: IssueType | "all";
  categoryId?: string;
  limit?: number;
}

export function useNewsWithIssues({
  issueType,
  categoryId,
  limit = 100,
}: UseNewsWithIssuesOptions) {
  return useQuery({
    queryKey: ["news-with-issues", issueType, categoryId, limit],
    queryFn: async (): Promise<NewsWithIssue[]> => {
      let query = supabase
        .from("news")
        .select(`
          id,
          title,
          slug,
          featured_image_url,
          og_image_url,
          card_image_url,
          published_at,
          original_published_at,
          source,
          category_id,
          status,
          created_at,
          category:categories(id, name, slug)
        `)
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(limit);

      // Apply issue-specific filters
      switch (issueType) {
        case "missing_image":
          query = query.or("featured_image_url.is.null,featured_image_url.eq.");
          break;
        case "invalid_image":
          query = query.like("featured_image_url", "%_0001%");
          break;
        case "future_date":
          query = query.gt("published_at", new Date().toISOString());
          break;
        case "missing_original_date":
          query = query.is("original_published_at", null).not("source", "is", null);
          break;
        case "missing_source":
          query = query.is("source", null);
          break;
        case "missing_category":
          query = query.is("category_id", null);
          break;
      }

      // Apply category filter if provided
      if (categoryId) {
        query = query.eq("category_id", categoryId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data || []) as NewsWithIssue[];
    },
  });
}
