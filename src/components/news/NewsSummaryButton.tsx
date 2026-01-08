import { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NewsSummaryButtonProps {
  bullets: string[] | null;
  generatedAt?: string | null;
  className?: string;
}

export function NewsSummaryButton({ 
  bullets, 
  generatedAt,
  className 
}: NewsSummaryButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!bullets || bullets.length === 0) {
    return null;
  }

  return (
    <div className={cn("border border-border rounded-lg overflow-hidden", className)}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-muted/50 hover:bg-muted transition-colors"
      >
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <span className="font-medium">📄 Ler resumo da notícia</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>

      {isExpanded && (
        <div className="p-4 bg-background space-y-4">
          <ul className="space-y-3">
            {bullets.map((bullet, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center mt-0.5">
                  {index + 1}
                </span>
                <span className="text-foreground">{bullet}</span>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2 pt-2 border-t text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" />
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
        </div>
      )}
    </div>
  );
}
