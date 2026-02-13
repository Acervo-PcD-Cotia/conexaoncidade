import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, ArrowLeft, CheckSquare, Square, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { DateCorrectionDialog } from "@/components/admin/DateCorrectionDialog";
import { NewsIssueCard } from "../components/NewsIssueCard";
import { useNewsWithIssues } from "../hooks/useNewsWithIssues";
import { useContentFixStats } from "../hooks/useContentFixStats";
import type { IssueType, NewsWithIssue } from "../types";

type DateIssueFilter = "future_date" | "missing_original_date" | "all";

export default function DateFixer() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<DateIssueFilter>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: stats, refetch: refetchStats } = useContentFixStats();
  
  const { data: futureDates, isLoading: loadingFuture, refetch: refetchFuture } = useNewsWithIssues({
    issueType: "future_date",
    limit: 200,
  });
  
  const { data: missingOriginal, isLoading: loadingMissing, refetch: refetchMissing } = useNewsWithIssues({
    issueType: "missing_original_date",
    limit: 200,
  });

  const isLoading = loadingFuture || loadingMissing;

  // Combine and filter news
  const allNews = [
    ...(futureDates || []),
    ...(missingOriginal || []),
  ].filter((news, index, self) => 
    index === self.findIndex(n => n.id === news.id)
  );

  const filteredNews = filter === "all" 
    ? allNews
    : filter === "future_date"
      ? futureDates || []
      : missingOriginal || [];

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    if (selectedIds.size === filteredNews.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredNews.map(n => n.id)));
    }
  };

  const selectedNews = filteredNews.filter(n => selectedIds.has(n.id));

  const handleRefresh = () => {
    refetchFuture();
    refetchMissing();
    refetchStats();
  };

  const handleSuccess = () => {
    setSelectedIds(new Set());
    handleRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/spah/painel/content-fix")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950/30">
            <Calendar className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Correção de Datas</h1>
            <p className="text-muted-foreground">
              {(stats?.futureDates || 0) + (stats?.missingOriginalDate || 0)} notícias com problemas de data
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-4">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as DateIssueFilter)}>
          <TabsList>
            <TabsTrigger value="all">
              Todos
              <Badge variant="secondary" className="ml-2">
                {allNews.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="future_date">
              Datas Futuras
              <Badge variant="secondary" className="ml-2">
                {stats?.futureDates || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="missing_original_date">
              Sem Original
              <Badge variant="secondary" className="ml-2">
                {stats?.missingOriginalDate || 0}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={selectAll}>
            {selectedIds.size === filteredNews.length ? (
              <>
                <Square className="h-4 w-4 mr-2" />
                Desmarcar
              </>
            ) : (
              <>
                <CheckSquare className="h-4 w-4 mr-2" />
                Selecionar Todos
              </>
            )}
          </Button>

          <Button 
            onClick={() => setDialogOpen(true)}
            disabled={selectedIds.size === 0}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Corrigir ({selectedIds.size})
          </Button>
        </div>
      </div>

      {/* News List */}
      <ScrollArea className="h-[calc(100vh-280px)]">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma notícia com problemas de data encontrada</p>
          </div>
        ) : (
          <div className="space-y-3 pr-4">
            {filteredNews.map((news) => (
              <NewsIssueCard
                key={news.id}
                news={news}
                selected={selectedIds.has(news.id)}
                onSelect={() => toggleSelect(news.id)}
                issueType="date"
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Correction Dialog */}
      <DateCorrectionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        selectedNews={selectedNews.map(n => ({
          id: n.id,
          title: n.title,
          published_at: n.published_at,
          source: n.source,
        }))}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
