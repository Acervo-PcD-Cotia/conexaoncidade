import { TrendingUp, MessageSquare, Heart, Eye, Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useTrendingPosts } from "@/hooks/useTrendingPosts";

function truncateContent(content: string, maxChars = 60): string {
  // Remove HTML tags if any
  const cleanContent = content.replace(/<[^>]*>/g, "").trim();
  if (cleanContent.length <= maxChars) return cleanContent;
  return cleanContent.substring(0, maxChars).trim() + "...";
}

function formatTimeAgo(date: string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "Agora";
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return past.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function TrendingTopics() {
  const { data: posts, isLoading } = useTrendingPosts(5);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Em Alta
          <Flame className="h-3 w-3 text-orange-500" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex gap-3">
                <div className="w-6 h-6 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : !posts?.length ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum tópico em alta ainda.
            <br />
            <span className="text-xs">Seja o primeiro a iniciar uma discussão!</span>
          </p>
        ) : (
          posts.map((post, index) => (
            <div
              key={post.id}
              className="flex gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
            >
              {/* Position Badge */}
              <div className="flex-shrink-0">
                <Badge
                  variant={index < 3 ? "default" : "secondary"}
                  className={`w-6 h-6 p-0 flex items-center justify-center text-xs font-bold ${
                    index === 0
                      ? "bg-yellow-500 hover:bg-yellow-600"
                      : index === 1
                      ? "bg-gray-400 hover:bg-gray-500"
                      : index === 2
                      ? "bg-amber-600 hover:bg-amber-700"
                      : ""
                  }`}
                >
                  {index + 1}
                </Badge>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                  {truncateContent(post.content, 80)}
                </p>

                {/* Author and Stats */}
                <div className="flex items-center gap-2 mt-1.5">
                  <Avatar className="h-4 w-4">
                    <AvatarImage src={post.author?.avatar_url || undefined} />
                    <AvatarFallback className="text-[8px]">
                      {post.author?.full_name?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground truncate">
                    {post.author?.full_name || "Anônimo"}
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">
                    {formatTimeAgo(post.created_at)}
                  </span>
                </div>

                {/* Engagement stats */}
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Heart className="h-3 w-3" />
                    {post.like_count}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MessageSquare className="h-3 w-3" />
                    {post.comment_count}
                  </span>
                  {post.view_count > 0 && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Eye className="h-3 w-3" />
                      {post.view_count}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
