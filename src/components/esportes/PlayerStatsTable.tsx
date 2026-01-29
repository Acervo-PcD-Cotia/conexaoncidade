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
import { PlayerStats } from "@/types/football";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PlayerStatsTableProps {
  players: PlayerStats[];
  showAssists?: boolean;
  showCards?: boolean;
}

export function PlayerStatsTable({ 
  players, 
  showAssists = true,
  showCards = false 
}: PlayerStatsTableProps) {
  if (!players.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">Estatísticas não disponíveis</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12 text-center">#</TableHead>
            <TableHead>Jogador</TableHead>
            <TableHead>Time</TableHead>
            <TableHead className="text-center">Gols</TableHead>
            {showAssists && <TableHead className="text-center">Assist.</TableHead>}
            <TableHead className="text-center">Jogos</TableHead>
            {showCards && (
              <>
                <TableHead className="text-center">🟨</TableHead>
                <TableHead className="text-center">🟥</TableHead>
              </>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((player, index) => (
            <TableRow key={player.id}>
              <TableCell className="text-center font-bold">{index + 1}</TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={player.player_photo_url || undefined} alt={player.player_name} />
                    <AvatarFallback>
                      {player.player_name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{player.player_name}</p>
                    {player.position && (
                      <p className="text-xs text-muted-foreground">{player.position}</p>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {player.team ? (
                  <Link 
                    to={`/esportes/brasileirao/serie-a/time/${player.team.slug}`}
                    className="hover:underline"
                  >
                    <TeamBadge 
                      name={player.team.name} 
                      logoUrl={player.team.logo_url}
                      size="sm"
                    />
                  </Link>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell className="text-center font-bold text-lg">{player.goals || 0}</TableCell>
              {showAssists && (
                <TableCell className="text-center">{player.assists || 0}</TableCell>
              )}
              <TableCell className="text-center">{player.matches_played || 0}</TableCell>
              {showCards && (
                <>
                  <TableCell className="text-center">{player.yellow_cards || 0}</TableCell>
                  <TableCell className="text-center">{player.red_cards || 0}</TableCell>
                </>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
