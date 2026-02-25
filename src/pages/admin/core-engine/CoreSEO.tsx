import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Search, TrendingUp, AlertTriangle, CheckCircle, BarChart3 } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? "text-green-500 bg-green-500/10" : score >= 50 ? "text-yellow-500 bg-yellow-500/10" : "text-red-500 bg-red-500/10";
  return <Badge variant="outline" className={cn("text-xs font-bold", color)}>{score}</Badge>;
}

export default function CoreSEO() {
  const { data: scores = [] } = useQuery({
    queryKey: ["core-seo-scores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("core_seo_scores")
        .select("*")
        .order("seo_score", { ascending: true })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  const { data: newsWithSeo = [] } = useQuery({
    queryKey: ["news-seo-overview"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news")
        .select("id, title, slug, meta_title, meta_description, featured_image_url, status")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
  });

  // Calculate SEO issues for each article inline
  const analyzedNews = newsWithSeo.map(news => {
    const issues: string[] = [];
    let score = 100;

    if (!news.meta_title || news.meta_title.length < 10) { issues.push("Meta título ausente ou muito curto"); score -= 20; }
    else if (news.meta_title.length > 60) { issues.push("Meta título muito longo (>60 chars)"); score -= 10; }
    
    if (!news.meta_description || news.meta_description.length < 50) { issues.push("Meta descrição ausente ou curta"); score -= 20; }
    else if (news.meta_description.length > 160) { issues.push("Meta descrição muito longa (>160 chars)"); score -= 10; }
    
    if (!news.featured_image_url) { issues.push("Sem imagem de destaque"); score -= 15; }
    if (!news.slug || news.slug.length < 3) { issues.push("Slug muito curto"); score -= 10; }

    return { ...news, seoScore: Math.max(0, score), issues };
  });

  const avgScore = analyzedNews.length > 0
    ? Math.round(analyzedNews.reduce((s, n) => s + n.seoScore, 0) / analyzedNews.length)
    : 0;

  const goodCount = analyzedNews.filter(n => n.seoScore >= 80).length;
  const mediumCount = analyzedNews.filter(n => n.seoScore >= 50 && n.seoScore < 80).length;
  const badCount = analyzedNews.filter(n => n.seoScore < 50).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <NavLink to="/spah/painel/core-engine">
          <Button variant="ghost" size="icon" className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
        </NavLink>
        <div className="p-2 rounded-xl bg-blue-500/10"><Search className="h-5 w-5 text-blue-500" /></div>
        <div>
          <h1 className="text-xl font-bold">SEO Profissional</h1>
          <p className="text-xs text-muted-foreground">Análise das últimas {analyzedNews.length} notícias publicadas</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-3 flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-primary" />
            <div>
              <p className="text-2xl font-bold">{avgScore}</p>
              <p className="text-xs text-muted-foreground">Score Médio</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/5 border-green-500/20">
          <CardContent className="p-3 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{goodCount}</p>
              <p className="text-xs text-muted-foreground">Bom (≥80)</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-500/5 border-yellow-500/20">
          <CardContent className="p-3 flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold">{mediumCount}</p>
              <p className="text-xs text-muted-foreground">Regular (50-79)</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-500/5 border-red-500/20">
          <CardContent className="p-3 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-2xl font-bold">{badCount}</p>
              <p className="text-xs text-muted-foreground">Crítico (&lt;50)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Articles List */}
      <Card>
        <CardHeader className="p-4 border-b">
          <CardTitle className="text-sm">Análise SEO por Notícia</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {analyzedNews.map(news => (
              <div key={news.id} className="p-4 flex items-start gap-3">
                <ScoreBadge score={news.seoScore} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{news.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">/{news.slug}</p>
                  {news.issues.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {news.issues.map((issue, i) => (
                        <Badge key={i} variant="outline" className="text-[10px] text-destructive border-destructive/30">
                          {issue}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
