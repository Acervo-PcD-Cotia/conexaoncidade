import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Type, ArrowLeft, CheckSquare, Square, RefreshCw, Zap, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { NewsIssueCard } from "../components/NewsIssueCard";
import { useNewsWithIssues } from "../hooks/useNewsWithIssues";
import { ContentRepairDialog } from "../components/ContentRepairDialog";

export default function TitleFixer() {
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch all published news - title fixer can work on any article
  const { data: news, isLoading, refetch } = useNewsWithIssues({
    issueType: "all",
    limit: 200,
  });

  // Show all news - title/subtitle can always be improved
  const newsToFix = (news || []);

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    if (selectedIds.size === newsToFix.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(newsToFix.map(n => n.id)));
  };

  const selectedNews = newsToFix.filter(n => selectedIds.has(n.id));
  const handleRefresh = () => refetch();
  const handleSuccess = () => { setSelectedIds(new Set()); handleRefresh(); };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/spah/painel/content-fix")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950/30">
            <Type className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Corrigir Título e Subtítulo</h1>
            <p className="text-muted-foreground">
              {newsToFix.length} notícias com título ou subtítulo para aprimorar
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800 p-4">
        <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-blue-800 dark:text-blue-400">Aprimoramento de título e subtítulo</p>
          <p className="text-blue-700 dark:text-blue-500 mt-0.5">
            A IA irá aprimorar o título (máx. 60 chars) e gerar/reescrever o subtítulo (máx. 160 chars)
            mantendo <strong>fidelidade total ao conteúdo original</strong>. Nenhum conteúdo será alterado ou resumido.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          {selectedIds.size > 0 ? (
            <span>{selectedIds.size} selecionada(s)</span>
          ) : (
            <span>Selecione as notícias para aprimorar título e subtítulo</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={selectAll}>
            {selectedIds.size === newsToFix.length ? (
              <><Square className="h-4 w-4 mr-2" />Desmarcar</>
            ) : (
              <><CheckSquare className="h-4 w-4 mr-2" />Selecionar Todos</>
            )}
          </Button>
          <Button onClick={() => setDialogOpen(true)} disabled={selectedIds.size === 0}>
            <Zap className="h-4 w-4 mr-2" />
            Aprimorar com IA ({selectedIds.size})
          </Button>
        </div>
      </div>

      {/* News List */}
      <ScrollArea className="h-[calc(100vh-320px)]">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
          </div>
        ) : newsToFix.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Type className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma notícia encontrada para aprimorar título</p>
          </div>
        ) : (
          <div className="space-y-3 pr-4">
            {newsToFix.map((news) => (
              <NewsIssueCard
                key={news.id}
                news={news}
                selected={selectedIds.has(news.id)}
                onSelect={() => toggleSelect(news.id)}
                issueType="title"
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {dialogOpen && (
        <ContentRepairDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          selectedNews={selectedNews.map(n => ({ id: n.id, title: n.title, source: n.source }))}
          mode="title"
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
