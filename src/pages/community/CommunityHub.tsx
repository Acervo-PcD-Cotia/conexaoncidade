import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Users, 
  TrendingUp,
  Hash,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useCommunity } from "@/hooks/useCommunity";
import { MemberBadge, AchievementBadge } from "@/components/community/MemberBadge";
import { CommunityFeed } from "@/components/community/CommunityFeed";
import { CommunityTermsModal } from "@/components/community/CommunityTermsModal";

export default function CommunityHub() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { membership, hasAccess, groups, isLoading, acceptTerms } = useCommunity();
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth?redirect=/comunidade");
    }
  }, [user, navigate]);

  useEffect(() => {
    // Only redirect when fully loaded AND user is authenticated AND no access
    if (!isLoading && user && !hasAccess) {
      navigate("/comunidade/desbloquear");
    }
  }, [hasAccess, isLoading, user, navigate]);

  useEffect(() => {
    if (hasAccess && membership && !membership.terms_accepted_at) {
      setShowTerms(true);
    }
  }, [hasAccess, membership]);

  const handleAcceptTerms = () => {
    acceptTerms();
    setShowTerms(false);
  };

  if (isLoading) {
    return (
      <div className="container py-12 flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  const userInitials = user?.user_metadata?.full_name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <div className="container py-6">
      <CommunityTermsModal 
        open={showTerms} 
        onAccept={handleAcceptTerms} 
      />

      <div className="grid lg:grid-cols-4 gap-6">
          {/* Left Sidebar - User Profile */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-3">
                  <Avatar className="h-16 w-16 mx-auto">
                    <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">
                      {user?.user_metadata?.full_name || 'Membro'}
                    </h3>
                    {membership && (
                      <div className="mt-2">
                        <MemberBadge level={membership.level} size="sm" />
                      </div>
                    )}
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{membership?.points || 0}</p>
                      <p className="text-xs text-muted-foreground">Pontos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{membership?.share_count || 0}</p>
                      <p className="text-xs text-muted-foreground">Compartilhamentos</p>
                    </div>
                  </div>

                  {/* Badges */}
                  {membership?.badges && membership.badges.length > 0 && (
                    <div className="pt-3 border-t">
                      <p className="text-xs text-muted-foreground mb-2">Selos</p>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {membership.badges.map((badge) => (
                          <AchievementBadge key={badge} badge={badge} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Groups */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Grupos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {groups?.map((group) => (
                  <Link 
                    key={group.id}
                    to={`/comunidade/grupos/${group.slug}`}
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors"
                  >
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: group.color }}
                    >
                      {group.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{group.name}</p>
                      <p className="text-xs text-muted-foreground">{group.member_count} membros</p>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Feed */}
          <div className="lg:col-span-2">
            <CommunityFeed />
          </div>

          {/* Right Sidebar - Trending & Stats */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Em Alta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Em breve: tópicos mais discutidos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Membros Ativos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Em breve: ranking de contribuidores
                </p>
              </CardContent>
            </Card>

            {/* Anti Fake News Card */}
            <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-green-600" />
                  Anti Fake News
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Verifique links, textos e imagens antes de compartilhar.
                </p>
                <Button asChild size="sm" className="w-full bg-green-600 hover:bg-green-700">
                  <Link to="/anti-fake-news">Verificar agora</Link>
                </Button>
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
