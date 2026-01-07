import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Mock data - will be replaced with real data from database
const heroNews = {
  id: 1,
  title: "Cidade recebe investimento histórico para modernização do transporte público",
  subtitle: "Projeto prevê novas linhas de ônibus elétricos e expansão do metrô para os próximos 10 anos",
  excerpt: "A prefeitura anunciou ontem um pacote de investimentos de R$ 2 bilhões para revolucionar o transporte público da cidade. O plano inclui a aquisição de 500 ônibus elétricos, construção de três novas estações de metrô e a implementação de um sistema integrado de bilhetagem.",
  featuredImageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&h=600&fit=crop",
  category: { name: "Economia", slug: "economia" },
  publishedAt: new Date().toISOString(),
  slug: "investimento-transporte-publico",
  hat: "Exclusivo",
};

const sideNews = [
  {
    id: 2,
    title: "Time local conquista vitória histórica no campeonato estadual",
    category: { name: "Esportes", slug: "esportes" },
    featuredImageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=300&fit=crop",
    publishedAt: new Date().toISOString(),
    slug: "vitoria-historica-campeonato",
  },
  {
    id: 3,
    title: "Nova lei ambiental entra em vigor e empresas precisam se adaptar",
    category: { name: "Política", slug: "politica" },
    featuredImageUrl: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400&h=300&fit=crop",
    publishedAt: new Date().toISOString(),
    slug: "nova-lei-ambiental",
  },
];

function formatTimeAgo(date: string) {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 60) return `Há ${diffMins} minutos`;
  if (diffHours < 24) return `Há ${diffHours} horas`;
  return past.toLocaleDateString("pt-BR");
}

export function HeroSection() {
  return (
    <section className="container py-6">
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Main hero */}
        <div className="lg:col-span-2">
          <Link to={`/noticia/${heroNews.slug}`} className="group block">
            <article className="news-card relative overflow-hidden rounded-lg">
              <div className="aspect-[16/9] overflow-hidden">
                <img
                  src={heroNews.featuredImageUrl}
                  alt={heroNews.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-transparent" />
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="mb-3 flex items-center gap-2">
                  {heroNews.hat && (
                    <Badge className="bg-accent text-accent-foreground">
                      {heroNews.hat}
                    </Badge>
                  )}
                  <Badge variant="secondary" className="bg-primary text-primary-foreground">
                    {heroNews.category.name}
                  </Badge>
                </div>
                <h1 className="mb-2 font-heading text-2xl font-bold leading-tight md:text-3xl lg:text-4xl">
                  {heroNews.title}
                </h1>
                <p className="mb-3 line-clamp-2 text-sm text-white/80 md:text-base">
                  {heroNews.subtitle}
                </p>
                <div className="flex items-center gap-1 text-xs text-white/70">
                  <Clock className="h-3 w-3" />
                  {formatTimeAgo(heroNews.publishedAt)}
                </div>
              </div>
            </article>
          </Link>
        </div>

        {/* Side news */}
        <div className="flex flex-col gap-4">
          {sideNews.map((news) => (
            <Link key={news.id} to={`/noticia/${news.slug}`} className="group block flex-1">
              <article className="news-card relative h-full overflow-hidden rounded-lg">
                <div className="absolute inset-0">
                  <img
                    src={news.featuredImageUrl}
                    alt={news.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <Badge variant="secondary" className="mb-2 bg-primary text-primary-foreground">
                    {news.category.name}
                  </Badge>
                  <h2 className="font-heading text-lg font-bold leading-tight line-clamp-3">
                    {news.title}
                  </h2>
                  <div className="mt-2 flex items-center gap-1 text-xs text-white/70">
                    <Clock className="h-3 w-3" />
                    {formatTimeAgo(news.publishedAt)}
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
