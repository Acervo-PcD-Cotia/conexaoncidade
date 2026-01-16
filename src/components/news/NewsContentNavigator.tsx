import { useMemo, useState, useEffect } from 'react';
import { List, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface NewsContentNavigatorProps {
  // Summary props
  summaryShort?: string | null;
  summaryMedium?: string | null;
  keyPoints?: string[] | null;
  isGenerating?: boolean;
  // Table of contents props
  contentHtml?: string | null;
  // Callbacks
  onSummaryExpand?: () => void;
  onTocClick?: () => void;
  className?: string;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function NewsContentNavigator({
  summaryShort,
  summaryMedium,
  keyPoints,
  isGenerating,
  contentHtml,
  onSummaryExpand,
  onTocClick,
  className
}: NewsContentNavigatorProps) {
  // UOL behavior: Open by default on desktop (>=768px), collapsed on mobile
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<'up' | 'down' | null>(null);
  const [hasTrackedExpand, setHasTrackedExpand] = useState(false);

  // Set initial state based on viewport width (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDesktop = window.innerWidth >= 768;
      setSummaryOpen(isDesktop);
      if (isDesktop) {
        setHasTrackedExpand(true); // Don't track auto-expand on desktop
      }
    }
  }, []);

  // Parse headings for table of contents
  const tocItems = useMemo(() => {
    if (!contentHtml) return [];

    const items: TocItem[] = [];
    const h2Regex = /<h2[^>]*>(.*?)<\/h2>/gi;
    let match;
    let index = 0;

    while ((match = h2Regex.exec(contentHtml)) !== null) {
      const text = match[1].replace(/<[^>]*>/g, '').trim();
      if (text) {
        const id = `heading-${index}`;
        items.push({ id, text, level: 2 });
        index++;
      }
    }

    return items;
  }, [contentHtml]);

  const hasSummary = keyPoints?.length || summaryShort || summaryMedium || isGenerating;
  const hasToc = tocItems.length >= 3;

  // Don't render if no content
  if (!hasSummary && !hasToc) {
    return null;
  }

  const handleSummaryToggle = (open: boolean) => {
    setSummaryOpen(open);
    if (open && !hasTrackedExpand) {
      onSummaryExpand?.();
      setHasTrackedExpand(true);
    }
  };

  const handleTocToggle = (open: boolean) => {
    setTocOpen(open);
  };

  const handleScrollTo = (index: number) => {
    const articleContent = document.querySelector('.prose-news');
    if (!articleContent) return;

    const headings = articleContent.querySelectorAll('h2');
    const targetHeading = headings[index];

    if (targetHeading) {
      targetHeading.scrollIntoView({ behavior: 'smooth', block: 'start' });
      onTocClick?.();
    }
  };

  const handleFeedback = (type: 'up' | 'down') => {
    setFeedbackGiven(type);
    toast.success(type === 'up' ? 'Obrigado pelo feedback!' : 'Vamos melhorar!');
  };

  // Get summary content to display - limit to max 4 points (UOL standard)
  const summaryPoints = keyPoints?.length 
    ? keyPoints.slice(0, 4) 
    : (summaryMedium || summaryShort)?.split(/[.!?]\s+/).filter(s => s.trim().length > 20).slice(0, 4) || [];

  return (
    <div className={cn("space-y-3", className)}>
      {/* Summary Section - UOL Style */}
      {hasSummary && (
        <Collapsible open={summaryOpen} onOpenChange={handleSummaryToggle}>
          <div className={cn(
            "border-2 rounded-lg overflow-hidden transition-all duration-200",
            summaryOpen 
              ? "border-primary/40 bg-primary/5 dark:bg-primary/10" 
              : "border-border hover:border-primary/30"
          )}>
            <CollapsibleTrigger className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
              <span className="font-semibold text-foreground">
                {summaryOpen ? "Resumo da notícia" : "Ler resumo da notícia"}
              </span>
              {summaryOpen ? (
                <ChevronUp className="h-5 w-5 text-primary" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </CollapsibleTrigger>

            <CollapsibleContent>
              <div className="px-4 pb-4 space-y-4">
                {isGenerating ? (
                  <div className="flex items-center gap-2 text-muted-foreground py-2">
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Gerando resumo...</span>
                  </div>
                ) : (
                  <>
                    {/* Key Points with square markers */}
                    {summaryPoints.length > 0 && (
                      <ul className="space-y-3">
                        {summaryPoints.map((point, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <span 
                              className="mt-2 h-1.5 w-1.5 bg-primary shrink-0" 
                              aria-hidden="true"
                            />
                            <span className="text-sm leading-relaxed text-foreground">{point}</span>
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
                          feedbackGiven === 'up' && "text-green-600 bg-green-100 dark:bg-green-900/30"
                        )}
                        onClick={() => handleFeedback('up')}
                        disabled={feedbackGiven !== null}
                        aria-label="Resumo útil"
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-8 w-8",
                          feedbackGiven === 'down' && "text-red-600 bg-red-100 dark:bg-red-900/30"
                        )}
                        onClick={() => handleFeedback('down')}
                        disabled={feedbackGiven !== null}
                        aria-label="Resumo não útil"
                      >
                        <ThumbsDown className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* AI Disclaimer */}
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3" />
                      Resumo gerado por ferramenta de IA treinada com padrões editoriais do Portal Conexão.
                    </p>
                  </>
                )}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      )}

      {/* Table of Contents Section */}
      {hasToc && (
        <Collapsible open={tocOpen} onOpenChange={handleTocToggle}>
          <div className={cn(
            "border rounded-lg overflow-hidden transition-colors",
            tocOpen ? "border-primary/30" : "border-border"
          )}>
            <CollapsibleTrigger className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-2">
                <List className="h-5 w-5 text-primary" />
                <span className="font-medium">Nesta matéria</span>
                <span className="text-xs text-muted-foreground">({tocItems.length} tópicos)</span>
              </div>
              {tocOpen ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </CollapsibleTrigger>

            <CollapsibleContent>
              <ol className="px-4 pb-4 space-y-2">
                {tocItems.map((item, index) => (
                  <li key={item.id}>
                    <button
                      onClick={() => handleScrollTo(index)}
                      className="flex items-start gap-3 w-full text-left group p-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {item.text}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </CollapsibleContent>
          </div>
        </Collapsible>
      )}
    </div>
  );
}
