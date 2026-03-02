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
  editor_id: string | null;
  editor_name: string | null;
  audio_url: string | null;
  audio_status: string | null;
  audio_duration_seconds: number | null;
  summary_short: string | null;
  summary_medium: string | null;
  ai_summary_bullets: string[] | null;
  ai_summary_generated_at: string | null;
  transcript_text?: string | null;
  podcast_enabled?: boolean | null;
  podcast_status?: string | null;
  podcast_audio_url?: string | null;
  spotify_url?: string | null;
  updated_at_display?: string | null;
  meta_title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
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

// ── Batch helpers ──────────────────────────────────────────────
// Fetch all authors for a list of news items in a single query
async function batchFetchAuthors(items: any[]) {
  try {
    const authorIds = [...new Set(items.map(n => n.author_id).filter(Boolean))];
    if (authorIds.length === 0) return new Map();

    const { data: authors, error } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, bio')
      .in('id', authorIds);

    if (error) {
      console.warn('[useNews] Erro ao buscar autores (não-bloqueante):', error.message);
      return new Map();
    }

    return new Map((authors || []).map(a => [a.id, a]));
  } catch (err) {
    console.warn('[useNews] Falha ao buscar autores:', err);
    return new Map();
  }
}

// Fetch all tags for a list of news items in a single query
async function batchFetchTags(items: any[]) {
  try {
    const newsIds = items.map(n => n.id);
    if (newsIds.length === 0) return new Map<string, any[]>();

    const { data: allTags, error } = await supabase
      .from('news_tags')
      .select('news_id, tag:tags(id, name, slug)')
      .in('news_id', newsIds);

    if (error) {
      console.warn('[useNews] Erro ao buscar tags (não-bloqueante):', error.message);
      return new Map<string, any[]>();
    }

    const tagsMap = new Map<string, any[]>();
    (allTags || []).forEach((t: any) => {
      if (!t.tag) return;
      if (!tagsMap.has(t.news_id)) tagsMap.set(t.news_id, []);
      tagsMap.get(t.news_id)!.push(t.tag);
    });
    return tagsMap;
  } catch (err) {
    console.warn('[useNews] Falha ao buscar tags:', err);
    return new Map<string, any[]>();
  }
}

// Enrich news items with batch-fetched authors and tags
async function enrichNewsItems(items: any[], opts?: { authors?: boolean; tags?: boolean }): Promise<NewsItem[]> {
  const fetchAuthors = opts?.authors !== false;
  const fetchTags = opts?.tags !== false;

  const [authorsMap, tagsMap] = await Promise.all([
    fetchAuthors ? batchFetchAuthors(items) : Promise.resolve(new Map()),
    fetchTags ? batchFetchTags(items) : Promise.resolve(new Map<string, any[]>()),
  ]);

  return items.map(item => ({
    ...item,
    author: fetchAuthors ? (authorsMap.get(item.author_id) || null) : null,
    tags: fetchTags ? (tagsMap.get(item.id) || []) : [],
  })) as NewsItem[];
}

// ── Hooks ──────────────────────────────────────────────────────
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

      return enrichNewsItems(data || []);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
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
      
      // Fetch author and editor in parallel
      const [authorResult, editorResult, tagsResult] = await Promise.all([
        data.author_id
          ? supabase.from('profiles').select('id, full_name, avatar_url, bio').eq('id', data.author_id).maybeSingle()
          : Promise.resolve({ data: null, error: null }),
        data.editor_id
          ? supabase.from('profiles').select('id, full_name').eq('id', data.editor_id).maybeSingle()
          : Promise.resolve({ data: null, error: null }),
        supabase.from('news_tags').select('tag:tags(id, name, slug)').eq('news_id', data.id),
      ]);

      if (authorResult.error) console.warn('[useNewsBySlug] Erro ao buscar autor:', authorResult.error);
      if (editorResult.error) console.warn('[useNewsBySlug] Erro ao buscar editor:', editorResult.error);
      if (tagsResult.error) console.warn('[useNewsBySlug] Erro ao buscar tags:', tagsResult.error);

      const tags = (tagsResult.data || []).map((t: any) => t.tag).filter(Boolean);
      return { ...data, author: authorResult.data, editor: editorResult.data, tags } as NewsItem;
    },
    enabled: !!slug,
  });
}

export function useNewsByCategory(categorySlug: string, limit?: number) {
  return useQuery({
    queryKey: ['news', 'category', categorySlug, limit],
    queryFn: async () => {
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

      return enrichNewsItems(data || []);
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
      let results: any[] = [];

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
            .select(`*, category:categories(id, name, slug, color)`)
            .in('id', uniqueIds)
            .eq('status', 'published')
            .is('deleted_at', null)
            .order('published_at', { ascending: false })
            .limit(limit);

          if (taggedNews) results = taggedNews;
        }
      }

      // 2. Fill with category news
      if (results.length < limit && categoryId) {
        const existingIds = results.map(r => r.id);
        const needed = limit - results.length;

        const { data: categoryNews } = await supabase
          .from('news')
          .select(`*, category:categories(id, name, slug, color)`)
          .eq('category_id', categoryId)
          .eq('status', 'published')
          .is('deleted_at', null)
          .neq('id', newsId)
          .not('id', 'in', `(${existingIds.join(',') || 'null'})`)
          .order('published_at', { ascending: false })
          .limit(needed);

        if (categoryNews) results = [...results, ...categoryNews];
      }

      // 3. Fill with latest news
      if (results.length < limit) {
        const existingIds = results.map(r => r.id);
        const needed = limit - results.length;

        const { data: latestNews } = await supabase
          .from('news')
          .select(`*, category:categories(id, name, slug, color)`)
          .eq('status', 'published')
          .is('deleted_at', null)
          .neq('id', newsId)
          .not('id', 'in', `(${existingIds.join(',') || 'null'})`)
          .order('published_at', { ascending: false })
          .limit(needed);

        if (latestNews) results = [...results, ...latestNews];
      }

      const enriched = await enrichNewsItems(results.slice(0, limit), { authors: false });
      return enriched;
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
          category:categories(id, name, slug, color)
        `)
        .eq('status', 'published')
        .is('deleted_at', null)
        .or('is_home_highlight.eq.true,is_urgent.eq.true,is_featured.eq.true,highlight.in.(home,featured,urgent)')
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return enrichNewsItems(data || [], { authors: false });
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
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
          category:categories(id, name, slug, color)
        `)
        .eq('status', 'published')
        .is('deleted_at', null)
        .order('view_count', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return enrichNewsItems(data || [], { authors: false });
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
  });
}

export async function incrementViewCount(newsId: string) {
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
