import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useNewsBySlug, useRelatedNews } from '@/hooks/useNews';
import { ShareButtons } from '@/components/news/ShareButtons';
import { AuthorCard } from '@/components/news/AuthorCard';
import { RelatedNews } from '@/components/news/RelatedNews';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, Eye, Calendar, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

function calculateReadTime(content: string | null): number {
  if (!content) return 1;
  const wordsPerMinute = 200;
  const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

export default function NewsDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: news, isLoading, error } = useNewsBySlug(slug || '');
  const { data: relatedNews = [] } = useRelatedNews(
    news?.id || '',
    news?.category_id || null,
    4
  );

  // Increment view count on mount
  useEffect(() => {
    if (news?.id) {
      supabase
        .from('news')
        .update({ view_count: (news.view_count || 0) + 1 })
        .eq('id', news.id)
        .then(() => {});
    }
  }, [news?.id]);

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8">
        <Skeleton className="h-8 w-24 mb-4" />
        <Skeleton className="h-12 w-full mb-2" />
        <Skeleton className="h-12 w-3/4 mb-6" />
        <Skeleton className="h-6 w-1/2 mb-8" />
        <Skeleton className="aspect-video w-full mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="container max-w-4xl py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Notícia não encontrada</h1>
        <p className="text-muted-foreground mb-8">
          A notícia que você está procurando não existe ou foi removida.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para a página inicial
        </Link>
      </div>
    );
  }

  const readTime = calculateReadTime(news.content);
  const authorInitials = news.author?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'AU';

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <article className="container max-w-4xl py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link to="/" className="hover:text-primary transition-colors">
          Início
        </Link>
        <span>/</span>
        {news.category && (
          <>
            <Link
              to={`/categoria/${news.category.slug}`}
              className="hover:text-primary transition-colors"
            >
              {news.category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-foreground line-clamp-1">{news.title}</span>
      </nav>

      {/* Category & Hat */}
      <div className="flex items-center gap-3 mb-4">
        {news.category && (
          <Link to={`/categoria/${news.category.slug}`}>
            <Badge
              className="text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: news.category.color }}
            >
              {news.category.name}
            </Badge>
          </Link>
        )}
        {news.hat && (
          <span className="text-sm font-medium text-primary uppercase tracking-wide">
            {news.hat}
          </span>
        )}
      </div>

      {/* Title */}
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading leading-tight mb-4">
        {news.title}
      </h1>

      {/* Subtitle */}
      {news.subtitle && (
        <p className="text-xl text-muted-foreground leading-relaxed mb-6">
          {news.subtitle}
        </p>
      )}

      {/* Meta Info */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b">
        {news.author && (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={news.author.avatar_url || undefined} />
              <AvatarFallback className="text-xs">{authorInitials}</AvatarFallback>
            </Avatar>
            <span className="font-medium text-foreground">
              {news.author.full_name || 'Redação'}
            </span>
          </div>
        )}
        
        {news.published_at && (
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <time dateTime={news.published_at}>
              {format(new Date(news.published_at), "d 'de' MMMM 'de' yyyy", {
                locale: ptBR,
              })}
            </time>
          </div>
        )}

        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <span>{readTime} min de leitura</span>
        </div>

        <div className="flex items-center gap-1">
          <Eye className="h-4 w-4" />
          <span>{news.view_count.toLocaleString()} visualizações</span>
        </div>
      </div>

      {/* Featured Image */}
      {news.featured_image_url && (
        <figure className="mb-8">
          <img
            src={news.featured_image_url}
            alt={news.image_alt || news.title}
            className="w-full rounded-lg object-cover aspect-video"
          />
          {news.image_credit && (
            <figcaption className="text-sm text-muted-foreground mt-2 text-center">
              Foto: {news.image_credit}
            </figcaption>
          )}
        </figure>
      )}

      {/* Content */}
      {news.content && (
        <div
          className="prose-news text-lg mb-8"
          dangerouslySetInnerHTML={{ __html: news.content }}
        />
      )}

      {/* Tags */}
      {news.tags && news.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {news.tags.map((tag) => (
            <Link
              key={tag.id}
              to={`/busca?tag=${tag.slug}`}
              className="bg-muted hover:bg-muted/80 px-3 py-1 rounded-full text-sm transition-colors"
            >
              #{tag.name}
            </Link>
          ))}
        </div>
      )}

      {/* Share Buttons */}
      <div className="mb-8 pb-8 border-b">
        <ShareButtons url={currentUrl} title={news.title} />
      </div>

      {/* Author Card */}
      {news.author && <AuthorCard author={news.author} />}

      {/* Related News */}
      <RelatedNews news={relatedNews} />
    </article>
  );
}
