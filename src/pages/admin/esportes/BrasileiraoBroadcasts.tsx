import { useState } from "react";
import { Tv, Calendar, Save, RefreshCw, Search, Plus, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TeamBadge } from "@/components/esportes/TeamBadge";
import { WhereToWatchCard } from "@/components/esportes/WhereToWatchCard";
import { useToast } from "@/hooks/use-toast";
import { 
  useBrBroadcasts, 
  useSyncBroadcasts,
  useUpdateBroadcast,
  type BrBroadcast 
} from "@/hooks/useBrasileiraoNews";
import { useRoundMatches, useCompetitionByType } from "@/hooks/useFootball";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

const TV_OPEN_OPTIONS = ["Globo", "Band", "Record", "SBT"];
const TV_CLOSED_OPTIONS = ["SporTV", "Premiere", "ESPN", "TNT Sports"];
const STREAMING_OPTIONS = ["Globoplay", "Prime Video", "Star+", "Paramount+", "CazéTV"];

export default function BrasileiraoBroadcasts() {
  const { toast } = useToast();
  const [selectedRound, setSelectedRound] = useState<number>(1);
  const [editingMatch, setEditingMatch] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    tvOpen: string[];
    tvClosed: string[];
    streaming: string[];
  }>({ tvOpen: [], tvClosed: [], streaming: [] });

  const { data: competition } = useCompetitionByType("Série A");
  const { data: matches, isLoading: loadingMatches } = useRoundMatches(
    competition?.id, 
    selectedRound
  );
  
  const matchIds = matches?.map(m => m.id) || [];
  const { data: broadcasts, isLoading: loadingBroadcasts } = useBrBroadcasts(
    matchIds.length > 0 ? matchIds : undefined
  );

  const syncBroadcastsMutation = useSyncBroadcasts();
  const updateBroadcastMutation = useUpdateBroadcast();

  const broadcastMap = new Map(broadcasts?.map(b => [b.match_id, b]) || []);
  const rounds = Array.from({ length: 38 }, (_, i) => i + 1);

  const handleOpenEditor = (matchId: string) => {
    const broadcast = broadcastMap.get(matchId);
    setFormData({
      tvOpen: broadcast?.tv_open || [],
      tvClosed: broadcast?.tv_closed || [],
      streaming: broadcast?.streaming || []
    });
    setEditingMatch(matchId);
  };

  const handleSave = async () => {
    if (!editingMatch) return;
    
    try {
      await updateBroadcastMutation.mutateAsync({
        matchId: editingMatch,
        tvOpen: formData.tvOpen,
        tvClosed: formData.tvClosed,
        streaming: formData.streaming
      });
      toast({
        title: "Transmissão salva",
        description: "Os canais foram atualizados com sucesso."
      });
      setEditingMatch(null);
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleSyncAll = async () => {
    try {
      await syncBroadcastsMutation.mutateAsync(undefined);
      toast({
        title: "Sincronização concluída",
        description: "Transmissões atualizadas automaticamente."
      });
    } catch (error: any) {
      toast({
        title: "Erro na sincronização",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const toggleChannel = (type: 'tvOpen' | 'tvClosed' | 'streaming', channel: string) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].includes(channel)
        ? prev[type].filter(c => c !== channel)
        : [...prev[type], channel]
    }));
  };

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Tv className="h-6 w-6 text-primary" />
            Transmissões
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie onde os jogos serão transmitidos
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleSyncAll}
            disabled={syncBroadcastsMutation.isPending}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", syncBroadcastsMutation.isPending && "animate-spin")} />
            Sync Automático
          </Button>
        </div>
      </header>

      {/* Round Selector */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Selecione a Rodada</CardTitle>
            <Select 
              value={selectedRound.toString()} 
              onValueChange={(v) => setSelectedRound(Number(v))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {rounds.map((round) => (
                  <SelectItem key={round} value={round.toString()}>
                    Rodada {round}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Matches List */}
      {loadingMatches || loadingBroadcasts ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : matches && matches.length > 0 ? (
        <div className="space-y-4">
          {matches.map((match) => {
            const broadcast = broadcastMap.get(match.id);
            const matchDate = new Date(match.match_date);
            const hasChannels = broadcast && (
              (broadcast.tv_open?.length || 0) > 0 ||
              (broadcast.tv_closed?.length || 0) > 0 ||
              (broadcast.streaming?.length || 0) > 0
            );
            
            return (
              <Card key={match.id} className={cn(!hasChannels && "border-dashed")}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(matchDate, "EEEE, dd/MM 'às' HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleOpenEditor(match.id)}
                    >
                      Editar Canais
                    </Button>
                  </div>
                  
                  {/* Match Info */}
                  <div className="flex items-center justify-between py-3">
                    <TeamBadge 
                      name={match.home_team?.name || 'Casa'} 
                      logoUrl={match.home_team?.logo_url}
                      className="flex-1"
                    />
                    <div className="px-4 text-center">
                      <span className="text-lg font-bold text-muted-foreground">vs</span>
                    </div>
                    <TeamBadge 
                      name={match.away_team?.name || 'Fora'} 
                      logoUrl={match.away_team?.logo_url}
                      className="flex-1 justify-end"
                    />
                  </div>

                  {/* Broadcast Preview */}
                  <div className="pt-3 border-t">
                    {broadcast && hasChannels ? (
                      <WhereToWatchCard broadcast={broadcast} variant="compact" />
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-2">
                        Nenhum canal configurado
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Tv className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="font-medium mb-1">Nenhum jogo encontrado</h3>
            <p className="text-sm text-muted-foreground">
              Selecione outra rodada.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingMatch} onOpenChange={(open) => !open && setEditingMatch(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Transmissão</DialogTitle>
            <DialogDescription>
              Selecione os canais que transmitirão este jogo
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* TV Aberta */}
            <div>
              <Label className="text-sm font-medium mb-3 block">TV Aberta</Label>
              <div className="flex flex-wrap gap-2">
                {TV_OPEN_OPTIONS.map((channel) => (
                  <Badge
                    key={channel}
                    variant={formData.tvOpen.includes(channel) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/80"
                    onClick={() => toggleChannel('tvOpen', channel)}
                  >
                    {channel}
                    {formData.tvOpen.includes(channel) && (
                      <X className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            {/* TV Fechada */}
            <div>
              <Label className="text-sm font-medium mb-3 block">TV por Assinatura</Label>
              <div className="flex flex-wrap gap-2">
                {TV_CLOSED_OPTIONS.map((channel) => (
                  <Badge
                    key={channel}
                    variant={formData.tvClosed.includes(channel) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/80"
                    onClick={() => toggleChannel('tvClosed', channel)}
                  >
                    {channel}
                    {formData.tvClosed.includes(channel) && (
                      <X className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Streaming */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Streaming</Label>
              <div className="flex flex-wrap gap-2">
                {STREAMING_OPTIONS.map((channel) => (
                  <Badge
                    key={channel}
                    variant={formData.streaming.includes(channel) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/80"
                    onClick={() => toggleChannel('streaming', channel)}
                  >
                    {channel}
                    {formData.streaming.includes(channel) && (
                      <X className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditingMatch(null)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={updateBroadcastMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
