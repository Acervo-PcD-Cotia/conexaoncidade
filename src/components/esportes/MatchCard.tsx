import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TeamBadge } from "./TeamBadge";
import { 
  FootballMatch, 
  getMatchStatusLabel, 
  getStatusColor, 
  isMatchLive, 
  isMatchFinished 
} from "@/types/football";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface MatchCardProps {
  match: FootballMatch;
  showLeague?: boolean;
  compact?: boolean;
  showLiveIndicator?: boolean;
}

export function MatchCard({ match, showLeague = false, compact = false, showLiveIndicator = false }: MatchCardProps) {
  const statusColors = getStatusColor(match.status);
  const live = isMatchLive(match.status);
  const finished = isMatchFinished(match.status);
  
  const matchDate = new Date(match.match_date);
  
  if (compact) {
    return (
      <Link to={`/esportes/brasileirao/serie-a/jogo/${match.slug || match.id}`}>
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <TeamBadge name={match.home_team?.name || "Casa"} logoUrl={match.home_team?.logo_url} size="xs" />
              <span className="text-xs text-muted-foreground">vs</span>
              <TeamBadge name={match.away_team?.name || "Fora"} logoUrl={match.away_team?.logo_url} size="xs" />
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {format(matchDate, "HH:mm")}
          </div>
        </div>
      </Link>
    );
  }
  
  return (
    <Link to={`/esportes/brasileirao/serie-a/jogo/${match.slug || match.id}`}>
      <Card className={cn(
        "hover:bg-accent/50 transition-colors cursor-pointer",
        live && "border-red-500/50"
      )}>
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs text-muted-foreground">
              {match.round_name && <span>{match.round_name}</span>}
            </div>
            <Badge 
              variant="secondary" 
              className={cn(statusColors.bg, statusColors.text, "text-xs")}
            >
              {live && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5 animate-pulse" />
              )}
              {getMatchStatusLabel(match.status)}
              {live && match.elapsed_time && ` ${match.elapsed_time}'`}
            </Badge>
          </div>
          
          {/* Teams */}
          <div className="space-y-3">
            {/* Home Team */}
            <div className="flex items-center justify-between">
              <TeamBadge 
                name={match.home_team?.name || "Time Casa"} 
                logoUrl={match.home_team?.logo_url}
                showName
                size="sm"
              />
              <span className={cn(
                "text-xl font-bold tabular-nums",
                finished && (match.home_score ?? 0) > (match.away_score ?? 0) && "text-green-600 dark:text-green-400"
              )}>
                {match.home_score ?? "-"}
              </span>
            </div>
            
            {/* Away Team */}
            <div className="flex items-center justify-between">
              <TeamBadge 
                name={match.away_team?.name || "Time Fora"} 
                logoUrl={match.away_team?.logo_url}
                showName
                size="sm"
              />
              <span className={cn(
                "text-xl font-bold tabular-nums",
                finished && (match.away_score ?? 0) > (match.home_score ?? 0) && "text-green-600 dark:text-green-400"
              )}>
                {match.away_score ?? "-"}
              </span>
            </div>
          </div>
          
          {/* Footer */}
          <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {format(matchDate, "dd/MM • HH:mm", { locale: ptBR })}
            </span>
            {match.venue && (
              <span className="truncate max-w-[150px]">{match.venue}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
