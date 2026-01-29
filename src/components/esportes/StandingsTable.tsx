import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TeamBadge } from "./TeamBadge";
import { FormBadge } from "./FormBadge";
import { 
  StandingsEntry, 
  getPositionZone, 
  getPositionZoneColors 
} from "@/types/football";
import { cn } from "@/lib/utils";

interface StandingsTableProps {
  standings: StandingsEntry[];
  isSerieA?: boolean;
  compact?: boolean;
}

export function StandingsTable({ standings, isSerieA = true, compact = false }: StandingsTableProps) {
  const serie = isSerieA ? "serie-a" : "serie-b";
  
  if (!standings.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">Classificação não disponível</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12 text-center">#</TableHead>
            <TableHead>Time</TableHead>
            <TableHead className="text-center w-12">P</TableHead>
            <TableHead className="text-center w-12">J</TableHead>
            {!compact && (
              <>
                <TableHead className="text-center w-12">V</TableHead>
                <TableHead className="text-center w-12">E</TableHead>
                <TableHead className="text-center w-12">D</TableHead>
                <TableHead className="text-center w-12">GP</TableHead>
                <TableHead className="text-center w-12">GC</TableHead>
              </>
            )}
            <TableHead className="text-center w-12">SG</TableHead>
            {!compact && <TableHead className="text-center">Forma</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {standings.map((entry) => {
            const zone = getPositionZone(entry.position, isSerieA);
            const zoneColors = getPositionZoneColors(zone);
            
            return (
              <TableRow 
                key={entry.id} 
                className={cn("border-l-4", zoneColors.border, zoneColors.bg)}
              >
                <TableCell className="text-center font-bold">
                  {entry.position}
                </TableCell>
                <TableCell>
                  <Link 
                    to={`/esportes/brasileirao/${serie}/time/${entry.team?.slug}`}
                    className="hover:underline"
                  >
                    <TeamBadge 
                      name={entry.team?.name || "Time"} 
                      logoUrl={entry.team?.logo_url}
                      showName
                      size="sm"
                    />
                  </Link>
                </TableCell>
                <TableCell className="text-center font-bold">{entry.points || 0}</TableCell>
                <TableCell className="text-center">{entry.played || 0}</TableCell>
                {!compact && (
                  <>
                    <TableCell className="text-center text-green-600">{entry.won || 0}</TableCell>
                    <TableCell className="text-center text-yellow-600">{entry.drawn || 0}</TableCell>
                    <TableCell className="text-center text-red-600">{entry.lost || 0}</TableCell>
                    <TableCell className="text-center">{entry.goals_for || 0}</TableCell>
                    <TableCell className="text-center">{entry.goals_against || 0}</TableCell>
                  </>
                )}
                <TableCell className={cn(
                  "text-center font-medium",
                  (entry.goal_difference || 0) > 0 && "text-green-600",
                  (entry.goal_difference || 0) < 0 && "text-red-600"
                )}>
                  {(entry.goal_difference || 0) > 0 ? `+${entry.goal_difference}` : entry.goal_difference || 0}
                </TableCell>
                {!compact && (
                  <TableCell>
                    <FormBadge form={entry.form} />
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span>{isSerieA ? "Libertadores (G4)" : "Acesso (G4)"}</span>
        </div>
        {isSerieA && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span>Sul-Americana</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500" />
          <span>Rebaixamento (Z4)</span>
        </div>
      </div>
    </div>
  );
}
