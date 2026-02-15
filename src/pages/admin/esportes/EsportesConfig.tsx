import { useState } from "react";
import { ArrowLeft, RefreshCw, Check, AlertCircle, Clock, Database, Wifi } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useSyncFootballData, useCompetitions, useStandings } from "@/hooks/useFootball";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export default function EsportesConfig() {
  const { toast } = useToast();
  const [syncingSerie, setSyncingSerie] = useState<string | null>(null);
  
  const { data: competitions } = useCompetitions();
  const syncMutation = useSyncFootballData();
  
  // Get counts for each competition
  const { data: teamsCounts } = useQuery({
    queryKey: ["football", "teams-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("football_teams")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });
  
  const { data: matchesCounts } = useQuery({
    queryKey: ["football", "matches-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("football_matches")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });
  
  const { data: standingsCounts } = useQuery({
    queryKey: ["football", "standings-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("football_standings")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });
  
  const { data: lastSync } = useQuery({
    queryKey: ["football", "last-sync"],
    queryFn: async () => {
      const { data } = await supabase
        .from("football_matches")
        .select("updated_at")
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();
      return data?.updated_at;
    },
  });

  const handleSync = async (competitionId?: string, serieName?: string) => {
    setSyncingSerie(competitionId || "all");
    
    try {
      await syncMutation.mutateAsync(competitionId);
      toast({
        title: "Sincronização concluída!",
        description: `Dados ${serieName ? `da ${serieName}` : "do Brasileirão"} atualizados com sucesso.`,
      });
    } catch (error: any) {
      toast({
        title: "Erro na sincronização",
        description: error.message || "Não foi possível sincronizar os dados.",
        variant: "destructive",
      });
    } finally {
      setSyncingSerie(null);
    }
  };

  const serieA = competitions?.find(c => c.name.includes("A"));
  const serieB = competitions?.find(c => c.name.includes("B"));

  const formatLastSync = (date: string | undefined) => {
    if (!date) return "Nunca";
    const d = new Date(date);
    return d.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link to="/spah/painel/esportes">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Configuração do Módulo Esportes
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie a sincronização de dados e configurações da API
          </p>
        </div>
      </header>

      {/* Status da API */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Wifi className="h-5 w-5 text-primary" />
            Status da Integração
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-500/10">
                <Check className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <p className="font-medium">RAPIDAPI_KEY</p>
                <p className="text-sm text-muted-foreground">Chave configurada e ativa</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
              Ativo
            </Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-500/10">
                <Clock className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="font-medium">Última Sincronização</p>
                <p className="text-sm text-muted-foreground">{formatLastSync(lastSync)}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-purple-500/10">
                <Database className="h-4 w-4 text-purple-500" />
              </div>
              <div>
                <p className="font-medium">Dados no Banco</p>
                <p className="text-sm text-muted-foreground">
                  {teamsCounts || 0} times • {matchesCounts || 0} jogos • {standingsCounts || 0} posições
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sincronização por Série */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Série A</CardTitle>
            <CardDescription>Campeonato Brasileiro Série A - 20 times</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/30 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">ID da Competição:</span>
                <span className="font-mono">{serieA?.id || "Não configurado"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">API ID:</span>
                <span className="font-mono">{serieA?.external_id || "71"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Temporada:</span>
                <span className="font-mono">{serieA?.season || new Date().getFullYear()}</span>
              </div>
            </div>
            
            <Button 
              className="w-full" 
              onClick={() => handleSync(serieA?.id, "Série A")}
              disabled={syncingSerie !== null}
            >
              {syncingSerie === serieA?.id ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sincronizar Série A
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Série B</CardTitle>
            <CardDescription>Campeonato Brasileiro Série B - 20 times</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/30 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">ID da Competição:</span>
                <span className="font-mono">{serieB?.id || "Não configurado"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">API ID:</span>
                <span className="font-mono">{serieB?.external_id || "72"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Temporada:</span>
                <span className="font-mono">{serieB?.season || new Date().getFullYear()}</span>
              </div>
            </div>
            
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => handleSync(serieB?.id, "Série B")}
              disabled={syncingSerie !== null}
            >
              {syncingSerie === serieB?.id ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sincronizar Série B
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Sincronização Completa */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            Sincronização Completa
          </CardTitle>
          <CardDescription>
            Sincroniza todos os dados de ambas as séries de uma só vez
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Isso irá atualizar: times, jogos, classificação e artilharia
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Pode levar alguns segundos para completar
              </p>
            </div>
            <Button 
              size="lg"
              onClick={() => handleSync(undefined, undefined)}
              disabled={syncingSerie !== null}
            >
              {syncingSerie === "all" ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Sincronizando Tudo...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sincronizar Tudo
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Configurações Avançadas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Configurações Avançadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground">Intervalo de Atualização</p>
              <p className="text-lg font-semibold">15 segundos</p>
              <p className="text-xs text-muted-foreground">Para jogos ao vivo</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground">Cache Classificação</p>
              <p className="text-lg font-semibold">30 minutos</p>
              <p className="text-xs text-muted-foreground">Tabela atualizada</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground">Cache Times</p>
              <p className="text-lg font-semibold">24 horas</p>
              <p className="text-xs text-muted-foreground">Dados estáticos</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
