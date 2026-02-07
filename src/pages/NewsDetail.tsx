import React, { useEffect, useMemo, useCallback, useState, Component, ErrorInfo, ReactNode } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useNewsBySlug, useRelatedNews } from '@/hooks/useNews';
import { ShareButtons } from '@/components/news/ShareButtons';
import { AuthorCard } from '@/components/news/AuthorCard';
import { RelatedNews } from '@/components/news/RelatedNews';
import { NewsAudioBlock } from '@/components/news/NewsAudioBlock';
import { NewsContentNavigator } from '@/components/news/NewsContentNavigator';
import { ReadingProgressBar } from '@/components/news/ReadingProgressBar';
import { FactCheckCTA } from '@/components/news/FactCheckCTA';
import { PrintButton } from '@/components/news/PrintButton';
import { NewsGallery } from '@/components/news/NewsGallery';
import { InlineAdSlot } from '@/components/ads/InlineAdSlot';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useReadingTracker } from '@/hooks/useReadingTracker';
import { useNewsAnalytics } from '@/hooks/useNewsAnalytics';
import { useAuth } from '@/contexts/AuthContext';
import { getCategoryDisplay } from '@/utils/categoryDisplay';
import { getCategoryTheme, getArticleThemeStyle } from '@/lib/categoryTheme';
import { normalizeSrc, parseUserAgentSimple } from '@/lib/circulationUtils';
import { 
  ArticleHeader, 
  ArticleHero, 
  ArticleContent, 
  ArticleDivider, 
  ArticleFooter 
} from '@/components/article';

// Error Boundary para capturar erros de renderização
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class NewsErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[NewsDetail] Erro de renderização:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container max-w-4xl py-16 text-center">
          <h1 className="text-3xl font-bold mb-4 text-foreground">Erro ao carregar notícia</h1>
          <p className="text-muted-foreground mb-8">
            Ocorreu um erro inesperado ao exibir esta notícia.
          </p>
          <div className="flex justify-center gap-4">
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Recarregar página
            </Button>
            <Link to="/">
              <Button className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar para home
              </Button>
            </Link>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

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
  const { data: news, isLoading, error } = useNewsBySlug(slug || '');

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

  // Only render content component when news is loaded
  return <NewsDetailContent news={news} />;
}

// Separate component that only mounts when news data is available
interface NewsDetailContentProps {
  news: NonNullable<ReturnType<typeof useNewsBySlug>['data']>;
}

function NewsDetailContent({ news }: NewsDetailContentProps) {
  const { user } = useAuth();
  
  // Client-side URL to avoid hydration mismatch
  const [currentUrl, setCurrentUrl] = useState('');
  
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);
  
  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);
  
  // Get tag IDs for better related news selection
  const tagIds = useMemo(() => news.tags?.map(t => t.id) || [], [news.tags]);
  
  const { data: relatedNews = [] } = useRelatedNews(
    news.id,
    news.category_id || null,
    6,
    tagIds
  );

  // Reading tracker for gamification - now news.id is guaranteed to exist
  const { trackScroll, isCompleted } = useReadingTracker({
    contentType: 'news',
    contentId: news.id,
    minimumTimeSeconds: 45,
    completionThreshold: 85
  });

  // Analytics tracking for reading behavior - now news.id is guaranteed to exist
  const {
    trackAudioPlay,
    trackAudioStop,
    trackPodcastPlay,
    trackSummaryExpand,
    trackTocClick,
    trackShare,
  } = useNewsAnalytics(news.id);

  // Track scroll progress
  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight > 0) {
      const scrollPercent = (scrollTop / docHeight) * 100;
      trackScroll(scrollPercent);
    }
  }, [trackScroll]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Increment view count on mount
  useEffect(() => {
    supabase
      .from('news')
      .update({ view_count: (news.view_count || 0) + 1 })
      .eq('id', news.id)
      .then(() => {});
  }, [news.id, news.view_count]);

  // Track news click with ref + src for circulation tracking
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref') || null;
    const src = normalizeSrc(params.get('src'));
    
    // Dedup key includes ref+src so different sources count as separate clicks
    const key = `nc_${news.id}_${refCode || 'none'}_${src}`;
    if (sessionStorage.getItem(key)) return;
    
    const ua = navigator.userAgent;
    const { device_type, browser } = parseUserAgentSimple(ua);

    supabase
      .from('news_clicks' as any)
      .insert({
        news_id: news.id,
        ref_code: refCode,
        src,
        referrer: document.referrer || null,
        user_agent: ua,
        device_type,
        browser,
      })
      .then(() => {
        sessionStorage.setItem(key, '1');
      });
  }, [news.id]);

  const readTime = calculateReadTime(news.content);
  const wordCount = countWords(news.content);

  // Category theme for styled elements
  const categoryTheme = useMemo(() => {
    return getCategoryTheme(
      news.category?.name || 'Geral',
      news.category?.color || null
    );
  }, [news.category]);

  // Category display text (e.g., "Cotia | Saúde")
  const categoryDisplay = useMemo(() => {
    return getCategoryDisplay(
      news.category?.name || 'Geral',
      news.tags?.map(t => t.name) || [],
      news.source
    );
  }, [news.category, news.tags, news.source]);

  const metaDescription = news.meta_description || news.summary_short || news.excerpt || news.subtitle || '';
  const ogImage = news.og_image_url || news.featured_image_url || '';

  // Schema.org NewsArticle for SEO - memoized and conditional on currentUrl
  const schemaOrg = useMemo(() => {
    if (!currentUrl) return null;
    
    return {
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
    } as Record<string, unknown>;
  }, [currentUrl, news.title, metaDescription, ogImage, news.published_at, news.updated_at_display, news.updated_at, wordCount, news.author?.full_name]);

  // Add AudioObject and PodcastEpisode to schemaOrg if applicable
  if (schemaOrg) {
    if (news.audio_url && news.audio_status === 'ready') {
      schemaOrg["audio"] = {
        "@type": "AudioObject",
        "contentUrl": news.audio_url,
        "duration": news.audio_duration_seconds ? `PT${Math.floor(news.audio_duration_seconds / 60)}M${news.audio_duration_seconds % 60}S` : undefined,
        "encodingFormat": "audio/mpeg"
      };
    }
    if (news.podcast_enabled && news.audio_url) {
      schemaOrg["@type"] = ["NewsArticle", "PodcastEpisode"];
    }
  }

  return (
    <NewsErrorBoundary>
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
        
        {/* Schema.org JSON-LD - only render when currentUrl is available */}
        {schemaOrg && (
          <script type="application/ld+json">
            {JSON.stringify(schemaOrg)}
          </script>
        )}
      </Helmet>
      
      {/* Skip Link for Accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-20 focus:left-4 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded"
      >
        Pular para o conteúdo
      </a>

      {/* Article with Category Theme */}
      <article 
        role="article" 
        aria-labelledby="news-title"
        className="article-themed"
        style={getArticleThemeStyle(categoryTheme)}
      >
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

        {/* Clean Header - Agência Brasil Style (no colored background) */}
        <div className="print-hide bg-background">
          <ArticleHeader
            categoryDisplay={categoryDisplay}
            categorySlug={news.category?.slug}
            title={news.title}
            subtitle={news.subtitle}
            authorName={news.author?.full_name || 'Redação'}
            publishedAt={news.published_at}
            source={news.source}
          />
          
          {/* Share Buttons + Print - aligned right */}
          <div className="max-w-[820px] mx-auto px-4 md:px-6 pb-4">
            <div className="flex items-center justify-end gap-2">
              <ShareButtons 
                url={currentUrl} 
                title={news.title} 
                contentId={news.id}
                contentType="news"
                variant="circular"
                onShare={trackShare}
              />
              <PrintButton />
            </div>
          </div>
        </div>

        <ArticleDivider />

        {/* Main Content Area */}
        <div className="max-w-[820px] mx-auto px-4 md:px-6 py-8">
          {/* 1. Hero Image */}
          <ArticleHero
            imageUrl={news.featured_image_url}
            imageAlt={news.image_alt}
            imageCredit={news.image_credit}
          />

          {/* 2. Audio Block - UOL/Trinity Audio Style (BEFORE summary) */}
          <div id="accessibility">
            <NewsAudioBlock
              newsId={news.id}
              audioUrl={news.audio_url}
              audioStatus={news.audio_status}
              audioDuration={news.audio_duration_seconds}
              transcriptText={news.transcript_text}
              contentHtml={news.content}
              spotifyUrl={news.spotify_url}
              podcastStatus={news.podcast_status}
              podcastAudioUrl={news.podcast_audio_url}
              className="mb-6"
              onAudioPlay={trackAudioPlay}
              onAudioStop={trackAudioStop}
              onPodcastPlay={trackPodcastPlay}
            />
          </div>

          {/* 3. Summary Block - UOL Style (AFTER audio, BEFORE content) */}
          <NewsContentNavigator
            summaryShort={news.summary_short}
            summaryMedium={news.summary_medium}
            keyPoints={news.ai_summary_bullets}
            contentHtml={news.content}
            onSummaryExpand={trackSummaryExpand}
            onTocClick={trackTocClick}
            className="mb-8"
          />

          {/* 4. Gallery Images - Additional images from source with Lightbox */}
          <NewsGallery 
            heroImage={news.featured_image_url}
            galleryUrls={news.gallery_urls}
            imageAlt={news.image_alt}
          />

          {/* Main Content */}
          <section aria-label="Conteúdo da matéria">
            {news.content && (
              <>
                <ArticleContent html={news.content} className="mb-6" />
                {/* Inline Ad After Content - 300x250 Editorial Slot */}
                <InlineAdSlot 
                  position={4} 
                  category={news.category?.slug}
                  className="my-8"
                />
              </>
            )}
          </section>

          {/* Article Footer with Tags and Share */}
          <ArticleFooter
            tags={news.tags}
            newsId={news.id}
            newsTitle={news.title}
            currentUrl={currentUrl}
            onShare={trackShare}
          />

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
    </NewsErrorBoundary>
  );
}
