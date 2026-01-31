import { Link } from "react-router-dom";
import { Clock, Volume2, Share2, Accessibility } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";
import type { NewsItem } from "@/hooks/useNews";
import { getCategoryDisplay } from "@/utils/categoryDisplay";

interface NewsCardVisualProps {
  news: NewsItem;
  showActions?: boolean;
  priority?: boolean;
  className?: string;
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

function truncateTitle(title: string, maxChars: number = 80): string {
  if (title.length <= maxChars) return title;
  return title.substring(0, maxChars).trim() + "...";
}

export function NewsCardVisual({ 
  news, 
  showActions = true, 
  priority = false,
  className 
}: NewsCardVisualProps) {
  // Get formatted category display with city prefix (priority: source URL > tags)
  const tagNames = news.tags?.map(t => t.name) || [];
  const categoryDisplay = getCategoryDisplay(news.category?.name || "Notícia", tagNames, news.source);

  const handleTTS = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const utterance = new SpeechSynthesisUtterance(news.title);
    utterance.lang = "pt-BR";
    speechSynthesis.speak(utterance);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      await navigator.share({
        title: news.title,
        url: `/noticia/${news.slug}`,
      });
    }
  };

  return (
    <article 
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-all duration-200",
        "hover:shadow-lg hover:border-primary/30 focus-within:ring-2 focus-within:ring-ring",
        className
      )}
    >
      {/* Image with 16:9 aspect ratio */}
      <Link to={`/noticia/${news.slug}`} className="block overflow-hidden">
        <AspectRatio ratio={16 / 9}>
          <img
            src={news.featured_image_url || "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&h=338&fit=crop"}
            alt={news.image_alt || `Imagem: ${truncateTitle(news.title, 50)}`}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={priority ? "high" : "auto"}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </AspectRatio>
        
        {/* Category badge overlay */}
        <Badge
          className="absolute top-2 left-2 text-[10px] font-semibold uppercase"
          style={{
            backgroundColor: news.category?.color || "hsl(var(--primary))",
            color: "white",
          }}
        >
          {categoryDisplay}
        </Badge>

        {/* Urgent badge */}
        {news.highlight === "urgent" && (
          <Badge className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-[10px] animate-pulse">
            URGENTE
          </Badge>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-3">
        <Link to={`/noticia/${news.slug}`} className="flex-1">
          <h3 className="font-heading text-sm font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {truncateTitle(news.title, 80)}
          </h3>
        </Link>

        {/* Date */}
        <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
          <Clock className="h-3 w-3" aria-hidden="true" />
          <time dateTime={news.published_at || undefined}>
            {news.published_at && formatTimeAgo(news.published_at)}
          </time>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="mt-3 flex items-center gap-1 border-t border-border pt-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleTTS}
              aria-label={`Ouvir: ${news.title}`}
            >
              <Volume2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              asChild
            >
              <Link to={`/noticia/${news.slug}#accessibility`} aria-label="Opções de acessibilidade">
                <Accessibility className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleShare}
              aria-label={`Compartilhar: ${news.title}`}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </article>
  );
}
