import { useState } from 'react';
import { ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NewsSummaryBlockProps {
  summaryShort?: string | null;
  summaryMedium?: string | null;
  keyPoints?: string[] | null;
  generatedAt?: string | null;
  isGenerating?: boolean;
  className?: string;
  onExpand?: () => void;
}

export function NewsSummaryBlock({
  summaryShort,
  summaryMedium,
  keyPoints,
  generatedAt,
  isGenerating = false,
  className,
  onExpand,
}: NewsSummaryBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasTrackedExpand, setHasTrackedExpand] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const handleToggle = () => {
    const willExpand = !isExpanded;
    setIsExpanded(willExpand);
    if (willExpand && !hasTrackedExpand && onExpand) {
      onExpand();
      setHasTrackedExpand(true);
    }
  };

  const handleFeedback = (type: 'up' | 'down') => {
    setFeedback(type);
    // Could track feedback here via analytics
  };

  // Check if any summary content is available
  const hasContent = summaryShort || summaryMedium || (keyPoints && keyPoints.length > 0);

  // Don't render if no content and not generating
  if (!hasContent && !isGenerating) {
    return null;
  }

  // Build summary points to display
  const displayPoints = keyPoints && keyPoints.length > 0 
    ? keyPoints 
    : summaryMedium 
      ? [summaryMedium]
      : summaryShort 
        ? [summaryShort]
        : [];

  return (
    <section
      className={cn("", className)}
      aria-label="Resumo da notícia"
    >
      {/* Collapsed State - Toggle Button */}
      {!isExpanded && (
        <button
          onClick={handleToggle}
          className="w-full flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
          aria-expanded={isExpanded}
          aria-controls="summary-content"
        >
          <span className="font-medium text-foreground">Ler resumo da notícia</span>
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        </button>
      )}

      {/* Expanded State - Full Content */}
      {isExpanded && (
        <div 
          id="summary-content"
          className="border border-red-200 dark:border-red-800/50 rounded-lg overflow-hidden"
        >
          {/* Header */}
          <button
            onClick={handleToggle}
            className="w-full flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/30 transition-colors"
            aria-expanded={isExpanded}
          >
            <span className="font-semibold text-foreground">Resumo da notícia</span>
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          </button>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Summary Points - Square bullet markers */}
            {displayPoints.length > 0 && (
              <ul className="space-y-3">
                {displayPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span 
                      className="mt-2 h-1.5 w-1.5 bg-foreground shrink-0" 
                      aria-hidden="true"
                    />
                    <span className="text-sm text-foreground leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Feedback Section */}
            <div className="flex items-center gap-3 pt-4 border-t">
              <span className="text-sm text-muted-foreground">Esse resumo foi útil?</span>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8",
                  feedback === 'up' && "text-green-600 bg-green-100 dark:bg-green-900/30"
                )}
                onClick={() => handleFeedback('up')}
                aria-label="Resumo útil"
              >
                <ThumbsUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8",
                  feedback === 'down' && "text-red-600 bg-red-100 dark:bg-red-900/30"
                )}
                onClick={() => handleFeedback('down')}
                aria-label="Resumo não útil"
              >
                <ThumbsDown className="h-4 w-4" />
              </Button>
            </div>

            {/* AI Footer */}
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" />
              Resumo gerado por ferramenta de IA treinada pela redação do portal.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
