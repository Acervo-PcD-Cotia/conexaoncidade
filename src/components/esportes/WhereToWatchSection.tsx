import { useState } from "react";
import { Tv, Calendar, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TeamBadge } from "@/components/esportes/TeamBadge";
import { WhereToWatchCard } from "@/components/esportes/WhereToWatchCard";
import { useBrBroadcasts } from "@/hooks/useBrasileiraoNews";
import { useRoundMatches, useCompetitionByType } from "@/hooks/useFootball";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface WhereToWatchSectionProps {
  className?: string;
}

export function WhereToWatchSection({ className }: WhereToWatchSectionProps) {
  const [selectedRound, setSelectedRound] = useState<number>(1);
  
  const { data: competition } = useCompetitionByType("Série A");
  const { data: matches, isLoading: loadingMatches } = useRoundMatches(
    competition?.id, 
    selectedRound
  );
  
  const matchIds = matches?.map(m => m.id) || [];
  const { data: broadcasts, isLoading: loadingBroadcasts } = useBrBroadcasts(
    matchIds.length > 0 ? matchIds : undefined
  );

  const broadcastMap = new Map(broadcasts?.map(b => [b.match_id, b]) || []);
  const rounds = Array.from({ length: 38 }, (_, i) => i + 1);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Round Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Tv className="h-5 w-5 text-primary" />
          Onde Assistir
        </h2>
        <Select 
          value={selectedRound.toString()} 
          onValueChange={(v) => setSelectedRound(Number(v))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Selecione a rodada" />
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
            
            return (
              <Card key={match.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(matchDate, "EEEE, dd/MM 'às' HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                    {match.venue && (
                      <span className="text-xs text-muted-foreground">
                        {match.venue}
                      </span>
                    )}
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

                  {/* Broadcast Info */}
                  {broadcast ? (
                    <div className="pt-3 border-t">
                      <WhereToWatchCard broadcast={broadcast} variant="compact" />
                    </div>
                  ) : (
                    <div className="pt-3 border-t">
                      <p className="text-sm text-muted-foreground text-center py-2">
                        Transmissão a confirmar
                      </p>
                    </div>
                  )}
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
              Selecione outra rodada para ver os jogos e transmissões.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
