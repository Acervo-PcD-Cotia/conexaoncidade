import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWeather } from "@/hooks/useWeather";
import { Calendar, MapPin, Cloud, Sun, CloudRain, Briefcase, Phone, ChevronRight, Thermometer } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

// ── Weather icon helper ──
function WeatherIcon({ description }: { description: string }) {
  const lower = description.toLowerCase();
  if (lower.includes("chuva") || lower.includes("chuvisco") || lower.includes("pancada") || lower.includes("tempestade"))
    return <CloudRain className="h-6 w-6 text-primary/70" />;
  if (lower.includes("nublado") || lower.includes("neblina"))
    return <Cloud className="h-6 w-6 text-muted-foreground" />;
  return <Sun className="h-6 w-6 text-accent-foreground" />;
}

// ── Events hook ──
function useUpcomingEvents() {
  return useQuery({
    queryKey: ["home-upcoming-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id, title, slug, location, start_date, end_date, hero_image_url, is_free")
        .eq("status", "published")
        .eq("is_public", true)
        .gte("start_date", new Date().toISOString())
        .order("start_date", { ascending: true })
        .limit(4);

      if (error) {
        console.warn("[LocalEngagement] Erro ao buscar eventos:", error.message);
        return [];
      }
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ── Jobs hook ──
function useRecentJobs() {
  return useQuery({
    queryKey: ["home-recent-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("id, title, company_name, location, job_type")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) {
        console.warn("[LocalEngagement] Erro ao buscar vagas:", error.message);
        return [];
      }
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ── Event Card ──
function EventCard({ event }: { event: any }) {
  const date = parseISO(event.start_date);
  const day = format(date, "dd");
  const month = format(date, "MMM", { locale: ptBR }).toUpperCase();
  const time = format(date, "HH'h'mm");

  return (
    <Link
      to={`/eventos/${event.slug}`}
      className="group flex gap-3 rounded-lg bg-card p-3 shadow-sm ring-1 ring-border/50 transition-all hover:shadow-md hover:ring-primary/30"
    >
      {/* Date box */}
      <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <span className="text-lg font-bold leading-none">{day}</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider">{month}</span>
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <h4 className="line-clamp-2 text-sm font-semibold leading-tight text-foreground group-hover:text-primary transition-colors">
          {event.title}
        </h4>
        <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{event.location || "Local a definir"}</span>
          <span className="mx-0.5">•</span>
          <span className="shrink-0">{time}</span>
        </div>
        {event.is_free && (
          <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
            Gratuito
          </span>
        )}
      </div>
    </Link>
  );
}

// ── Job Item ──
function JobItem({ job }: { job: any }) {
  return (
    <div className="flex items-start gap-2 border-b border-border/50 py-2.5 last:border-0">
      <Briefcase className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-tight text-foreground line-clamp-1">{job.title}</p>
        <p className="text-xs text-muted-foreground line-clamp-1">
          {job.company_name}{job.location ? ` • ${job.location}` : ""}
        </p>
      </div>
    </div>
  );
}

// ── Useful phones data ──
const USEFUL_PHONES = [
  { label: "SAMU", phone: "192" },
  { label: "Bombeiros", phone: "193" },
  { label: "Polícia Militar", phone: "190" },
  { label: "Defesa Civil", phone: "199" },
];

// ── Main Component ──
export function LocalEngagementSection() {
  const { data: events, isLoading: eventsLoading } = useUpcomingEvents();
  const { data: jobs, isLoading: jobsLoading } = useRecentJobs();
  const { data: weather, isLoading: weatherLoading } = useWeather();

  const weatherData = weather || { temp: 24, description: "Parcialmente nublado", city: "Cotia" };
  const hasEvents = events && events.length > 0;
  const hasJobs = jobs && jobs.length > 0;

  // Don't render if no data at all
  if (!eventsLoading && !jobsLoading && !hasEvents && !hasJobs) return null;

  return (
    <section className="home-container home-section-spacing" aria-label="Engajamento local">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px]">
        {/* ═══ COLUNA A: Agenda Cultural (65%) ═══ */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <Calendar className="h-5 w-5 text-primary" />
              <span>Agenda da Semana</span>
            </h2>
            <Link
              to="/eventos"
              className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              Ver agenda completa
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {eventsLoading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))}
            </div>
          ) : hasEvents ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {events.map((ev: any) => (
                <EventCard key={ev.id} event={ev} />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/30 p-8">
              <p className="text-sm text-muted-foreground">Nenhum evento programado no momento</p>
            </div>
          )}
        </div>

        {/* ═══ COLUNA B: Utilidade Pública (35%) ═══ */}
        <aside className="space-y-4" aria-label="Utilidade pública">
          <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Thermometer className="h-5 w-5 text-primary" />
            <span>Utilidade Pública</span>
          </h2>

          {/* Widget Clima */}
          <div className="rounded-lg bg-card p-4 shadow-sm ring-1 ring-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {weatherData.city}
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {weatherLoading ? "..." : `${weatherData.temp}°C`}
                </p>
                <p className="text-sm text-muted-foreground">
                  {weatherLoading ? "Carregando..." : weatherData.description}
                </p>
              </div>
              <WeatherIcon description={weatherData.description} />
            </div>
          </div>

          {/* Vagas de Emprego */}
          <div className="rounded-lg bg-card p-4 shadow-sm ring-1 ring-border/50">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                <Briefcase className="h-4 w-4 text-primary" />
                Vagas em Destaque
              </h3>
            </div>

            {jobsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-10 rounded" />
                ))}
              </div>
            ) : hasJobs ? (
              <>
                <div>
                  {jobs.map((job: any) => (
                    <JobItem key={job.id} job={job} />
                  ))}
                </div>
                <Link
                  to="/vagas"
                  className="mt-2 flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  Ver todas as vagas
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </>
            ) : (
              <p className="py-2 text-xs text-muted-foreground">Nenhuma vaga disponível no momento</p>
            )}
          </div>

          {/* Telefones Úteis */}
          <div className="rounded-lg bg-card p-4 shadow-sm ring-1 ring-border/50">
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-foreground">
              <Phone className="h-4 w-4 text-primary" />
              Telefones Úteis
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {USEFUL_PHONES.map(item => (
                <a
                  key={item.phone}
                  href={`tel:${item.phone}`}
                  className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-primary/10"
                >
                  <span className="font-bold text-primary">{item.phone}</span>
                  <span className="text-muted-foreground">{item.label}</span>
                </a>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
