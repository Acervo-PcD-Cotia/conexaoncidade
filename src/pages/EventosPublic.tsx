import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, MapPin, Clock, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO, isAfter, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Helmet } from "react-helmet-async";

interface PublicEvent {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  location: string | null;
  location_type: string | null;
  start_date: string;
  end_date: string | null;
  hero_image_url: string | null;
  is_free: boolean | null;
}

function usePublicEvents() {
  return useQuery({
    queryKey: ["public-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id, title, slug, description, location, location_type, start_date, end_date, hero_image_url, is_free")
        .eq("status", "published")
        .eq("is_public", true)
        .order("start_date", { ascending: true });
      if (error) throw error;
      return (data || []) as PublicEvent[];
    },
    staleTime: 60000,
  });
}

export default function EventosPublic() {
  const { data: events = [], isLoading } = usePublicEvents();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("upcoming");

  const now = new Date();

  const filtered = events.filter((e) => {
    const matchesSearch =
      !search ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.location?.toLowerCase().includes(search.toLowerCase());

    const eventDate = parseISO(e.start_date);
    const matchesFilter =
      filter === "all" ||
      (filter === "upcoming" && isAfter(eventDate, now)) ||
      (filter === "past" && isBefore(eventDate, now));

    return matchesSearch && matchesFilter;
  });

  return (
    <>
      <Helmet>
        <title>Eventos | Conexão na Cidade</title>
        <meta name="description" content="Confira os próximos eventos em Cotia e região. Agenda cultural, shows, feiras e muito mais." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero */}
        <div className="bg-primary/5 border-b">
          <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Agenda de Eventos</h1>
            <p className="text-muted-foreground text-lg">
              Descubra o que está acontecendo em Cotia e região
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar eventos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {(["upcoming", "all", "past"] as const).map((f) => (
                <Button
                  key={f}
                  size="sm"
                  variant={filter === f ? "default" : "outline"}
                  onClick={() => setFilter(f)}
                >
                  {f === "upcoming" ? "Próximos" : f === "all" ? "Todos" : "Passados"}
                </Button>
              ))}
            </div>
          </div>

          {/* Events Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Nenhum evento encontrado</h3>
              <p className="text-muted-foreground mt-1">
                {search ? "Tente outra busca" : "Em breve teremos novos eventos por aqui!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((event) => {
                const date = parseISO(event.start_date);
                const isPast = isBefore(date, now);

                return (
                  <Link
                    key={event.id}
                    to={`/evento/${event.slug}`}
                    className="group block rounded-xl border bg-card overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Image */}
                    <div className="relative aspect-[16/9] bg-muted overflow-hidden">
                      {event.hero_image_url ? (
                        <img
                          src={event.hero_image_url}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Calendar className="h-10 w-10 text-muted-foreground/40" />
                        </div>
                      )}

                      {/* Date badge */}
                      <div className="absolute top-3 left-3 bg-primary text-primary-foreground rounded-lg px-3 py-1.5 text-center min-w-[52px]">
                        <span className="block text-lg font-bold leading-tight">
                          {format(date, "dd")}
                        </span>
                        <span className="block text-[10px] uppercase font-medium leading-tight">
                          {format(date, "MMM", { locale: ptBR })}
                        </span>
                      </div>

                      {/* Badges */}
                      <div className="absolute top-3 right-3 flex gap-1.5">
                        {event.is_free && (
                          <Badge variant="secondary" className="text-xs">Gratuito</Badge>
                        )}
                        {isPast && (
                          <Badge variant="outline" className="text-xs bg-background/80">Encerrado</Badge>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-semibold text-base line-clamp-2 group-hover:text-primary transition-colors">
                        {event.title}
                      </h3>

                      <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 shrink-0" />
                          <span>{format(date, "EEEE, dd 'de' MMMM · HH'h'mm", { locale: ptBR })}</span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        )}
                      </div>

                      {event.description && (
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
