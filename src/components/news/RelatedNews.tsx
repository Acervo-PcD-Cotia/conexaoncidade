import { Link } from 'react-router-dom';
import { NewsItem } from '@/hooks/useNews';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getCategoryDisplay } from '@/utils/categoryDisplay';

interface RelatedNewsProps {
  news: NewsItem[];
}

export function RelatedNews({ news }: RelatedNewsProps) {
  if (news.length === 0) return null;

  return (
    <section className="mt-12">
      {/* Centered Title with Decorative Lines */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1 h-px bg-border" />
        <h3 className="text-lg font-bold uppercase tracking-wider text-muted-foreground">
          Relacionadas
        </h3>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {news.map((item) => (
          <Link
            key={item.id}
            to={`/noticia/${item.slug}`}
            className="group"
          >
            <article className="space-y-3">
              {/* Compact Square Image */}
              <div className="aspect-[4/3] overflow-hidden bg-muted">
                <img
                  src={item.featured_image_url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400'}
                  alt={item.image_alt || item.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              
              {/* Content */}
              <div className="space-y-1.5">
                {item.category && (
                  <span
                    className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 text-white"
                    style={{ backgroundColor: item.category.color }}
                  >
                    {getCategoryDisplay(item.category.name, item.tags?.map(t => t.name) || [], item.source)}
                  </span>
                )}
                <h4 className="text-sm font-semibold line-clamp-3 group-hover:text-primary transition-colors leading-snug">
                  {item.title}
                </h4>
                {item.published_at && (
                  <time className="text-[11px] text-muted-foreground block">
                    {formatDistanceToNow(new Date(item.published_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </time>
                )}
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}
