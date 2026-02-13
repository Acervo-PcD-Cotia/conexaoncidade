import { ShieldX, LogIn, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import logoFull from "@/assets/logo-full.png";

interface AccessDeniedScreenProps {
  type: 'not_authenticated' | 'not_authorized';
  redirectCountdown?: number;
}

export function AccessDeniedScreen({ type, redirectCountdown }: AccessDeniedScreenProps) {
  return (
    <div className="min-h-screen flex flex-col lg:grid lg:grid-cols-[60%_40%]">
      {/* Coluna Esquerda - Logo com fundo laranja claro */}
      <div className="flex items-center justify-center py-12 px-6 lg:py-0 bg-orange-50 lg:border-r lg:border-orange-100">
        <img 
          src={logoFull} 
          alt="Conexão na Cidade" 
          className="h-24 lg:h-32 w-auto"
        />
      </div>

      {/* Coluna Direita - Card de mensagem */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-muted/30">
        <Card className="w-full max-w-md border border-border/50 shadow-lg">
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
                  <Link to="/spah">
                    <LogIn className="h-4 w-4 mr-2" />
                    Entrar
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
