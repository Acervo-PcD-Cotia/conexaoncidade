import { Users, Trophy, Medal, Award, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useTopContributors } from "@/hooks/useTopContributors";
import { MemberBadge } from "@/components/community/MemberBadge";

const positionIcons = [
  { icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-100 dark:bg-yellow-900/30" },
  { icon: Medal, color: "text-gray-400", bg: "bg-gray-100 dark:bg-gray-800/50" },
  { icon: Award, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30" },
  { icon: Star, color: "text-primary", bg: "bg-primary/10" },
  { icon: Star, color: "text-primary", bg: "bg-primary/10" },
];

export function ActiveMembersRanking() {
  const { data: contributors, isLoading } = useTopContributors(5);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          Membros Ativos
          <Trophy className="h-3 w-3 text-yellow-500" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex gap-3 items-center">
                <div className="w-8 h-8 rounded-full bg-muted" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : !contributors?.length ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum membro ativo ainda.
            <br />
            <span className="text-xs">Participe e seja o primeiro!</span>
          </p>
        ) : (
          contributors.map((contributor, index) => {
            const positionStyle = positionIcons[index] || positionIcons[4];
            const PositionIcon = positionStyle.icon;
            const initials =
              contributor.profile?.full_name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase() || "?";

            return (
              <div
                key={contributor.user_id}
                className={`flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-muted/50 ${
                  index < 3 ? positionStyle.bg : ""
                }`}
              >
                {/* Position Icon */}
                <div className="flex-shrink-0 relative">
                  <PositionIcon className={`h-5 w-5 ${positionStyle.color}`} />
                  <span className="absolute -bottom-1 -right-1 text-[10px] font-bold bg-background rounded-full w-3 h-3 flex items-center justify-center border">
                    {index + 1}
                  </span>
                </div>

                {/* Avatar */}
                <Avatar className="h-8 w-8 border-2 border-background shadow-sm">
                  <AvatarImage src={contributor.profile?.avatar_url || undefined} />
                  <AvatarFallback
                    className={`text-xs font-bold ${
                      index === 0
                        ? "bg-yellow-500 text-white"
                        : index === 1
                        ? "bg-gray-400 text-white"
                        : index === 2
                        ? "bg-amber-600 text-white"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    {initials}
                  </AvatarFallback>
                </Avatar>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {contributor.profile?.full_name || "Membro"}
                  </p>
                  <div className="flex items-center gap-2">
                    <MemberBadge
                      level={contributor.level as "supporter" | "collaborator" | "ambassador" | "leader"}
                      size="sm"
                    />
                  </div>
                </div>

                {/* Points */}
                <div className="text-right">
                  <Badge variant="secondary" className="text-xs font-bold">
                    {contributor.points?.toLocaleString("pt-BR")} pts
                  </Badge>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
