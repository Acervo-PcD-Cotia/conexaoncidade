import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TeamBadge } from "./TeamBadge";
import { FootballMatch, getMatchStatusLabel } from "@/types/football";

interface LiveMatchCardProps {
  match: FootballMatch;
}

export function LiveMatchCard({ match }: LiveMatchCardProps) {
  return (
    <Link to={`/esportes/brasileirao/serie-a/jogo/${match.slug || match.id}`}>
      <Card className="border-red-500/50 bg-red-500/5 hover:bg-red-500/10 transition-colors cursor-pointer overflow-hidden">
        <CardContent className="p-4">
          {/* Live Badge */}
          <div className="flex items-center justify-center mb-4">
            <Badge variant="destructive" className="animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white mr-2 animate-ping" />
              AO VIVO {match.elapsed_time ? `• ${match.elapsed_time}'` : ""}
            </Badge>
          </div>
          
          {/* Score Display */}
          <div className="flex items-center justify-between gap-4">
            {/* Home Team */}
            <div className="flex-1 text-center">
              <TeamBadge 
                name={match.home_team?.name || "Casa"} 
                logoUrl={match.home_team?.logo_url}
                size="lg"
                className="justify-center mb-2"
              />
              <p className="text-sm font-medium truncate">
                {match.home_team?.short_name || match.home_team?.name}
              </p>
            </div>
            
            {/* Score */}
            <div className="text-center">
              <div className="text-4xl font-bold tabular-nums">
                {match.home_score ?? 0} - {match.away_score ?? 0}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {getMatchStatusLabel(match.status)}
              </div>
            </div>
            
            {/* Away Team */}
            <div className="flex-1 text-center">
              <TeamBadge 
                name={match.away_team?.name || "Fora"} 
                logoUrl={match.away_team?.logo_url}
                size="lg"
                className="justify-center mb-2"
              />
              <p className="text-sm font-medium truncate">
                {match.away_team?.short_name || match.away_team?.name}
              </p>
            </div>
          </div>
          
          {/* Half-time score */}
          {match.home_score_halftime != null && (
            <div className="text-center mt-3 text-xs text-muted-foreground">
              Intervalo: {match.home_score_halftime} - {match.away_score_halftime}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
