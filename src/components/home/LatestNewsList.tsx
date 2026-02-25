import React from "react";
import { Link } from "react-router-dom";
import { RefreshCw, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNews } from "@/hooks/useNews";
import { NewsCardVisual } from "./NewsCardVisual";

export function LatestNewsList() {
  const { data: news, isLoading: rawLoading, error } = useNews(12);

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
      <section className="py-4">
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
      <section className="py-4" aria-label="Carregando últimas notícias">
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

  // 8 news in 2 rows of 4
  const gridNews = news.slice(0, 8);

  return (
    <section aria-labelledby="latest-news-title">
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

      {/* Grid 4 columns x 2 rows = 8 cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {gridNews.map((item, index) => (
          <NewsCardVisual 
            key={item.id} 
            news={item} 
            priority={index < 4}
            showActions={index < 4}
          />
        ))}
      </div>
    </section>
  );
}
