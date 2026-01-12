import { useQuery } from "@tanstack/react-query";
import { ShieldCheck, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface TopVerifier {
  user_id: string;
  fact_check_count: number;
  profile: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export function AntiFactCheckRanking() {
  const { data: topVerifiers, isLoading } = useQuery({
    queryKey: ['top-fact-checkers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_members')
        .select('user_id, fact_check_count')
        .gt('fact_check_count', 0)
        .order('fact_check_count', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      if (!data || data.length === 0) return [];
      
      // Fetch profiles
      const userIds = data.map(d => d.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);
      
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      return data.map(item => ({
        ...item,
        profile: profileMap.get(item.user_id) || null,
      })) as TopVerifier[];
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="animate-pulse h-20 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!topVerifiers || topVerifiers.length === 0) {
    return (
      <Card className="border-green-200 dark:border-green-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-green-600" />
            Top Verificadores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Seja o primeiro a verificar informações!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Trophy className="h-4 w-4 text-yellow-500" />
          Top Verificadores da Semana
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {topVerifiers.map((verifier, index) => {
          const initials = verifier.profile?.full_name
            ?.split(' ')
            .map(n => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase() || 'U';
          
          return (
            <div key={verifier.user_id} className="flex items-center gap-3">
              <span className={`text-sm font-bold w-5 ${
                index === 0 ? 'text-yellow-500' :
                index === 1 ? 'text-gray-400' :
                index === 2 ? 'text-amber-600' :
                'text-muted-foreground'
              }`}>
                {index + 1}º
              </span>
              <Avatar className="h-8 w-8">
                <AvatarImage src={verifier.profile?.avatar_url || undefined} />
                <AvatarFallback className="text-xs bg-green-100 text-green-700">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {verifier.profile?.full_name || 'Membro'}
                </p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                {verifier.fact_check_count} ✓
              </Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
