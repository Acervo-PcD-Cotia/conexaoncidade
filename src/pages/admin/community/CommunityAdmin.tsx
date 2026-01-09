import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Award,
  AlertTriangle,
  UserPlus,
  Share2,
  Heart,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { NavLink } from "@/components/NavLink";

// Mock stats
const communityStats = {
  totalMembers: 1247,
  activeToday: 89,
  pendingAccess: 34,
  totalPosts: 3456,
  totalComments: 12890,
  totalShares: 8234,
  reportsToReview: 5,
  levelDistribution: {
    visitor: 456,
    supporter: 389,
    collaborator: 245,
    ambassador: 112,
    leader: 45,
  },
};

const recentActivity = [
  { type: "join", user: "Maria Silva", time: "2 min atrás" },
  { type: "post", user: "João Santos", time: "5 min atrás" },
  { type: "share", user: "Ana Costa", content: "Notícia sobre economia", time: "8 min atrás" },
  { type: "levelup", user: "Pedro Lima", level: "Colaborador", time: "15 min atrás" },
];

export default function CommunityAdmin() {
  const totalByLevel = Object.values(communityStats.levelDistribution).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Comunidade</h1>
          <p className="text-muted-foreground">Gerencie e monitore sua comunidade de leitores</p>
        </div>
        <div className="flex gap-2">
          <NavLink to="/admin/community/members">
            <Button variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Membros
            </Button>
          </NavLink>
          <NavLink to="/admin/community/moderation">
            <Button variant={communityStats.reportsToReview > 0 ? "destructive" : "outline"}>
              <AlertTriangle className="h-4 w-4 mr-2" />
              Moderação
              {communityStats.reportsToReview > 0 && (
                <Badge variant="secondary" className="ml-2">{communityStats.reportsToReview}</Badge>
              )}
            </Button>
          </NavLink>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Membros</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{communityStats.totalMembers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ativos Hoje</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{communityStats.activeToday}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((communityStats.activeToday / communityStats.totalMembers) * 100)}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Aguardando Acesso</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{communityStats.pendingAccess}</div>
            <p className="text-xs text-muted-foreground">
              Completando desafio de 12 shares
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Denúncias Pendentes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{communityStats.reportsToReview}</div>
            <NavLink to="/admin/community/moderation">
              <Button variant="link" className="h-auto p-0 text-xs">
                Revisar agora →
              </Button>
            </NavLink>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Engagement Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Engajamento</CardTitle>
            <CardDescription>Métricas de interação da comunidade</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span>Posts</span>
              </div>
              <span className="font-semibold">{communityStats.totalPosts.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-muted-foreground" />
                <span>Comentários</span>
              </div>
              <span className="font-semibold">{communityStats.totalComments.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="h-4 w-4 text-muted-foreground" />
                <span>Compartilhamentos</span>
              </div>
              <span className="font-semibold">{communityStats.totalShares.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Level Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Nível</CardTitle>
            <CardDescription>Membros por tier de engajamento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(communityStats.levelDistribution).map(([level, count]) => {
              const percentage = Math.round((count / totalByLevel) * 100);
              const levelNames: Record<string, string> = {
                visitor: "Visitante",
                supporter: "Apoiador",
                collaborator: "Colaborador",
                ambassador: "Embaixador",
                leader: "Líder",
              };
              const levelColors: Record<string, string> = {
                visitor: "bg-gray-500",
                supporter: "bg-blue-500",
                collaborator: "bg-green-500",
                ambassador: "bg-purple-500",
                leader: "bg-yellow-500",
              };
              
              return (
                <div key={level} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Award className={`h-4 w-4 ${levelColors[level].replace("bg-", "text-")}`} />
                      <span>{levelNames[level]}</span>
                    </div>
                    <span className="text-muted-foreground">{count} ({percentage}%)</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>Últimas ações na comunidade</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    activity.type === "join" ? "bg-green-100" :
                    activity.type === "post" ? "bg-blue-100" :
                    activity.type === "share" ? "bg-purple-100" :
                    "bg-yellow-100"
                  }`}>
                    {activity.type === "join" && <UserPlus className="h-4 w-4 text-green-600" />}
                    {activity.type === "post" && <MessageSquare className="h-4 w-4 text-blue-600" />}
                    {activity.type === "share" && <Share2 className="h-4 w-4 text-purple-600" />}
                    {activity.type === "levelup" && <Award className="h-4 w-4 text-yellow-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span>
                      {activity.type === "join" && " entrou na comunidade"}
                      {activity.type === "post" && " publicou um post"}
                      {activity.type === "share" && ` compartilhou "${activity.content}"`}
                      {activity.type === "levelup" && ` subiu para ${activity.level}`}
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
