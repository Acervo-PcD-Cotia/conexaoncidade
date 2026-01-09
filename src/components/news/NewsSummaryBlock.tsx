import { useState } from 'react';
import { FileText, Sparkles, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NewsSummaryBlockProps {
  summaryShort?: string | null;
  summaryMedium?: string | null;
  keyPoints?: string[] | null;
  generatedAt?: string | null;
  isGenerating?: boolean;
  className?: string;
}

export function NewsSummaryBlock({
  summaryShort,
  summaryMedium,
  keyPoints,
  generatedAt,
  isGenerating = false,
  className,
}: NewsSummaryBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Check if any summary content is available
  const hasContent = summaryShort || summaryMedium || (keyPoints && keyPoints.length > 0);
  const showGenerating = isGenerating && !hasContent;

  // Don't render if no content and not generating
  if (!hasContent && !showGenerating) {
    return null;
  }

  // Determine default tab
  const defaultTab = keyPoints && keyPoints.length > 0 
    ? 'pontos' 
    : summaryShort 
      ? 'curto' 
      : 'medio';

  return (
    <section
      className={cn(
        "border border-border rounded-xl overflow-hidden bg-card",
        className
      )}
      aria-label="Resumo da notícia"
    >
      {/* Header - Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors"
        aria-expanded={isExpanded}
        aria-controls="summary-content"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-foreground">Resumo da Notícia</h3>
            <p className="text-xs text-muted-foreground">Entenda o essencial em segundos</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>

      {/* Content */}
      <div
        id="summary-content"
        className={cn(
          "overflow-hidden transition-all duration-300",
          isExpanded ? "max-h-[500px]" : "max-h-0"
        )}
      >
        <div className="p-4 bg-background">
          {/* Generating State */}
          {showGenerating && (
            <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <div>
                <p className="font-medium text-sm">Gerando resumo...</p>
                <p className="text-xs text-muted-foreground">
                  O resumo inteligente está sendo processado.
                </p>
              </div>
            </div>
          )}

          {/* Content Tabs */}
          {hasContent && (
            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                {summaryShort && (
                  <TabsTrigger value="curto" className="text-xs">
                    Curto (30s)
                  </TabsTrigger>
                )}
                {summaryMedium && (
                  <TabsTrigger value="medio" className="text-xs">
                    Médio (60s)
                  </TabsTrigger>
                )}
                {keyPoints && keyPoints.length > 0 && (
                  <TabsTrigger value="pontos" className="text-xs">
                    Pontos-chave
                  </TabsTrigger>
                )}
              </TabsList>

              {summaryShort && (
                <TabsContent value="curto" className="mt-0">
                  <p className="text-sm text-foreground leading-relaxed">
                    {summaryShort}
                  </p>
                </TabsContent>
              )}

              {summaryMedium && (
                <TabsContent value="medio" className="mt-0">
                  <p className="text-sm text-foreground leading-relaxed">
                    {summaryMedium}
                  </p>
                </TabsContent>
              )}

              {keyPoints && keyPoints.length > 0 && (
                <TabsContent value="pontos" className="mt-0">
                  <ul className="space-y-3">
                    {keyPoints.map((point, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center mt-0.5">
                          {index + 1}
                        </span>
                        <span className="text-sm text-foreground">{point}</span>
                      </li>
                    ))}
                  </ul>
                </TabsContent>
              )}
            </Tabs>
          )}

          {/* Footer */}
          {hasContent && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Resumo gerado por IA editorial</span>
              {generatedAt && (
                <>
                  <span>•</span>
                  <span>
                    {format(new Date(generatedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
