import { ExternalLink, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { FactCheckSource } from '@/hooks/useFactCheck';

interface SourcesListProps {
  sources: FactCheckSource[];
  className?: string;
}

export function SourcesList({ sources, className }: SourcesListProps) {
  if (!sources || sources.length === 0) {
    return (
      <div className={cn('text-muted-foreground text-sm italic', className)}>
        Nenhuma fonte encontrada para esta verificação.
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {sources.map((source, index) => (
        <div
          key={source.id || index}
          className={cn(
            'p-4 rounded-lg border',
            source.is_corroborating
              ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
              : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Source name and indicator */}
              <div className="flex items-center gap-2 mb-1">
                {source.is_corroborating ? (
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
                )}
                <span className="font-medium text-foreground truncate">
                  {source.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({source.domain})
                </span>
              </div>

              {/* Snippet */}
              {source.snippet && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {source.snippet}
                </p>
              )}

              {/* Meta info */}
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                {source.published_at && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {format(new Date(source.published_at), "d 'de' MMM 'de' yyyy", { locale: ptBR })}
                    </span>
                  </div>
                )}
                {source.reliability_score && (
                  <span className="text-xs">
                    Confiabilidade: {source.reliability_score}%
                  </span>
                )}
              </div>
            </div>

            {/* External link */}
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 p-2 rounded-md hover:bg-muted/50 transition-colors"
              aria-label={`Abrir ${source.name} em nova aba`}
            >
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
