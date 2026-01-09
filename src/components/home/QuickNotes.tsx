import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Zap, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNews } from "@/hooks/useNews";
import { QuickNoteModal } from "./QuickNoteModal";
import type { NewsItem } from "@/hooks/useNews";

export function QuickNotes() {
  const { data: news, isLoading } = useNews(18);
  const [selectedNote, setSelectedNote] = useState<NewsItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleNoteClick = (note: NewsItem, e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedNote(note);
    setModalOpen(true);
  };

  if (isLoading) {
    return (
      <section className="container py-4" aria-label="Carregando notas rápidas">
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-8 w-32 bg-muted rounded-full animate-pulse shrink-0" />
          ))}
        </div>
      </section>
    );
  }

  if (!news || news.length === 0) return null;

  const quickItems = news.slice(0, 18);

  return (
    <section className="container py-4" aria-labelledby="quick-notes-title">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" aria-hidden="true" />
          <h2 id="quick-notes-title" className="font-heading text-sm font-bold uppercase tracking-wider">
            Notas Rápidas
          </h2>
          <Badge variant="secondary" className="text-[10px]">
            {quickItems.length}
          </Badge>
        </div>
        
        {/* Scroll controls */}
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => scroll("left")}
            aria-label="Rolar notas para esquerda"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => scroll("right")}
            aria-label="Rolar notas para direita"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Horizontal scrollable chips */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 snap-x snap-mandatory"
        role="list"
        aria-label="Lista de notas rápidas"
      >
        {quickItems.map((item) => (
          <Tooltip key={item.id}>
            <TooltipTrigger asChild>
              <button
                onClick={(e) => handleNoteClick(item, e)}
                className="group relative shrink-0 snap-start flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 transition-all hover:border-primary hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label={`Nota: ${item.title}`}
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{
                    backgroundColor: item.category?.color || "hsl(var(--primary))",
                  }}
                  aria-hidden="true"
                />
                <span className="text-sm font-medium whitespace-nowrap max-w-[200px] truncate group-hover:text-primary transition-colors">
                  {item.title.length > 40 ? item.title.substring(0, 40) + "..." : item.title}
                </span>
              </button>
            </TooltipTrigger>
            <TooltipContent 
              side="bottom" 
              className="max-w-xs"
              aria-live="polite"
            >
              <p className="font-medium text-sm mb-1">{item.title}</p>
              {item.excerpt && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {item.excerpt}
                </p>
              )}
              <p className="text-[10px] text-muted-foreground mt-1">
                Clique para ver mais
              </p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      {/* Quick note modal */}
      <QuickNoteModal
        news={selectedNote}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />

      {/* View all link */}
      <div className="flex justify-center mt-3">
        <Button variant="link" size="sm" asChild className="text-xs">
          <Link to="/noticias">Ver todas as notícias</Link>
        </Button>
      </div>
    </section>
  );
}
