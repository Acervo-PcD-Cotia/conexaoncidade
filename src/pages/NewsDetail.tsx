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
import { FactCheckCTA } from '@/components/news/FactCheckCTA';
import { PrintButton } from '@/components/news/PrintButton';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useReadingTracker } from '@/hooks/useReadingTracker';
import { useAuth } from '@/contexts/AuthContext';
import { getNewsHeaderColor } from '@/lib/colorUtils';

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
  const { trackScroll, isCompleted } = useReadingTracker({
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
      <div className="min-h-screen">
        <div className="bg-[hsl(217,91%,20%)] py-12">
          <div className="container max-w-4xl text-center">
            <Skeleton className="h-6 w-24 mx-auto mb-4 bg-white/20" />
            <Skeleton className="h-12 w-full mb-2 bg-white/20" />
            <Skeleton className="h-12 w-3/4 mx-auto mb-6 bg-white/20" />
            <Skeleton className="h-6 w-1/2 mx-auto bg-white/20" />
          </div>
        </div>
        <div className="container max-w-4xl py-8">
          <Skeleton className="aspect-video w-full mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
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

  // Dynamic header color based on category
  const headerBgColor = useMemo(() => {
    return getNewsHeaderColor(news.category?.color || null, news.highlight);
  }, [news.category?.color, news.highlight]);

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
        
        {/* Schema.org JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify(schemaOrg)}
        </script>
      </Helmet>
      
      {/* Skip Link for Accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-20 focus:left-4 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded"
      >
        Pular para o conteúdo
      </a>

      <article role="article" aria-labelledby="news-title">
        {/* Print Header - Hidden on screen */}
        <div className="hidden print:block news-header-print">
          <div className="news-category-print">
            {news.category?.name}
          </div>
          <h1 className="news-title-print">{news.title}</h1>
          {news.subtitle && (
            <p className="news-subtitle-print">{news.subtitle}</p>
          )}
          <div className="news-meta-print">
            Por {news.author?.full_name || 'Redação'} | {' '}
            {news.published_at && format(new Date(news.published_at), "dd/MM/yyyy")} | {' '}
            {news.source || 'Conexão na Cidade'}
          </div>
        </div>

        {/* Dark Header - Agência Brasil Style (hidden on print) */}
        <header 
          className="print-hide text-white py-8 md:py-12 transition-colors duration-300"
          style={{ backgroundColor: headerBgColor }}
        >
          <div className="container max-w-4xl text-center">
            {/* Category Badge */}
            {news.category && (
              <Link to={`/categoria/${news.category.slug}`}>
                <Badge
                  className="mb-4 bg-white/20 hover:bg-white/30 text-white border-white/30 text-xs uppercase tracking-widest"
                  variant="outline"
                >
                  {news.category.name}
                </Badge>
              </Link>
            )}

            {/* Title (H1) */}
            <h1 
              id="news-title"
              className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-4 px-4"
            >
              {news.title}
            </h1>

            {/* Subtitle / Linha Fina */}
            {news.subtitle && (
              <p className="text-lg md:text-xl text-white/80 leading-relaxed px-4 max-w-3xl mx-auto">
                {news.subtitle}
              </p>
            )}
          </div>
        </header>

        {/* Author & Metadata Bar */}
        <div className="border-b bg-card">
          <div className="container max-w-4xl py-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Author Info */}
              <div className="space-y-1">
                <p className="font-bold text-foreground uppercase tracking-wide text-sm">
                  {news.author?.full_name || 'Redação'}
                </p>
                {news.published_at && (
                  <p className="text-sm text-muted-foreground">
                    Publicado em {format(new Date(news.published_at), "dd/MM/yyyy '-' HH:mm", { locale: ptBR })}
                  </p>
                )}
                {news.source && (
                  <p className="text-sm text-muted-foreground">
                    {news.source}
                  </p>
                )}
              </div>

              {/* Share Buttons + Print */}
              <div className="flex items-center gap-2 print-hide">
                <ShareButtons 
                  url={currentUrl} 
                  title={news.title} 
                  contentId={news.id}
                  contentType="news"
                  variant="circular"
                />
                <PrintButton />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="container max-w-4xl py-8">
          {/* Hero Image - No Rounded Corners */}
          {news.featured_image_url && (
            <figure className="mb-8 relative">
              <img
                src={news.featured_image_url}
                alt={news.image_alt || `Imagem da notícia: ${news.title}`}
                className="w-full object-cover aspect-video"
                loading="eager"
                fetchPriority="high"
              />
              {/* Credit overlay on image */}
              {news.image_credit && (
                <span className="absolute bottom-0 right-0 bg-black/70 text-white text-xs px-3 py-1.5">
                  {news.image_credit}
                </span>
              )}
              {/* Caption below image */}
              {news.image_alt && (
                <figcaption className="text-sm text-muted-foreground mt-3 italic">
                  {news.image_alt}
                </figcaption>
              )}
            </figure>
          )}

          {/* Audio Block - Dark Style */}
          <NewsAudioBlock
            newsId={news.id}
            audioUrl={news.audio_url}
            audioStatus={news.audio_status}
            audioDuration={news.audio_duration_seconds}
            transcriptText={news.transcript_text}
            contentHtml={news.content}
            className="mb-8"
          />

          {/* Summary Block */}
          <NewsSummaryBlock
            summaryShort={news.summary_short}
            summaryMedium={news.summary_medium}
            keyPoints={news.ai_summary_bullets}
            generatedAt={news.ai_summary_generated_at}
            className="mb-8"
          />

          {/* Table of Contents */}
          {news.content && (
            <NewsTableOfContents 
              contentHtml={news.content} 
              className="mb-8"
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

          {/* Article Footer */}
          <footer className="border-t pt-8 space-y-8 article-footer" aria-label="Informações adicionais">
            {/* Editor Info */}
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Edição:</span>{' '}
              {news.editor_name || news.editor?.full_name || news.author?.full_name || 'Redação Conexão na Cidade'}
            </div>

            {/* Tags */}
            {news.tags && news.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {news.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    to={`/busca?tag=${tag.slug}`}
                    className="bg-muted hover:bg-primary/10 hover:text-primary px-4 py-2 rounded-full text-sm transition-colors"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Share Section - Centered */}
            <div className="text-center py-6 border-t">
              <p className="text-sm font-medium text-foreground mb-4">Compartilhe essa notícia</p>
              <div className="flex justify-center">
                <ShareButtons 
                  url={currentUrl} 
                  title={news.title} 
                  contentId={news.id}
                  contentType="news"
                  variant="circular"
                />
              </div>
            </div>
          </footer>

          {/* Author Card */}
          {news.author && (
            <div className="mt-10">
              <AuthorCard author={news.author} />
            </div>
          )}

          {/* Fact Check CTA */}
          <div className="mt-10">
            <FactCheckCTA newsSlug={news.slug} newsTitle={news.title} />
          </div>

          {/* Related News */}
          <nav aria-label="Notícias relacionadas" className="mt-12">
            <RelatedNews news={relatedNews} />
          </nav>
        </div>
      </article>
    </>
  );
}
