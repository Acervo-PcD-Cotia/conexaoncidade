import React from "react";
import { Link } from "react-router-dom";
import { Clock, RefreshCw, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNews } from "@/hooks/useNews";
import { NewsCardVisual } from "./NewsCardVisual";
import { InlineAdSlot } from "@/components/ads/InlineAdSlot";

function formatTimeAgo(date: string) {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 60) return `${diffMins}min`;
  if (diffHours < 24) return `${diffHours}h`;
  return past.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export function LatestNewsList() {
  const { data: news, isLoading: rawLoading, error } = useNews(12);

  // Safety timeout — avoid infinite loading
  const [timedOut, setTimedOut] = React.useState(false);
  React.useEffect(() => {
    if (rawLoading) {
      const t = setTimeout(() => setTimedOut(true), 10000);
      return () => clearTimeout(t);
    }
    setTimedOut(false);
  }, [rawLoading]);

  const isLoading = rawLoading && !timedOut;

  if (error) {
    console.error('[LatestNewsList] Erro ao carregar notícias:', error);
    return (
      <section className="container py-4">
        <div className="text-center py-8 text-muted-foreground">
          <p className="mb-3">Não foi possível carregar as notícias</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="container py-4" aria-label="Carregando últimas notícias">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="aspect-[16/9] bg-muted animate-pulse" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse w-16" />
                <div className="h-8 bg-muted rounded animate-pulse" />
                <div className="h-3 bg-muted rounded animate-pulse w-12" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!news || news.length === 0) return null;

  // First 4 are featured with full cards, rest are compact list
  const featuredNews = news.slice(0, 8);
  const compactNews = news.slice(8);

  return (
    <section className="container py-4" aria-labelledby="latest-news-title">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 id="latest-news-title" className="font-heading text-lg font-bold">
            Últimas Notícias
          </h2>
        </div>
        <Button variant="ghost" size="sm" asChild className="gap-1 text-xs">
          <Link to="/noticias">
            Ver todas
            <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </div>

      {/* Visual cards grid - first row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {featuredNews.slice(0, 4).map((item, index) => (
          <NewsCardVisual 
            key={item.id} 
            news={item} 
            priority={index < 4}
            showActions={index < 4}
          />
        ))}
      </div>

      {/* Inline ad between rows */}
      <div className="my-4 flex justify-center">
        <InlineAdSlot position={1} className="max-w-[300px]" />
      </div>

      {/* Visual cards grid - second row */}
      {featuredNews.length > 4 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featuredNews.slice(4).map((item) => (
            <NewsCardVisual 
              key={item.id} 
              news={item} 
              priority={false}
              showActions={false}
            />
          ))}
        </div>
      )}

      {/* Compact list for additional news */}
      {compactNews.length > 0 && (
        <div className="mt-4 rounded-lg border border-border bg-card overflow-hidden">
          <div className="grid gap-0 divide-y divide-border md:grid-cols-2 md:divide-y-0">
            {compactNews.map((item, index) => (
              <Link
                key={item.id}
                to={`/noticia/${item.slug}`}
                className={`group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50 ${
                  index % 2 === 0 ? "md:border-r md:border-border" : ""
                }`}
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{
                    backgroundColor: item.category?.color || "hsl(var(--primary))",
                  }}
                  aria-hidden="true"
                />
                <h3 className="flex-1 text-sm font-medium leading-snug line-clamp-1 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  <time dateTime={item.published_at || undefined}>
                    {item.published_at && formatTimeAgo(item.published_at)}
                  </time>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
