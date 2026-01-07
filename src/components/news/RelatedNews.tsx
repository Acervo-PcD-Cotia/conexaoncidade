import { Link } from 'react-router-dom';
import { NewsItem } from '@/hooks/useNews';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RelatedNewsProps {
  news: NewsItem[];
}

export function RelatedNews({ news }: RelatedNewsProps) {
  if (news.length === 0) return null;

  return (
    <section className="mt-12">
      <h3 className="text-2xl font-bold mb-6">Notícias Relacionadas</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {news.map((item) => (
          <Link
            key={item.id}
            to={`/noticia/${item.slug}`}
            className="group"
          >
            <article className="news-card bg-card rounded-lg overflow-hidden border border-border/50">
              <div className="aspect-video overflow-hidden">
                <img
                  src={item.featured_image_url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400'}
                  alt={item.image_alt || item.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                {item.category && (
                  <span
                    className="category-badge text-white mb-2"
                    style={{ backgroundColor: item.category.color }}
                  >
                    {item.category.name}
                  </span>
                )}
                <h4 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                  {item.title}
                </h4>
                {item.published_at && (
                  <time className="text-xs text-muted-foreground mt-2 block">
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
