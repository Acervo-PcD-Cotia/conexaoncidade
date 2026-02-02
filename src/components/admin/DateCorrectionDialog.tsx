import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, CalendarClock, Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface NewsItem {
  id: string;
  title: string;
  published_at: string | null;
  source: string | null;
}

interface DateCorrectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedNews: NewsItem[];
  onSuccess: () => void;
}

type CorrectionMode = "original" | "manual";

interface ProcessResult {
  id: string;
  title: string;
  status: "success" | "error" | "skipped";
  message?: string;
  newDate?: string | null;
}

export function DateCorrectionDialog({
  open,
  onOpenChange,
  selectedNews,
  onSuccess,
}: DateCorrectionDialogProps) {
  const [mode, setMode] = useState<CorrectionMode>("original");
  const [manualDate, setManualDate] = useState<Date | undefined>(undefined);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState<ProcessResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const resetState = () => {
    setMode("original");
    setManualDate(undefined);
    setIsProcessing(false);
    setProgress({ current: 0, total: 0 });
    setResults([]);
    setShowResults(false);
  };

  const handleClose = () => {
    if (!isProcessing) {
      resetState();
      onOpenChange(false);
    }
  };

  const handleCorrect = async () => {
    if (mode === "manual" && !manualDate) {
      toast.error("Selecione uma data para aplicar");
      return;
    }

    setIsProcessing(true);
    setProgress({ current: 0, total: selectedNews.length });
    setResults([]);

    if (mode === "manual") {
      // Manual mode: update directly via Supabase
      const newResults: ProcessResult[] = [];
      const dateIso = manualDate!.toISOString();

      for (let i = 0; i < selectedNews.length; i++) {
        const news = selectedNews[i];
        setProgress({ current: i + 1, total: selectedNews.length });

        try {
          const { error } = await supabase
            .from("news")
            .update({ published_at: dateIso })
            .eq("id", news.id);

          if (error) {
            newResults.push({
              id: news.id,
              title: news.title,
              status: "error",
              message: error.message,
            });
          } else {
            newResults.push({
              id: news.id,
              title: news.title,
              status: "success",
              newDate: dateIso,
              message: `Atualizado para ${format(manualDate!, "dd/MM/yyyy", { locale: ptBR })}`,
            });
          }
        } catch (error) {
          newResults.push({
            id: news.id,
            title: news.title,
            status: "error",
            message: error instanceof Error ? error.message : "Erro desconhecido",
          });
        }
      }

      setResults(newResults);
      setShowResults(true);
      setIsProcessing(false);

      const successCount = newResults.filter((r) => r.status === "success").length;
      if (successCount > 0) {
        toast.success(`${successCount} notícia(s) atualizada(s) com sucesso`);
        onSuccess();
      }
    } else {
      // Original mode: use Edge Function to fetch dates from sources
      try {
        const newsIds = selectedNews.map((n) => n.id);
        
        const { data, error } = await supabase.functions.invoke("fix-publication-dates", {
          body: {
            dryRun: false,
            newsIds,
            limit: newsIds.length,
            onlyMissing: false,
          },
        });

        if (error) {
          throw error;
        }

        const functionResults = data?.results || [];
        const newResults: ProcessResult[] = functionResults.map((r: any) => ({
          id: r.id,
          title: r.title,
          status: r.status,
          newDate: r.newDate,
          message: r.message,
        }));

        setResults(newResults);
        setShowResults(true);
        setProgress({ current: selectedNews.length, total: selectedNews.length });

        const successCount = newResults.filter((r) => r.status === "success").length;
        if (successCount > 0) {
          toast.success(`${successCount} notícia(s) corrigida(s) com sucesso`);
          onSuccess();
        } else {
          toast.warning("Nenhuma data foi corrigida. Verifique os resultados.");
        }
      } catch (error) {
        console.error("Error calling fix-publication-dates:", error);
        toast.error("Erro ao processar correção de datas");
        setResults(
          selectedNews.map((n) => ({
            id: n.id,
            title: n.title,
            status: "error" as const,
            message: error instanceof Error ? error.message : "Erro ao chamar função",
          }))
        );
        setShowResults(true);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const successCount = results.filter((r) => r.status === "success").length;
  const errorCount = results.filter((r) => r.status === "error").length;
  const skippedCount = results.filter((r) => r.status === "skipped").length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5" />
            Corrigir Datas de Publicação
          </DialogTitle>
          <DialogDescription>
            {showResults
              ? "Veja o resultado do processamento abaixo"
              : `Escolha como corrigir as datas de ${selectedNews.length} notícia(s) selecionada(s)`}
          </DialogDescription>
        </DialogHeader>

        {!showResults ? (
          <>
            {/* Mode Selection */}
            <div className="space-y-4">
              <RadioGroup
                value={mode}
                onValueChange={(v) => setMode(v as CorrectionMode)}
                disabled={isProcessing}
              >
                <div className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-muted/50">
                  <RadioGroupItem value="original" id="original" className="mt-0.5" />
                  <div className="space-y-1">
                    <Label htmlFor="original" className="font-medium cursor-pointer">
                      Buscar data original da fonte
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Extrai automaticamente a data real de publicação acessando a página original
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-muted/50">
                  <RadioGroupItem value="manual" id="manual" className="mt-0.5" />
                  <div className="space-y-1 flex-1">
                    <Label htmlFor="manual" className="font-medium cursor-pointer">
                      Definir data manualmente
                    </Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Aplica a mesma data para todas as notícias selecionadas
                    </p>
                    {mode === "manual" && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !manualDate && "text-muted-foreground"
                            )}
                            disabled={isProcessing}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {manualDate
                              ? format(manualDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                              : "Selecione a data"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={manualDate}
                            onSelect={setManualDate}
                            initialFocus
                            locale={ptBR}
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                </div>
              </RadioGroup>

              {/* Selected news list */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Notícias selecionadas ({selectedNews.length})
                </Label>
                <ScrollArea className="h-[150px] rounded-md border p-2">
                  <div className="space-y-2">
                    {selectedNews.map((news) => (
                      <div
                        key={news.id}
                        className="flex items-center justify-between text-sm py-1"
                      >
                        <span className="line-clamp-1 flex-1">{news.title}</span>
                        <span className="text-muted-foreground ml-2 shrink-0">
                          {news.published_at
                            ? format(new Date(news.published_at), "dd/MM/yyyy")
                            : "-"}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Progress */}
              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Processando...</span>
                    <span>
                      {progress.current} / {progress.total}
                    </span>
                  </div>
                  <Progress value={(progress.current / progress.total) * 100} />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
                Cancelar
              </Button>
              <Button onClick={handleCorrect} disabled={isProcessing}>
                {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isProcessing ? "Processando..." : "Corrigir Datas"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            {/* Results View */}
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="flex items-center gap-2 rounded-lg border p-3 bg-green-50 dark:bg-green-950/20">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-lg font-semibold text-green-700 dark:text-green-400">
                      {successCount}
                    </p>
                    <p className="text-xs text-green-600">Sucesso</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg border p-3 bg-red-50 dark:bg-red-950/20">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-lg font-semibold text-red-700 dark:text-red-400">
                      {errorCount}
                    </p>
                    <p className="text-xs text-red-600">Erros</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg border p-3 bg-yellow-50 dark:bg-yellow-950/20">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-lg font-semibold text-yellow-700 dark:text-yellow-400">
                      {skippedCount}
                    </p>
                    <p className="text-xs text-yellow-600">Pulados</p>
                  </div>
                </div>
              </div>

              {/* Results List */}
              <ScrollArea className="h-[200px] rounded-md border">
                <div className="p-2 space-y-2">
                  {results.map((result) => (
                    <div
                      key={result.id}
                      className={cn(
                        "flex items-start gap-2 p-2 rounded text-sm",
                        result.status === "success" && "bg-green-50 dark:bg-green-950/20",
                        result.status === "error" && "bg-red-50 dark:bg-red-950/20",
                        result.status === "skipped" && "bg-yellow-50 dark:bg-yellow-950/20"
                      )}
                    >
                      {result.status === "success" && (
                        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                      )}
                      {result.status === "error" && (
                        <XCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                      )}
                      {result.status === "skipped" && (
                        <AlertCircle className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium line-clamp-1">{result.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {result.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <DialogFooter>
              <Button onClick={handleClose}>Fechar</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
