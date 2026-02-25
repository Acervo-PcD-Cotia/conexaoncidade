import { useState } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, Eye } from "lucide-react";
import { useMostReadNews } from "@/hooks/useNews";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface MostReadSectionProps {
  sidebar?: boolean;
}

export function MostReadSection({ sidebar = false }: MostReadSectionProps) {
  const [period, setPeriod] = useState<"today" | "week">("today");
  const { data: mostRead, isLoading } = useMostReadNews(10);

  const handleTTS = (e: React.MouseEvent, text: string) => {
    e.preventDefault();
    e.stopPropagation();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    speechSynthesis.speak(utterance);
  };

  if (isLoading) {
    return (
      <section className="container py-4" aria-label="Carregando mais lidas">
        <div className="rounded-xl bg-card border border-border p-4">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="h-10 w-10 bg-muted rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-2 bg-muted rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!mostRead || mostRead.length === 0) return null;

  // Calculate max views for proportional progress bars
  const maxViews = Math.max(...mostRead.map((n) => n.view_count || 1));

  const formatViews = (views: number): string => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}k`;
    }
    return views.toLocaleString("pt-BR");
  };

  return (
    <section className={sidebar ? "" : "container"} aria-labelledby="most-read-title">
      <div className="rounded-xl bg-card border border-border overflow-hidden">
        {/* Header with tabs */}
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 id="most-read-title" className="font-heading text-lg font-bold">
              Mais Lidas
            </h2>
          </div>
          <Tabs value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
            <TabsList className="h-8">
              <TabsTrigger value="today" className="text-xs px-3 h-6">
                Hoje
              </TabsTrigger>
              <TabsTrigger value="week" className="text-xs px-3 h-6">
                Semana
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Rankings */}
        <div className="divide-y divide-border">
          {mostRead.slice(0, 10).map((item, index) => {
            const progressValue = ((item.view_count || 0) / maxViews) * 100;
            const isTop3 = index < 3;

            return (
              <article
                key={item.id}
                className={cn(
                  "group relative flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted/50",
                  isTop3 && "bg-primary/5"
                )}
              >
                {/* Ranking number - large */}
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-heading text-base font-extrabold",
                    isTop3 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground"
                  )}
                  aria-label={`Posição ${index + 1}`}
                >
                  {index + 1}
                </span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/noticia/${item.slug}`}
                    className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                  >
                    <h3 className="font-medium text-xs leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                  </Link>

                  {/* Popularity bar + views */}
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex-1 max-w-24">
                      <Progress 
                        value={progressValue} 
                        className="h-1"
                        aria-label={`${formatViews(item.view_count)} visualizações`}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                      <Eye className="h-2.5 w-2.5" aria-hidden="true" />
                      {formatViews(item.view_count)}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
