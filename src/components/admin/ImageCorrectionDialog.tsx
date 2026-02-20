import { useState } from "react";
import { Image, Loader2, CheckCircle2, XCircle, AlertCircle, ExternalLink, Zap } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type CorrectionMode = "auto" | "manual";

interface ProcessResult {
  id: string;
  title: string;
  status: "pending" | "processing" | "success" | "error" | "skipped";
  message?: string;
  newImage?: string;
}

interface ExtractedImagesResult {
  id: string;
  title: string;
  currentImage: string | null;
  extractedImages: string[];
  recommendedImage: string | null;
  status: "success" | "error";
  message?: string;
}

interface ImageCorrectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedNews: Array<{
    id: string;
    title: string;
    featured_image_url: string | null;
    source: string | null;
  }>;
  onSuccess: () => void;
}

export function ImageCorrectionDialog({
  open,
  onOpenChange,
  selectedNews,
  onSuccess,
}: ImageCorrectionDialogProps) {
  const [mode, setMode] = useState<CorrectionMode>("auto");
  const [manualUrl, setManualUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [results, setResults] = useState<ProcessResult[]>([]);
  const [extractedData, setExtractedData] = useState<ExtractedImagesResult[]>([]);
  const [selectedImages, setSelectedImages] = useState<Record<string, string>>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleClose = () => {
    if (!isProcessing && !isExtracting) {
      setMode("auto");
      setManualUrl("");
      setResults([]);
      setExtractedData([]);
      setSelectedImages({});
      setPreviewUrl(null);
      setCurrentIndex(0);
      onOpenChange(false);
    }
  };

  const handleExtractImages = async () => {
    setIsExtracting(true);
    setExtractedData([]);
    try {
      const { data, error } = await supabase.functions.invoke("fix-news-images", {
        body: { newsIds: selectedNews.map(n => n.id), mode: "extract" },
      });
      if (error) throw error;
      if (data?.results) {
        setExtractedData(data.results);
        const preSelected: Record<string, string> = {};
        data.results.forEach((r: ExtractedImagesResult) => {
          if (r.recommendedImage) preSelected[r.id] = r.recommendedImage;
        });
        setSelectedImages(preSelected);
      }
    } catch (err) {
      toast.error("Erro ao extrair imagens das fontes");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleAutoApply = async () => {
    const toApply = Object.entries(selectedImages);
    if (toApply.length === 0) {
      toast.error("Selecione pelo menos uma imagem para corrigir");
      return;
    }
    setIsProcessing(true);
    const newResults: ProcessResult[] = selectedNews.map(n => ({
      id: n.id, title: n.title,
      status: selectedImages[n.id] ? "pending" : "skipped",
      message: selectedImages[n.id] ? undefined : "Sem imagem selecionada",
    }));
    setResults([...newResults]);

    for (let i = 0; i < selectedNews.length; i++) {
      const newsItem = selectedNews[i];
      const imageUrl = selectedImages[newsItem.id];
      if (!imageUrl) continue;
      setCurrentIndex(i);
      newResults[i] = { ...newResults[i], status: "processing" };
      setResults([...newResults]);
      try {
        const { error } = await supabase.from("news").update({
          featured_image_url: imageUrl,
          og_image_url: imageUrl,
          card_image_url: imageUrl,
        }).eq("id", newsItem.id);
        if (error) throw error;
        newResults[i] = { ...newResults[i], status: "success", message: "Imagem atualizada", newImage: imageUrl };
      } catch (err) {
        newResults[i] = { ...newResults[i], status: "error", message: err instanceof Error ? err.message : "Erro" };
      }
      setResults([...newResults]);
      await new Promise(res => setTimeout(res, 200));
    }
    setIsProcessing(false);
    const successCount = newResults.filter(r => r.status === "success").length;
    if (successCount > 0) { toast.success(`${successCount} imagem(ns) corrigida(s)!`); onSuccess(); }
  };

  const handleManualApply = async () => {
    if (!manualUrl.trim()) { toast.error("Informe a URL da imagem"); return; }
    try { new URL(manualUrl); } catch { toast.error("URL inválida"); return; }
    setIsProcessing(true);
    const newResults: ProcessResult[] = selectedNews.map(n => ({ id: n.id, title: n.title, status: "pending" }));
    setResults([...newResults]);
    for (let i = 0; i < selectedNews.length; i++) {
      const newsItem = selectedNews[i];
      setCurrentIndex(i);
      newResults[i] = { ...newResults[i], status: "processing" };
      setResults([...newResults]);
      try {
        const { error } = await supabase.from("news").update({
          featured_image_url: manualUrl, og_image_url: manualUrl, card_image_url: manualUrl,
        }).eq("id", newsItem.id);
        if (error) throw error;
        newResults[i] = { ...newResults[i], status: "success", message: "Imagem atualizada", newImage: manualUrl };
      } catch (err) {
        newResults[i] = { ...newResults[i], status: "error", message: err instanceof Error ? err.message : "Erro" };
      }
      setResults([...newResults]);
      await new Promise(res => setTimeout(res, 200));
    }
    setIsProcessing(false);
    const successCount = newResults.filter(r => r.status === "success").length;
    if (successCount > 0) { toast.success(`${successCount} imagem(ns) corrigida(s)!`); onSuccess(); }
  };

  const selectImage = (newsId: string, imageUrl: string) => {
    setSelectedImages(prev => ({ ...prev, [newsId]: imageUrl }));
  };

  const isDone = results.length > 0 && !isProcessing;
  const successCount = results.filter(r => r.status === "success").length;
  const errorCount = results.filter(r => r.status === "error").length;
  const processedCount = results.filter(r => r.status === "success" || r.status === "error").length;
  const totalToProcess = results.filter(r => r.status !== "skipped").length;
  const progress = totalToProcess > 0 ? (processedCount / totalToProcess) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Corrigir Imagens
          </DialogTitle>
          <DialogDescription>
            Corrija as imagens de {selectedNews.length} notícia(s) selecionada(s)
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-2">
          <div className="space-y-5">

            {/* ── Setup Mode ── */}
            {!isProcessing && results.length === 0 && (
              <>
                <RadioGroup
                  value={mode}
                  onValueChange={(v) => setMode(v as CorrectionMode)}
                  className="grid grid-cols-2 gap-3"
                >
                  <label
                    htmlFor="auto"
                    className={cn(
                      "flex items-center gap-3 rounded-lg border-2 p-3 cursor-pointer transition-all",
                      mode === "auto" ? "border-primary bg-primary/5" : "border-muted hover:border-primary/40"
                    )}
                  >
                    <RadioGroupItem value="auto" id="auto" />
                    <div>
                      <p className="text-sm font-medium">Buscar da fonte</p>
                      <p className="text-xs text-muted-foreground">Extrai automaticamente</p>
                    </div>
                  </label>
                  <label
                    htmlFor="manual"
                    className={cn(
                      "flex items-center gap-3 rounded-lg border-2 p-3 cursor-pointer transition-all",
                      mode === "manual" ? "border-primary bg-primary/5" : "border-muted hover:border-primary/40"
                    )}
                  >
                    <RadioGroupItem value="manual" id="manual" />
                    <div>
                      <p className="text-sm font-medium">URL manual</p>
                      <p className="text-xs text-muted-foreground">Aplicar a todas</p>
                    </div>
                  </label>
                </RadioGroup>

                {/* Auto Mode */}
                {mode === "auto" && (
                  <div className="space-y-4">
                    {extractedData.length === 0 ? (
                      <div className="text-center py-10 border-2 border-dashed rounded-xl">
                        <div className="p-3 rounded-full bg-muted/80 w-fit mx-auto mb-3">
                          <Image className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Extraia imagens das fontes originais das notícias
                        </p>
                        <Button onClick={handleExtractImages} disabled={isExtracting}>
                          {isExtracting ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Extraindo...</>
                          ) : (
                            <><ExternalLink className="mr-2 h-4 w-4" />Extrair Imagens</>
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{extractedData.length} notícias analisadas</p>
                          <Badge variant="secondary">
                            {Object.keys(selectedImages).length} selecionada(s)
                          </Badge>
                        </div>
                        {extractedData.map((item) => (
                          <div key={item.id} className="border rounded-xl p-4 space-y-3 bg-muted/20">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-medium text-sm line-clamp-1 flex-1">{item.title}</h4>
                              {selectedImages[item.id] && (
                                <Badge variant="secondary" className="shrink-0">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />Selecionada
                                </Badge>
                              )}
                              {item.status === "error" && (
                                <Badge variant="destructive" className="shrink-0">{item.message || "Erro"}</Badge>
                              )}
                            </div>
                            {item.extractedImages.length > 0 ? (
                              <div className="grid grid-cols-4 gap-2">
                                {item.extractedImages.slice(0, 8).map((imgUrl, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => selectImage(item.id, imgUrl)}
                                    className={cn(
                                      "relative aspect-video rounded-lg overflow-hidden border-2 transition-all",
                                      selectedImages[item.id] === imgUrl
                                        ? "border-primary ring-2 ring-primary/30 scale-[1.02]"
                                        : "border-transparent hover:border-primary/40"
                                    )}
                                  >
                                    <img src={imgUrl} alt="" className="w-full h-full object-cover"
                                      onError={(e) => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='60'%3E%3Crect fill='%23ddd' width='100' height='60'/%3E%3C/svg%3E"; }} />
                                    {item.recommendedImage === imgUrl && (
                                      <span className="absolute bottom-1 left-1 text-[10px] bg-black/70 text-white rounded px-1">⭐</span>
                                    )}
                                    {selectedImages[item.id] === imgUrl && (
                                      <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                                        <CheckCircle2 className="h-5 w-5 text-primary" />
                                      </div>
                                    )}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground italic">Nenhuma imagem encontrada na fonte</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Manual Mode */}
                {mode === "manual" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="manual-url">URL da Imagem</Label>
                      <div className="flex gap-2">
                        <Input
                          id="manual-url"
                          type="url"
                          placeholder="https://exemplo.com/imagem.jpg"
                          value={manualUrl}
                          onChange={(e) => { setManualUrl(e.target.value); setPreviewUrl(e.target.value); }}
                        />
                      </div>
                    </div>
                    {previewUrl && (
                      <div className="border rounded-xl p-3 bg-muted/30">
                        <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                        <img src={previewUrl} alt="Preview"
                          className="max-h-40 rounded object-contain mx-auto"
                          onError={() => setPreviewUrl(null)} />
                      </div>
                    )}
                    <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
                      Esta imagem será aplicada às <strong>{selectedNews.length}</strong> notícias selecionadas.
                    </div>
                  </div>
                )}

                {/* Selected news compact list */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                    Notícias selecionadas ({selectedNews.length})
                  </Label>
                  <ScrollArea className="h-28 border rounded-lg bg-muted/10">
                    <div className="p-2 space-y-1">
                      {selectedNews.map((news) => (
                        <div key={news.id} className="flex items-center gap-2 text-xs p-1.5 rounded hover:bg-muted/50">
                          {news.featured_image_url ? (
                            <img src={news.featured_image_url} alt="" className="h-6 w-9 rounded object-cover shrink-0"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                          ) : (
                            <div className="h-6 w-9 rounded bg-muted flex items-center justify-center shrink-0">
                              <Image className="h-3 w-3 text-muted-foreground" />
                            </div>
                          )}
                          <span className="line-clamp-1 flex-1">{news.title}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </>
            )}

            {/* ── Progress / Processing ── */}
            {(isProcessing || results.length > 0) && (
              <div className="space-y-4">
                {/* Progress bar section */}
                <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      {isProcessing ? (
                        <><Loader2 className="h-4 w-4 animate-spin text-primary" />Corrigindo imagens...</>
                      ) : (
                        <><CheckCircle2 className="h-4 w-4 text-green-600" />Concluído!</>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground font-mono">{Math.round(progress)}%</span>
                  </div>

                  <Progress value={progress} className="h-3" />

                  {/* Live counters */}
                  <div className="grid grid-cols-3 gap-3 pt-1">
                    <div className="text-center rounded-lg bg-green-50 dark:bg-green-950/30 py-2">
                      <p className="text-xl font-bold text-green-600">{successCount}</p>
                      <p className="text-xs text-green-700 dark:text-green-400">Sucesso</p>
                    </div>
                    <div className="text-center rounded-lg bg-red-50 dark:bg-red-950/30 py-2">
                      <p className="text-xl font-bold text-red-600">{errorCount}</p>
                      <p className="text-xs text-red-700 dark:text-red-400">Erro(s)</p>
                    </div>
                    <div className="text-center rounded-lg bg-muted/50 py-2">
                      <p className="text-xl font-bold text-muted-foreground">
                        {totalToProcess - processedCount > 0 ? totalToProcess - processedCount : "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">Falta</p>
                    </div>
                  </div>
                </div>

                {/* Item-by-item list */}
                <ScrollArea className="h-56 border rounded-xl">
                  <div className="p-2 space-y-1.5">
                    {selectedNews.map((news, idx) => {
                      const result = results[idx];
                      const status = result?.status || "pending";
                      return (
                        <div
                          key={news.id}
                          className={cn(
                            "flex items-center gap-3 p-2.5 rounded-lg text-sm transition-all",
                            status === "success" && "bg-green-50 dark:bg-green-950/20",
                            status === "error" && "bg-red-50 dark:bg-red-950/20",
                            status === "processing" && "bg-primary/5 border border-primary/20",
                            status === "skipped" && "opacity-40",
                            status === "pending" && "opacity-50",
                          )}
                        >
                          <div className="shrink-0 w-5">
                            {status === "pending" && <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />}
                            {status === "processing" && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                            {status === "success" && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                            {status === "error" && <XCircle className="h-4 w-4 text-red-600" />}
                            {status === "skipped" && <AlertCircle className="h-4 w-4 text-muted-foreground" />}
                          </div>

                          {/* Mini thumbnail if success */}
                          {status === "success" && result?.newImage ? (
                            <img src={result.newImage} alt="" className="h-7 w-10 rounded object-cover shrink-0"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                          ) : (
                            <div className="h-7 w-10 rounded bg-muted shrink-0" />
                          )}

                          <div className="flex-1 min-w-0">
                            <p className="line-clamp-1 font-medium">{news.title}</p>
                            {result?.message && (
                              <p className={cn("text-xs", status === "success" ? "text-green-600" : "text-red-500")}>
                                {result.message}
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
        </ScrollArea>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
            {results.length > 0 ? "Fechar" : "Cancelar"}
          </Button>
          {results.length === 0 && !isProcessing && (
            <>
              {mode === "auto" && extractedData.length > 0 && (
                <Button onClick={handleAutoApply} disabled={Object.keys(selectedImages).length === 0}>
                  <Zap className="mr-2 h-4 w-4" />
                  Aplicar Selecionadas ({Object.keys(selectedImages).length})
                </Button>
              )}
              {mode === "manual" && (
                <Button onClick={handleManualApply} disabled={!manualUrl.trim()}>
                  <Image className="mr-2 h-4 w-4" />
                  Aplicar a Todas
                </Button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
