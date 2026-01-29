import { Link } from "react-router-dom";
import { Clock, Newspaper, Trophy, Eye, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { BrGeneratedNews } from "@/hooks/useBrasileiraoNews";

interface GeneratedNewsCardProps {
  news: BrGeneratedNews;
  showBadge?: boolean;
  compact?: boolean;
  className?: string;
}

const NEWS_TYPE_LABELS: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  'round_recap': { label: 'Resumo da Rodada', icon: Trophy, color: 'bg-green-500' },
  'standings_change': { label: 'Classificação', icon: Trophy, color: 'bg-blue-500' },
  'where_to_watch': { label: 'Onde Assistir', icon: Eye, color: 'bg-purple-500' },
  'preview': { label: 'Prévia', icon: Calendar, color: 'bg-orange-500' },
  'highlight': { label: 'Destaque', icon: Newspaper, color: 'bg-red-500' },
};

function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}

export function GeneratedNewsCard({ news, showBadge = true, compact = false, className }: GeneratedNewsCardProps) {
  const typeInfo = NEWS_TYPE_LABELS[news.news_type] || { 
    label: 'Notícia', 
    icon: Newspaper, 
    color: 'bg-primary' 
  };
  const TypeIcon = typeInfo.icon;
  
  const publishedDate = news.published_at ? new Date(news.published_at) : new Date(news.created_at);
  const timeAgo = formatDistanceToNow(publishedDate, { addSuffix: true, locale: ptBR });
  
  const excerpt = stripHtml(news.content).slice(0, 150) + '...';

  if (compact) {
    return (
      <Link 
        to={`/esportes/brasileirao/noticia/${news.slug}`}
        className={cn(
          "flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors group",
          className
        )}
      >
        <div className={cn("p-2 rounded-lg flex-shrink-0", typeInfo.color, "text-white")}>
          <TypeIcon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
            {news.title}
          </h4>
          <div className="flex items-center gap-2 mt-1.5">
            {showBadge && (
              <Badge variant="outline" className="text-[10px] h-4 border-primary/50 text-primary">
                Portal
              </Badge>
            )}
            <span className="text-[10px] text-muted-foreground">{timeAgo}</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Card className={cn("overflow-hidden hover:shadow-md transition-shadow group", className)}>
      <Link to={`/esportes/brasileirao/noticia/${news.slug}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {showBadge && (
              <div className={cn("p-2.5 rounded-lg flex-shrink-0", typeInfo.color, "text-white")}>
                <TypeIcon className="h-5 w-5" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs border-primary/50 text-primary">
                  Portal
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {typeInfo.label}
                </Badge>
              </div>
              <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                {news.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {excerpt}
              </p>
              <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {timeAgo}
                </span>
                <span className="text-primary group-hover:underline">
                  Ler mais →
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
