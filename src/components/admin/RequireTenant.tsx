import { ReactNode } from "react";
import { AlertCircle, Building2, RefreshCw, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAdminTenant } from "@/hooks/useAdminTenant";

interface RequireTenantProps {
  children: ReactNode;
  fallback?: ReactNode;
}

function TenantSelectionCard() {
  const { availableSites, selectTenant, error, refetch, isLoading } = useAdminTenant();

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription className="flex items-center gap-2">
          {error}
          <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Selecione um Site
        </CardTitle>
        <CardDescription className="text-sm">
          Para continuar, escolha o site que deseja gerenciar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Select onValueChange={selectTenant}>
          <SelectTrigger className="w-full max-w-sm">
            <SelectValue placeholder="Selecione um site..." />
          </SelectTrigger>
          <SelectContent>
            {availableSites.map((site) => (
              <SelectItem key={site.id} value={site.id}>
                {site.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}

function NoSitesAvailableCard() {
  const { error, refetch, isLoading } = useAdminTenant();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Nenhum Site Disponível
        </CardTitle>
        <CardDescription>
          {error || "Você não está associado a nenhum site. Entre em contato com o administrador."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Tentar novamente
        </Button>
      </CardContent>
    </Card>
  );
}

export function RequireTenant({ children, fallback }: RequireTenantProps) {
  const { hasTenant, isLoading, availableSites } = useAdminTenant();

  // Show loading overlay without blocking layout completely
  if (isLoading) {
    return (
      <div className="relative min-h-[200px]">
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
        <div className="opacity-30 pointer-events-none">{children}</div>
      </div>
    );
  }

  // If no tenant selected but sites are available, show selection inline
  if (!hasTenant && availableSites.length > 0) {
    return (
      <div className="space-y-4">
        <TenantSelectionCard />
        <div className="opacity-50 pointer-events-none">{children}</div>
      </div>
    );
  }

  // If no sites available at all
  if (!hasTenant && availableSites.length === 0) {
    return fallback || <NoSitesAvailableCard />;
  }

  return <>{children}</>;
}
