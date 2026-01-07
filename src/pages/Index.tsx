import { BreakingNewsTicker } from "@/components/home/BreakingNewsTicker";
import { MarketDataBar } from "@/components/home/MarketDataBar";
import { SuperBanner } from "@/components/home/SuperBanner";
import { StoriesBar } from "@/components/home/StoriesBar";
import { HeroSection } from "@/components/home/HeroSection";
import { LatestNewsSection } from "@/components/home/LatestNewsSection";
import { CategorySection } from "@/components/home/CategorySection";

// Mock data for category sections
const politicsNews = [
  { id: 10, title: "Câmara aprova projeto de lei para modernização urbana", featuredImageUrl: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=600&h=400&fit=crop", category: { name: "Política", slug: "politica" }, publishedAt: new Date().toISOString(), slug: "camara-projeto-lei" },
  { id: 11, title: "Prefeito anuncia novas medidas econômicas", category: { name: "Política", slug: "politica" }, featuredImageUrl: "", publishedAt: new Date().toISOString(), slug: "prefeito-medidas" },
  { id: 12, title: "Vereadores debatem orçamento para 2025", category: { name: "Política", slug: "politica" }, featuredImageUrl: "", publishedAt: new Date().toISOString(), slug: "vereadores-orcamento" },
  { id: 13, title: "Secretaria apresenta plano de governo", category: { name: "Política", slug: "politica" }, featuredImageUrl: "", publishedAt: new Date().toISOString(), slug: "secretaria-plano" },
];

const sportsNews = [
  { id: 20, title: "Atleta local conquista medalha em competição internacional", featuredImageUrl: "https://images.unsplash.com/photo-1461896836934- voices-media-photography?w=600&h=400&fit=crop", category: { name: "Esportes", slug: "esportes" }, publishedAt: new Date().toISOString(), slug: "atleta-medalha" },
  { id: 21, title: "Campeonato regional de vôlei começa neste fim de semana", category: { name: "Esportes", slug: "esportes" }, featuredImageUrl: "", publishedAt: new Date().toISOString(), slug: "campeonato-volei" },
  { id: 22, title: "Novo centro esportivo será inaugurado", category: { name: "Esportes", slug: "esportes" }, featuredImageUrl: "", publishedAt: new Date().toISOString(), slug: "centro-esportivo" },
  { id: 23, title: "Maratona da cidade abre inscrições", category: { name: "Esportes", slug: "esportes" }, featuredImageUrl: "", publishedAt: new Date().toISOString(), slug: "maratona-inscricoes" },
];

const Index = () => {
  return (
    <>
      <BreakingNewsTicker />
      <MarketDataBar />
      <SuperBanner />
      <StoriesBar />
      <HeroSection />
      <LatestNewsSection />
      <CategorySection title="Política" slug="politica" news={politicsNews} />
      <CategorySection title="Esportes" slug="esportes" news={sportsNews} />
    </>
  );
};

export default Index;
