import { AlertTriangle, Shield } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function TransportDisclaimer() {
  return (
    <Alert className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/50">
      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <AlertTitle className="text-amber-800 dark:text-amber-200">
        Importante
      </AlertTitle>
      <AlertDescription className="text-amber-700 dark:text-amber-300 text-sm space-y-2">
        <p>
          Este serviço é apenas um <strong>facilitador de contato</strong> entre pais/responsáveis e transportadores escolares.
        </p>
        <p>
          O portal <strong>não se responsabiliza</strong> pela qualidade, segurança ou regularidade dos serviços prestados pelos transportadores listados.
        </p>
        <p className="flex items-center gap-2">
          <Shield className="h-4 w-4 shrink-0" />
          <span>
            Antes de contratar, verifique documentação, licenças e referências do transportador.
          </span>
        </p>
      </AlertDescription>
    </Alert>
  );
}
