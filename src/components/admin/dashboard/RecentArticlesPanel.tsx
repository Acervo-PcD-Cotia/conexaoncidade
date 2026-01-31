import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { getCategoryDisplay } from "@/utils/categoryDisplay";

const statusColors: Record<string, string> = {
  published: "bg-emerald-500",
  draft: "bg-slate-400",
  scheduled: "bg-sky-500",
  review: "bg-amber-500",
};

const statusLabels: Record<string, string> = {
  published: "Publicado",
  draft: "Rascunho",
  scheduled: "Agendado",
  review: "Revisão",
};

export function RecentArticlesPanel() {
  const { data: articles, isLoading } = useQuery({
    queryKey: ["dashboard-recent-articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news")
        .select(`
          id, 
          title, 
          slug, 
          status, 
          published_at, 
          updated_at,
          source,
          category:categories(name, slug),
          news_tags(tags(name))
        `)
        .order("updated_at", { ascending: false })
        .limit(8);
      if (error) throw error;
      return data;
    },
  });
  return (
    <Card className="bg-card border-border h-full flex flex-col">
      <CardHeader className="p-4 border-b border-border flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-muted">
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-sm font-semibold">Artigos Recentes</h3>
        </div>
        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" asChild>
          <Link to="/admin/news">
            Ver todas
            <ChevronRight className="h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-4 flex-1 overflow-auto">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-3 animate-pulse">
                <div className="w-2 h-2 mt-2 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {articles?.map((article) => (
              <Link
                key={article.id}
                to={`/admin/news/${article.id}/edit`}
                className="flex items-start gap-3 py-3 px-2 -mx-2 rounded-md hover:bg-muted/50 transition-colors group border-b border-border/50 last:border-0"
              >
                {/* Status Bullet */}
                <div 
                  className={cn(
                    "w-2 h-2 mt-2 rounded-full shrink-0",
                    statusColors[article.status] || "bg-slate-400"
                  )} 
                  title={statusLabels[article.status] || article.status}
                />
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {/* Category Badge */}
                    {article.category && (
                      <span className="px-2 py-0.5 text-[10px] font-medium bg-neutral-800 text-white rounded">
                        {(() => {
                          const tags = (article as any).news_tags?.map((nt: any) => nt.tags?.name).filter(Boolean) || [];
                          return getCategoryDisplay(article.category.name, tags, (article as any).source);
                        })()}
                      </span>
                    )}
                    {/* Timestamp */}
                    <span className="text-[11px] text-muted-foreground">
                      {formatDistanceToNow(new Date(article.updated_at), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
