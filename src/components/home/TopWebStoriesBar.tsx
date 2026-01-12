import { useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWebStories } from "@/hooks/useWebStories";
export function TopWebStoriesBar() {
  const {
    data: stories,
    isLoading
  } = useWebStories(14);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = useCallback((direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 200;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth"
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
    return <div className="border-b bg-card py-4">
        <div className="container">
          <div className="flex items-center gap-4">
            {Array.from({
            length: 8
          }).map((_, i) => <div key={i} className="flex flex-col items-center gap-2">
                <div className="h-20 w-16 animate-pulse rounded-xl bg-muted" />
                <div className="h-3 w-14 animate-pulse rounded bg-muted" />
              </div>)}
          </div>
        </div>
      </div>;
  }
  if (!stories || stories.length === 0) {
    return null;
  }
  return;
}