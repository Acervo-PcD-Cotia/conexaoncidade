import { Link } from "react-router-dom";
import { PlayCircle, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWebStories } from "@/hooks/useWebStories";

export function WebStoriesSidebar() {
  const { data: stories, isLoading } = useWebStories(6);

  if (isLoading) {
    return (
      <Card className="h-fit">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <PlayCircle className="h-4 w-4 text-primary" />
            Web Stories
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-16 h-20 rounded-lg bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-3/4" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!stories?.length) return null;

  return (
    <Card className="h-fit sticky top-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <PlayCircle className="h-4 w-4 text-primary" />
          Web Stories
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {stories.map((story) => (
          <Link
            key={story.id}
            to={`/stories/${story.slug}`}
            className="flex gap-3 group rounded-lg p-1 -m-1 hover:bg-muted/50 transition-colors"
          >
            {/* Thumbnail - vertical format like stories */}
            <div className="relative w-14 h-20 flex-shrink-0 overflow-hidden rounded-lg shadow-sm">
              <img
                src={
                  story.cover_image_url ||
                  "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=200&h=300&fit=crop"
                }
                alt={story.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              {/* Play overlay */}
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <PlayCircle className="h-6 w-6 text-white drop-shadow-lg" />
              </div>
              {/* Gradient overlay at bottom */}
              <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/60 to-transparent" />
            </div>

            {/* Title */}
            <div className="flex-1 min-w-0 py-1">
              <p className="text-sm font-medium line-clamp-3 group-hover:text-primary transition-colors leading-tight">
                {story.title}
              </p>
              {story.view_count > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {story.view_count.toLocaleString("pt-BR")} visualizações
                </p>
              )}
            </div>
          </Link>
        ))}

        {/* Ver todos link */}
        <Link
          to="/stories"
          className="flex items-center justify-center gap-1 text-sm text-primary hover:underline pt-2 border-t"
        >
          Ver todos
          <ChevronRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
