import { useState } from "react";
import { Image, Loader2, CheckCircle2, XCircle, AlertCircle, ExternalLink, Link as LinkIcon } from "lucide-react";
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

type CorrectionMode = "auto" | "manual";

interface ProcessResult {
  id: string;
  title: string;
  status: "success" | "error" | "skipped";
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
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState<ProcessResult[]>([]);
  const [extractedData, setExtractedData] = useState<ExtractedImagesResult[]>([]);
  const [selectedImages, setSelectedImages] = useState<Record<string, string>>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleClose = () => {
    if (!isProcessing && !isExtracting) {
      setMode("auto");
      setManualUrl("");
      setResults([]);
      setExtractedData([]);
      setSelectedImages({});
      setPreviewUrl(null);
      onOpenChange(false);
    }
  };

  // Extract images from sources
  const handleExtractImages = async () => {
    setIsExtracting(true);
    setProgress({ current: 0, total: selectedNews.length });
    setExtractedData([]);

    try {
      const { data, error } = await supabase.functions.invoke("fix-news-images", {
        body: {
          newsIds: selectedNews.map(n => n.id),
          mode: "extract",
        },
      });

      if (error) throw error;

      if (data?.results) {
        setExtractedData(data.results);
        
        // Pre-select recommended images
        const preSelected: Record<string, string> = {};
        data.results.forEach((r: ExtractedImagesResult) => {
          if (r.recommendedImage) {
            preSelected[r.id] = r.recommendedImage;
          }
        });
        setSelectedImages(preSelected);
      }
    } catch (err) {
      console.error("Error extracting images:", err);
      toast.error("Erro ao extrair imagens das fontes");
    } finally {
      setIsExtracting(false);
    }
  };

  // Apply auto corrections using selected images
  const handleAutoApply = async () => {
    const toApply = Object.entries(selectedImages);
    if (toApply.length === 0) {
      toast.error("Selecione pelo menos uma imagem para corrigir");
      return;
    }

    setIsProcessing(true);
    setProgress({ current: 0, total: toApply.length });
    const newResults: ProcessResult[] = [];

    for (let i = 0; i < toApply.length; i++) {
      const [newsId, imageUrl] = toApply[i];
      const newsItem = selectedNews.find(n => n.id === newsId);
      
      setProgress({ current: i + 1, total: toApply.length });

      try {
        const { error } = await supabase
          .from("news")
          .update({
            featured_image_url: imageUrl,
            og_image_url: imageUrl,
            card_image_url: imageUrl,
          })
          .eq("id", newsId);

        if (error) throw error;

        newResults.push({
          id: newsId,
          title: newsItem?.title || "Desconhecido",
          status: "success",
          message: "Imagem atualizada",
          newImage: imageUrl,
        });
      } catch (err) {
        newResults.push({
          id: newsId,
          title: newsItem?.title || "Desconhecido",
          status: "error",
          message: err instanceof Error ? err.message : "Erro desconhecido",
        });
      }
    }

    setResults(newResults);
    setIsProcessing(false);

    const successCount = newResults.filter(r => r.status === "success").length;
    if (successCount > 0) {
      toast.success(`${successCount} imagem(ns) corrigida(s)!`);
      onSuccess();
    }
  };

  // Apply manual URL to all selected
  const handleManualApply = async () => {
    if (!manualUrl.trim()) {
      toast.error("Informe a URL da imagem");
      return;
    }

    // Validate URL format
    try {
      new URL(manualUrl);
    } catch {
      toast.error("URL inválida");
      return;
    }

    setIsProcessing(true);
    setProgress({ current: 0, total: selectedNews.length });
    const newResults: ProcessResult[] = [];

    for (let i = 0; i < selectedNews.length; i++) {
      const newsItem = selectedNews[i];
      setProgress({ current: i + 1, total: selectedNews.length });

      try {
        const { error } = await supabase
          .from("news")
          .update({
            featured_image_url: manualUrl,
            og_image_url: manualUrl,
            card_image_url: manualUrl,
          })
          .eq("id", newsItem.id);

        if (error) throw error;

        newResults.push({
          id: newsItem.id,
          title: newsItem.title,
          status: "success",
          message: "Imagem atualizada",
          newImage: manualUrl,
        });
      } catch (err) {
        newResults.push({
          id: newsItem.id,
          title: newsItem.title,
          status: "error",
          message: err instanceof Error ? err.message : "Erro desconhecido",
        });
      }
    }

    setResults(newResults);
    setIsProcessing(false);

    const successCount = newResults.filter(r => r.status === "success").length;
    if (successCount > 0) {
      toast.success(`${successCount} imagem(ns) corrigida(s)!`);
      onSuccess();
    }
  };

  const selectImage = (newsId: string, imageUrl: string) => {
    setSelectedImages(prev => ({
      ...prev,
      [newsId]: imageUrl,
    }));
  };

  const successCount = results.filter(r => r.status === "success").length;
  const errorCount = results.filter(r => r.status === "error").length;

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

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {/* Mode Selection */}
            {!isProcessing && results.length === 0 && (
              <>
                <RadioGroup
                  value={mode}
                  onValueChange={(v) => setMode(v as CorrectionMode)}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="auto" id="auto" />
                    <Label htmlFor="auto" className="cursor-pointer">
                      Buscar da fonte (automático)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="manual" id="manual" />
                    <Label htmlFor="manual" className="cursor-pointer">
                      Definir URL manualmente
                    </Label>
                  </div>
                </RadioGroup>

                {/* Auto Mode - Extract and Select */}
                {mode === "auto" && (
                  <div className="space-y-4">
                    {extractedData.length === 0 ? (
                      <div className="text-center py-8">
                        <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-4">
                          Clique para extrair imagens das fontes originais
                        </p>
                        <Button
                          onClick={handleExtractImages}
                          disabled={isExtracting}
                        >
                          {isExtracting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Extraindo...
                            </>
                          ) : (
                            <>
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Extrair Imagens
                            </>
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {extractedData.map((item) => (
                          <div
                            key={item.id}
                            className="border rounded-lg p-4 space-y-3"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium line-clamp-1">
                                  {item.title}
                                </h4>
                                {item.status === "error" && (
                                  <Badge variant="destructive" className="mt-1">
                                    {item.message || "Erro ao extrair"}
                                  </Badge>
                                )}
                              </div>
                              {selectedImages[item.id] && (
                                <Badge variant="secondary" className="ml-2">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Selecionada
                                </Badge>
                              )}
                            </div>

                            {item.extractedImages.length > 0 ? (
                              <div className="grid grid-cols-4 gap-2">
                                {item.extractedImages.slice(0, 8).map((imgUrl, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => selectImage(item.id, imgUrl)}
                                    className={`relative aspect-video rounded overflow-hidden border-2 transition-all ${
                                      selectedImages[item.id] === imgUrl
                                        ? "border-primary ring-2 ring-primary/20"
                                        : "border-transparent hover:border-primary/50"
                                    }`}
                                  >
                                    <img
                                      src={imgUrl}
                                      alt=""
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src =
                                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='60'%3E%3Crect fill='%23ddd' width='100' height='60'/%3E%3C/svg%3E";
                                      }}
                                    />
                                    {item.recommendedImage === imgUrl && (
                                      <Badge
                                        variant="secondary"
                                        className="absolute bottom-1 left-1 text-xs"
                                      >
                                        Recomendada
                                      </Badge>
                                    )}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                Nenhuma imagem encontrada
                              </p>
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
                          onChange={(e) => {
                            setManualUrl(e.target.value);
                            setPreviewUrl(e.target.value);
                          }}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setPreviewUrl(manualUrl)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {previewUrl && (
                      <div className="border rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-2">
                          Preview:
                        </p>
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="max-h-48 rounded object-contain mx-auto"
                          onError={() => setPreviewUrl(null)}
                        />
                      </div>
                    )}

                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm text-muted-foreground">
                        Esta imagem será aplicada a todas as{" "}
                        <strong>{selectedNews.length}</strong> notícias selecionadas.
                      </p>
                    </div>
                  </div>
                )}

                {/* Selected News List */}
                <div className="space-y-2">
                  <Label>Notícias selecionadas</Label>
                  <ScrollArea className="h-32 border rounded-lg">
                    <div className="p-2 space-y-1">
                      {selectedNews.map((news) => (
                        <div
                          key={news.id}
                          className="flex items-center gap-2 text-sm"
                        >
                          {news.featured_image_url ? (
                            <img
                              src={news.featured_image_url}
                              alt=""
                              className="h-8 w-12 rounded object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="h-8 w-12 rounded bg-muted flex items-center justify-center">
                              <Image className="h-4 w-4 text-muted-foreground" />
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

            {/* Progress */}
            {isProcessing && (
              <div className="space-y-4 py-8">
                <div className="flex items-center justify-center gap-3">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span>
                    Corrigindo {progress.current} de {progress.total}...
                  </span>
                </div>
                <Progress
                  value={(progress.current / progress.total) * 100}
                  className="h-2"
                />
              </div>
            )}

            {/* Results */}
            {results.length > 0 && (
              <div className="space-y-4">
                <div className="flex gap-4 justify-center">
                  <Badge variant="secondary" className="text-green-600">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {successCount} sucesso
                  </Badge>
                  {errorCount > 0 && (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      {errorCount} erro(s)
                    </Badge>
                  )}
                </div>

                <ScrollArea className="h-48 border rounded-lg">
                  <div className="p-2 space-y-2">
                    {results.map((result) => (
                      <div
                        key={result.id}
                        className={`flex items-center gap-2 p-2 rounded text-sm ${
                          result.status === "success"
                            ? "bg-green-50 dark:bg-green-950/20"
                            : "bg-red-50 dark:bg-red-950/20"
                        }`}
                      >
                        {result.status === "success" ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600 shrink-0" />
                        )}
                        <span className="line-clamp-1 flex-1">{result.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {result.message}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
            {results.length > 0 ? "Fechar" : "Cancelar"}
          </Button>
          
          {results.length === 0 && !isProcessing && (
            <>
              {mode === "auto" && extractedData.length > 0 && (
                <Button
                  onClick={handleAutoApply}
                  disabled={Object.keys(selectedImages).length === 0}
                >
                  <Image className="mr-2 h-4 w-4" />
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

// Helper component for icon
function Eye(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
