import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ExternalLink, Image, Calendar, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { NewsWithIssue } from "../types";

interface NewsIssueCardProps {
  news: NewsWithIssue;
  selected: boolean;
  onSelect: (selected: boolean) => void;
  issueType: "image" | "date" | "general";
}

export function NewsIssueCard({ news, selected, onSelect, issueType }: NewsIssueCardProps) {
  const hasImageIssue = !news.featured_image_url || 
    news.featured_image_url === "" || 
    news.featured_image_url.includes("_0001");

  const hasDateIssue = news.published_at && new Date(news.published_at) > new Date();
  const hasMissingOriginalDate = !news.original_published_at && news.source;

  return (
    <Card className={cn(
      "transition-all",
      selected && "ring-2 ring-primary"
    )}>
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Checkbox */}
          <div className="flex items-start pt-1">
            <Checkbox
              checked={selected}
              onCheckedChange={onSelect}
            />
          </div>

          {/* Thumbnail */}
          {issueType === "image" && (
            <div className="shrink-0">
              {news.featured_image_url && !hasImageIssue ? (
                <img
                  src={news.featured_image_url}
                  alt={news.title}
                  className="w-20 h-14 object-cover rounded"
                />
              ) : (
                <div className="w-20 h-14 rounded bg-muted flex items-center justify-center">
                  <Image className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium line-clamp-2 text-sm">{news.title}</h3>
              {news.source && (
                <a
                  href={news.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0"
                >
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </a>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {news.category && (
                <Badge variant="secondary" className="text-xs">
                  {news.category.name}
                </Badge>
              )}

              {issueType === "image" && hasImageIssue && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Imagem inválida
                </Badge>
              )}

              {issueType === "date" && hasDateIssue && (
                <Badge variant="destructive" className="text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  Data futura
                </Badge>
              )}

              {issueType === "date" && hasMissingOriginalDate && (
                <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                  Sem data original
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>
                Publicado: {news.published_at 
                  ? format(new Date(news.published_at), "dd/MM/yyyy HH:mm", { locale: ptBR })
                  : "-"
                }
              </span>
              {news.original_published_at && (
                <span>
                  Original: {format(new Date(news.original_published_at), "dd/MM/yyyy", { locale: ptBR })}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
