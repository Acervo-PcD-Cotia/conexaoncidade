import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TrendingUp, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function TrendingPanel() {
  const { data: trending, isLoading } = useQuery({
    queryKey: ["dashboard-trending"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news")
        .select("id, title, slug, view_count")
        .eq("status", "published")
        .order("view_count", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  return (
    <Card className="bg-card border-border">
      <CardHeader className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-orange-100 dark:bg-orange-900/30">
            <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </div>
          <h3 className="text-sm font-semibold">Mais Pesquisadas</h3>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-6 h-6 rounded-full bg-muted" />
                <div className="flex-1 h-4 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {trending?.map((item, index) => (
              <Link
                key={item.id}
                to={`/admin/news/${item.id}/edit`}
                className="flex items-center gap-3 group"
              >
                {/* Ranking Badge */}
                <span className={cn(
                  "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0",
                  index === 0 && "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
                  index === 1 && "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
                  index === 2 && "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300",
                  index > 2 && "bg-muted text-muted-foreground"
                )}>
                  #{index + 1}
                </span>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Eye className="h-3 w-3" />
                    {(item.view_count || 0).toLocaleString("pt-BR")}
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
