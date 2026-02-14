import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MODULE_METADATA, type SystemModule } from "@/types/profiles-modules";
import {
  Lock,
  Settings,
  Home,
  Mail,
  FileText,
  Search,
  Radio,
  Video,
  Users,
  Medal,
  Store,
  Tag,
  Briefcase,
  Heart,
  Wand2,
  type LucideIcon,
} from "lucide-react";

// Mapa de ícones para lookup dinâmico
const ICON_MAP: Record<string, LucideIcon> = {
  Lock,
  FileText,
  Search,
  Radio,
  Video,
  Users,
  Medal,
  Store,
  Tag,
  Briefcase,
  Heart,
  Wand2,
};

interface ModuleUnavailableProps {
  moduleKey: SystemModule;
}

export function ModuleUnavailable({ moduleKey }: ModuleUnavailableProps) {
  const moduleMeta = MODULE_METADATA[moduleKey];
  const IconComponent = moduleMeta ? ICON_MAP[moduleMeta.icon] : Lock;

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 pb-6 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
            {IconComponent ? (
              <IconComponent className="h-8 w-8 text-muted-foreground" />
            ) : (
              <Lock className="h-8 w-8 text-muted-foreground" />
            )}
          </div>

          <h1 className="text-2xl font-bold mb-2">Módulo Indisponível</h1>

          <p className="text-muted-foreground mb-6">
            O módulo <strong>{moduleMeta?.label || moduleKey}</strong> não está
            disponível no seu plano atual.
          </p>

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link to="/spah/painel/settings/modules">
                <Settings className="mr-2 h-4 w-4" />
                Gerenciar Módulos
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full">
              <Link to="/spah/painel">
                <Home className="mr-2 h-4 w-4" />
                Voltar ao Dashboard
              </Link>
            </Button>

            <div className="pt-4 border-t mt-4">
              <p className="text-sm text-muted-foreground mb-2">
                Precisa de ajuda?
              </p>
              <Button asChild variant="ghost" size="sm">
                <a href="mailto:suporte@conexaonacidade.com.br">
                  <Mail className="mr-2 h-4 w-4" />
                  Falar com Suporte
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ModuleUnavailable;
