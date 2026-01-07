import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { useNews } from "@/hooks/useNews";

function formatTime(date: string): string {
  const d = new Date(date);
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function AgoraNaCidade() {
  const { data: news, isLoading } = useNews(8);

  if (isLoading) {
    return (
      <section className="container py-1">
        <div className="bg-accent/5 border-y border-border">
          <div className="animate-pulse flex items-center gap-4 px-3 py-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-3 bg-muted rounded w-32" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!news || news.length === 0) return null;

  const items = news.slice(0, 8);

  return (
    <section className="container py-1">
      <div className="bg-accent/5 border-y border-border">
        {/* Header */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 border-b border-border/50">
          <MapPin className="h-3 w-3 text-primary" />
          <span className="font-heading text-[10px] font-bold uppercase tracking-wider text-primary">
            Agora na Cidade
          </span>
        </div>

        {/* News ticker row */}
        <div className="flex flex-wrap items-center divide-x divide-border/30">
          {items.map((item) => (
            <Link
              key={item.id}
              to={`/noticia/${item.slug}`}
              className="group flex items-center gap-2 px-3 py-1.5 hover:bg-muted/30 transition-colors"
            >
              <span
                className="h-1 w-1 shrink-0 rounded-full"
                style={{ backgroundColor: item.category?.color || "hsl(var(--primary))" }}
              />
              <span className="text-[11px] font-medium leading-tight line-clamp-1 group-hover:text-primary max-w-[180px] lg:max-w-[220px]">
                {item.title}
              </span>
              <span className="text-[9px] text-muted-foreground font-mono shrink-0">
                {formatTime(item.published_at || item.created_at)}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
