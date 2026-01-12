import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Sparkles, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { levelLabels } from "@/hooks/useCommunity";

export function MemberOfTheWeek() {
  const { data: member, isLoading } = useQuery({
    queryKey: ['member-of-the-week'],
    queryFn: async () => {
      // Get member with highest points gained this week
      // For simplicity, we'll just get the member with highest total points
      // In production, you'd calculate weekly points from history
      const { data, error } = await supabase
        .from('community_members')
        .select('user_id, level, points, badges')
        .not('access_granted_at', 'is', null)
        .eq('is_suspended', false)
        .order('points', { ascending: false })
        .limit(1)
        .single();
      
      if (error) throw error;
      if (!data) return null;
      
      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('id', data.user_id)
        .single();
      
      return {
        ...data,
        profile,
      };
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="animate-pulse h-24 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!member) {
    return null;
  }

  const initials = member.profile?.full_name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';

  return (
    <Card className="border-yellow-200 dark:border-yellow-800 bg-gradient-to-br from-yellow-50/50 to-amber-50/30 dark:from-yellow-950/20 dark:to-amber-950/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-yellow-500" />
          Membro da Semana
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Link 
          to={`/comunidade/membro/${member.user_id}`}
          className="flex items-center gap-3 group"
        >
          <div className="relative">
            <Avatar className="h-12 w-12 ring-2 ring-yellow-400 ring-offset-2">
              <AvatarImage src={member.profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-yellow-100 text-yellow-700 font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-0.5">
              <Star className="h-3 w-3 text-yellow-900 fill-yellow-900" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate group-hover:text-primary transition-colors">
              {member.profile?.full_name || 'Membro'}
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {levelLabels[member.level]}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {member.points.toLocaleString()} pts
              </span>
            </div>
          </div>
        </Link>
        <p className="text-xs text-muted-foreground mt-3 text-center">
          Maior engajamento positivo da semana! 🏆
        </p>
      </CardContent>
    </Card>
  );
}
