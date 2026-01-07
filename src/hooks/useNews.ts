import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface NewsItem {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  hat: string | null;
  content: string | null;
  excerpt: string | null;
  featured_image_url: string | null;
  image_alt: string | null;
  image_credit: string | null;
  status: string;
  highlight: string;
  view_count: number;
  published_at: string | null;
  created_at: string;
  category_id: string | null;
  author_id: string | null;
  category?: {
    id: string;
    name: string;
    slug: string;
    color: string;
  } | null;
  author?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    bio: string | null;
  } | null;
  tags?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

export function useNews(limit?: number) {
  return useQuery({
    queryKey: ['news', limit],
    queryFn: async () => {
      let query = supabase
        .from('news')
        .select(`
          *,
          category:categories(id, name, slug, color)
        `)
        .eq('status', 'published')
        .is('deleted_at', null)
        .order('published_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Fetch authors separately
      const newsWithAuthors = await Promise.all(
        (data || []).map(async (item) => {
          let author = null;
          if (item.author_id) {
            const { data: authorData } = await supabase
              .from('profiles')
              .select('id, full_name, avatar_url, bio')
              .eq('id', item.author_id)
              .maybeSingle();
            author = authorData;
          }
          return { ...item, author } as NewsItem;
        })
      );
      
      return newsWithAuthors;
    },
  });
}

export function useNewsById(id: string) {
  return useQuery({
    queryKey: ['news', 'id', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news')
        .select(`
          *,
          category:categories(id, name, slug, color)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      
      // Fetch author separately
      let author = null;
      if (data.author_id) {
        const { data: authorData } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, bio')
          .eq('id', data.author_id)
          .maybeSingle();
        author = authorData;
      }
      
      return { ...data, author } as NewsItem;
    },
    enabled: !!id,
  });
}

export function useNewsBySlug(slug: string) {
  return useQuery({
    queryKey: ['news', 'slug', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news')
        .select(`
          *,
          category:categories(id, name, slug, color)
        `)
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      
      // Fetch author separately
      let author = null;
      if (data.author_id) {
        const { data: authorData } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, bio')
          .eq('id', data.author_id)
          .maybeSingle();
        author = authorData;
      }

      // Fetch tags separately
      const { data: tagsData } = await supabase
        .from('news_tags')
        .select('tag:tags(id, name, slug)')
        .eq('news_id', data.id);

      const tags = tagsData?.map((t) => t.tag).filter(Boolean) || [];
      return { ...data, author, tags } as NewsItem;
    },
    enabled: !!slug,
  });
}

export function useNewsByCategory(categorySlug: string, limit?: number) {
  return useQuery({
    queryKey: ['news', 'category', categorySlug, limit],
    queryFn: async () => {
      // First get category id
      const { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .maybeSingle();

      if (!category) return [];

      let query = supabase
        .from('news')
        .select(`
          *,
          category:categories(id, name, slug, color)
        `)
        .eq('category_id', category.id)
        .eq('status', 'published')
        .is('deleted_at', null)
        .order('published_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Fetch authors separately
      const newsWithAuthors = await Promise.all(
        (data || []).map(async (item) => {
          let author = null;
          if (item.author_id) {
            const { data: authorData } = await supabase
              .from('profiles')
              .select('id, full_name, avatar_url, bio')
              .eq('id', item.author_id)
              .maybeSingle();
            author = authorData;
          }
          return { ...item, author } as NewsItem;
        })
      );
      
      return newsWithAuthors;
    },
    enabled: !!categorySlug,
  });
}

export function useRelatedNews(newsId: string, categoryId: string | null, limit = 4) {
  return useQuery({
    queryKey: ['news', 'related', newsId, categoryId, limit],
    queryFn: async () => {
      if (!categoryId) return [];

      const { data, error } = await supabase
        .from('news')
        .select(`
          *,
          category:categories(id, name, slug, color)
        `)
        .eq('category_id', categoryId)
        .eq('status', 'published')
        .is('deleted_at', null)
        .neq('id', newsId)
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as unknown as NewsItem[];
    },
    enabled: !!categoryId,
  });
}

export function useFeaturedNews(limit = 5) {
  return useQuery({
    queryKey: ['news', 'featured', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news')
        .select(`
          *,
          category:categories(id, name, slug, color)
        `)
        .eq('status', 'published')
        .is('deleted_at', null)
        .in('highlight', ['home', 'featured', 'urgent'])
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as unknown as NewsItem[];
    },
  });
}

export async function incrementViewCount(newsId: string) {
  // Simple update without RPC
  await supabase
    .from('news')
    .update({ view_count: 1 }) // This will be handled differently
    .eq('id', newsId);
}
