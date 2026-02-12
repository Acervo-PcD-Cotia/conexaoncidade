import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Bug, Copy, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { logService } from '@/lib/logService';
import { BUILD_ID, BUILD_ENV } from '@/config/buildInfo';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
}

export class AdminErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, copied: false };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    console.error('[AdminErrorBoundary] Error caught:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      route: window.location.pathname,
      buildId: BUILD_ID,
    });

    logService.error('admin_error_boundary', error, {
      componentStack: errorInfo.componentStack,
      route: window.location.pathname,
      buildId: BUILD_ID,
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoBack = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, copied: false });
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, copied: false });
  };

  buildErrorReport = (): string => {
    const { error, errorInfo } = this.state;
    return [
      `BUILD: ${BUILD_ID}`,
      `ENV: ${BUILD_ENV}`,
      `ROUTE: ${window.location.pathname}`,
      `TIMESTAMP: ${new Date().toISOString()}`,
      `ERROR: ${error?.message ?? 'Unknown'}`,
      `STACK:\n${error?.stack ?? 'N/A'}`,
      `COMPONENT_STACK:\n${errorInfo?.componentStack ?? 'N/A'}`,
    ].join('\n');
  };

  handleCopyError = async () => {
    try {
      await navigator.clipboard.writeText(this.buildErrorReport());
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    } catch {
      // fallback: select text
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <Card className="w-full max-w-lg">
            <CardContent className="flex flex-col items-center justify-center py-12 gap-4 text-center">
              <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Ops, algo deu errado</h2>
                <p className="text-muted-foreground text-sm max-w-md">
                  Ocorreu um erro ao renderizar esta página. Tente recarregar ou voltar para a página anterior.
                </p>
              </div>

              {/* Build info */}
              <div className="text-[10px] font-mono text-muted-foreground">
                Build: {BUILD_ID} | Env: {BUILD_ENV} | Route: {window.location.pathname}
              </div>

              {this.state.error && (
                <div className="w-full mt-2 p-3 rounded-lg bg-muted text-left">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Bug className="h-4 w-4 text-orange-500" />
                      <span className="text-xs font-medium uppercase text-orange-600">Debug Info</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={this.handleCopyError}
                    >
                      {this.state.copied ? (
                        <><Check className="h-3 w-3 text-green-500" /> Copiado!</>
                      ) : (
                        <><Copy className="h-3 w-3" /> Copiar erro</>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs font-mono text-destructive break-all">
                    {this.state.error.message}
                  </p>
                  {this.state.errorInfo?.componentStack && (
                    <pre className="mt-2 text-[10px] text-muted-foreground overflow-auto max-h-32 whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                <Button onClick={this.handleReload}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Recarregar Página
                </Button>
                <Button variant="outline" onClick={this.handleGoBack}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Tentar Novamente
                </Button>
                <Button variant="ghost" asChild>
                  <Link to="/admin">
                    <Home className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
