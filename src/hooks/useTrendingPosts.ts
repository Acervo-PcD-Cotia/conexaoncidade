import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TrendingPost {
  id: string;
  content: string;
  author_id: string;
  like_count: number;
  comment_count: number;
  view_count: number;
  created_at: string;
  engagement_score: number;
  author?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export function useTrendingPosts(limit = 5) {
  return useQuery({
    queryKey: ["trending-posts", limit],
    queryFn: async () => {
      // Get posts from last 7 days
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const { data: posts, error } = await supabase
        .from("community_posts")
        .select(`
          id,
          content,
          author_id,
          like_count,
          comment_count,
          view_count,
          created_at
        `)
        .eq("is_hidden", false)
        .gte("created_at", weekAgo.toISOString())
        .limit(50); // Get more to calculate score

      if (error) throw error;
      if (!posts?.length) return [];

      // Calculate engagement score and sort
      const postsWithScore = posts.map((post) => ({
        ...post,
        engagement_score:
          (post.like_count || 0) * 2 +
          (post.comment_count || 0) * 3 +
          (post.view_count || 0),
      }));

      // Sort by engagement score and take top
      postsWithScore.sort((a, b) => b.engagement_score - a.engagement_score);
      const topPosts = postsWithScore.slice(0, limit);

      // Fetch author profiles
      const authorIds = [...new Set(topPosts.map((p) => p.author_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", authorIds);

      // Merge author info
      const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);
      
      return topPosts.map((post) => ({
        ...post,
        author: profileMap.get(post.author_id) || null,
      })) as TrendingPost[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
