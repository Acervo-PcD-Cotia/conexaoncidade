import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, Home, RefreshCw, ArrowLeft, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class CommunityErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("CommunityErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
    
    // Log to analytics if available
    try {
      // Could integrate with error tracking service here
      console.log("Error logged for community module:", {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      });
    } catch (e) {
      // Silently fail if logging fails
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoBack = () => {
    window.history.back();
  };

  private handleGoHome = () => {
    window.location.href = "/comunidade";
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] items-center justify-center p-4">
          <Card className="w-full max-w-lg border-destructive/20 shadow-lg">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-950/30">
                <AlertTriangle className="h-8 w-8 text-pink-600 dark:text-pink-400" />
              </div>
              <CardTitle className="text-xl">Ops! Algo deu errado</CardTitle>
              <CardDescription className="text-base">
                Encontramos um problema ao carregar esta página da Comunidade.
                Não se preocupe, estamos trabalhando para resolver.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                <Button
                  variant="default"
                  onClick={this.handleReload}
                  className="gap-2 bg-pink-600 hover:bg-pink-700"
                >
                  <RefreshCw className="h-4 w-4" />
                  Recarregar Página
                </Button>
                <Button
                  variant="outline"
                  onClick={this.handleGoBack}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Button>
                <Button
                  variant="ghost"
                  onClick={this.handleGoHome}
                  className="gap-2"
                >
                  <Home className="h-4 w-4" />
                  Ir para Hub
                </Button>
              </div>

              {/* Suporte */}
              <div className="rounded-lg bg-muted/50 p-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Se o problema persistir, entre em contato conosco:
                </p>
                <Button variant="link" size="sm" className="gap-1 text-pink-600">
                  <MessageCircle className="h-4 w-4" />
                  Falar com Suporte
                </Button>
              </div>

              {/* Debug info - only in development */}
              {import.meta.env.DEV && this.state.error && (
                <details className="rounded-lg border bg-muted/30 p-3">
                  <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                    Detalhes técnicos (desenvolvimento)
                  </summary>
                  <div className="mt-2 space-y-2">
                    <div className="rounded bg-background p-2">
                      <p className="text-xs font-mono text-destructive break-all">
                        {this.state.error.message}
                      </p>
                    </div>
                    {this.state.error.stack && (
                      <pre className="max-h-40 overflow-auto rounded bg-background p-2 text-xs font-mono text-muted-foreground">
                        {this.state.error.stack}
                      </pre>
                    )}
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
