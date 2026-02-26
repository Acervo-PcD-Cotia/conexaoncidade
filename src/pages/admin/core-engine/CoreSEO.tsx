import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Search, TrendingUp, AlertTriangle, CheckCircle, BarChart3, BookOpen, FileCode, Link2, Lightbulb, Eye } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ── Readability helpers (Flesch adapted PT-BR) ──────────────────
function countSyllables(word: string): number {
  const vowels = word.toLowerCase().match(/[aeiouáàâãéêíóôõúü]/g);
  if (!vowels) return 1;
  let count = 0;
  let prev = false;
  for (const ch of word.toLowerCase()) {
    const isV = /[aeiouáàâãéêíóôõúü]/.test(ch);
    if (isV && !prev) count++;
    prev = isV;
  }
  return Math.max(1, count);
}

function analyzeReadability(text: string) {
  const clean = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const sentences = clean.split(/[.!?]+/).filter(s => s.trim().length > 3);
  const words = clean.split(/\s+/).filter(w => w.length > 0);
  const syllables = words.reduce((s, w) => s + countSyllables(w), 0);

  if (words.length === 0 || sentences.length === 0) return { score: 0, level: "N/A", avgSentLen: 0, avgSyllPerWord: 0 };

  const avgSentLen = words.length / sentences.length;
  const avgSyllPerWord = syllables / words.length;
  // Flesch-Kincaid adapted for Portuguese
  const score = Math.max(0, Math.min(100, 206.835 - 1.015 * avgSentLen - 84.6 * avgSyllPerWord));

  let level = "Muito Difícil";
  if (score >= 80) level = "Muito Fácil";
  else if (score >= 60) level = "Fácil";
  else if (score >= 40) level = "Médio";
  else if (score >= 20) level = "Difícil";

  return { score: Math.round(score), level, avgSentLen: Math.round(avgSentLen * 10) / 10, avgSyllPerWord: Math.round(avgSyllPerWord * 100) / 100 };
}

function analyzeKeywords(text: string, title: string) {
  const clean = text.replace(/<[^>]+>/g, " ").toLowerCase();
  const stopwords = new Set(["de", "da", "do", "das", "dos", "em", "no", "na", "nos", "nas", "um", "uma", "uns", "umas", "o", "a", "os", "as", "que", "para", "por", "com", "se", "como", "mais", "mas", "ao", "ou", "sua", "seu", "sua", "seus", "suas", "não", "foi", "são", "está", "ter", "ser", "este", "esta", "isso", "ela", "ele", "eles", "elas", "entre", "sobre", "já", "também", "só", "pelo", "pela", "até", "após", "após", "tem", "pode", "vai", "ano", "anos", "dia", "dias"]);
  const words = clean.match(/[a-záàâãéêíóôõúü]{3,}/g) || [];
  const freq: Record<string, number> = {};
  words.forEach(w => { if (!stopwords.has(w)) freq[w] = (freq[w] || 0) + 1; });

  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 15);
  const titleLower = title.toLowerCase();
  return sorted.map(([word, count]) => ({
    word,
    count,
    density: Math.round((count / words.length) * 10000) / 100,
    inTitle: titleLower.includes(word),
  }));
}

function generateSuggestions(news: any) {
  const suggestions: { type: "error" | "warning" | "info"; text: string }[] = [];
  if (!news.meta_title) suggestions.push({ type: "error", text: "Adicione um meta título para melhorar o CTR nos resultados." });
  else if (news.meta_title.length > 60) suggestions.push({ type: "warning", text: `Meta título tem ${news.meta_title.length} chars (máx 60). Reduza para evitar truncamento.` });
  else if (news.meta_title.length < 30) suggestions.push({ type: "warning", text: "Meta título muito curto. Use entre 30-60 caracteres." });

  if (!news.meta_description) suggestions.push({ type: "error", text: "Meta descrição ausente. Adicione uma com 120-160 caracteres." });
  else if (news.meta_description.length > 160) suggestions.push({ type: "warning", text: `Meta descrição tem ${news.meta_description.length} chars (máx 160).` });

  if (!news.featured_image_url) suggestions.push({ type: "error", text: "Imagem de destaque ausente. Artigos com imagem recebem 94% mais visualizações." });
  if (!news.og_image_url && !news.featured_image_url) suggestions.push({ type: "warning", text: "Sem imagem OG definida. Compartilhamentos sociais ficarão sem preview." });
  
  const slug = news.slug || "";
  if (slug.length < 5) suggestions.push({ type: "warning", text: "Slug muito curto. Use 3-5 palavras-chave." });
  if (slug.includes("--")) suggestions.push({ type: "info", text: "Slug contém hífens duplos. Simplifique." });

  if (news.content) {
    const hasH2 = /<h2/i.test(news.content);
    if (!hasH2) suggestions.push({ type: "info", text: "Adicione subtítulos H2 para melhorar a estrutura semântica." });
    
    const imgWithoutAlt = (news.content.match(/<img(?![^>]*alt=)[^>]*>/gi) || []).length;
    if (imgWithoutAlt > 0) suggestions.push({ type: "warning", text: `${imgWithoutAlt} imagem(ns) sem atributo alt no conteúdo.` });
  }

  if (suggestions.length === 0) suggestions.push({ type: "info", text: "✅ Nenhum problema encontrado. Artigo bem otimizado!" });
  return suggestions;
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? "text-green-500 bg-green-500/10" : score >= 50 ? "text-yellow-500 bg-yellow-500/10" : "text-red-500 bg-red-500/10";
  return <Badge variant="outline" className={cn("text-xs font-bold", color)}>{score}</Badge>;
}

function ReadabilityBadge({ score }: { score: number }) {
  const color = score >= 60 ? "text-green-500" : score >= 40 ? "text-yellow-500" : "text-red-500";
  return <span className={cn("text-xs font-bold", color)}>{score}</span>;
}

export default function CoreSEO() {
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: newsWithSeo = [] } = useQuery({
    queryKey: ["news-seo-full"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news")
        .select("id, title, slug, meta_title, meta_description, featured_image_url, og_image_url, content, status, excerpt")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: robotsTxt, refetch: refetchRobots } = useQuery({
    queryKey: ["core-seo-robots"],
    queryFn: async () => {
      const { data } = await supabase
        .from("core_seo_settings")
        .select("*")
        .eq("key", "robots_txt")
        .maybeSingle();
      return (data?.value as string) || `User-agent: *\nAllow: /\nDisallow: /spah/\nDisallow: /api/\n\nSitemap: https://conexaonacidade.com.br/sitemap.xml`;
    },
  });

  const [robotsDraft, setRobotsDraft] = useState<string | null>(null);
  const currentRobots = robotsDraft ?? robotsTxt ?? "";

  const saveRobotsMutation = useMutation({
    mutationFn: async (content: string) => {
      const { error } = await supabase.from("core_seo_settings").upsert({
        key: "robots_txt",
        value: JSON.parse(JSON.stringify(content)),
      }, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("robots.txt salvo com sucesso");
      setRobotsDraft(null);
      refetchRobots();
    },
    onError: () => toast.error("Erro ao salvar robots.txt"),
  });

  // Analyzed data
  const analyzedNews = newsWithSeo.map(news => {
    const issues: string[] = [];
    let score = 100;

    if (!news.meta_title || news.meta_title.length < 10) { issues.push("Meta título ausente/curto"); score -= 20; }
    else if (news.meta_title.length > 60) { issues.push("Meta título >60 chars"); score -= 10; }
    if (!news.meta_description || news.meta_description.length < 50) { issues.push("Meta descrição ausente/curta"); score -= 20; }
    else if (news.meta_description.length > 160) { issues.push("Meta descrição >160 chars"); score -= 10; }
    if (!news.featured_image_url) { issues.push("Sem imagem destaque"); score -= 15; }
    if (!news.slug || news.slug.length < 3) { issues.push("Slug curto"); score -= 10; }

    const readability = news.content ? analyzeReadability(news.content) : { score: 0, level: "N/A", avgSentLen: 0, avgSyllPerWord: 0 };
    if (readability.score < 40 && news.content) { issues.push("Legibilidade baixa"); score -= 10; }

    const keywords = news.content ? analyzeKeywords(news.content, news.title) : [];
    const suggestions = generateSuggestions(news);

    return { ...news, seoScore: Math.max(0, score), issues, readability, keywords, suggestions };
  });

  const avgScore = analyzedNews.length > 0 ? Math.round(analyzedNews.reduce((s, n) => s + n.seoScore, 0) / analyzedNews.length) : 0;
  const avgReadability = analyzedNews.length > 0 ? Math.round(analyzedNews.reduce((s, n) => s + n.readability.score, 0) / analyzedNews.length) : 0;
  const goodCount = analyzedNews.filter(n => n.seoScore >= 80).length;
  const badCount = analyzedNews.filter(n => n.seoScore < 50).length;

  const selected = selectedArticle ? analyzedNews.find(n => n.id === selectedArticle) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <NavLink to="/spah/painel/core-engine">
          <Button variant="ghost" size="icon" className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
        </NavLink>
        <div className="p-2 rounded-xl bg-blue-500/10"><Search className="h-5 w-5 text-blue-500" /></div>
        <div>
          <h1 className="text-xl font-bold">SEO Profissional</h1>
          <p className="text-xs text-muted-foreground">Análise completa: SEO, legibilidade, keywords e schema</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-3 flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-primary" />
            <div><p className="text-2xl font-bold">{avgScore}</p><p className="text-xs text-muted-foreground">Score SEO Médio</p></div>
          </CardContent>
        </Card>
        <Card className="bg-indigo-500/5 border-indigo-500/20">
          <CardContent className="p-3 flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-indigo-500" />
            <div><p className="text-2xl font-bold">{avgReadability}</p><p className="text-xs text-muted-foreground">Legibilidade Média</p></div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/5 border-green-500/20">
          <CardContent className="p-3 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div><p className="text-2xl font-bold">{goodCount}</p><p className="text-xs text-muted-foreground">Bom (≥80)</p></div>
          </CardContent>
        </Card>
        <Card className="bg-red-500/5 border-red-500/20">
          <CardContent className="p-3 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <div><p className="text-2xl font-bold">{badCount}</p><p className="text-xs text-muted-foreground">Crítico (&lt;50)</p></div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="scores" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 h-auto">
          <TabsTrigger value="scores" className="text-xs gap-1"><BarChart3 className="h-3.5 w-3.5" />Scores</TabsTrigger>
          <TabsTrigger value="readability" className="text-xs gap-1"><BookOpen className="h-3.5 w-3.5" />Legibilidade</TabsTrigger>
          <TabsTrigger value="keywords" className="text-xs gap-1"><TrendingUp className="h-3.5 w-3.5" />Keywords</TabsTrigger>
          <TabsTrigger value="suggestions" className="text-xs gap-1"><Lightbulb className="h-3.5 w-3.5" />Sugestões</TabsTrigger>
          <TabsTrigger value="robots" className="text-xs gap-1"><FileCode className="h-3.5 w-3.5" />robots.txt</TabsTrigger>
        </TabsList>

        {/* ── Tab: Scores ───────────────────────── */}
        <TabsContent value="scores">
          <Card>
            <CardHeader className="p-4 border-b">
              <CardTitle className="text-sm">Análise SEO por Notícia</CardTitle>
              <CardDescription className="text-xs">Últimas {analyzedNews.length} notícias publicadas</CardDescription>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-border">
              {analyzedNews.map(news => (
                <div key={news.id} className="p-4 flex items-start gap-3 hover:bg-accent/30 cursor-pointer" onClick={() => setSelectedArticle(news.id)}>
                  <ScoreBadge score={news.seoScore} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{news.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">/{news.slug}</p>
                    {news.issues.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {news.issues.map((issue, i) => (
                          <Badge key={i} variant="outline" className="text-[10px] text-destructive border-destructive/30">{issue}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <ReadabilityBadge score={news.readability.score} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab: Legibilidade ───────────────── */}
        <TabsContent value="readability">
          <Card>
            <CardHeader className="p-4 border-b">
              <CardTitle className="text-sm">Score de Legibilidade (Flesch PT-BR)</CardTitle>
              <CardDescription className="text-xs">Baseado no índice Flesch adaptado para português</CardDescription>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-border">
              {analyzedNews.map(news => (
                <div key={news.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium truncate flex-1 mr-4">{news.title}</p>
                    <Badge variant="outline" className={cn("text-xs", 
                      news.readability.score >= 60 ? "text-green-500 bg-green-500/10" : 
                      news.readability.score >= 40 ? "text-yellow-500 bg-yellow-500/10" : "text-red-500 bg-red-500/10"
                    )}>
                      {news.readability.score} — {news.readability.level}
                    </Badge>
                  </div>
                  <Progress value={news.readability.score} className="h-1.5 mb-2" />
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>Palavras/frase: <strong>{news.readability.avgSentLen}</strong></span>
                    <span>Sílabas/palavra: <strong>{news.readability.avgSyllPerWord}</strong></span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab: Keywords ─────────────────────── */}
        <TabsContent value="keywords">
          <div className="grid gap-4">
            <Card>
              <CardHeader className="p-4 border-b">
                <CardTitle className="text-sm">Selecione um artigo para análise de keywords</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div className="max-h-48 overflow-y-auto divide-y divide-border">
                  {analyzedNews.map(news => (
                    <button key={news.id} onClick={() => setSelectedArticle(news.id)}
                      className={cn("w-full text-left p-2 text-sm hover:bg-accent/30 rounded transition-colors truncate",
                        selectedArticle === news.id && "bg-accent"
                      )}>
                      {news.title}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
            {selected && (
              <Card>
                <CardHeader className="p-4 border-b">
                  <CardTitle className="text-sm">Keywords: {selected.title}</CardTitle>
                  <CardDescription className="text-xs">Top 15 termos com maior frequência</CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selected.keywords.map((kw, i) => (
                      <div key={kw.word} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                        <span className="text-xs font-mono text-muted-foreground w-5">#{i + 1}</span>
                        <span className="text-sm font-medium flex-1">{kw.word}</span>
                        <Badge variant="outline" className="text-[10px]">{kw.count}× ({kw.density}%)</Badge>
                        {kw.inTitle && <Badge className="text-[10px] bg-green-500/10 text-green-500 border-green-500/20" variant="outline">No título</Badge>}
                      </div>
                    ))}
                  </div>
                  {selected.keywords.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">Sem conteúdo para análise</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* ── Tab: Sugestões ─────────────────── */}
        <TabsContent value="suggestions">
          <Card>
            <CardHeader className="p-4 border-b">
              <CardTitle className="text-sm">Sugestões Automáticas de Otimização</CardTitle>
              <CardDescription className="text-xs">Recomendações priorizadas por impacto</CardDescription>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-border">
              {analyzedNews.filter(n => n.suggestions.some(s => s.type !== "info" || !s.text.startsWith("✅"))).map(news => (
                <div key={news.id} className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ScoreBadge score={news.seoScore} />
                    <p className="text-sm font-medium truncate">{news.title}</p>
                  </div>
                  <div className="space-y-1.5 ml-8">
                    {news.suggestions.map((s, i) => (
                      <div key={i} className={cn("flex items-start gap-2 text-xs rounded-md p-1.5",
                        s.type === "error" ? "bg-red-500/5 text-red-600" :
                        s.type === "warning" ? "bg-yellow-500/5 text-yellow-600" : "bg-blue-500/5 text-blue-600"
                      )}>
                        {s.type === "error" ? <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" /> :
                         s.type === "warning" ? <Eye className="h-3.5 w-3.5 mt-0.5 shrink-0" /> :
                         <Lightbulb className="h-3.5 w-3.5 mt-0.5 shrink-0" />}
                        <span>{s.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {analyzedNews.every(n => n.suggestions.every(s => s.text.startsWith("✅"))) && (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  Todos os artigos estão bem otimizados!
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab: robots.txt ────────────────── */}
        <TabsContent value="robots">
          <Card>
            <CardHeader className="p-4 border-b">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileCode className="h-4 w-4" />
                Editor robots.txt
              </CardTitle>
              <CardDescription className="text-xs">Configure diretivas de rastreamento para bots de busca</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <Textarea
                value={currentRobots}
                onChange={e => setRobotsDraft(e.target.value)}
                className="font-mono text-xs min-h-[200px]"
                placeholder="User-agent: *&#10;Allow: /"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">As alterações serão refletidas em /robots.txt</p>
                <Button
                  size="sm"
                  onClick={() => saveRobotsMutation.mutate(currentRobots)}
                  disabled={saveRobotsMutation.isPending || robotsDraft === null}
                >
                  {saveRobotsMutation.isPending ? "Salvando..." : "Salvar robots.txt"}
                </Button>
              </div>

              {/* Quick tips */}
              <Card className="bg-muted/50 border-dashed">
                <CardContent className="p-3 space-y-2">
                  <p className="text-xs font-semibold">Referência rápida:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-[11px] text-muted-foreground font-mono">
                    <span>User-agent: * → todos os bots</span>
                    <span>Disallow: /admin/ → bloqueia pasta</span>
                    <span>Allow: / → libera tudo</span>
                    <span>Sitemap: URL → indica sitemap</span>
                    <span>Crawl-delay: 10 → intervalo em seg</span>
                    <span>User-agent: Googlebot → bot específico</span>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
