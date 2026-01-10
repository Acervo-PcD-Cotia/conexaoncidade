import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
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
  const [isOpen, setIsOpen] = useState(false);

  // Check if any summary content is available
  const hasContent = summaryShort || summaryMedium || (keyPoints && keyPoints.length > 0);
  const showGenerating = isGenerating && !hasContent;

  // Don't render if no content and not generating
  if (!hasContent && !showGenerating) {
    return null;
  }

  // Prefer short summary for display
  const displaySummary = summaryShort || summaryMedium;

  return (
    <details
      className={cn("border-b border-border pb-4 mb-6", className)}
      open={isOpen}
      onToggle={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}
    >
      <summary className="cursor-pointer text-sm font-medium text-foreground hover:text-primary transition-colors flex items-center gap-2 py-2 list-none [&::-webkit-details-marker]:hidden">
        <Sparkles className="h-4 w-4 text-primary" />
        <span>Resumo da notícia</span>
        {showGenerating && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground ml-2" />}
      </summary>
      
      <div className="mt-3 pl-6 space-y-3">
        {/* Generating State */}
        {showGenerating && (
          <p className="text-sm text-muted-foreground italic">
            Gerando resumo inteligente...
          </p>
        )}

        {/* Summary Text */}
        {displaySummary && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {displaySummary}
          </p>
        )}

        {/* Key Points */}
        {keyPoints && keyPoints.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-muted-foreground font-medium mb-2">Pontos-chave:</p>
            <ul className="space-y-1.5">
              {keyPoints.map((point, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary font-medium shrink-0">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer */}
        {hasContent && (
          <p className="text-xs text-muted-foreground/60 mt-3 pt-2 border-t border-border/50">
            Resumo gerado por IA editorial
            {generatedAt && (
              <> • {format(new Date(generatedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</>
            )}
          </p>
        )}
      </div>
    </details>
  );
}
