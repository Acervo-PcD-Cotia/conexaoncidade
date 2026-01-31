import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNewsByCategory } from "@/hooks/useNews";
import { getCategoryDisplay } from "@/utils/categoryDisplay";

interface CategorySectionProps {
  title: string;
  slug: string;
}

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

export function CategorySection({ title, slug }: CategorySectionProps) {
  const { data: news, isLoading } = useNewsByCategory(slug, 8);

  if (isLoading) {
    return (
      <section className="container py-2">
        <div className="animate-pulse">
          <div className="mb-2 h-5 w-28 bg-muted rounded" />
          <div className="grid gap-2 lg:grid-cols-3">
            <div className="lg:col-span-2 aspect-[16/9] bg-muted rounded-lg" />
            <div className="space-y-1.5">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="h-8 bg-muted rounded" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!news || news.length === 0) return null;

  const [mainNews, ...sideNews] = news;
  const categoryColor = mainNews.category?.color || "hsl(var(--primary))";

  return (
    <section className="container py-2">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="h-4 w-1 rounded-full"
            style={{ backgroundColor: categoryColor }}
          />
          <h2 className="font-heading text-sm font-bold uppercase">{title}</h2>
        </div>
        <Link
          to={`/categoria/${slug}`}
          className="flex items-center gap-1 text-[10px] font-medium text-primary hover:underline"
        >
          Ver mais
          <ArrowRight className="h-2.5 w-2.5" />
        </Link>
      </div>

      {/* Content grid - denser layout */}
      <div className="grid gap-2 lg:grid-cols-3">
        {/* Main news - with image */}
        <div className="lg:col-span-2">
          <Link to={`/noticia/${mainNews.slug}`} className="group block">
            <article className="news-card relative overflow-hidden rounded-lg">
              <div className="aspect-[16/9] overflow-hidden">
                <img
                  src={mainNews.featured_image_url || "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&h=450&fit=crop"}
                  alt={mainNews.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                <Badge
                  variant="secondary"
                  className="mb-1.5 text-[10px]"
                  style={{ backgroundColor: categoryColor, color: "white" }}
                >
                  {getCategoryDisplay(mainNews.category?.name || title, mainNews.tags?.map(t => t.name) || [], mainNews.source)}
                </Badge>
                <h3 className="font-heading text-base font-bold leading-tight line-clamp-2 md:text-lg">
                  {mainNews.title}
                </h3>
                {mainNews.published_at && (
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-white/70">
                    <Clock className="h-2.5 w-2.5" />
                    {formatTimeAgo(mainNews.published_at)}
                  </div>
                )}
              </div>
            </article>
          </Link>
        </div>

        {/* Side news - text only, dense list with 7 items */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="border-b border-border px-2.5 py-1.5 bg-muted/30">
            <h4 className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wide">
              Mais em {title}
            </h4>
          </div>
          <div className="divide-y divide-border">
            {sideNews.slice(0, 7).map((n) => (
              <Link
                key={n.id}
                to={`/noticia/${n.slug}`}
                className="group flex items-start gap-1.5 px-2.5 py-1.5 transition-colors hover:bg-muted/50"
              >
                <span
                  className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: categoryColor }}
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-medium leading-snug line-clamp-2 group-hover:text-primary">
                    {n.title}
                  </h4>
                  {n.published_at && (
                    <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-2 w-2" />
                      {formatTimeAgo(n.published_at)}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
