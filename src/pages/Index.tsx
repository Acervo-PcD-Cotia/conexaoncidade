import { BreakingNewsTicker } from "@/components/home/BreakingNewsTicker";
import { MarketDataBar } from "@/components/home/MarketDataBar";
import { SuperBanner } from "@/components/home/SuperBanner";
import { StoriesBar } from "@/components/home/StoriesBar";
import { HeroSection } from "@/components/home/HeroSection";
import { AgoraNaCidade } from "@/components/home/AgoraNaCidade";
import { LatestNewsList } from "@/components/home/LatestNewsList";
import { QuickNotes } from "@/components/home/QuickNotes";
import { MostReadSection } from "@/components/home/MostReadSection";
import { CategorySection } from "@/components/home/CategorySection";

const Index = () => {
  return (
    <div className="space-y-0">
      <BreakingNewsTicker />
      <MarketDataBar />
      
      {/* Main hero - dominant headline */}
      <HeroSection />
      
      {/* Real-time city updates */}
      <AgoraNaCidade />
      
      {/* Dense latest news list */}
      <LatestNewsList />
      
      <SuperBanner />
      
      {/* Quick notes - short updates */}
      <QuickNotes />
      
      {/* Most read - social proof */}
      <MostReadSection />
      
      {/* Category sections - dense format */}
      <CategorySection title="Política" slug="politica" />
      <CategorySection title="Esportes" slug="esportes" />
      <CategorySection title="Polícia" slug="policia" />
      
      {/* Stories bar moved lower */}
      <StoriesBar />
    </div>
  );
};

export default Index;
