import { MapPin, Monitor, Smartphone, Star, RotateCcw, Check, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { usePublidoorLocations } from "@/hooks/usePublidoor";

export default function PublidoorLocations() {
  const { data: locations, isLoading } = usePublidoorLocations(false);

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case "desktop":
        return <Monitor className="h-4 w-4" />;
      case "mobile":
        return <Smartphone className="h-4 w-4" />;
      default:
        return (
          <div className="flex gap-1">
            <Monitor className="h-4 w-4" />
            <Smartphone className="h-4 w-4" />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Locais de Exibição</h1>
        <p className="text-muted-foreground">
          Gerencie onde os Publidoors podem aparecer no portal
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Carregando...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {locations?.map((location) => (
            <Card key={location.id} className={!location.is_active ? "opacity-60" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{location.name}</CardTitle>
                  </div>
                  {location.is_premium && (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                      <Star className="mr-1 h-3 w-3" />
                      Premium
                    </Badge>
                  )}
                </div>
                {location.description && (
                  <CardDescription>{location.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Dispositivo</span>
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(location.device_target)}
                      <span className="capitalize">{location.device_target === "all" ? "Todos" : location.device_target}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Máx. Publidoors</span>
                    <span className="font-medium">{location.max_items}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Rotação</span>
                    <div className="flex items-center gap-1">
                      {location.allows_rotation ? (
                        <>
                          <RotateCcw className="h-4 w-4 text-green-500" />
                          <span className="text-green-600">Permitida</span>
                        </>
                      ) : (
                        <>
                          <X className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Fixa</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm pt-2 border-t">
                    <span className="text-muted-foreground">Ativo</span>
                    <div className="flex items-center gap-2">
                      {location.is_active ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                      <span className={location.is_active ? "text-green-600" : "text-red-600"}>
                        {location.is_active ? "Sim" : "Não"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t">
                  <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    {location.slug}
                  </code>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">Sobre os Locais</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>Premium:</strong> Locais exclusivos que permitem apenas 1 Publidoor por vez,
            garantindo máxima visibilidade.
          </p>
          <p>
            <strong>Rotação:</strong> Quando permitida, múltiplos Publidoors alternam automaticamente
            no mesmo local.
          </p>
          <p>
            <strong>Dispositivo:</strong> Define em quais dispositivos o local está disponível
            (desktop, mobile ou ambos).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
