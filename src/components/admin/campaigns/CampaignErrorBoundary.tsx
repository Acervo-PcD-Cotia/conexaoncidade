import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class CampaignErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null, errorInfo: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error('[CampaignErrorBoundary] Crash capturado:', error);
    console.error('[CampaignErrorBoundary] Component stack:', errorInfo.componentStack);
  }

  handleCopy = () => {
    const { error, errorInfo } = this.state;
    const text = [
      `Error: ${error?.message}`,
      `Stack: ${error?.stack}`,
      `Component Stack: ${errorInfo?.componentStack}`,
      `Route: ${window.location.pathname}`,
      `Time: ${new Date().toISOString()}`,
    ].join('\n\n');
    navigator.clipboard.writeText(text);
    toast.success('Erro copiado para a área de transferência');
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mx-auto py-12 max-w-lg text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-xl font-bold">Erro no módulo Campanhas</h2>
          <p className="text-muted-foreground text-sm">
            {this.state.error?.message || 'Erro desconhecido'}
          </p>
          <details className="text-left text-xs bg-muted p-3 rounded-lg max-h-40 overflow-auto">
            <summary className="cursor-pointer font-medium mb-2">Stack técnico</summary>
            <pre className="whitespace-pre-wrap break-all">
              {this.state.error?.stack}
            </pre>
          </details>
          <div className="flex justify-center gap-2">
            <Button variant="outline" size="sm" onClick={this.handleCopy}>
              <Copy className="h-4 w-4 mr-1" /> Copiar Erro
            </Button>
            <Button size="sm" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-1" /> Tentar Novamente
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
