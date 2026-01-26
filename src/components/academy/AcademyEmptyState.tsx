import { GraduationCap, Radio, Tv, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AcademyEmptyStateProps {
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function AcademyEmptyState({ isLoading, onRefresh }: AcademyEmptyStateProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <h2 className="text-xl font-semibold mb-2">Carregando cursos...</h2>
        <p className="text-muted-foreground">
          Preparando seu conteúdo de treinamento
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center max-w-lg mx-auto">
      <div className="relative mb-6">
        <div className="p-4 bg-primary/10 rounded-2xl">
          <GraduationCap className="h-16 w-16 text-primary" />
        </div>
        <div className="absolute -top-2 -right-2 p-2 bg-card rounded-lg shadow-lg border">
          <Radio className="h-5 w-5 text-primary" />
        </div>
        <div className="absolute -bottom-2 -left-2 p-2 bg-card rounded-lg shadow-lg border">
          <Tv className="h-5 w-5 text-primary" />
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-3">
        Bem-vindo ao Conexão Academy!
      </h2>
      
      <p className="text-muted-foreground mb-6">
        Aprenda a configurar e operar sua WebRádio e WebTV com nossos treinamentos 
        completos. Do zero ao ar em poucos passos.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={onRefresh} size="lg">
          Carregar Treinamentos
        </Button>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="p-1.5 bg-primary/10 rounded">
            <Radio className="h-4 w-4 text-primary" />
          </div>
          <span>WebRádio completo</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="p-1.5 bg-primary/10 rounded">
            <Tv className="h-4 w-4 text-primary" />
          </div>
          <span>WebTV profissional</span>
        </div>
      </div>
    </div>
  );
}
