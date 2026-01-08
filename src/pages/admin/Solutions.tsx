import { useState } from "react";
import { useSolutions, useTenantSolutions, useActivateSolution, useDeactivateSolution } from "@/hooks/useSolutions";
import { useCurrentSite } from "@/hooks/useSites";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Newspaper, Share2, Sparkles, Globe, Shield, Calendar, 
  CalendarDays, Megaphone, BarChart3, Receipt, BookOpen, 
  GraduationCap, Check, Settings, Loader2 
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Newspaper, Share2, Sparkles, Globe, Shield, Calendar,
  CalendarDays, Megaphone, BarChart3, Receipt, BookOpen, GraduationCap,
};

export default function Solutions() {
  const { data: site, isLoading: siteLoading } = useCurrentSite();
  const { data: solutions, isLoading: solutionsLoading } = useSolutions();
  const { data: tenantSolutions, isLoading: tenantLoading } = useTenantSolutions(site?.id);
  const activateMutation = useActivateSolution();
  const deactivateMutation = useDeactivateSolution();
  const [activatingId, setActivatingId] = useState<string | null>(null);

  const isLoading = siteLoading || solutionsLoading || tenantLoading;

  const getTenantSolution = (solutionId: string) => {
    return tenantSolutions?.find(ts => ts.solution_id === solutionId);
  };

  const isActive = (solutionId: string) => {
    const ts = getTenantSolution(solutionId);
    return ts?.status === "active";
  };

  const handleActivate = async (solutionId: string) => {
    if (!site?.id) return;
    setActivatingId(solutionId);
    try {
      await activateMutation.mutateAsync({ tenantId: site.id, solutionId });
    } finally {
      setActivatingId(null);
    }
  };

  const handleDeactivate = async (solutionId: string) => {
    const ts = getTenantSolution(solutionId);
    if (!ts) return;
    setActivatingId(solutionId);
    try {
      await deactivateMutation.mutateAsync(ts.id);
    } finally {
      setActivatingId(null);
    }
  };

  const formatPrice = (price: number | null) => {
    if (!price || price === 0) return "Grátis";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const activeSolutions = solutions?.filter(s => isActive(s.id)) || [];
  const availableSolutions = solutions?.filter(s => !isActive(s.id)) || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Soluções</h1>
          <p className="text-muted-foreground">Marketplace de módulos e funcionalidades</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Soluções</h1>
        <p className="text-muted-foreground">
          Ative módulos adicionais para expandir seu portal
        </p>
      </div>

      <Tabs defaultValue="available" className="space-y-6">
        <TabsList>
          <TabsTrigger value="available">
            Disponíveis ({availableSolutions.length})
          </TabsTrigger>
          <TabsTrigger value="active">
            Minhas Soluções ({activeSolutions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {availableSolutions.map(solution => {
              const IconComponent = iconMap[solution.icon || "Newspaper"] || Newspaper;
              const loading = activatingId === solution.id;

              return (
                <Card key={solution.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <Badge variant="secondary">
                        {formatPrice(solution.price_monthly)}/mês
                      </Badge>
                    </div>
                    <CardTitle className="mt-4">{solution.name}</CardTitle>
                    <CardDescription>{solution.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    {solution.benefits && solution.benefits.length > 0 && (
                      <ul className="space-y-2 text-sm">
                        {solution.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    )}
                    {solution.who_should_use && (
                      <p className="mt-4 text-xs text-muted-foreground">
                        <strong>Ideal para:</strong> {solution.who_should_use}
                      </p>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      onClick={() => handleActivate(solution.id)}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Ativar Solução
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {availableSolutions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Você já ativou todas as soluções disponíveis! 🎉
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeSolutions.map(solution => {
              const IconComponent = iconMap[solution.icon || "Newspaper"] || Newspaper;
              const ts = getTenantSolution(solution.id);
              const loading = activatingId === solution.id;

              return (
                <Card key={solution.id} className="flex flex-col border-primary/20 bg-primary/5">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                        <IconComponent className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <Badge variant="default" className="bg-green-500">
                        Ativo
                      </Badge>
                    </div>
                    <CardTitle className="mt-4">{solution.name}</CardTitle>
                    <CardDescription>{solution.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    {ts?.activated_at && (
                      <p className="text-xs text-muted-foreground">
                        Ativado em:{" "}
                        {new Date(ts.activated_at).toLocaleDateString("pt-BR")}
                      </p>
                    )}
                    {ts?.billing_cycle && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Ciclo: {ts.billing_cycle === "monthly" ? "Mensal" : "Anual"}
                      </p>
                    )}
                  </CardContent>
                  <CardFooter className="gap-2">
                    <Button variant="outline" className="flex-1">
                      <Settings className="mr-2 h-4 w-4" />
                      Gerenciar
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeactivate(solution.id)}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Cancelar"
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {activeSolutions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Você ainda não ativou nenhuma solução.
              </p>
              <Button 
                variant="link" 
                onClick={() => document.querySelector('[data-value="available"]')?.dispatchEvent(new Event('click'))}
              >
                Ver soluções disponíveis
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
