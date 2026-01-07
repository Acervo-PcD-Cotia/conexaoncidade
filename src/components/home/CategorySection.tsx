import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { NewsCard } from "./NewsCard";

interface CategorySectionProps {
  title: string;
  slug: string;
  news: Array<{
    id: number;
    title: string;
    excerpt?: string;
    featuredImageUrl: string;
    category: { name: string; slug: string };
    publishedAt: string;
    slug: string;
  }>;
}

export function CategorySection({ title, slug, news }: CategorySectionProps) {
  if (news.length === 0) return null;

  const [mainNews, ...sideNews] = news;

  return (
    <section className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-heading text-2xl font-bold">{title}</h2>
        <Link
          to={`/categoria/${slug}`}
          className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Ver mais
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main news */}
        <div className="lg:col-span-2">
          <NewsCard news={mainNews} />
        </div>
        {/* Side news */}
        <div className="space-y-4 rounded-lg bg-card p-4">
          <h3 className="font-heading text-lg font-semibold">Mais em {title}</h3>
          <div className="divide-y">
            {sideNews.slice(0, 4).map((n) => (
              <NewsCard key={n.id} news={n} variant="compact" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
