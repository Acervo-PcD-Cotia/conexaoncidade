import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface NewsCardProps {
  news: {
    id: number;
    title: string;
    excerpt?: string;
    featuredImageUrl: string;
    category: { name: string; slug: string };
    publishedAt: string;
    slug: string;
  };
  variant?: "default" | "horizontal" | "compact";
}

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

export function NewsCard({ news, variant = "default" }: NewsCardProps) {
  if (variant === "horizontal") {
    return (
      <Link to={`/noticia/${news.slug}`} className="group block">
        <article className="news-card flex gap-4 rounded-lg bg-card p-3">
          <div className="h-20 w-28 shrink-0 overflow-hidden rounded-md">
            <img
              src={news.featuredImageUrl}
              alt={news.title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          </div>
          <div className="flex flex-1 flex-col justify-between">
            <div>
              <Badge variant="outline" className="mb-1 text-xs">
                {news.category.name}
              </Badge>
              <h3 className="font-heading text-sm font-semibold leading-tight line-clamp-2 group-hover:text-primary">
                {news.title}
              </h3>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatTimeAgo(news.publishedAt)}
            </div>
          </div>
        </article>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link to={`/noticia/${news.slug}`} className="group block">
        <article className="flex items-start gap-3 py-3">
          <div className="h-3 w-3 shrink-0 rounded-full bg-primary mt-1" />
          <div>
            <h3 className="font-medium leading-tight line-clamp-2 group-hover:text-primary">
              {news.title}
            </h3>
            <span className="mt-1 inline-block text-xs text-muted-foreground">
              {formatTimeAgo(news.publishedAt)}
            </span>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link to={`/noticia/${news.slug}`} className="group block">
      <article className="news-card overflow-hidden rounded-lg bg-card">
        <div className="aspect-[16/10] overflow-hidden">
          <img
            src={news.featuredImageUrl}
            alt={news.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="p-4">
          <Badge variant="outline" className="mb-2">
            {news.category.name}
          </Badge>
          <h3 className="mb-2 font-heading text-lg font-semibold leading-tight line-clamp-2 group-hover:text-primary">
            {news.title}
          </h3>
          {news.excerpt && (
            <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
              {news.excerpt}
            </p>
          )}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formatTimeAgo(news.publishedAt)}
          </div>
        </div>
      </article>
    </Link>
  );
}
