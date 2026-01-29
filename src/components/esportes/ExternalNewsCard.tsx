import { ExternalLink, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { BrNewsItem } from "@/hooks/useBrasileiraoNews";

interface ExternalNewsCardProps {
  news: BrNewsItem;
  compact?: boolean;
  className?: string;
}

const SOURCE_LABELS: Record<string, { name: string; color: string }> = {
  'ge': { name: 'GE', color: 'bg-red-500' },
  'ogol': { name: 'oGol', color: 'bg-orange-500' },
};

export function ExternalNewsCard({ news, compact = false, className }: ExternalNewsCardProps) {
  const sourceInfo = SOURCE_LABELS[news.source_key] || { name: news.source_key, color: 'bg-muted' };
  const publishedDate = news.published_at ? new Date(news.published_at) : null;
  
  const timeAgo = publishedDate 
    ? formatDistanceToNow(publishedDate, { addSuffix: true, locale: ptBR })
    : null;

  if (compact) {
    return (
      <a 
        href={news.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className={cn(
          "flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors group",
          className
        )}
      >
        {news.image_url && (
          <img 
            src={news.image_url} 
            alt="" 
            className="w-16 h-16 object-cover rounded flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
            {news.title}
          </h4>
          <div className="flex items-center gap-2 mt-1.5">
            <Badge variant="secondary" className={cn("text-[10px] h-4", sourceInfo.color, "text-white")}>
              {sourceInfo.name}
            </Badge>
            {timeAgo && (
              <span className="text-[10px] text-muted-foreground">{timeAgo}</span>
            )}
          </div>
        </div>
        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
      </a>
    );
  }

  return (
    <Card className={cn("overflow-hidden hover:shadow-md transition-shadow group", className)}>
      <a href={news.url} target="_blank" rel="noopener noreferrer">
        {news.image_url && (
          <div className="aspect-video relative overflow-hidden">
            <img 
              src={news.image_url} 
              alt="" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <Badge 
              variant="secondary" 
              className={cn("absolute top-2 left-2 text-xs", sourceInfo.color, "text-white")}
            >
              {sourceInfo.name}
            </Badge>
          </div>
        )}
        <CardContent className="p-4">
          <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
            {news.title}
          </h3>
          {news.excerpt && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {news.excerpt}
            </p>
          )}
          <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              {!news.image_url && (
                <Badge variant="secondary" className={cn("text-[10px]", sourceInfo.color, "text-white")}>
                  {sourceInfo.name}
                </Badge>
              )}
              {timeAgo && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {timeAgo}
                </span>
              )}
            </div>
            <span className="flex items-center gap-1 group-hover:text-primary">
              Ler <ExternalLink className="h-3 w-3" />
            </span>
          </div>
        </CardContent>
      </a>
    </Card>
  );
}
