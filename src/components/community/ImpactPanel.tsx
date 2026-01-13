import { useQuery } from "@tanstack/react-query";
import { TrendingUp, MessageSquare, Heart, Share2, Award, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCommunity, levelLabels, levelThresholds, levelOrder } from "@/hooks/useCommunity";

export function ImpactPanel() {
  const { user } = useAuth();
  const { membership } = useCommunity();

  // Fetch user activity stats
  const { data: stats } = useQuery({
    queryKey: ['user-impact-stats', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      // Get posts count
      const { count: postsCount } = await supabase
        .from('community_posts')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', user!.id);

      // Get comments count
      const { count: commentsCount } = await supabase
        .from('community_comments')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', user!.id);

      // Get reactions given count
      const { count: reactionsCount } = await supabase
        .from('community_reactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id);

      // Get shares count
      const { count: sharesCount } = await supabase
        .from('community_shares')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id);

      return {
        posts: postsCount || 0,
        comments: commentsCount || 0,
        reactions: reactionsCount || 0,
        shares: sharesCount || 0,
      };
    },
  });

  if (!membership) return null;

  const currentLevel = membership.level || 'supporter';
  const currentLevelIndex = levelOrder.indexOf(currentLevel);
  const nextLevel = currentLevelIndex < levelOrder.length - 1 
    ? levelOrder[currentLevelIndex + 1] 
    : null;

  const currentThreshold = levelThresholds[currentLevel] || 0;
  const nextThreshold = nextLevel ? levelThresholds[nextLevel] : levelThresholds.leader;
  const pointsInLevel = (membership.points || 0) - currentThreshold;
  const pointsNeeded = nextThreshold - currentThreshold;
  const progressPercent = Math.min(100, Math.round((pointsInLevel / pointsNeeded) * 100));

  const activityItems = [
    { icon: MessageSquare, label: "Posts", value: stats?.posts || 0, color: "text-blue-500" },
    { icon: Heart, label: "Comentários", value: stats?.comments || 0, color: "text-red-500" },
    { icon: Star, label: "Reações", value: stats?.reactions || 0, color: "text-yellow-500" },
    { icon: Share2, label: "Compartilhamentos", value: stats?.shares || 0, color: "text-green-500" },
  ];

  return (
    <Card className="border-pink-200 dark:border-pink-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-pink-600" />
          Meu Impacto na Cidade
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Level Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-pink-600" />
              <span className="font-medium">{levelLabels[currentLevel]}</span>
            </div>
            <Badge variant="outline" className="text-pink-600 border-pink-200">
              {membership.points || 0} pts
            </Badge>
          </div>
          
          {nextLevel && (
            <div className="space-y-1">
              <Progress value={progressPercent} className="h-2" />
              <p className="text-xs text-muted-foreground text-right">
                {pointsNeeded - pointsInLevel} pts para {levelLabels[nextLevel]}
              </p>
            </div>
          )}
        </div>

        {/* Activity Stats */}
        <div className="grid grid-cols-2 gap-2">
          {activityItems.map(({ icon: Icon, label, value, color }) => (
            <div 
              key={label}
              className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
            >
              <Icon className={`h-4 w-4 ${color}`} />
              <div>
                <p className="text-lg font-bold leading-none">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Badges */}
        {membership.badges && membership.badges.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-2">Badges conquistados:</p>
            <div className="flex flex-wrap gap-1">
              {membership.badges.slice(0, 4).map((badge) => (
                <Badge key={badge} variant="secondary" className="text-xs">
                  {badge === 'founding_member' && '🏆 Fundador'}
                  {badge === 'pcd_ally' && '🧩 Aliado PcD'}
                  {badge === 'volunteer' && '🤝 Voluntário'}
                  {badge === 'local_expert' && '🧠 Conhecedor'}
                  {badge === 'guardian' && '🛡️ Guardião'}
                </Badge>
              ))}
              {membership.badges.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{membership.badges.length - 4}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
