import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featured_image_url: string | null;
  image_alt: string | null;
  published_at: string | null;
  category: { id: string; name: string; slug: string; color: string } | null;
  author: { id: string; full_name: string; avatar_url: string | null } | null;
  editor_name: string | null;
  view_count: number;
  subtitle: string | null;
  hat: string | null;
}

export function useBlogPosts(limit?: number) {
  return useQuery({
    queryKey: ['blog-posts', limit],
    queryFn: async () => {
      let query = supabase
        .from('news')
        .select(`
          id, title, slug, excerpt, content, featured_image_url, image_alt,
          published_at, editor_name, view_count, subtitle, hat, author_id,
          category:categories(id, name, slug, color)
        `)
        .eq('status', 'published')
        .eq('is_blog', true)
        .is('deleted_at', null)
        .order('published_at', { ascending: false });

      if (limit) query = query.limit(limit);

      const { data, error } = await query;
      if (error) throw error;

      // Enrich with author data
      const authorIds = [...new Set((data || []).map(d => d.author_id).filter(Boolean))];
      let authorsMap = new Map();
      if (authorIds.length > 0) {
        const { data: authors } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', authorIds);
        if (authors) {
          authors.forEach(a => authorsMap.set(a.id, a));
        }
      }

      return (data || []).map(item => ({
        ...item,
        author: item.author_id ? authorsMap.get(item.author_id) || null : null,
      })) as BlogPost[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useBlogPostBySlug(slug: string) {
  return useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news')
        .select(`
          *,
          category:categories(id, name, slug, color)
        `)
        .eq('slug', slug)
        .eq('is_blog', true)
        .eq('status', 'published')
        .is('deleted_at', null)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      let author = null;
      if (data.author_id) {
        const { data: authorData } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, bio')
          .eq('id', data.author_id)
          .maybeSingle();
        author = authorData;
      }

      return { ...data, author } as any;
    },
    enabled: !!slug,
  });
}
