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
import { Skeleton } from "@/components/ui/skeleton";
import { NavLink } from "@/components/NavLink";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function CommunityAdmin() {
  // Fetch community stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["community-admin-stats"],
    queryFn: async () => {
      const [
        { count: totalMembers },
        { count: activeToday },
        { count: pendingAccess },
        { count: totalPosts },
        { count: totalComments },
        { count: totalShares },
        { count: pendingReports },
        { data: levelData },
      ] = await Promise.all([
        supabase.from("community_members").select("*", { count: "exact", head: true }),
        supabase.from("community_members")
          .select("*", { count: "exact", head: true })
          .gte("updated_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
        supabase.from("community_members")
          .select("*", { count: "exact", head: true })
          .is("access_granted_at", null),
        supabase.from("community_posts").select("*", { count: "exact", head: true }),
        supabase.from("community_comments").select("*", { count: "exact", head: true }),
        supabase.from("community_shares").select("*", { count: "exact", head: true }),
        supabase.from("community_reports")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase.from("community_members").select("level"),
      ]);

      // Calculate level distribution
      const levelDistribution = {
        supporter: 0,
        collaborator: 0,
        ambassador: 0,
        leader: 0,
      };

      levelData?.forEach((member) => {
        const level = member.level as keyof typeof levelDistribution;
        if (levelDistribution[level] !== undefined) {
          levelDistribution[level]++;
        }
      });

      return {
        totalMembers: totalMembers || 0,
        activeToday: activeToday || 0,
        pendingAccess: pendingAccess || 0,
        totalPosts: totalPosts || 0,
        totalComments: totalComments || 0,
        totalShares: totalShares || 0,
        reportsToReview: pendingReports || 0,
        levelDistribution,
      };
    },
  });

  // Fetch recent activity
  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ["community-recent-activity"],
    queryFn: async () => {
      // Fetch recent members with their profile via separate query
      const { data: newMembers } = await supabase
        .from("community_members")
        .select("user_id, created_at")
        .order("created_at", { ascending: false })
        .limit(3);

      const { data: newPosts } = await supabase
        .from("community_posts")
        .select("id, created_at, author_id")
        .order("created_at", { ascending: false })
        .limit(3);

      const { data: newShares } = await supabase
        .from("community_shares")
        .select("id, shared_at, user_id")
        .order("shared_at", { ascending: false })
        .limit(3);

      // Get all unique user IDs
      const userIds = new Set<string>();
      newMembers?.forEach((m) => userIds.add(m.user_id));
      newPosts?.forEach((p) => userIds.add(p.author_id));
      newShares?.forEach((s) => userIds.add(s.user_id));

      // Fetch profiles for all users
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", Array.from(userIds));

      const profileMap = new Map(profiles?.map((p) => [p.id, p.full_name]) || []);

      const activities: Array<{
        type: "join" | "post" | "share";
        user: string;
        time: string;
      }> = [];

      newMembers?.forEach((m) => {
        activities.push({
          type: "join",
          user: profileMap.get(m.user_id) || "Usuário",
          time: formatDistanceToNow(new Date(m.created_at), { addSuffix: true, locale: ptBR }),
        });
      });

      newPosts?.forEach((p) => {
        activities.push({
          type: "post",
          user: profileMap.get(p.author_id) || "Usuário",
          time: formatDistanceToNow(new Date(p.created_at), { addSuffix: true, locale: ptBR }),
        });
      });

      newShares?.forEach((s) => {
        activities.push({
          type: "share",
          user: profileMap.get(s.user_id) || "Usuário",
          time: formatDistanceToNow(new Date(s.shared_at), { addSuffix: true, locale: ptBR }),
        });
      });

      // Sort by most recent (approximation since we mixed different timestamps)
      return activities.slice(0, 8);
    },
  });

  const totalByLevel = stats ? Object.values(stats.levelDistribution).reduce((a, b) => a + b, 0) : 0;

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
            <Button variant={stats?.reportsToReview ? "destructive" : "outline"}>
              <AlertTriangle className="h-4 w-4 mr-2" />
              Moderação
              {stats?.reportsToReview ? (
                <Badge variant="secondary" className="ml-2">{stats.reportsToReview}</Badge>
              ) : null}
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
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.totalMembers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">membros cadastrados</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ativos Hoje</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.activeToday}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.totalMembers ? Math.round((stats.activeToday / stats.totalMembers) * 100) : 0}% do total
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Aguardando Acesso</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.pendingAccess}</div>
                <p className="text-xs text-muted-foreground">
                  Completando desafio de 12 shares
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Denúncias Pendentes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.reportsToReview}</div>
                <NavLink to="/admin/community/moderation">
                  <Button variant="link" className="h-auto p-0 text-xs">
                    Revisar agora →
                  </Button>
                </NavLink>
              </>
            )}
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
            {statsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span>Posts</span>
                  </div>
                  <span className="font-semibold">{stats?.totalPosts.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-muted-foreground" />
                    <span>Comentários</span>
                  </div>
                  <span className="font-semibold">{stats?.totalComments.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Share2 className="h-4 w-4 text-muted-foreground" />
                    <span>Compartilhamentos</span>
                  </div>
                  <span className="font-semibold">{stats?.totalShares.toLocaleString()}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Level Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Nível</CardTitle>
            <CardDescription>Membros por tier de engajamento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {statsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              Object.entries(stats?.levelDistribution || {}).map(([level, count]) => {
                const percentage = totalByLevel > 0 ? Math.round((count / totalByLevel) * 100) : 0;
                const levelNames: Record<string, string> = {
                  supporter: "Apoiador",
                  collaborator: "Colaborador",
                  ambassador: "Embaixador",
                  leader: "Líder",
                };
                const levelColors: Record<string, string> = {
                  supporter: "text-blue-500",
                  collaborator: "text-green-500",
                  ambassador: "text-purple-500",
                  leader: "text-yellow-500",
                };
                
                return (
                  <div key={level} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Award className={`h-4 w-4 ${levelColors[level]}`} />
                        <span>{levelNames[level]}</span>
                      </div>
                      <span className="text-muted-foreground">{count} ({percentage}%)</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>Últimas ações na comunidade</CardDescription>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivity?.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma atividade recente
              </p>
            ) : (
              <div className="space-y-4">
                {recentActivity?.map((activity, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      activity.type === "join" ? "bg-green-100" :
                      activity.type === "post" ? "bg-blue-100" :
                      "bg-purple-100"
                    }`}>
                      {activity.type === "join" && <UserPlus className="h-4 w-4 text-green-600" />}
                      {activity.type === "post" && <MessageSquare className="h-4 w-4 text-blue-600" />}
                      {activity.type === "share" && <Share2 className="h-4 w-4 text-purple-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span>
                        {activity.type === "join" && " entrou na comunidade"}
                        {activity.type === "post" && " publicou um post"}
                        {activity.type === "share" && " compartilhou conteúdo"}
                      </p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}