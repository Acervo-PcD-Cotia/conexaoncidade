import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { NewsCard } from "./NewsCard";

// Mock data - will be replaced with real data from database
const latestNews = [
  {
    id: 4,
    title: "Hospital público inaugura nova ala de emergência com equipamentos modernos",
    excerpt: "A unidade conta com 50 novos leitos e tecnologia de ponta para atendimento",
    featuredImageUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&h=400&fit=crop",
    category: { name: "Saúde", slug: "saude" },
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    slug: "hospital-nova-ala-emergencia",
  },
  {
    id: 5,
    title: "Festival cultural reúne mais de 50 mil pessoas no centro da cidade",
    excerpt: "Evento trouxe atrações musicais, gastronômicas e artísticas durante três dias",
    featuredImageUrl: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&h=400&fit=crop",
    category: { name: "Cultura", slug: "cultura" },
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
    slug: "festival-cultural-centro",
  },
  {
    id: 6,
    title: "Operação policial desmantela quadrilha que atuava em cinco cidades",
    excerpt: "Foram cumpridos 15 mandados de prisão e apreendidos veículos e armas",
    featuredImageUrl: "https://images.unsplash.com/photo-1453873531674-2151bcd01707?w=600&h=400&fit=crop",
    category: { name: "Polícia", slug: "policia" },
    publishedAt: new Date(Date.now() - 10800000).toISOString(),
    slug: "operacao-policial-quadrilha",
  },
  {
    id: 7,
    title: "Escolas municipais recebem novos laboratórios de informática",
    excerpt: "Investimento de R$ 5 milhões beneficia 30 unidades de ensino da rede pública",
    featuredImageUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&h=400&fit=crop",
    category: { name: "Educação", slug: "educacao" },
    publishedAt: new Date(Date.now() - 14400000).toISOString(),
    slug: "escolas-laboratorios-informatica",
  },
];

export function LatestNewsSection() {
  return (
    <section className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-heading text-2xl font-bold">Últimas Notícias</h2>
        <Link
          to="/noticias"
          className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Ver todas
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {latestNews.map((news) => (
          <NewsCard key={news.id} news={news} />
        ))}
      </div>
    </section>
  );
}
