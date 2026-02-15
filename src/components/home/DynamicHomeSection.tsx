import { lazy, Suspense } from "react";
import type { HomeSectionConfig, HomeSectionType } from "@/types/portal-templates";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveAdUnit } from "@/components/ads/ResponsiveAdUnit";


// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SectionComponent = React.ComponentType<any>;

// Lazy load all section components
const MarketDataBar = lazy(() => import("./MarketDataBar").then(m => ({ default: m.MarketDataBar })));
const SuperBanner = lazy(() => import("./SuperBanner").then(m => ({ default: m.SuperBanner })));
const HomeVideoBlock = lazy(() => import("./HomeVideoBlock").then(m => ({ default: m.HomeVideoBlock })));
const TopWebStoriesBar = lazy(() => import("./TopWebStoriesBar").then(m => ({ default: m.TopWebStoriesBar })));
const HeroSection = lazy(() => import("./HeroSection").then(m => ({ default: m.HeroSection })));
const LiveBroadcastWidget = lazy(() => import("./LiveBroadcastWidget").then(m => ({ default: m.LiveBroadcastWidget })));
const AgoraNaCidade = lazy(() => import("./AgoraNaCidade").then(m => ({ default: m.AgoraNaCidade })));
const LatestNewsList = lazy(() => import("./LatestNewsList").then(m => ({ default: m.LatestNewsList })));
const QuickNotes = lazy(() => import("./QuickNotes").then(m => ({ default: m.QuickNotes })));
const MostReadSection = lazy(() => import("./MostReadSection").then(m => ({ default: m.MostReadSection })));
const CategorySection = lazy(() => import("./CategorySection").then(m => ({ default: m.CategorySection })));
const BannerIntroSection = lazy(() => import("@/components/ads/BannerIntro").then(m => ({ default: m.BannerIntro })));

// Placeholder components for sections not yet implemented
const DonationsCTA = () => (
  <section className="container py-8">
    <div className="bg-gradient-to-r from-primary/20 to-primary/5 rounded-xl p-8 text-center">
      <h2 className="text-2xl font-bold mb-2">Contribua com Nossa Missão</h2>
      <p className="text-muted-foreground mb-4">Sua doação faz a diferença.</p>
      <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium">
        Contribuir Agora
      </button>
    </div>
  </section>
);

const MembersCTA = () => (
  <section className="container py-8">
    <div className="bg-gradient-to-r from-accent/20 to-accent/5 rounded-xl p-8 text-center">
      <h2 className="text-2xl font-bold mb-2">Área de Membros</h2>
      <p className="text-muted-foreground mb-4">Acesse conteúdo exclusivo.</p>
      <button className="bg-accent text-accent-foreground px-6 py-2 rounded-lg font-medium">
        Acessar Membros
      </button>
    </div>
  </section>
);

const NewsletterCTA = () => (
  <section className="container py-8">
    <div className="bg-muted rounded-xl p-8 text-center">
      <h2 className="text-2xl font-bold mb-2">Receba Nossas Atualizações</h2>
      <p className="text-muted-foreground mb-4">Cadastre-se para receber as últimas notícias.</p>
      <div className="flex gap-2 justify-center max-w-md mx-auto">
        <input 
          type="email" 
          placeholder="Seu e-mail" 
          className="flex-1 px-4 py-2 rounded-lg border bg-background"
        />
        <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium">
          Inscrever
        </button>
      </div>
    </div>
  </section>
);

const RadioPlayer = () => (
  <section className="container py-4">
    <div className="bg-gradient-to-r from-primary/10 to-transparent rounded-xl p-6 flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
        <span className="text-2xl">🎵</span>
      </div>
      <div className="flex-1">
        <p className="font-semibold">Web Rádio</p>
        <p className="text-sm text-muted-foreground">Ao vivo 24 horas</p>
      </div>
      <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg">
        Ouvir
      </button>
    </div>
  </section>
);

// Component mapping
const SECTION_COMPONENTS: Record<HomeSectionType, SectionComponent> = {
  market_data: MarketDataBar,
  super_banner: SuperBanner,
  video_block: HomeVideoBlock,
  stories_bar: TopWebStoriesBar,
  ad_slot_top: () => (
    <div className="container py-2">
      <ResponsiveAdUnit format="SUPER_BANNER_TOPO" slotId="super_banner" source="ads" page="home" />
    </div>
  ),
  hero_headlines: () => (
    <>
      <HeroSection />
      {/* Sidebar ad slot rendered inline for DOM proof */}
      <div className="container py-2 flex justify-center lg:justify-end">
        <ResponsiveAdUnit format="ARRANHA_CEU" slotId="arranha_ceu" source="ads" page="home" />
      </div>
    </>
  ),
  live_broadcast: LiveBroadcastWidget,
  agora_na_cidade: AgoraNaCidade,
  latest_news: LatestNewsList,
  quick_notes: QuickNotes,
  most_read: MostReadSection,
  category_section: CategorySection,
  radio_player: RadioPlayer,
  tv_featured: LiveBroadcastWidget, // Reuse for now
  vod_library: () => <div className="container py-4">VOD Library (em breve)</div>,
  programs_grid: () => <div className="container py-4">Grade de Programas (em breve)</div>,
  social_embed: () => <div className="container py-4">Social Embed (em breve)</div>,
  newsletter_cta: NewsletterCTA,
  donations_cta: DonationsCTA,
  members_cta: MembersCTA,
  banner_intro: BannerIntroSection,
  ad_slot_mid: () => (
    <div className="container py-2">
      <ResponsiveAdUnit format="RETANGULO_MEDIO" slotId="retangulo_medio" source="ads" page="home" />
    </div>
  ),
  ad_slot_bottom: () => (
    <div className="container py-2">
      <ResponsiveAdUnit format="ANUNCIO_HOME" slotId="leaderboard" source="ads" page="home" />
    </div>
  ),
};

interface DynamicHomeSectionProps {
  section: HomeSectionConfig;
}

function SectionSkeleton() {
  return (
    <div className="container py-4">
      <Skeleton className="h-32 w-full rounded-xl" />
    </div>
  );
}

export function DynamicHomeSection({ section }: DynamicHomeSectionProps) {
  const Component = SECTION_COMPONENTS[section.type];

  if (!Component) {
    console.warn(`Unknown section type: ${section.type}`);
    return null;
  }

  // Handle category sections with props
  if (section.type === "category_section" && section.props) {
    return (
      <Suspense fallback={<SectionSkeleton />}>
        <CategorySection 
          title={section.props.title as string} 
          slug={section.props.slug as string} 
        />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<SectionSkeleton />}>
      <Component {...(section.props || {})} />
    </Suspense>
  );
}
