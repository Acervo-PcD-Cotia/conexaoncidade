import { ReactNode } from "react";
import { AlertCircle, Building2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminTenant } from "@/hooks/useAdminTenant";

interface RequireTenantProps {
  children: ReactNode;
  fallback?: ReactNode;
}

function TenantMissingAlert() {
  const { availableSites, selectTenant, isLoading, error } = useAdminTenant();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (availableSites.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Nenhum Site Disponível
          </CardTitle>
          <CardDescription>
            Você não está associado a nenhum site. Entre em contato com o administrador.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Selecione um Site
        </CardTitle>
        <CardDescription>
          Para continuar, selecione o site que deseja gerenciar.
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

export function RequireTenant({ children, fallback }: RequireTenantProps) {
  const { hasTenant, isLoading } = useAdminTenant();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    );
  }

  if (!hasTenant) {
    return <>{fallback || <TenantMissingAlert />}</>;
  }

  return <>{children}</>;
}
