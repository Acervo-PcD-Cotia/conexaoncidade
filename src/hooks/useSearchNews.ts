import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { NewsItem } from './useNews';

interface SearchParams {
  term?: string;
  tagSlug?: string;
  categorySlug?: string;
  limit?: number;
}

export function useSearchNews({ term, tagSlug, categorySlug, limit = 50 }: SearchParams) {
  return useQuery({
    queryKey: ['news', 'search', term, tagSlug, categorySlug, limit],
    queryFn: async () => {
      // If searching by tag
      if (tagSlug) {
        // First get the tag
        const { data: tag } = await supabase
          .from('tags')
          .select('id, name')
          .eq('slug', tagSlug)
          .maybeSingle();

        if (!tag) return { news: [], tag: null, term: null };

        // Get news IDs with this tag
        const { data: newsTagsData } = await supabase
          .from('news_tags')
          .select('news_id')
          .eq('tag_id', tag.id);

        if (!newsTagsData || newsTagsData.length === 0) {
          return { news: [], tag, term: null };
        }

        const newsIds = newsTagsData.map(nt => nt.news_id);

        // Get the news
        const { data: newsData, error } = await supabase
          .from('news')
          .select(`
            *,
            category:categories(id, name, slug, color)
          `)
          .in('id', newsIds)
          .eq('status', 'published')
          .is('deleted_at', null)
          .order('published_at', { ascending: false })
          .limit(limit);

        if (error) throw error;

        return { 
          news: (newsData || []) as unknown as NewsItem[], 
          tag, 
          term: null 
        };
      }

      // If searching by term
      if (term && term.trim().length >= 2) {
        const searchTerm = term.trim();
        
        let query = supabase
          .from('news')
          .select(`
            *,
            category:categories(id, name, slug, color)
          `)
          .eq('status', 'published')
          .is('deleted_at', null)
          .or(`title.ilike.%${searchTerm}%,excerpt.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
          .order('published_at', { ascending: false })
          .limit(limit);

        if (categorySlug) {
          const { data: category } = await supabase
            .from('categories')
            .select('id')
            .eq('slug', categorySlug)
            .maybeSingle();

          if (category) {
            query = query.eq('category_id', category.id);
          }
        }

        const { data, error } = await query;

        if (error) throw error;

        return { 
          news: (data || []) as unknown as NewsItem[], 
          tag: null, 
          term: searchTerm 
        };
      }

      // No search criteria
      return { news: [], tag: null, term: null };
    },
    enabled: !!(term && term.trim().length >= 2) || !!tagSlug,
  });
}
