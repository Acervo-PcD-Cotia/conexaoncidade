import { useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWebStories } from "@/hooks/useWebStories";
import { cn } from "@/lib/utils";

export function TopWebStoriesBar() {
  const { data: stories, isLoading } = useWebStories(15);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = useCallback((direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 200;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") scroll("left");
      else if (e.key === "ArrowRight") scroll("right");
    },
    [scroll]
  );

  if (isLoading) {
    return (
      <div className="border-b bg-card py-3">
        <div className="home-container">
          <div className="flex items-center gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="h-16 w-16 animate-pulse rounded-full bg-muted" />
                <div className="h-3 w-14 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stories || stories.length === 0) return null;

  return (
    <section className="border-b bg-card py-3" aria-label="Stories">
      <div className="home-container">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <Play className="h-3.5 w-3.5 fill-current" />
            Stories
          </h2>
          <div className="hidden sm:flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => scroll("left")} aria-label="Scroll esquerda">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => scroll("right")} aria-label="Scroll direita">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Circular Stories Carousel */}
        <div
          ref={scrollRef}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4 snap-x snap-mandatory"
          role="list"
          aria-label="Lista de stories"
        >
          {stories.map((story, index) => (
            <Link
              key={story.id}
              to={`/stories/${story.slug}`}
              className="group flex flex-col items-center gap-1.5 flex-shrink-0 snap-start"
              role="listitem"
            >
              {/* Circular thumbnail with gradient ring */}
              <div className="relative">
                <div
                  className={cn(
                    "absolute -inset-[3px] rounded-full",
                    "bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500",
                    "opacity-80 group-hover:opacity-100 transition-opacity"
                  )}
                />
                <div className="relative h-16 w-16 rounded-full overflow-hidden bg-muted border-2 border-background">
                  {story.cover_image_url ? (
                    <img
                      src={story.cover_image_url}
                      alt={story.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-110"
                      loading={index < 5 ? "eager" : "lazy"}
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                      <Play className="h-5 w-5 text-primary fill-primary" />
                    </div>
                  )}
                  {/* Play overlay on hover */}
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                    <div className="bg-white/90 rounded-full p-1">
                      <Play className="h-3 w-3 text-black fill-black" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Title */}
              <span className="text-[10px] text-center font-medium text-foreground/80 max-w-[68px] line-clamp-1 leading-tight">
                {story.title}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
