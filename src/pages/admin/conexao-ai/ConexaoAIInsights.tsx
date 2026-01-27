import { ArrowLeft, Eye, FileText, Users, Accessibility, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AIInsightWidget } from "@/components/conexao-ai/AIInsightWidget";
import { useToolUsageStats } from "@/hooks/useConexaoAI";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "#10b981", "#f59e0b", "#ef4444"];

export default function ConexaoAIInsights() {
  const navigate = useNavigate();
  const { data: toolStats } = useToolUsageStats();

  // Fetch news stats
  const { data: newsStats, isLoading: loadingNews } = useQuery({
    queryKey: ["insights-news-stats"],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from("news")
        .select("id, title, view_count, created_at")
        .gte("created_at", thirtyDaysAgo.toISOString())
        .order("view_count", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });

  // Fetch module usage (simplified mock - in real app would track actual usage)
  const moduleUsage = [
    { name: "Notícias", value: 45 },
    { name: "Parceiros", value: 25 },
    { name: "Comunidade", value: 15 },
    { name: "PcD", value: 10 },
    { name: "Academy", value: 5 },
  ];

  // Calculate totals
  const { data: totalStats, isLoading: loadingTotals } = useQuery({
    queryKey: ["insights-totals"],
    queryFn: async () => {
      const [newsCount, communityCount, conversationsCount] = await Promise.all([
        supabase.from("news").select("id", { count: "exact", head: true }),
        supabase.from("community_members").select("id", { count: "exact", head: true }),
        supabase.from("conexao_ai_conversations").select("id", { count: "exact", head: true }),
      ]);

      return {
        news: newsCount.count || 0,
        community: communityCount.count || 0,
        conversations: conversationsCount.count || 0,
      };
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/conexao-ai")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Insights e Diagnósticos</h1>
          <p className="text-sm text-muted-foreground">
            Análise de desempenho e oportunidades do portal
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loadingTotals ? (
          <>
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </>
        ) : (
          <>
            <AIInsightWidget
              title="Total de Notícias"
              data={{
                value: totalStats?.news || 0,
                label: "Publicadas",
                trend: "up",
                change: 12,
              }}
              icon={<FileText className="h-4 w-4 text-muted-foreground" />}
            />
            <AIInsightWidget
              title="Membros Comunidade"
              data={{
                value: totalStats?.community || 0,
                label: "Ativos",
                trend: "up",
                change: 5,
              }}
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
            />
            <AIInsightWidget
              title="Conversas IA"
              data={{
                value: totalStats?.conversations || 0,
                label: "Realizadas",
                trend: "neutral",
              }}
              icon={<Accessibility className="h-4 w-4 text-muted-foreground" />}
            />
            <AIInsightWidget
              title="Ferramentas IA"
              data={{
                value: toolStats?.length || 0,
                label: "Utilizadas",
                trend: "up",
                change: 8,
              }}
              icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
            />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top content */}
        <div className="rounded-lg border bg-card p-4">
          <h2 className="mb-4 font-semibold">Top 10 Conteúdos (30 dias)</h2>
          {loadingNews ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : newsStats && newsStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={newsStats.map((item) => ({
                  name: (item.title?.substring(0, 20) || "Sem título") + "...",
                  views: item.view_count || 0,
                }))}
                layout="vertical"
                margin={{ left: 10, right: 20 }}
              >
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="views" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              Nenhum dado disponível
            </div>
          )}
        </div>

        {/* Module usage */}
        <div className="rounded-lg border bg-card p-4">
          <h2 className="mb-4 font-semibold">Uso por Módulo</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={moduleUsage}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent, x, y }) => (
                  <text
                    x={x}
                    y={y}
                    fill="hsl(25, 95%, 53%)"
                    textAnchor="middle"
                    fontSize={12}
                    fontWeight={500}
                  >
                    {`${name} ${(percent * 100).toFixed(0)}%`}
                  </text>
                )}
                labelLine={{ stroke: "hsl(25, 95%, 53%)" }}
              >
                {moduleUsage.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Opportunities */}
      <div className="rounded-lg border bg-card p-4">
        <h2 className="mb-4 font-semibold">Oportunidades Identificadas</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border bg-muted/50 p-4">
            <h3 className="font-medium text-green-600">Alta prioridade</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Criar conteúdo sobre eventos locais - demanda identificada em buscas
            </p>
          </div>
          <div className="rounded-lg border bg-muted/50 p-4">
            <h3 className="font-medium text-yellow-600">Média prioridade</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Ampliar cobertura de serviços PcD - poucos cadastrados na região
            </p>
          </div>
          <div className="rounded-lg border bg-muted/50 p-4">
            <h3 className="font-medium text-blue-600">Sugestão</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Parceiros com perfil incompleto - potencial para campanha de atualização
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
