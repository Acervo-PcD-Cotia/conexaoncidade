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
  updated_at: string | null;
  category_id: string | null;
  author_id: string | null;
  source: string | null;
  // Editor fields
  editor_id: string | null;
  editor_name: string | null;
  // Audio fields
  audio_url: string | null;
  audio_status: string | null;
  audio_duration_seconds: number | null;
  // Summary fields
  summary_short: string | null;
  summary_medium: string | null;
  ai_summary_bullets: string[] | null;
  ai_summary_generated_at: string | null;
  transcript_text?: string | null;
  // Podcast fields
  podcast_enabled?: boolean | null;
  podcast_status?: string | null;
  podcast_audio_url?: string | null;
  spotify_url?: string | null;
  // Display updated timestamp
  updated_at_display?: string | null;
  // Meta fields
  meta_title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
  // Gallery images
  gallery_urls?: string[] | null;
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
  editor?: {
    id: string;
    full_name: string | null;
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
          category:categories!inner(id, name, slug, color, is_active)
        `)
        .eq('status', 'published')
        .is('deleted_at', null)
        .eq('category.is_active', true)
        .order('published_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Fetch authors and tags separately
      const newsWithDetails = await Promise.all(
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
          
          // Fetch tags for city detection
          const { data: tagsData } = await supabase
            .from('news_tags')
            .select('tag:tags(id, name, slug)')
            .eq('news_id', item.id);
          
          const tags = tagsData?.map((t) => t.tag).filter(Boolean) || [];
          
          return { ...item, author, tags } as NewsItem;
        })
      );
      
      return newsWithDetails;
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
        .eq('status', 'published')
        .is('deleted_at', null)
        .maybeSingle();

      if (error) {
        console.error('[useNewsBySlug] Erro ao buscar notícia:', error);
        throw error;
      }
      
      if (!data) {
        console.warn('[useNewsBySlug] Notícia não encontrada para slug:', slug);
        return null;
      }
      
      // Fetch author separately
      let author = null;
      if (data.author_id) {
        const { data: authorData, error: authorError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, bio')
          .eq('id', data.author_id)
          .maybeSingle();
        
        if (authorError) {
          console.warn('[useNewsBySlug] Erro ao buscar autor:', authorError);
        }
        author = authorData;
      }

      // Fetch editor separately
      let editor = null;
      if (data.editor_id) {
        const { data: editorData, error: editorError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('id', data.editor_id)
          .maybeSingle();
        
        if (editorError) {
          console.warn('[useNewsBySlug] Erro ao buscar editor:', editorError);
        }
        editor = editorData;
      }

      // Fetch tags separately
      const { data: tagsData, error: tagsError } = await supabase
        .from('news_tags')
        .select('tag:tags(id, name, slug)')
        .eq('news_id', data.id);

      if (tagsError) {
        console.warn('[useNewsBySlug] Erro ao buscar tags:', tagsError);
      }

      const tags = tagsData?.map((t) => t.tag).filter(Boolean) || [];
      return { ...data, author, editor, tags } as NewsItem;
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
      
      // Fetch authors and tags separately
      const newsWithDetails = await Promise.all(
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
          
          // Fetch tags for city detection
          const { data: tagsData } = await supabase
            .from('news_tags')
            .select('tag:tags(id, name, slug)')
            .eq('news_id', item.id);
          
          const tags = tagsData?.map((t) => t.tag).filter(Boolean) || [];
          
          return { ...item, author, tags } as NewsItem;
        })
      );
      
      return newsWithDetails;
    },
    enabled: !!categorySlug,
  });
}

export function useRelatedNews(
  newsId: string, 
  categoryId: string | null, 
  limit = 4,
  tagIds?: string[]
) {
  return useQuery({
    queryKey: ['news', 'related', newsId, categoryId, tagIds, limit],
    queryFn: async () => {
      // Strategy: Try tags first, then category, then just latest news
      let results: NewsItem[] = [];

      // 1. If we have tags, try to find news with matching tags
      if (tagIds && tagIds.length > 0) {
        const { data: taggedNewsIds } = await supabase
          .from('news_tags')
          .select('news_id')
          .in('tag_id', tagIds)
          .neq('news_id', newsId);

        if (taggedNewsIds && taggedNewsIds.length > 0) {
          const uniqueIds = [...new Set(taggedNewsIds.map(t => t.news_id))];
          
          const { data: taggedNews } = await supabase
            .from('news')
            .select(`
              *,
              category:categories!inner(id, name, slug, color, is_active)
            `)
            .in('id', uniqueIds)
            .eq('status', 'published')
            .is('deleted_at', null)
            .eq('category.is_active', true)
            .order('published_at', { ascending: false })
            .limit(limit);

          if (taggedNews) {
            // Fetch tags for each news item
            const newsWithTags = await Promise.all(
              taggedNews.map(async (item) => {
                const { data: tagsData } = await supabase
                  .from('news_tags')
                  .select('tag:tags(id, name, slug)')
                  .eq('news_id', item.id);
                const tags = tagsData?.map((t) => t.tag).filter(Boolean) || [];
                return { ...item, tags } as NewsItem;
              })
            );
            results = newsWithTags;
          }
        }
      }

      // 2. If not enough from tags, fill with category news
      if (results.length < limit && categoryId) {
        const existingIds = results.map(r => r.id);
        const needed = limit - results.length;

        const { data: categoryNews } = await supabase
          .from('news')
          .select(`
            *,
            category:categories!inner(id, name, slug, color, is_active)
          `)
          .eq('category_id', categoryId)
          .eq('status', 'published')
          .is('deleted_at', null)
          .eq('category.is_active', true)
          .neq('id', newsId)
          .not('id', 'in', `(${existingIds.join(',') || 'null'})`)
          .order('published_at', { ascending: false })
          .limit(needed);

        if (categoryNews) {
          // Fetch tags for each news item
          const newsWithTags = await Promise.all(
            categoryNews.map(async (item) => {
              const { data: tagsData } = await supabase
                .from('news_tags')
                .select('tag:tags(id, name, slug)')
                .eq('news_id', item.id);
              const tags = tagsData?.map((t) => t.tag).filter(Boolean) || [];
              return { ...item, tags } as NewsItem;
            })
          );
          results = [...results, ...newsWithTags];
        }
      }

      // 3. If still not enough, fill with latest news
      if (results.length < limit) {
        const existingIds = results.map(r => r.id);
        const needed = limit - results.length;

        const { data: latestNews } = await supabase
          .from('news')
          .select(`
            *,
            category:categories!inner(id, name, slug, color, is_active)
          `)
          .eq('status', 'published')
          .is('deleted_at', null)
          .eq('category.is_active', true)
          .neq('id', newsId)
          .not('id', 'in', `(${existingIds.join(',') || 'null'})`)
          .order('published_at', { ascending: false })
          .limit(needed);

        if (latestNews) {
          // Fetch tags for each news item
          const newsWithTags = await Promise.all(
            latestNews.map(async (item) => {
              const { data: tagsData } = await supabase
                .from('news_tags')
                .select('tag:tags(id, name, slug)')
                .eq('news_id', item.id);
              const tags = tagsData?.map((t) => t.tag).filter(Boolean) || [];
              return { ...item, tags } as NewsItem;
            })
          );
          results = [...results, ...newsWithTags];
        }
      }

      return results.slice(0, limit);
    },
    enabled: !!newsId,
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
          category:categories!inner(id, name, slug, color, is_active)
        `)
        .eq('status', 'published')
        .is('deleted_at', null)
        .eq('category.is_active', true)
        .or('is_home_highlight.eq.true,is_urgent.eq.true,is_featured.eq.true,highlight.in.(home,featured,urgent)')
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      // Fetch tags for city detection
      const newsWithTags = await Promise.all(
        (data || []).map(async (item) => {
          const { data: tagsData } = await supabase
            .from('news_tags')
            .select('tag:tags(id, name, slug)')
            .eq('news_id', item.id);
          
          const tags = tagsData?.map((t) => t.tag).filter(Boolean) || [];
          return { ...item, tags } as NewsItem;
        })
      );
      
      return newsWithTags;
    },
  });
}

export function useMostReadNews(limit = 10) {
  return useQuery({
    queryKey: ['news', 'most-read', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news')
        .select(`
          *,
          category:categories!inner(id, name, slug, color, is_active)
        `)
        .eq('status', 'published')
        .is('deleted_at', null)
        .eq('category.is_active', true)
        .order('view_count', { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      // Fetch tags for city detection
      const newsWithTags = await Promise.all(
        (data || []).map(async (item) => {
          const { data: tagsData } = await supabase
            .from('news_tags')
            .select('tag:tags(id, name, slug)')
            .eq('news_id', item.id);
          
          const tags = tagsData?.map((t) => t.tag).filter(Boolean) || [];
          return { ...item, tags } as NewsItem;
        })
      );
      
      return newsWithTags;
    },
  });
}

export async function incrementViewCount(newsId: string) {
  // Fetch current count and increment
  const { data } = await supabase
    .from('news')
    .select('view_count')
    .eq('id', newsId)
    .single();

  if (data) {
    await supabase
      .from('news')
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq('id', newsId);
  }
}
