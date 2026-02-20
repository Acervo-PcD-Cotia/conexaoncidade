import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, ArrowLeft, CheckSquare, Square, RefreshCw, Zap, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { NewsIssueCard } from "../components/NewsIssueCard";
import { useNewsWithIssues } from "../hooks/useNewsWithIssues";
import { ContentRepairDialog } from "../components/ContentRepairDialog";

export default function ContentFixer() {
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: emptyNews, isLoading, refetch } = useNewsWithIssues({
    issueType: "missing_source",
    limit: 200,
  });

  // Filter: news with no content_html or very short content
  const newsWithoutContent = (emptyNews || []);

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    if (selectedIds.size === newsWithoutContent.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(newsWithoutContent.map(n => n.id)));
  };

  const selectedNews = newsWithoutContent.filter(n => selectedIds.has(n.id));

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
          <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950/30">
            <FileText className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Corrigir Conteúdo Vazio</h1>
            <p className="text-muted-foreground">
              {newsWithoutContent.length} notícias sem conteúdo ou com conteúdo insuficiente
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-4">
        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-amber-800 dark:text-amber-400">Preservação de tamanho original</p>
          <p className="text-amber-700 dark:text-amber-500 mt-0.5">
            A IA irá buscar o conteúdo completo da fonte original. O conteúdo <strong>não será resumido</strong> — 
            preservando 95–105% do tamanho original conforme política editorial.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          {selectedIds.size > 0 ? (
            <span>{selectedIds.size} selecionada(s)</span>
          ) : (
            <span>Selecione as notícias para corrigir o conteúdo</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={selectAll}>
            {selectedIds.size === newsWithoutContent.length ? (
              <><Square className="h-4 w-4 mr-2" />Desmarcar</>
            ) : (
              <><CheckSquare className="h-4 w-4 mr-2" />Selecionar Todos</>
            )}
          </Button>
          <Button onClick={() => setDialogOpen(true)} disabled={selectedIds.size === 0}>
            <Zap className="h-4 w-4 mr-2" />
            Corrigir com IA ({selectedIds.size})
          </Button>
        </div>
      </div>

      {/* News List */}
      <ScrollArea className="h-[calc(100vh-320px)]">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
          </div>
        ) : newsWithoutContent.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma notícia sem conteúdo encontrada</p>
          </div>
        ) : (
          <div className="space-y-3 pr-4">
            {newsWithoutContent.map((news) => (
              <NewsIssueCard
                key={news.id}
                news={news}
                selected={selectedIds.has(news.id)}
                onSelect={() => toggleSelect(news.id)}
                issueType="content"
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
          mode="content"
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
