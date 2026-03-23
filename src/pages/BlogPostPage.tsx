import { useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useBlogPostBySlug } from '@/hooks/useBlogPosts';
import { ShareButtons } from '@/components/news/ShareButtons';
import { RelatedNews } from '@/components/news/RelatedNews';
import { useRelatedNews } from '@/hooks/useNews';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, Calendar, User, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import DOMPurify from 'dompurify';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, error } = useBlogPostBySlug(slug || '');
  const { data: related } = useRelatedNews(
    post?.id || '',
    post?.category_id || '',
    post?.id ? true : false
  );

  // Increment view count
  useEffect(() => {
    if (post?.id) {
      supabase
        .from('news')
        .select('view_count')
        .eq('id', post.id)
        .single()
        .then(({ data }) => {
          if (data) {
            supabase
              .from('news')
              .update({ view_count: (data.view_count || 0) + 1 })
              .eq('id', post.id)
              .then(() => {});
          }
        });
    }
  }, [post?.id]);

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-10 space-y-6">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-96 rounded-xl" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const sanitizedContent = DOMPurify.sanitize(post.content || '');
  const canonicalUrl = `https://conexaonacidade.lovable.app/blog/${post.slug}`;

  return (
    <>
      <Helmet>
        <title>{post.meta_title || post.title} | Blog Conexão na Cidade</title>
        <meta name="description" content={post.meta_description || post.excerpt || ''} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt || ''} />
        <meta property="og:image" content={post.og_image_url || post.featured_image_url || ''} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="article" />
      </Helmet>

      <article className="min-h-screen">
        {/* Back */}
        <div className="container max-w-4xl pt-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/blog" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Blog
            </Link>
          </Button>
        </div>

        {/* Header */}
        <header className="container max-w-4xl py-8">
          {post.hat && (
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
              {post.hat}
            </p>
          )}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4">
            {post.title}
          </h1>
          {post.subtitle && (
            <p className="text-lg md:text-xl text-muted-foreground mb-6">{post.subtitle}</p>
          )}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {post.category && (
              <Badge variant="secondary">{(post.category as any).name}</Badge>
            )}
            {post.published_at && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(post.published_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </span>
            )}
            {(post.editor_name || post.author?.full_name) && (
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {post.editor_name || post.author?.full_name}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {post.view_count || 0} visualizações
            </span>
          </div>
        </header>

        {/* Hero Image */}
        {post.featured_image_url && (
          <div className="container max-w-4xl mb-8">
            <div className="aspect-[16/9] rounded-xl overflow-hidden">
              <img
                src={post.featured_image_url}
                alt={post.image_alt || post.title}
                className="w-full h-full object-cover"
              />
            </div>
            {post.image_credit && (
              <p className="text-xs text-muted-foreground mt-2">Foto: {post.image_credit}</p>
            )}
          </div>
        )}

        {/* Content */}
        <div className="container max-w-4xl mb-10">
          <div
            className="prose prose-lg dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        </div>

        {/* Share */}
        <div className="container max-w-4xl mb-10">
          <div className="border-t border-b py-6">
            <p className="text-sm font-medium text-muted-foreground mb-3">Compartilhar</p>
            <ShareButtons
              url={canonicalUrl}
              title={post.title}
              imageUrl={post.featured_image_url || undefined}
            />
          </div>
        </div>

        {/* Related */}
        {related && related.length > 0 && (
          <div className="container max-w-4xl mb-16">
            <h2 className="text-2xl font-bold mb-6">Leia também</h2>
            <RelatedNews articles={related} />
          </div>
        )}
      </article>
    </>
  );
}
