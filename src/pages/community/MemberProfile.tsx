import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Trophy, 
  Share2, 
  MessageSquare, 
  Calendar, 
  ArrowLeft,
  Star,
  Award,
  TrendingUp
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AchievementBadge } from "@/components/community/MemberBadge";

const levelConfig = {
  visitor: { label: 'Visitante', color: 'bg-muted text-muted-foreground', icon: User },
  supporter: { label: 'Apoiador', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300', icon: Star },
  collaborator: { label: 'Colaborador', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300', icon: TrendingUp },
  ambassador: { label: 'Embaixador', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300', icon: Award },
  leader: { label: 'Líder', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300', icon: Trophy },
};

const badgeLabels: Record<string, string> = {
  founding_member: '🏅 Membro Fundador',
  verified: '✓ Verificado',
  top_contributor: '🏆 Top Contribuidor',
  early_adopter: '🚀 Early Adopter',
  news_hunter: '🔍 Caçador de Notícias',
};

export default function MemberProfile() {
  const { userId } = useParams<{ userId: string }>();

  const { data: member, isLoading: memberLoading } = useQuery({
    queryKey: ['community-member-profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_members')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const { data: profile } = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', userId)
        .single();

      if (error) return null;
      return data;
    },
    enabled: !!userId,
  });

  const { data: posts } = useQuery({
    queryKey: ['member-posts', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_posts')
        .select('id, content, created_at, like_count, comment_count')
        .eq('author_id', userId)
        .eq('is_hidden', false)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const { data: comments } = useQuery({
    queryKey: ['member-comments', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_comments')
        .select('id, content, created_at, like_count, post_id')
        .eq('author_id', userId)
        .eq('is_hidden', false)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const { data: shares } = useQuery({
    queryKey: ['member-shares', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_shares')
        .select('id, content_type, platform, shared_at, points_earned')
        .eq('user_id', userId)
        .order('shared_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  if (memberLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4 space-y-6">
        <Skeleton className="h-48 w-full rounded-xl" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Membro não encontrado</h1>
        <Button asChild>
          <Link to="/comunidade">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para a Comunidade
          </Link>
        </Button>
      </div>
    );
  }

  const level = member.level as keyof typeof levelConfig || 'supporter';
  const levelInfo = levelConfig[level];
  const LevelIcon = levelInfo.icon;
  const memberName = profile?.full_name || 'Membro';
  const badges = (member.badges as string[]) || [];

  return (
    <>
      <Helmet>
        <title>{memberName} - Perfil | Comunidade</title>
        <meta name="description" content={`Perfil de ${memberName} na comunidade Conexão na Cidade`} />
      </Helmet>

      <div className="container max-w-4xl mx-auto py-8 px-4 space-y-6">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/comunidade">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para a Comunidade
          </Link>
        </Button>

        {/* Profile Header */}
        <Card className="overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
          <CardContent className="relative pt-0">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-4 -mt-12">
              <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="text-2xl bg-primary/10">
                  {memberName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left pb-2">
                <h1 className="text-2xl font-bold">{memberName}</h1>
                <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
                  <Badge className={levelInfo.color}>
                    <LevelIcon className="h-3 w-3 mr-1" />
                    {levelInfo.label}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Membro desde {format(new Date(member.created_at!), "MMM yyyy", { locale: ptBR })}
                  </span>
                </div>
              </div>
            </div>

            {/* Bio */}
            {member.bio && (
              <p className="mt-4 text-muted-foreground italic">
                "{member.bio}"
              </p>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <Trophy className="h-6 w-6 mx-auto mb-2 text-amber-500" />
              <p className="text-2xl font-bold">{member.points || 0}</p>
              <p className="text-xs text-muted-foreground">Pontos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Share2 className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold">{member.share_count || 0}</p>
              <p className="text-xs text-muted-foreground">Compartilhamentos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Award className="h-6 w-6 mx-auto mb-2 text-purple-500" />
              <p className="text-2xl font-bold">{badges.length}</p>
              <p className="text-xs text-muted-foreground">Conquistas</p>
            </CardContent>
          </Card>
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="h-5 w-5" />
                Conquistas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {badges.map((badge) => (
                  <AchievementBadge key={badge} badge={badge} size="md" />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Activity Tabs */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="posts" className="text-xs sm:text-sm">
              <MessageSquare className="h-4 w-4 mr-1 sm:mr-2" />
              Posts ({posts?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="comments" className="text-xs sm:text-sm">
              <MessageSquare className="h-4 w-4 mr-1 sm:mr-2" />
              Comentários ({comments?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="shares" className="text-xs sm:text-sm">
              <Share2 className="h-4 w-4 mr-1 sm:mr-2" />
              Compartilhamentos ({shares?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-4 space-y-3">
            {posts && posts.length > 0 ? (
              posts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="pt-4">
                    <p className="text-sm line-clamp-3">{post.content}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(post.created_at!), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                      <span>❤️ {post.like_count || 0}</span>
                      <span>💬 {post.comment_count || 0}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">Nenhum post ainda</p>
            )}
          </TabsContent>

          <TabsContent value="comments" className="mt-4 space-y-3">
            {comments && comments.length > 0 ? (
              comments.map((comment) => (
                <Card key={comment.id}>
                  <CardContent className="pt-4">
                    <p className="text-sm line-clamp-2">{comment.content}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(comment.created_at!), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                      <span>❤️ {comment.like_count || 0}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">Nenhum comentário ainda</p>
            )}
          </TabsContent>

          <TabsContent value="shares" className="mt-4 space-y-3">
            {shares && shares.length > 0 ? (
              shares.map((share) => (
                <Card key={share.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium capitalize">
                          {share.content_type === 'news' ? '📰 Notícia' : share.content_type}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          via {share.platform}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-primary font-medium">
                          +{share.points_earned || 0} pts
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(share.shared_at!), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">Nenhum compartilhamento ainda</p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
