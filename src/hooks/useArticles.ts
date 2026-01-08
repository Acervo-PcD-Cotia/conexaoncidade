import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Article {
  id: string;
  site_id: string;
  news_id: string | null;
  title: string;
  slug: string;
  summary: string | null;
  content_html: string | null;
  author_name: string | null;
  category: string | null;
  tags: string[];
  hero_image_url: string | null;
  published_at: string | null;
  status: string;
  canonical_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArticleVersion {
  id: string;
  article_id: string;
  site_id: string;
  kind: 'original' | 'imported' | 'rewritten' | 'edited';
  content_html: string | null;
  created_by: string | null;
  created_at: string;
  style_profile_id: string | null;
  style_version_id: string | null;
  rewrite_engine: string | null;
  rewrite_prompt_hash: string | null;
}

// Fetch articles for a site
export function useArticles(siteId: string | undefined, status?: string) {
  return useQuery({
    queryKey: ['articles', siteId, status],
    queryFn: async () => {
      if (!siteId) return [];
      
      let query = supabase
        .from('articles')
        .select('*')
        .eq('site_id', siteId)
        .order('created_at', { ascending: false });
      
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query.limit(100);
      
      if (error) throw error;
      return data as Article[];
    },
    enabled: !!siteId,
  });
}

// Fetch single article
export function useArticle(articleId: string | undefined) {
  return useQuery({
    queryKey: ['articles', articleId],
    queryFn: async () => {
      if (!articleId) return null;
      
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', articleId)
        .single();
      
      if (error) throw error;
      return data as Article;
    },
    enabled: !!articleId,
  });
}

// Fetch article versions
export function useArticleVersions(articleId: string | undefined) {
  return useQuery({
    queryKey: ['article-versions', articleId],
    queryFn: async () => {
      if (!articleId) return [];
      
      const { data, error } = await supabase
        .from('article_versions')
        .select('*')
        .eq('article_id', articleId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ArticleVersion[];
    },
    enabled: !!articleId,
  });
}

// Create article from news
export function useCreateArticleFromNews() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ 
      siteId, 
      newsId,
      title,
      slug,
      summary,
      content_html,
      author_name,
      category,
      tags,
      hero_image_url,
      canonical_url,
    }: { 
      siteId: string;
      newsId: string;
      title: string;
      slug: string;
      summary?: string | null;
      content_html?: string | null;
      author_name?: string | null;
      category?: string | null;
      tags?: string[];
      hero_image_url?: string | null;
      canonical_url?: string | null;
    }) => {
      const { data, error } = await supabase
        .from('articles')
        .insert({
          site_id: siteId,
          news_id: newsId,
          title,
          slug,
          summary,
          content_html,
          author_name,
          category,
          tags: tags || [],
          hero_image_url,
          canonical_url,
          status: 'draft',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      toast({ title: 'Artigo criado!' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar artigo',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Update article
export function useUpdateArticle() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      ...data 
    }: { 
      id: string;
      title?: string;
      slug?: string;
      summary?: string | null;
      content_html?: string | null;
      status?: string;
      published_at?: string | null;
    }) => {
      const { data: result, error } = await supabase
        .from('articles')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['articles', data.id] });
      toast({ title: 'Artigo atualizado!' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar artigo',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Create article version
export function useCreateArticleVersion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      articleId, 
      siteId,
      kind,
      content_html,
      created_by,
      style_profile_id,
      style_version_id,
      rewrite_engine,
    }: { 
      articleId: string;
      siteId: string;
      kind: 'original' | 'imported' | 'rewritten' | 'edited';
      content_html: string | null;
      created_by?: string;
      style_profile_id?: string;
      style_version_id?: string;
      rewrite_engine?: string;
    }) => {
      const { data, error } = await supabase
        .from('article_versions')
        .insert({
          article_id: articleId,
          site_id: siteId,
          kind,
          content_html,
          created_by,
          style_profile_id,
          style_version_id,
          rewrite_engine,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['article-versions', data.article_id] });
    },
  });
}
