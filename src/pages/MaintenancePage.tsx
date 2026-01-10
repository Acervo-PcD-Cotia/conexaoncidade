import { Wrench, Clock, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MaintenancePageProps {
  message?: string;
  estimatedEnd?: string | null;
}

export default function MaintenancePage({ 
  message = "Estamos em manutenção programada. Voltaremos em breve!", 
  estimatedEnd 
}: MaintenancePageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <Card className="max-w-lg w-full shadow-xl border-2">
        <CardContent className="pt-12 pb-10 px-8 text-center space-y-6">
          {/* Icon Animation */}
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
            <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-primary/20">
              <Wrench className="h-12 w-12 text-primary animate-pulse" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Em Manutenção
          </h1>

          {/* Message */}
          <p className="text-muted-foreground text-lg leading-relaxed">
            {message}
          </p>

          {/* Estimated End */}
          {estimatedEnd && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg py-3 px-4">
              <Clock className="h-4 w-4" />
              <span>
                Previsão de retorno:{" "}
                <strong className="text-foreground">
                  {format(new Date(estimatedEnd), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </strong>
              </span>
            </div>
          )}

          {/* Social Links */}
          <div className="pt-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Enquanto isso, siga-nos nas redes sociais:
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button variant="outline" size="sm" asChild>
                <a 
                  href="https://instagram.com/conexaonacidade" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="gap-2"
                >
                  Instagram
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a 
                  href="https://facebook.com/conexaonacidade" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="gap-2"
                >
                  Facebook
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            </div>
          </div>

          {/* Logo */}
          <div className="pt-6 border-t">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Conexão na Cidade
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
