import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Crown, TrendingUp, Flame } from "lucide-react";

const MOCK_RANKING = [
  { id: "1", name: "Maria Silva", points: 2450, streak: 15, avatar: null, position: 1 },
  { id: "2", name: "João Santos", points: 2200, streak: 12, avatar: null, position: 2 },
  { id: "3", name: "Ana Costa", points: 1980, streak: 8, avatar: null, position: 3 },
  { id: "4", name: "Pedro Lima", points: 1750, streak: 10, avatar: null, position: 4 },
  { id: "5", name: "Lucia Ferreira", points: 1620, streak: 5, avatar: null, position: 5 },
  // Usuário atual
  { id: "current", name: "Você", points: 1250, streak: 7, avatar: null, position: 12, isCurrent: true },
];

export default function GcotiaRanking() {
  const currentUser = MOCK_RANKING.find(u => u.isCurrent);
  const topUsers = MOCK_RANKING.filter(u => !u.isCurrent).slice(0, 5);

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Medal className="h-5 w-5 text-amber-600" />;
      default: return <span className="font-bold text-muted-foreground">#{position}</span>;
    }
  };

  const getPositionBg = (position: number) => {
    switch (position) {
      case 1: return "bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-300";
      case 2: return "bg-gradient-to-r from-gray-200/50 to-gray-300/50 border-gray-300";
      case 3: return "bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-400";
      default: return "";
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-purple-500/10">
          <Trophy className="h-5 w-5 text-purple-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Ranking</h1>
          <p className="text-muted-foreground">Veja sua posição entre os participantes</p>
        </div>
      </div>

      {/* Card do usuário atual */}
      {currentUser && (
        <Card className="border-2 border-primary bg-primary/5">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="w-10 text-center font-bold text-lg">
                #{currentUser.position}
              </div>
              <Avatar>
                <AvatarFallback>VC</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">Sua posição</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{currentUser.points} pontos</span>
                  <span className="flex items-center gap-1">
                    <Flame className="h-3 w-3 text-orange-500" />
                    {currentUser.streak} dias
                  </span>
                </div>
              </div>
            </div>
            <Badge variant="outline" className="text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +3 posições
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Top 5 */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Top 5</h2>
        {topUsers.map((user) => (
          <Card key={user.id} className={`${getPositionBg(user.position)}`}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 flex justify-center">
                  {getPositionIcon(user.position)}
                </div>
                <Avatar>
                  <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{user.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Flame className="h-3 w-3 text-orange-500" />
                      {user.streak} dias
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-lg">{user.points.toLocaleString()}</span>
                <p className="text-xs text-muted-foreground">pontos</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
