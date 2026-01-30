import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getCategoryDisplay } from "@/utils/categoryDisplay";

interface NewsCardProps {
  news: {
    id: number | string;
    title: string;
    excerpt?: string;
    featuredImageUrl?: string;
    featured_image_url?: string;
    category?: { name: string; slug: string; color?: string } | null;
    publishedAt?: string;
    published_at?: string;
    slug: string;
    tags?: Array<{ id: string; name: string; slug: string }>;
  };
  variant?: "default" | "horizontal" | "compact" | "mini" | "numbered" | "headline";
  number?: number;
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

export function NewsCard({ news, variant = "default", number }: NewsCardProps) {
  const imageUrl = news.featuredImageUrl || news.featured_image_url;
  const publishedAt = news.publishedAt || news.published_at;
  const categoryColor = news.category?.color || "hsl(var(--primary))";
  
  // Get formatted category display with city prefix for neighboring cities
  const tagNames = news.tags?.map(t => t.name) || [];
  const categoryDisplay = getCategoryDisplay(news.category?.name || "Notícia", tagNames);

  // Mini variant - just title and time
  if (variant === "mini") {
    return (
      <Link to={`/noticia/${news.slug}`} className="group flex items-center gap-2 py-1.5">
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: categoryColor }}
        />
        <h3 className="text-sm font-medium leading-tight line-clamp-1 group-hover:text-primary flex-1">
          {news.title}
        </h3>
        {publishedAt && (
          <span className="text-[10px] text-muted-foreground shrink-0">
            {formatTimeAgo(publishedAt)}
          </span>
        )}
      </Link>
    );
  }

  // Numbered variant - for rankings
  if (variant === "numbered") {
    return (
      <Link to={`/noticia/${news.slug}`} className="group flex items-start gap-3 py-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary/10 font-heading text-sm font-bold text-primary">
          {number || 1}
        </span>
        <h3 className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-primary">
          {news.title}
        </h3>
      </Link>
    );
  }

  // Headline variant - large title, no image
  if (variant === "headline") {
    return (
      <Link to={`/noticia/${news.slug}`} className="group block py-3">
        <Badge
          variant="secondary"
          className="mb-2 text-[10px]"
          style={{
            backgroundColor: `${categoryColor}20`,
            color: categoryColor,
          }}
        >
          {categoryDisplay}
        </Badge>
        <h2 className="font-heading text-lg font-bold leading-tight group-hover:text-primary">
          {news.title}
        </h2>
        {publishedAt && (
          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formatTimeAgo(publishedAt)}
          </div>
        )}
      </Link>
    );
  }

  // Horizontal variant
  if (variant === "horizontal") {
    return (
      <Link to={`/noticia/${news.slug}`} className="group block">
        <article className="news-card flex gap-3 rounded-lg bg-card p-2">
          {imageUrl && (
            <div className="h-16 w-20 shrink-0 overflow-hidden rounded-md">
              <img
                src={imageUrl}
                alt={news.title}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            </div>
          )}
          <div className="flex flex-1 flex-col justify-between min-w-0">
            <div>
              <Badge
                variant="outline"
                className="mb-1 text-[10px] px-1.5 py-0"
                style={{ borderColor: categoryColor, color: categoryColor }}
              >
                {categoryDisplay}
              </Badge>
              <h3 className="font-heading text-sm font-medium leading-tight line-clamp-2 group-hover:text-primary">
                {news.title}
              </h3>
            </div>
            {publishedAt && (
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Clock className="h-2.5 w-2.5" />
                {formatTimeAgo(publishedAt)}
              </div>
            )}
          </div>
        </article>
      </Link>
    );
  }

  // Compact variant
  if (variant === "compact") {
    return (
      <Link to={`/noticia/${news.slug}`} className="group block">
        <article className="flex items-start gap-2.5 py-2.5">
          <span
            className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: categoryColor }}
          />
          <div className="min-w-0">
            <h3 className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-primary">
              {news.title}
            </h3>
            {publishedAt && (
              <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                <Clock className="h-2.5 w-2.5" />
                {formatTimeAgo(publishedAt)}
              </span>
            )}
          </div>
        </article>
      </Link>
    );
  }

  // Default variant
  return (
    <Link to={`/noticia/${news.slug}`} className="group block">
      <article className="news-card overflow-hidden rounded-lg bg-card">
        {imageUrl && (
          <div className="aspect-[16/10] overflow-hidden">
            <img
              src={imageUrl}
              alt={news.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}
        <div className="p-3">
          <Badge
            variant="outline"
            className="mb-1.5 text-[10px] px-1.5 py-0"
            style={{ borderColor: categoryColor, color: categoryColor }}
          >
            {categoryDisplay}
          </Badge>
          <h3 className="mb-1.5 font-heading text-base font-semibold leading-tight line-clamp-2 group-hover:text-primary">
            {news.title}
          </h3>
          {news.excerpt && (
            <p className="mb-2 text-xs text-muted-foreground line-clamp-2">
              {news.excerpt}
            </p>
          )}
          {publishedAt && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Clock className="h-2.5 w-2.5" />
              {formatTimeAgo(publishedAt)}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
