import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  FileText, CheckCircle, Clock, AlertTriangle, BarChart3,
  PenTool, Eye, Star, ListChecks, Users
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// ─── Editorial KPIs ───
function EditorialKpis() {
  const { data: news } = useQuery({
    queryKey: ["core-editorial-stats"],
    queryFn: async () => {
      const { data } = await supabase
        .from("news")
        .select("id, status, editor_name, created_at, published_at")
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(500);
      return data ?? [];
    },
  });

  const total = news?.length ?? 0;
  const published = news?.filter(n => n.status === "published").length ?? 0;
  const drafts = news?.filter(n => n.status === "draft").length ?? 0;
  const review = news?.filter(n => n.status === "review" || n.status === "approved").length ?? 0;
  const avgScore = total > 0 ? Math.round((published / total) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="bg-muted/50">
          <CardContent className="p-3 flex items-center gap-3">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xl font-bold">{total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/5 border-green-500/20">
          <CardContent className="p-3 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-xl font-bold">{published}</p>
              <p className="text-xs text-muted-foreground">Publicadas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-500/5 border-yellow-500/20">
          <CardContent className="p-3 flex items-center gap-3">
            <Clock className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="text-xl font-bold">{drafts}</p>
              <p className="text-xs text-muted-foreground">Rascunhos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-orange-500/5 border-orange-500/20">
          <CardContent className="p-3 flex items-center gap-3">
            <Eye className="h-5 w-5 text-orange-500" />
            <div>
              <p className="text-xl font-bold">{review}</p>
              <p className="text-xs text-muted-foreground">Em revisão</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/5 border-purple-500/20">
          <CardContent className="p-3 flex items-center gap-3">
            <Star className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-xl font-bold">{avgScore}</p>
              <p className="text-xs text-muted-foreground">Score Médio</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Quality Checklist Overview ───
function QualityChecklist() {
  const checks = [
    { name: "Título com até 65 caracteres", rule: "SEO obrigatório", status: "active" },
    { name: "Meta description preenchida", rule: "SEO obrigatório", status: "active" },
    { name: "Imagem hero definida", rule: "Editorial obrigatório", status: "active" },
    { name: "Texto ALT da imagem hero", rule: "Acessibilidade", status: "active" },
    { name: "Autor definido", rule: "Editorial obrigatório", status: "active" },
    { name: "Categoria selecionada", rule: "Classificação", status: "active" },
    { name: "Mínimo 300 palavras", rule: "Qualidade", status: "active" },
    { name: "Tags definidas (mín. 2)", rule: "SEO recomendado", status: "active" },
    { name: "Slug personalizado", rule: "SEO recomendado", status: "active" },
    { name: "Fonte/crédito informado", rule: "Ética jornalística", status: "active" },
    { name: "Sanitização HTML (DOMPurify)", rule: "Segurança", status: "active" },
    { name: "Score editorial ≥ 60", rule: "Qualidade mínima", status: "active" },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <ListChecks className="h-4 w-4" />
          Checklist de Publicação
        </CardTitle>
        <CardDescription>Regras aplicadas automaticamente antes da publicação</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {checks.map((c, i) => (
            <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg border bg-green-500/5 border-green-500/20">
              <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.rule}</p>
              </div>
              <Badge variant="outline" className="bg-green-500/10 text-green-600 text-[10px]">Ativo</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Recent Articles ───
function RecentArticles() {
  const { data: news, isLoading } = useQuery({
    queryKey: ["core-editorial-recent"],
    queryFn: async () => {
      const { data } = await supabase
        .from("news")
        .select("id, title, status, editor_name, created_at, category_id")
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(20);
      return data ?? [];
    },
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Artigos Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Carregando...</p>
        ) : !news?.length ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Nenhum artigo</p>
        ) : (
          <div className="max-h-[500px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Editor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {news.map((n) => (
                  <TableRow key={n.id}>
                    <TableCell className="font-medium text-sm max-w-[250px] truncate">{n.title}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{n.editor_name ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        n.status === "published" ? "bg-green-500/10 text-green-600" :
                        n.status === "draft" ? "bg-yellow-500/10 text-yellow-600" :
                        "bg-orange-500/10 text-orange-600"
                      }>
                        {n.status === "published" ? "Publicado" : n.status === "draft" ? "Rascunho" : n.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(n.created_at), "dd/MM", { locale: ptBR })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Author Stats ───
function AuthorStats() {
  const { data: news } = useQuery({
    queryKey: ["core-editorial-authors"],
    queryFn: async () => {
      const { data } = await supabase
        .from("news")
        .select("editor_name, status")
        .is("deleted_at", null)
        .eq("status", "published");
      return data ?? [];
    },
  });

  const authorMap = new Map<string, number>();
  news?.forEach((n) => {
    const name = n.editor_name ?? "Sem autor";
    authorMap.set(name, (authorMap.get(name) ?? 0) + 1);
  });
  const topAuthors = [...authorMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Users className="h-4 w-4" /> Produção por Autor
        </CardTitle>
      </CardHeader>
      <CardContent>
        {topAuthors.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Sem dados</p>
        ) : (
          <div className="space-y-2">
            {topAuthors.map(([name, count], i) => (
              <div key={name} className="flex items-center gap-3 p-2 rounded bg-muted/50">
                <span className="text-xs text-muted-foreground w-5">{i + 1}.</span>
                <span className="text-sm flex-1">{name}</span>
                <Badge variant="outline">{count} artigos</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main ───
export default function CoreEditorial() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-indigo-500/10">
          <FileText className="h-6 w-6 text-indigo-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Editorial Avançado</h1>
          <p className="text-sm text-muted-foreground">
            Score de qualidade, checklist de publicação, produção por autor e revisão
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="overview" className="text-xs">Visão Geral</TabsTrigger>
          <TabsTrigger value="checklist" className="text-xs">Checklist</TabsTrigger>
          <TabsTrigger value="articles" className="text-xs">Artigos</TabsTrigger>
          <TabsTrigger value="authors" className="text-xs">Autores</TabsTrigger>
        </TabsList>

        <TabsContent value="overview"><EditorialKpis /></TabsContent>
        <TabsContent value="checklist"><QualityChecklist /></TabsContent>
        <TabsContent value="articles"><RecentArticles /></TabsContent>
        <TabsContent value="authors"><AuthorStats /></TabsContent>
      </Tabs>
    </div>
  );
}
