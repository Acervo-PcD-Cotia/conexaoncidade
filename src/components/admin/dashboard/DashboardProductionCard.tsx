import { useQuery } from "@tanstack/react-query";
import { FileText, Clock, Send, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export function DashboardProductionCard() {
  const { data: productionStats } = useQuery({
    queryKey: ["dashboard-production-stats"],
    queryFn: async () => {
      const [drafts, review, scheduled, publishedToday] = await Promise.all([
        supabase
          .from("news")
          .select("id", { count: "exact", head: true })
          .eq("status", "draft"),
        supabase
          .from("news")
          .select("id", { count: "exact", head: true })
          .eq("status", "review"),
        supabase
          .from("news")
          .select("id", { count: "exact", head: true })
          .eq("status", "scheduled"),
        supabase
          .from("news")
          .select("id", { count: "exact", head: true })
          .eq("status", "published")
          .gte("published_at", new Date().toISOString().split("T")[0]),
      ]);

      return {
        drafts: drafts.count || 0,
        review: review.count || 0,
        scheduled: scheduled.count || 0,
        publishedToday: publishedToday.count || 0,
      };
    },
  });

  const stats = [
    {
      label: "Rascunhos",
      value: productionStats?.drafts || 0,
      icon: FileText,
      iconColor: "text-muted-foreground",
    },
    {
      label: "Em Revisão",
      value: productionStats?.review || 0,
      icon: Clock,
      iconColor: "text-cta",
      href: "/admin/news?status=review",
    },
    {
      label: "Agendadas",
      value: productionStats?.scheduled || 0,
      icon: Calendar,
      iconColor: "text-brand",
      href: "/admin/news?status=scheduled",
    },
    {
      label: "Publicadas Hoje",
      value: productionStats?.publishedToday || 0,
      icon: Send,
      iconColor: "text-money",
      href: "/admin/news?status=published",
    },
  ];

  return (
    <Card className="dashboard-card-glass overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="p-1.5 rounded-lg bg-brand/10">
            <FileText className="h-4 w-4 text-brand" />
          </div>
          Produção Editorial
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {stats.map((stat) => {
          const content = (
            <div className="flex items-center justify-between py-2 px-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-muted">
                  <stat.icon className={cn("h-3.5 w-3.5", stat.iconColor)} />
                </div>
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
              <span className={cn(
                "font-bold tabular-nums px-2 py-0.5 rounded-full text-sm",
                stat.value > 0 ? "bg-muted" : "bg-muted/50 text-muted-foreground"
              )}>
                {stat.value}
              </span>
            </div>
          );

          return stat.href ? (
            <Link key={stat.label} to={stat.href}>
              {content}
            </Link>
          ) : (
            <div key={stat.label}>{content}</div>
          );
        })}
      </CardContent>
    </Card>
  );
}
