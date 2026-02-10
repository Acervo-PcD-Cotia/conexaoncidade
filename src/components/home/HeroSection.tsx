import React from "react";
import { Link } from "react-router-dom";
import { Clock, Volume2, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useFeaturedNews, useNews } from "@/hooks/useNews";
import { WebStoriesSidebar } from "@/components/home/WebStoriesSidebar";
import { getCategoryDisplay } from "@/utils/categoryDisplay";

function formatTimeAgo(date: string) {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 60) return `Há ${diffMins} min`;
  if (diffHours < 24) return `Há ${diffHours}h`;
  return past.toLocaleDateString("pt-BR");
}

function truncateText(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return text.substring(0, maxChars).trim() + "...";
}

export function HeroSection() {
  const { data: featuredNews, isLoading: loadingFeatured, error: errorFeatured } = useFeaturedNews(6);
  const { data: latestNews, isLoading: loadingLatest, error: errorLatest } = useNews(10);

  // Safety timeout — avoid infinite loading
  const [timedOut, setTimedOut] = React.useState(false);
  React.useEffect(() => {
    if (loadingFeatured || loadingLatest) {
      const t = setTimeout(() => setTimedOut(true), 10000);
      return () => clearTimeout(t);
    }
    setTimedOut(false);
  }, [loadingFeatured, loadingLatest]);

  const isLoading = (loadingFeatured || loadingLatest) && !timedOut;
  const hasError = errorFeatured || errorLatest;

  if (hasError) {
    console.error('[HeroSection] Erro ao carregar notícias:', errorFeatured || errorLatest);
    return null;
  }

  // Combine featured and latest, prioritizing featured
  const allNews = [
    ...(featuredNews || []),
    ...(latestNews || []).filter(
      (n) => !featuredNews?.find((f) => f.id === n.id)
    ),
  ];

  const heroNews = allNews[0];
  const sideNews = allNews.slice(1, 3);

  // Get formatted category display with city prefix (priority: source URL > tags)
  const getNewsCategory = (news: typeof heroNews) => {
    const tagNames = news?.tags?.map(t => t.name) || [];
    return getCategoryDisplay(news?.category?.name || "Notícia", tagNames, news?.source);
  };

  const handleTTS = (e: React.MouseEvent, text: string) => {
    e.preventDefault();
    e.stopPropagation();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    speechSynthesis.speak(utterance);
  };

  if (isLoading) {
    return (
      <section className="container py-4" aria-label="Carregando notícias">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="aspect-[16/9] bg-muted rounded-xl animate-pulse" />
          <div className="flex flex-col gap-4">
            <div className="h-8 bg-muted rounded animate-pulse" />
            <div className="h-16 bg-muted rounded animate-pulse" />
            <div className="h-20 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  if (!heroNews) return null;

  return (
    <section className="container py-4" aria-labelledby="hero-title">
      <h2 id="hero-title" className="sr-only">Destaque Principal</h2>
      
      {/* Main 3-column hero layout with WebStories sidebar */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr_280px] items-start">
        {/* Left: Large image */}
        <Link 
          to={`/noticia/${heroNews.slug}`} 
          className="group block overflow-hidden rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <AspectRatio ratio={16 / 9}>
            <img
              src={heroNews.featured_image_url || "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&h=675&fit=crop"}
              alt={heroNews.image_alt || `Imagem: ${truncateText(heroNews.title, 50)}`}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="eager"
              fetchPriority="high"
            />
          </AspectRatio>
        </Link>

        {/* Right: Content */}
        <div className="flex flex-col gap-4">
          {/* Category badges */}
          <div className="flex flex-wrap items-center gap-2">
            {heroNews.hat && (
              <Badge className="bg-accent text-accent-foreground text-xs">
                {heroNews.hat}
              </Badge>
            )}
            {((heroNews as any).is_urgent || heroNews.highlight === "urgent") && (
              <Badge className="bg-destructive text-destructive-foreground text-xs animate-pulse">
                URGENTE
              </Badge>
            )}
            <Badge
              style={{
                backgroundColor: heroNews.category?.color || "hsl(var(--primary))",
                color: "white",
              }}
              className="text-xs font-semibold"
            >
              {getNewsCategory(heroNews)}
            </Badge>
          </div>

          {/* Title (max 60 chars visible, but shows full on hover/focus) */}
          <Link to={`/noticia/${heroNews.slug}`} className="group">
            <h3 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold leading-tight text-foreground group-hover:text-primary transition-colors">
              {truncateText(heroNews.title, 80)}
            </h3>
          </Link>

          {/* Subtitle (max 120 chars) */}
          {heroNews.subtitle && (
            <p className="text-muted-foreground text-base leading-relaxed">
              {truncateText(heroNews.subtitle, 120)}
            </p>
          )}

          {/* Time */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" aria-hidden="true" />
            <time dateTime={heroNews.published_at || undefined}>
              {heroNews.published_at && formatTimeAgo(heroNews.published_at)}
            </time>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 mt-2">
            <Button asChild size="lg" className="gap-2">
              <Link to={`/noticia/${heroNews.slug}`}>
                Ler notícia
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="default"
              className="gap-2"
              onClick={(e) => handleTTS(e, `${heroNews.title}. ${heroNews.subtitle || ""}`)}
              aria-label={`Ouvir notícia: ${heroNews.title}`}
            >
              <Volume2 className="h-4 w-4" />
              Ouvir notícia
            </Button>
          </div>
        </div>

        {/* WebStories Sidebar - hidden on mobile */}
        <div className="hidden lg:block">
          <WebStoriesSidebar />
        </div>
      </div>

      {/* Side news cards - Visual cards instead of overlay text */}
      {sideNews.length > 0 && (
        <div className="grid gap-4 mt-6 sm:grid-cols-2 lg:grid-cols-3">
          {sideNews.map((news) => (
            <article 
              key={news.id} 
              className="group relative overflow-hidden rounded-lg border border-border bg-card transition-all hover:shadow-lg hover:border-primary/30 focus-within:ring-2 focus-within:ring-ring"
            >
              <Link 
                to={`/noticia/${news.slug}`} 
                className="flex gap-4 p-4"
              >
                {/* Thumbnail */}
                <div className="shrink-0 w-24 h-24 sm:w-32 sm:h-32 overflow-hidden rounded-lg">
                  <img
                    src={news.featured_image_url || "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=300&h=300&fit=crop"}
                    alt={news.image_alt || `Imagem: ${truncateText(news.title, 30)}`}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 min-w-0">
                  <Badge
                    className="self-start text-[10px] font-semibold mb-2"
                    style={{
                      backgroundColor: news.category?.color || "hsl(var(--primary))",
                      color: "white",
                    }}
                  >
                    {getNewsCategory(news)}
                  </Badge>
                  <h4 className="font-heading text-sm font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {truncateText(news.title, 70)}
                  </h4>
                  <div className="mt-auto pt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    <time dateTime={news.published_at || undefined}>
                      {news.published_at && formatTimeAgo(news.published_at)}
                    </time>
                  </div>
                </div>
              </Link>
              
              {/* Quick TTS button */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => handleTTS(e, news.title)}
                aria-label={`Ouvir: ${news.title}`}
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
