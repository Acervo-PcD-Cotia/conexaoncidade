import { useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useNewsBySlug, useRelatedNews } from '@/hooks/useNews';
import { ShareButtons } from '@/components/news/ShareButtons';
import { AuthorCard } from '@/components/news/AuthorCard';
import { RelatedNews } from '@/components/news/RelatedNews';
import { NewsAudioBlock } from '@/components/news/NewsAudioBlock';
import { NewsSummaryBlock } from '@/components/news/NewsSummaryBlock';
import { NewsTableOfContents } from '@/components/news/NewsTableOfContents';
import { ReadingProgressBar } from '@/components/news/ReadingProgressBar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, Eye, Calendar, ArrowLeft, MapPin, RefreshCw, Printer } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useReadingTracker } from '@/hooks/useReadingTracker';
import { useAuth } from '@/contexts/AuthContext';

function calculateReadTime(content: string | null): number {
  if (!content) return 1;
  const wordsPerMinute = 200;
  const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

function countWords(content: string | null): number {
  if (!content) return 0;
  return content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
}

export default function NewsDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { data: news, isLoading, error } = useNewsBySlug(slug || '');
  
  // Get tag IDs for better related news selection
  const tagIds = useMemo(() => news?.tags?.map(t => t.id) || [], [news?.tags]);
  
  const { data: relatedNews = [] } = useRelatedNews(
    news?.id || '',
    news?.category_id || null,
    6,
    tagIds
  );

  // Reading tracker for gamification
  const { trackScroll, progress, isCompleted } = useReadingTracker({
    contentType: 'news',
    contentId: news?.id || '',
    minimumTimeSeconds: 45,
    completionThreshold: 85
  });

  // Track scroll progress
  const handleScroll = useCallback(() => {
    if (!news?.id) return;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight > 0) {
      const scrollPercent = (scrollTop / docHeight) * 100;
      trackScroll(scrollPercent);
    }
  }, [news?.id, trackScroll]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

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
  const wordCount = countWords(news.content);
  const authorInitials = news.author?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'RD';

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const metaDescription = news.meta_description || news.summary_short || news.excerpt || news.subtitle || '';
  const ogImage = news.og_image_url || news.featured_image_url || '';

  // Schema.org NewsArticle for SEO
  const schemaOrg: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": news.title,
    "description": metaDescription,
    "image": ogImage,
    "datePublished": news.published_at || "",
    "dateModified": news.updated_at_display || news.updated_at || news.published_at || "",
    "wordCount": wordCount,
    "isAccessibleForFree": true,
    "author": {
      "@type": "Person",
      "name": news.author?.full_name || "Redação"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Conexão na Cidade",
      "logo": {
        "@type": "ImageObject",
        "url": "https://conexaonacidade.com.br/favicon.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": currentUrl
    }
  };

  // Add AudioObject if audio exists
  if (news.audio_url && news.audio_status === 'ready') {
    schemaOrg["audio"] = {
      "@type": "AudioObject",
      "contentUrl": news.audio_url,
      "duration": news.audio_duration_seconds ? `PT${Math.floor(news.audio_duration_seconds / 60)}M${news.audio_duration_seconds % 60}S` : undefined,
      "encodingFormat": "audio/mpeg"
    };
  }

  // Add PodcastEpisode if podcast enabled
  if (news.podcast_enabled && news.audio_url) {
    schemaOrg["@type"] = ["NewsArticle", "PodcastEpisode"];
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Reading Progress Bar */}
      <ReadingProgressBar isCompleted={isCompleted} showCompletionBadge={!!user} />

      {/* SEO Meta Tags */}
      <Helmet>
        <title>{news.meta_title || news.title} | Conexão na Cidade</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={currentUrl} />
        
        {/* Open Graph */}
        <meta property="og:title" content={news.title} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={currentUrl} />
        <meta property="article:published_time" content={news.published_at || ''} />
        {news.updated_at_display && (
          <meta property="article:modified_time" content={news.updated_at_display} />
        )}
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={news.title} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={ogImage} />
      </Helmet>

      {/* Schema.org JSON-LD */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
      />
      
      {/* Skip Link for Accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-20 focus:left-4 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded"
      >
        Pular para o conteúdo
      </a>

      <article 
        className="container max-w-4xl py-8"
        role="article"
        aria-labelledby="news-title"
      >
        {/* Breadcrumb Navigation */}
        <nav 
          className="flex items-center gap-2 text-sm text-muted-foreground mb-6"
          aria-label="Navegação estrutural"
        >
          <Link to="/" className="hover:text-primary transition-colors">
            Início
          </Link>
          <span aria-hidden="true">/</span>
          {news.category && (
            <>
              <Link
                to={`/categoria/${news.category.slug}`}
                className="hover:text-primary transition-colors"
              >
                {news.category.name}
              </Link>
              <span aria-hidden="true">/</span>
            </>
          )}
          <span className="text-foreground line-clamp-1">{news.title}</span>
        </nav>

        {/* Article Header - Padrão Agência Brasil */}
        <header className="mb-8 text-center">
          {/* Chapéu (Categoria) - Centralizado, discreto */}
          <div className="mb-6">
            {news.category ? (
              <Link 
                to={`/categoria/${news.category.slug}`}
                className="inline-block text-xs text-muted-foreground uppercase tracking-widest bg-muted/50 px-4 py-1.5 rounded hover:bg-muted transition-colors"
              >
                {news.category.name}
              </Link>
            ) : news.hat && (
              <span className="inline-block text-xs text-muted-foreground uppercase tracking-widest bg-muted/50 px-4 py-1.5 rounded">
                {news.hat.slice(0, 19)}
              </span>
            )}
          </div>

          {/* Título (H1) - Grande, limpo */}
          <h1 
            id="news-title"
            className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold font-heading leading-tight mb-5"
          >
            {news.title}
          </h1>

          {/* Subtítulo / Linha Fina - Cinza, explicativo */}
          {news.subtitle && (
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-6 max-w-3xl mx-auto">
              {news.subtitle}
            </p>
          )}

          {/* Metadados - Linha única, sem ícones grandes */}
          <div className="text-sm text-muted-foreground border-t border-b border-border py-4 mb-6">
            <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
              <span className="font-medium text-foreground">
                Por {news.author?.full_name || 'Redação'}
              </span>
              <span className="text-muted-foreground/50">—</span>
              <span>Repórter do Conexão na Cidade</span>
              
              {news.published_at && (
                <>
                  <span className="text-muted-foreground/50">|</span>
                  <time dateTime={news.published_at}>
                    {format(new Date(news.published_at), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR })}
                  </time>
                </>
              )}
              
              {news.source && (
                <>
                  <span className="text-muted-foreground/50">|</span>
                  <span>{news.source}</span>
                </>
              )}
            </p>
            
            {/* Linha secundária: tempo de leitura e visualizações */}
            <p className="flex items-center justify-center gap-3 mt-2 text-xs text-muted-foreground/70">
              <span>{readTime} min de leitura</span>
              <span className="text-muted-foreground/30">•</span>
              <span>{news.view_count.toLocaleString('pt-BR')} visualizações</span>
              {news.updated_at_display && (
                <>
                  <span className="text-muted-foreground/30">•</span>
                  <span>
                    Atualizado {formatDistanceToNow(new Date(news.updated_at_display), { addSuffix: true, locale: ptBR })}
                  </span>
                </>
              )}
            </p>
          </div>
        </header>

        {/* Hero Image - Sem arredondamento, estilo Agência Brasil */}
        {news.featured_image_url && (
          <figure className="mb-6">
            <img
              src={news.featured_image_url}
              alt={news.image_alt || `Imagem da notícia: ${news.title}`}
              className="w-full object-cover aspect-video"
              loading="eager"
              fetchPriority="high"
            />
            {(news.image_alt || news.image_credit) && (
              <figcaption className="text-xs text-muted-foreground mt-2 px-1">
                {news.image_alt && <span>{news.image_alt}</span>}
                {news.image_alt && news.image_credit && <span> — </span>}
                {news.image_credit && <span className="italic">Foto: {news.image_credit}</span>}
              </figcaption>
            )}
          </figure>
        )}

        {/* Audio Block */}
        <NewsAudioBlock
          newsId={news.id}
          audioUrl={news.audio_url}
          audioStatus={news.audio_status}
          audioDuration={news.audio_duration_seconds}
          transcriptText={news.transcript_text}
          contentHtml={news.content}
          className="mb-6"
        />

        {/* Summary Block */}
        <NewsSummaryBlock
          summaryShort={news.summary_short}
          summaryMedium={news.summary_medium}
          keyPoints={news.ai_summary_bullets}
          generatedAt={news.ai_summary_generated_at}
          className="mb-6"
        />

        {/* Table of Contents - Oculto visualmente, mantido para acessibilidade */}
        {news.content && (
          <NewsTableOfContents 
            contentHtml={news.content} 
            className="sr-only"
          />
        )}

        {/* Main Content */}
        <section 
          id="main-content"
          aria-label="Conteúdo da matéria"
        >
          {news.content && (
            <div
              className="prose-news text-lg mb-10"
              dangerouslySetInnerHTML={{ __html: news.content }}
            />
          )}
        </section>

        {/* Article Footer - Estilo institucional */}
        <footer className="border-t pt-6 mt-10 space-y-4" aria-label="Informações adicionais">
          {/* Tags - discretas */}
          {news.tags && news.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground">Tags:</span>
              {news.tags.map((tag, index) => (
                <span key={tag.id}>
                  <Link
                    to={`/busca?tag=${tag.slug}`}
                    className="text-primary hover:underline"
                  >
                    {tag.name}
                  </Link>
                  {index < news.tags.length - 1 && <span className="text-muted-foreground">, </span>}
                </span>
              ))}
            </div>
          )}

          {/* Share - linha simples */}
          <div className="flex items-center gap-3 pt-2">
            <ShareButtons url={currentUrl} title={news.title} />
          </div>
        </footer>

        {/* Author Card */}
        {news.author && (
          <div className="mt-10">
            <AuthorCard author={news.author} />
          </div>
        )}

        {/* Related News */}
        <nav aria-label="Notícias relacionadas" className="mt-12">
          <RelatedNews news={relatedNews} />
        </nav>
      </article>
    </>
  );
}
