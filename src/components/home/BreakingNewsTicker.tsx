import { Megaphone } from "lucide-react";

// Mock data - will be replaced with real data from database
const breakingNews = [
  { id: 1, title: "Prefeitura anuncia novo pacote de obras para 2025", slug: "prefeitura-obras-2025" },
  { id: 2, title: "Time local vence campeonato regional de futebol", slug: "time-local-campeonato" },
  { id: 3, title: "Nova linha de ônibus conecta bairros da zona norte", slug: "nova-linha-onibus" },
];

export function BreakingNewsTicker() {
  if (breakingNews.length === 0) return null;

  const newsText = breakingNews.map((n) => n.title).join("  •  ");

  return (
    <div className="bg-news-urgent text-white">
      <div className="container flex items-center gap-3 py-2">
        <div className="flex shrink-0 items-center gap-2 font-semibold">
          <Megaphone className="h-4 w-4 breaking-pulse" />
          <span className="text-xs uppercase tracking-wider">Última Hora</span>
        </div>
        <div className="relative flex-1 overflow-hidden">
          <div className="animate-marquee flex whitespace-nowrap">
            <span className="text-sm">{newsText}</span>
            <span className="mx-8">•</span>
            <span className="text-sm">{newsText}</span>
            <span className="mx-8">•</span>
          </div>
        </div>
      </div>
    </div>
  );
}
