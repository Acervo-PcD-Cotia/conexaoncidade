import { useQuery } from "@tanstack/react-query";
import { FileText, Clock, Send, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { DashboardPanel } from "./DashboardPanel";

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
      iconColor: "text-primary",
      href: "/spah/painel/news?status=review",
    },
    {
      label: "Agendadas",
      value: productionStats?.scheduled || 0,
      icon: Calendar,
      iconColor: "text-brand",
      href: "/spah/painel/news?status=scheduled",
    },
    {
      label: "Publicadas Hoje",
      value: productionStats?.publishedToday || 0,
      icon: Send,
      iconColor: "text-money",
      href: "/spah/painel/news?status=published",
    },
  ];

  return (
    <DashboardPanel
      title="Produção Editorial"
      icon={FileText}
      iconColor="text-brand"
      contentClassName="space-y-1"
    >
      {stats.map((stat) => {
        const content = (
          <div className="flex items-center justify-between py-2 px-2 -mx-2 rounded-md hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2">
              <stat.icon className={cn("h-3.5 w-3.5", stat.iconColor)} />
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
            <span className={cn(
              "font-bold tabular-nums text-sm",
              stat.value > 0 ? "text-foreground" : "text-muted-foreground"
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
    </DashboardPanel>
  );
}
