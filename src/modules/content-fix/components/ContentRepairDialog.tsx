import { useState } from "react";
import { Zap, Loader2, CheckCircle2, XCircle, AlertCircle, FileText, Type } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type RepairMode = "content" | "title";

interface RepairItem {
  id: string;
  title: string;
  source: string | null;
}

interface ProcessResult {
  id: string;
  title: string;
  status: "pending" | "processing" | "success" | "error";
  message?: string;
  newValue?: string;
}

interface ContentRepairDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedNews: RepairItem[];
  mode: RepairMode;
  onSuccess: () => void;
}

export function ContentRepairDialog({
  open,
  onOpenChange,
  selectedNews,
  mode,
  onSuccess,
}: ContentRepairDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ProcessResult[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const isDone = results.length === selectedNews.length && results.length > 0;
  const successCount = results.filter(r => r.status === "success").length;
  const errorCount = results.filter(r => r.status === "error").length;
  const progress = results.length > 0 ? (results.length / selectedNews.length) * 100 : 0;

  const handleClose = () => {
    if (!isProcessing) {
      setResults([]);
      setCurrentIndex(0);
      onOpenChange(false);
    }
  };

  const handleStart = async () => {
    setIsProcessing(true);
    const newResults: ProcessResult[] = selectedNews.map(n => ({
      id: n.id,
      title: n.title,
      status: "pending",
    }));
    setResults([...newResults]);

    for (let i = 0; i < selectedNews.length; i++) {
      setCurrentIndex(i);
      const item = selectedNews[i];

      // Mark as processing
      newResults[i] = { ...newResults[i], status: "processing" };
      setResults([...newResults]);

      try {
        if (mode === "content") {
          const { data, error } = await supabase.functions.invoke("fix-news-content", {
            body: { newsId: item.id, sourceUrl: item.source, mode: "content" },
          });
          if (error) throw error;
          if (data?.success === false) throw new Error(data?.error || "Erro desconhecido");
          newResults[i] = {
            ...newResults[i],
            status: "success",
            message: "Conteúdo recuperado da fonte",
            newValue: data?.preview,
          };
        } else {
          const { data, error } = await supabase.functions.invoke("fix-news-content", {
            body: { newsId: item.id, sourceUrl: item.source, mode: "title" },
          });
          if (error) throw error;
          if (data?.success === false) throw new Error(data?.error || "Erro desconhecido");
          newResults[i] = {
            ...newResults[i],
            status: "success",
            message: "Título e subtítulo aprimorados",
            newValue: data?.newTitle,
          };
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erro ao processar";
        // User-friendly messages for common errors
        const friendlyMsg = msg.includes("402")
          ? "Créditos Lovable AI esgotados. Acesse Configurações > IA."
          : msg.includes("429")
          ? "Limite de requisições atingido. Aguarde e tente novamente."
          : msg.includes("Failed to send")
          ? "Erro de conexão com a função de IA."
          : msg;
        newResults[i] = {
          ...newResults[i],
          status: "error",
          message: friendlyMsg,
        };
      }

      setResults([...newResults]);
      // Small delay between items
      await new Promise(res => setTimeout(res, 300));
    }

    setIsProcessing(false);
    if (successCount > 0) {
      toast.success(`${successCount} notícia(s) corrigida(s) com sucesso!`);
      onSuccess();
    }
  };

  const modeConfig = {
    content: {
      icon: FileText,
      title: "Corrigir Conteúdo Vazio",
      description: `Buscar conteúdo completo da fonte para ${selectedNews.length} notícia(s)`,
      startLabel: "Iniciar Recuperação",
      color: "purple",
    },
    title: {
      icon: Type,
      title: "Aprimorar Título e Subtítulo",
      description: `Aprimorar título e subtítulo de ${selectedNews.length} notícia(s) com IA`,
      startLabel: "Iniciar Aprimoramento",
      color: "indigo",
    },
  }[mode];

  const ModeIcon = modeConfig.icon;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ModeIcon className="h-5 w-5" />
            {modeConfig.title}
          </DialogTitle>
          <DialogDescription>{modeConfig.description}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden space-y-4">
          {/* Pre-start state */}
          {!isProcessing && results.length === 0 && (
            <div className="space-y-4">
              {/* Warning */}
              <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-4">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-sm space-y-1">
                  <p className="font-medium text-amber-800 dark:text-amber-400">
                    {mode === "content"
                      ? "O conteúdo NÃO será resumido"
                      : "O conteúdo da notícia não será alterado"}
                  </p>
                  <p className="text-amber-700 dark:text-amber-500">
                    {mode === "content"
                      ? "A IA irá recuperar o conteúdo integral da fonte original, preservando 95–105% do tamanho original."
                      : "Apenas o título (máx. 60 chars) e o subtítulo (máx. 160 chars) serão aprimorados."}
                  </p>
                </div>
              </div>

              {/* News list preview */}
              <ScrollArea className="h-48 border rounded-lg">
                <div className="p-2 space-y-1">
                  {selectedNews.map((news) => (
                    <div key={news.id} className="flex items-center gap-2 text-sm p-2 rounded hover:bg-muted/50">
                      <ModeIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="line-clamp-1 flex-1">{news.title}</span>
                      {news.source && (
                        <Badge variant="outline" className="text-xs shrink-0">Tem fonte</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Processing / Done state */}
          {(isProcessing || results.length > 0) && (
            <div className="space-y-4">
              {/* Progress header */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        Processando {Math.min(currentIndex + 1, selectedNews.length)} de {selectedNews.length}...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        Processamento concluído
                      </span>
                    )}
                  </span>
                  <span className="text-muted-foreground">{Math.round(progress)}%</span>
                </div>

                <Progress value={progress} className="h-2" />

                {/* Stats row */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-sm">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-green-700 dark:text-green-400 font-medium">{successCount} sucesso</span>
                  </div>
                  {errorCount > 0 && (
                    <div className="flex items-center gap-1.5 text-sm">
                      <div className="h-2 w-2 rounded-full bg-red-500" />
                      <span className="text-red-700 dark:text-red-400 font-medium">{errorCount} erro(s)</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-sm">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                    <span className="text-muted-foreground">
                      {selectedNews.length - results.length} aguardando
                    </span>
                  </div>
                </div>
              </div>

              {/* Items list */}
              <ScrollArea className="h-60 border rounded-lg">
                <div className="p-2 space-y-1.5">
                  {selectedNews.map((news, idx) => {
                    const result = results[idx];
                    const status = result?.status || "pending";
                    return (
                      <div
                        key={news.id}
                        className={cn(
                          "flex items-center gap-3 p-2.5 rounded-md text-sm transition-all",
                          status === "success" && "bg-green-50 dark:bg-green-950/20",
                          status === "error" && "bg-red-50 dark:bg-red-950/20",
                          status === "processing" && "bg-primary/5 border border-primary/20",
                          status === "pending" && "opacity-50",
                        )}
                      >
                        {/* Status icon */}
                        <div className="shrink-0">
                          {status === "pending" && <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />}
                          {status === "processing" && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                          {status === "success" && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                          {status === "error" && <XCircle className="h-4 w-4 text-red-600" />}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="line-clamp-1 font-medium">{news.title}</p>
                          {result?.message && (
                            <p className={cn(
                              "text-xs mt-0.5",
                              status === "success" ? "text-green-600" : "text-red-500"
                            )}>
                              {result.message}
                            </p>
                          )}
                          {result?.newValue && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 italic">
                              → {result.newValue}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
            {isDone ? "Fechar" : "Cancelar"}
          </Button>
          {!isProcessing && results.length === 0 && (
            <Button onClick={handleStart}>
              <Zap className="h-4 w-4 mr-2" />
              {modeConfig.startLabel}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
