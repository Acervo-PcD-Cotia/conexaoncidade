import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSocialStats } from "@/hooks/useSocialPosts";
import { useSocialPosts, STATUS_LABELS, STATUS_COLORS } from "@/hooks/useSocialPosts";
import { PLATFORM_LABELS, PLATFORM_ICONS } from "@/hooks/useSocialAccounts";
import { NavLink } from "@/components/NavLink";
import { 
  Share2, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  ArrowRight,
  ExternalLink 
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function SocialDashboard() {
  const { data: stats, isLoading: statsLoading } = useSocialStats();
  const { posts: recentPosts, isLoading: postsLoading } = useSocialPosts({ limit: 10 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Distribuição Social</h1>
          <p className="text-muted-foreground">
            Gerencie a publicação automática em redes sociais
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <NavLink to="/admin/social/settings">
              Configurações
            </NavLink>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Na Fila</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.queued ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando publicação
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aguardando Revisão</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.needsReview ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              Precisam de aprovação
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Publicados</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.posted ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              Total de posts publicados
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Falhas</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.failed ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              Precisam de atenção
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Posts por Rede
          </CardTitle>
          <CardDescription>
            Total de publicações realizadas em cada plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            {Object.entries(stats?.byPlatform ?? {}).map(([platform, count]) => (
              <div 
                key={platform} 
                className="flex items-center gap-3 p-4 rounded-lg border bg-card"
              >
                <span className="text-2xl">
                  {PLATFORM_ICONS[platform as keyof typeof PLATFORM_ICONS]}
                </span>
                <div>
                  <p className="font-medium">
                    {PLATFORM_LABELS[platform as keyof typeof PLATFORM_LABELS]}
                  </p>
                  <p className="text-2xl font-bold">{count}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Posts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>
              Últimos posts processados
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <NavLink to="/admin/social/queue" className="flex items-center gap-1">
              Ver todos <ArrowRight className="h-4 w-4" />
            </NavLink>
          </Button>
        </CardHeader>
        <CardContent>
          {postsLoading ? (
            <p className="text-muted-foreground text-center py-8">Carregando...</p>
          ) : recentPosts?.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum post social ainda
            </p>
          ) : (
            <div className="space-y-3">
              {recentPosts?.map((post) => (
                <div 
                  key={post.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {PLATFORM_ICONS[post.platform]}
                    </span>
                    <div>
                      <p className="font-medium line-clamp-1">
                        {post.news?.title ?? 'Notícia removida'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(post.created_at), "dd/MM 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={STATUS_COLORS[post.status]}>
                      {STATUS_LABELS[post.status]}
                    </Badge>
                    {post.external_post_url && (
                      <Button variant="ghost" size="icon" asChild>
                        <a href={post.external_post_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
