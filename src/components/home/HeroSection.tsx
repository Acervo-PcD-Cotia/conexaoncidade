import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useFeaturedNews, useNews } from "@/hooks/useNews";

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

export function HeroSection() {
  const { data: featuredNews, isLoading: loadingFeatured } = useFeaturedNews(6);
  const { data: latestNews, isLoading: loadingLatest } = useNews(10);

  const isLoading = loadingFeatured || loadingLatest;

  // Combine featured and latest, prioritizing featured
  const allNews = [
    ...(featuredNews || []),
    ...(latestNews || []).filter(
      (n) => !featuredNews?.find((f) => f.id === n.id)
    ),
  ];

  const heroNews = allNews[0];
  const sideNews = allNews.slice(1, 3);
  const textNews = allNews.slice(3, 7);

  if (isLoading) {
    return (
      <section className="container py-4">
        <div className="grid gap-3 lg:grid-cols-3">
          <div className="lg:col-span-2 aspect-[16/9] bg-muted rounded-lg animate-pulse" />
          <div className="space-y-3">
            <div className="aspect-[16/10] bg-muted rounded-lg animate-pulse" />
            <div className="aspect-[16/10] bg-muted rounded-lg animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  if (!heroNews) return null;

  return (
    <section className="container py-4">
      <div className="grid gap-3 lg:grid-cols-3">
        {/* Main hero - Dominant */}
        <div className="lg:col-span-2">
          <Link to={`/noticia/${heroNews.slug}`} className="group block">
            <article className="news-card relative overflow-hidden rounded-lg">
              <div className="aspect-[16/9] overflow-hidden">
                <img
                  src={heroNews.featured_image_url || "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&h=600&fit=crop"}
                  alt={heroNews.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-white">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  {heroNews.hat && (
                    <Badge className="bg-accent text-accent-foreground text-xs">
                      {heroNews.hat}
                    </Badge>
                  )}
                  {heroNews.highlight === "urgent" && (
                    <Badge className="bg-destructive text-destructive-foreground text-xs animate-pulse">
                      URGENTE
                    </Badge>
                  )}
                  <Badge
                    variant="secondary"
                    className="text-xs"
                    style={{
                      backgroundColor: heroNews.category?.color || "hsl(var(--primary))",
                      color: "white",
                    }}
                  >
                    {heroNews.category?.name || "Notícia"}
                  </Badge>
                </div>
                <h1 className="mb-2 font-heading text-xl font-bold leading-tight md:text-2xl lg:text-3xl">
                  {heroNews.title}
                </h1>
                {heroNews.subtitle && (
                  <p className="mb-2 line-clamp-2 text-sm text-white/80 md:text-base">
                    {heroNews.subtitle}
                  </p>
                )}
                <div className="flex items-center gap-1 text-xs text-white/70">
                  <Clock className="h-3 w-3" />
                  {heroNews.published_at && formatTimeAgo(heroNews.published_at)}
                </div>
              </div>
            </article>
          </Link>
        </div>

        {/* Side news - Medium */}
        <div className="flex flex-col gap-3">
          {sideNews.map((news) => (
            <Link key={news.id} to={`/noticia/${news.slug}`} className="group block flex-1">
              <article className="news-card relative h-full min-h-[140px] overflow-hidden rounded-lg">
                <div className="absolute inset-0">
                  <img
                    src={news.featured_image_url || "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400&h=300&fit=crop"}
                    alt={news.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                  <Badge
                    variant="secondary"
                    className="mb-1.5 text-[10px]"
                    style={{
                      backgroundColor: news.category?.color || "hsl(var(--primary))",
                      color: "white",
                    }}
                  >
                    {news.category?.name || "Notícia"}
                  </Badge>
                  <h2 className="font-heading text-sm font-bold leading-tight line-clamp-2">
                    {news.title}
                  </h2>
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-white/70">
                    <Clock className="h-2.5 w-2.5" />
                    {news.published_at && formatTimeAgo(news.published_at)}
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>

      {/* Text-only headlines below hero */}
      {textNews.length > 0 && (
        <div className="mt-3 grid gap-0 divide-y divide-border rounded-lg border border-border bg-card sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4">
          {textNews.map((news, index) => (
            <Link
              key={news.id}
              to={`/noticia/${news.slug}`}
              className={`group flex items-start gap-2 p-3 transition-colors hover:bg-muted/50 ${
                index < textNews.length - 1 ? "sm:border-r sm:border-border" : ""
              }`}
            >
              <span
                className="mt-1 h-2 w-2 shrink-0 rounded-full"
                style={{
                  backgroundColor: news.category?.color || "hsl(var(--primary))",
                }}
              />
              <div className="min-w-0">
                <h3 className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-primary">
                  {news.title}
                </h3>
                <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Clock className="h-2.5 w-2.5" />
                  {news.published_at && formatTimeAgo(news.published_at)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
