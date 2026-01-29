import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface MatchStatsProps {
  homeStats: {
    possession?: number;
    shots?: number;
    shotsOnTarget?: number;
    corners?: number;
    fouls?: number;
    yellowCards?: number;
    redCards?: number;
  };
  awayStats: {
    possession?: number;
    shots?: number;
    shotsOnTarget?: number;
    corners?: number;
    fouls?: number;
    yellowCards?: number;
    redCards?: number;
  };
}

interface StatRowProps {
  label: string;
  homeValue: number;
  awayValue: number;
  showPercentage?: boolean;
}

function StatRow({ label, homeValue, awayValue, showPercentage = false }: StatRowProps) {
  const total = homeValue + awayValue;
  const homePercent = total > 0 ? (homeValue / total) * 100 : 50;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium tabular-nums">
          {homeValue}{showPercentage ? "%" : ""}
        </span>
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">
          {awayValue}{showPercentage ? "%" : ""}
        </span>
      </div>
      <div className="flex gap-1 h-2">
        <div 
          className="bg-primary rounded-l-full transition-all"
          style={{ width: `${homePercent}%` }}
        />
        <div 
          className="bg-muted-foreground/30 rounded-r-full transition-all"
          style={{ width: `${100 - homePercent}%` }}
        />
      </div>
    </div>
  );
}

export function MatchStats({ homeStats, awayStats }: MatchStatsProps) {
  const hasStats = Object.values(homeStats).some(v => v !== undefined) ||
                   Object.values(awayStats).some(v => v !== undefined);
  
  if (!hasStats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Estatísticas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground">
              Estatísticas não disponíveis para esta partida
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Estatísticas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {homeStats.possession !== undefined && awayStats.possession !== undefined && (
          <StatRow 
            label="Posse de Bola" 
            homeValue={homeStats.possession} 
            awayValue={awayStats.possession}
            showPercentage
          />
        )}
        
        {homeStats.shots !== undefined && awayStats.shots !== undefined && (
          <StatRow 
            label="Finalizações" 
            homeValue={homeStats.shots} 
            awayValue={awayStats.shots}
          />
        )}
        
        {homeStats.shotsOnTarget !== undefined && awayStats.shotsOnTarget !== undefined && (
          <StatRow 
            label="Chutes no Gol" 
            homeValue={homeStats.shotsOnTarget} 
            awayValue={awayStats.shotsOnTarget}
          />
        )}
        
        {homeStats.corners !== undefined && awayStats.corners !== undefined && (
          <StatRow 
            label="Escanteios" 
            homeValue={homeStats.corners} 
            awayValue={awayStats.corners}
          />
        )}
        
        {homeStats.fouls !== undefined && awayStats.fouls !== undefined && (
          <StatRow 
            label="Faltas" 
            homeValue={homeStats.fouls} 
            awayValue={awayStats.fouls}
          />
        )}
        
        {(homeStats.yellowCards !== undefined || homeStats.redCards !== undefined) && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-2xl">🟨</span>
                <span className="text-xl font-bold">{homeStats.yellowCards || 0}</span>
                <span className="text-muted-foreground">-</span>
                <span className="text-xl font-bold">{awayStats.yellowCards || 0}</span>
              </div>
              <p className="text-xs text-muted-foreground">Cartões Amarelos</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-2xl">🟥</span>
                <span className="text-xl font-bold">{homeStats.redCards || 0}</span>
                <span className="text-muted-foreground">-</span>
                <span className="text-xl font-bold">{awayStats.redCards || 0}</span>
              </div>
              <p className="text-xs text-muted-foreground">Cartões Vermelhos</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
