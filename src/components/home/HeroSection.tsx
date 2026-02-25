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

  const allNews = [
    ...(featuredNews || []),
    ...(latestNews || []).filter(
      (n) => !featuredNews?.find((f) => f.id === n.id)
    ),
  ];

  const heroNews = allNews[0];
  const miniCards = allNews.slice(1, 3);

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
      <section className="home-container home-section-spacing" aria-label="Carregando notícias">
        <div className="grid gap-5 lg:grid-cols-[7fr_3fr]">
          <div className="aspect-[16/9] bg-muted rounded-xl animate-pulse" />
          <div className="space-y-3">
            <div className="h-8 bg-muted rounded animate-pulse" />
            <div className="h-8 bg-muted rounded animate-pulse" />
            <div className="h-8 bg-muted rounded animate-pulse" />
            <div className="h-8 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  if (!heroNews) return null;

  return (
    <section className="home-container home-section-spacing" aria-labelledby="hero-title">
      <h2 id="hero-title" className="sr-only">Destaque Principal</h2>
      
      {/* Hero: 70% destaque | 30% Web Stories */}
      <div className="grid gap-5 lg:grid-cols-[7fr_3fr] items-start">
        {/* Coluna Esquerda - Destaque principal */}
        <div className="space-y-4">
          {/* Imagem grande */}
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
              {/* Tags no topo da imagem */}
              <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                {heroNews.hat && (
                  <Badge className="bg-accent text-accent-foreground text-xs shadow-md">
                    {heroNews.hat}
                  </Badge>
                )}
                {((heroNews as any).is_urgent || heroNews.highlight === "urgent") && (
                  <Badge className="bg-destructive text-destructive-foreground text-xs animate-pulse shadow-md">
                    URGENTE
                  </Badge>
                )}
                <Badge
                  style={{
                    backgroundColor: heroNews.category?.color || "hsl(var(--primary))",
                    color: "white",
                  }}
                  className="text-xs font-semibold shadow-md"
                >
                  {getNewsCategory(heroNews)}
                </Badge>
              </div>
            </AspectRatio>
          </Link>

          {/* Título forte */}
          <Link to={`/noticia/${heroNews.slug}`} className="group block">
            <h3 className="font-heading text-xl md:text-2xl lg:text-3xl font-extrabold leading-tight text-foreground group-hover:text-primary transition-colors">
              {truncateText(heroNews.title, 80)}
            </h3>
          </Link>

          {/* Subtítulo curto */}
          {heroNews.subtitle && (
            <p className="text-muted-foreground text-base leading-relaxed">
              {truncateText(heroNews.subtitle, 120)}
            </p>
          )}

          {/* Tempo + Ações */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" aria-hidden="true" />
              <time dateTime={heroNews.published_at || undefined}>
                {heroNews.published_at && formatTimeAgo(heroNews.published_at)}
              </time>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="default" className="gap-2">
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
        </div>

        {/* Coluna Direita - Web Stories */}
        <div className="hidden lg:block">
          <WebStoriesSidebar />
        </div>
      </div>

      {/* Mini Cards abaixo do hero - 2 cards lado a lado */}
      {miniCards.length > 0 && (
        <div className="grid gap-4 mt-5 sm:grid-cols-2">
          {miniCards.map((news) => (
            <article 
              key={news.id} 
              className="group overflow-hidden rounded-lg border border-border bg-card transition-all duration-200 hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5"
            >
              <Link 
                to={`/noticia/${news.slug}`} 
                className="flex gap-4 p-3"
              >
                {/* Imagem pequena à esquerda */}
                <div className="shrink-0 w-28 h-20 sm:w-36 sm:h-24 overflow-hidden rounded-lg">
                  <img
                    src={news.featured_image_url || "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=300&h=200&fit=crop"}
                    alt={news.image_alt || `Imagem: ${truncateText(news.title, 30)}`}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                {/* Conteúdo */}
                <div className="flex flex-col flex-1 min-w-0 justify-center">
                  <Badge
                    className="self-start text-[10px] font-semibold mb-1.5"
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
                  <div className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    <time dateTime={news.published_at || undefined}>
                      {news.published_at && formatTimeAgo(news.published_at)}
                    </time>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
