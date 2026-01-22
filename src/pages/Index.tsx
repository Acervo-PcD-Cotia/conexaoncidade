import { MarketDataBar } from "@/components/home/MarketDataBar";
import { SuperBanner } from "@/components/home/SuperBanner";
import { HomeVideoBlock } from "@/components/home/HomeVideoBlock";
import { TopWebStoriesBar } from "@/components/home/TopWebStoriesBar";
import { HeroSection } from "@/components/home/HeroSection";
import { LiveBroadcastWidget } from "@/components/home/LiveBroadcastWidget";
import { AgoraNaCidade } from "@/components/home/AgoraNaCidade";
import { LatestNewsList } from "@/components/home/LatestNewsList";
import { QuickNotes } from "@/components/home/QuickNotes";
import { MostReadSection } from "@/components/home/MostReadSection";
import { CategorySection } from "@/components/home/CategorySection";
import { AdSlot } from "@/components/home/AdSlot";

const Index = () => {
  return (
    <div className="space-y-0">
      
      {/* 1. Market/Weather data bar with BTC/ETH */}
      <MarketDataBar />
      
      {/* 2. SuperBanner - após cotações, antes do hero */}
      <SuperBanner />
      
      {/* 3. Video Block - após SuperBanner */}
      <HomeVideoBlock />
      
      {/* 4. WebStories - Instagram-style carousel */}
      <TopWebStoriesBar />
      
      {/* 4. Ad Slot: Home Top - 728x90 */}
      <div className="container py-2">
        <AdSlot slotType="home_top" />
      </div>
      
      {/* 5. Main hero - dominant headline */}
      <HeroSection />
      
      {/* 6. Live Broadcast Widget - Web Radio/TV */}
      <LiveBroadcastWidget />
      
      {/* 7. Real-time city updates */}
      <AgoraNaCidade />
      
      {/* 7. Dense latest news list */}
      <LatestNewsList />
      
      {/* 8. Quick notes - short updates */}
      <QuickNotes />
      
      {/* 9. Most read - social proof */}
      <MostReadSection />
      
      {/* 10. Category sections - dense format */}
      <CategorySection title="Política" slug="politica" />
      <CategorySection title="Esportes" slug="esportes" />
      <CategorySection title="Polícia" slug="policia" />
    </div>
  );
};

export default Index;
