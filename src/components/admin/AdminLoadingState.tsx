import { useState, useEffect, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface AdminLoadingStateProps {
  isLoading: boolean;
  isError?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  timeout?: number;
  children: ReactNode;
  loadingMessage?: string;
}

export function AdminLoadingState({
  isLoading,
  isError,
  error,
  onRetry,
  timeout = 15000,
  children,
  loadingMessage = 'Carregando...',
}: AdminLoadingStateProps) {
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setTimedOut(false);
      const timer = setTimeout(() => setTimedOut(true), timeout);
      return () => clearTimeout(timer);
    }
    setTimedOut(false);
  }, [isLoading, timeout]);

  if (isLoading && timedOut) {
    return (
      <Card className="m-4">
        <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
          <AlertCircle className="h-12 w-12 text-yellow-500" />
          <div className="text-center space-y-2">
            <h3 className="font-medium">Carregamento demorado</h3>
            <p className="text-sm text-muted-foreground">
              O conteúdo está demorando mais que o esperado para carregar.
            </p>
          </div>
          {onRetry && (
            <Button onClick={onRetry}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar novamente
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="m-4">
        <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div className="text-center space-y-2">
            <h3 className="font-medium">Erro ao carregar</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {error?.message || 'Não foi possível carregar o conteúdo. Tente novamente.'}
            </p>
          </div>
          {onRetry && (
            <Button onClick={onRetry}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar novamente
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{loadingMessage}</p>
      </div>
    );
  }

  return <>{children}</>;
}

// Skeleton Presets for common admin patterns
export function AdminTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 p-4 border rounded-lg">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}

export function AdminCardsSkeleton({ cards = 4 }: { cards?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: cards }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6 space-y-3">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
