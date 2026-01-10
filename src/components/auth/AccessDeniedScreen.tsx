import { ShieldX, LogIn, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface AccessDeniedScreenProps {
  type: 'not_authenticated' | 'not_authorized';
  redirectCountdown?: number;
}

export function AccessDeniedScreen({ type, redirectCountdown }: AccessDeniedScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <ShieldX className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle>
            {type === 'not_authenticated' ? 'Autenticação Necessária' : 'Acesso Negado'}
          </CardTitle>
          <CardDescription>
            {type === 'not_authenticated' 
              ? 'Você precisa estar logado para acessar esta área.'
              : 'Você não possui permissão para acessar esta área.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {redirectCountdown !== undefined && redirectCountdown > 0 && (
            <p className="text-sm text-center text-muted-foreground">
              Redirecionando em {redirectCountdown} segundos...
            </p>
          )}
          <div className="flex gap-2">
            <Button asChild variant="outline" className="flex-1">
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Início
              </Link>
            </Button>
            {type === 'not_authenticated' && (
              <Button asChild className="flex-1">
                <Link to="/auth">
                  <LogIn className="h-4 w-4 mr-2" />
                  Entrar
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
