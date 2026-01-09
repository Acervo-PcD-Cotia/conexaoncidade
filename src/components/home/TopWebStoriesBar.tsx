import { useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWebStories } from "@/hooks/useWebStories";

export function TopWebStoriesBar() {
  const { data: stories, isLoading } = useWebStories(14);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = useCallback((direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 200;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      scroll("left");
    } else if (e.key === "ArrowRight") {
      scroll("right");
    }
  }, [scroll]);

  if (isLoading) {
    return (
      <div className="border-b bg-card py-4">
        <div className="container">
          <div className="flex items-center gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="h-20 w-16 animate-pulse rounded-xl bg-muted" />
                <div className="h-3 w-14 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stories || stories.length === 0) {
    return null;
  }

  return (
    <section
      className="border-b bg-card py-4"
      role="region"
      aria-label="WebStories em destaque"
    >
      <div className="container">

        {/* Carousel */}
        <div className="group relative">
          {/* Left Arrow */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute -left-2 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 rounded-full bg-background/80 shadow-md backdrop-blur-sm transition-opacity lg:flex"
            onClick={() => scroll("left")}
            aria-label="Anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Stories Container */}
          <div
            ref={scrollRef}
            className="scrollbar-hide flex gap-4 overflow-x-auto scroll-smooth px-1"
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="list"
            aria-label="Lista de WebStories"
          >
            {stories.map((story) => (
              <Link
                key={story.id}
                to={`/stories/${story.slug}`}
                className="group/item flex shrink-0 flex-col items-center gap-2"
                role="listitem"
                aria-label={`Ver story: ${story.title}`}
              >
                {/* Story Thumbnail with gradient ring */}
                <div className="relative">
                  <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-br from-primary via-accent to-primary opacity-80" />
                  <div className="relative h-24 w-16 overflow-hidden rounded-xl bg-card">
                    <img
                      src={story.cover_image_url || "/placeholder.svg"}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-300 group-hover/item:scale-110"
                      loading="lazy"
                    />
                    {/* Play overlay on hover */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover/item:opacity-100">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90">
                        <Play className="h-4 w-4 fill-primary text-primary" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Title */}
                <span className="max-w-16 truncate text-center text-[10px] font-medium text-muted-foreground">
                  {story.title}
                </span>

              </Link>
            ))}
          </div>

          {/* Right Arrow */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute -right-2 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 rounded-full bg-background/80 shadow-md backdrop-blur-sm transition-opacity lg:flex"
            onClick={() => scroll("right")}
            aria-label="Próximo"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
