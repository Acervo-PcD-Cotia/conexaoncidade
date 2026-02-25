import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const ROTATION_INTERVAL = 5000;

interface UrgentNews {
  id: string;
  title: string;
  slug: string;
  published_at: string | null;
  category?: { name: string; color: string | null } | null;
}

function useUrgentNews(limit = 7) {
  return useQuery({
    queryKey: ["news", "urgent-ticker", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news")
        .select("id, title, slug, published_at, category:categories(name, color)")
        .eq("status", "published")
        .is("deleted_at", null)
        .or("is_urgent.eq.true,highlight.eq.urgent")
        .order("published_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as UrgentNews[];
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function UrgentNewsTicker() {
  const { data: urgentNews } = useUrgentNews();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("left");
  const [isAnimating, setIsAnimating] = useState(false);

  const items = urgentNews || [];
  const count = items.length;

  const goTo = useCallback(
    (next: number, dir: "left" | "right") => {
      if (isAnimating || count < 2) return;
      setDirection(dir);
      setIsAnimating(true);
      setTimeout(() => {
        setCurrent(next);
        setIsAnimating(false);
      }, 300);
    },
    [isAnimating, count]
  );

  const next = useCallback(() => {
    goTo((current + 1) % count, "left");
  }, [current, count, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + count) % count, "right");
  }, [current, count, goTo]);

  // Auto-rotate
  useEffect(() => {
    if (count < 2) return;
    const timer = setInterval(next, ROTATION_INTERVAL);
    return () => clearInterval(timer);
  }, [count, next]);

  if (count === 0) return null;

  const item = items[current];

  return (
    <div className="home-container">
      <div className="flex items-center gap-3 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-2.5 overflow-hidden">
        {/* Badge URGENTE */}
        <div className="shrink-0 flex items-center gap-1.5 bg-destructive text-destructive-foreground px-2.5 py-1 rounded font-bold text-xs uppercase tracking-wider animate-pulse">
          <AlertTriangle className="h-3.5 w-3.5" />
          Urgente
        </div>

        {/* News title with slide animation */}
        <div className="flex-1 min-w-0 relative h-6 overflow-hidden">
          <Link
            to={`/noticia/${item.slug}`}
            key={item.id}
            className={cn(
              "absolute inset-0 flex items-center text-sm font-semibold text-foreground hover:text-destructive transition-colors truncate",
              isAnimating && direction === "left" && "animate-slide-out-left",
              isAnimating && direction === "right" && "animate-slide-out-right",
              !isAnimating && "animate-slide-in"
            )}
          >
            {item.title}
          </Link>
        </div>

        {/* Counter + Navigation */}
        {count > 1 && (
          <div className="shrink-0 flex items-center gap-1">
            <span className="text-xs text-muted-foreground font-medium tabular-nums">
              {current + 1}/{count}
            </span>
            <button
              onClick={prev}
              className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Notícia urgente anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={next}
              className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Próxima notícia urgente"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
