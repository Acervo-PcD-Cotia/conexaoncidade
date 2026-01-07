import { useParams, Link } from 'react-router-dom';
import { useNewsByCategory } from '@/hooks/useNews';
import { useCategoryBySlug } from '@/hooks/useCategories';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft } from 'lucide-react';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: category, isLoading: categoryLoading } = useCategoryBySlug(slug || '');
  const { data: news = [], isLoading: newsLoading } = useNewsByCategory(slug || '');

  if (categoryLoading || newsLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-12 w-64 mb-4" />
        <Skeleton className="h-6 w-96 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-video w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Categoria não encontrada</h1>
        <p className="text-muted-foreground mb-8">
          A categoria que você está procurando não existe.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para a página inicial
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-1 h-12 rounded-full"
            style={{ backgroundColor: category.color }}
          />
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-heading">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-muted-foreground mt-1">{category.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* News Grid */}
      {news.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Nenhuma notícia encontrada nesta categoria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item) => (
            <Link
              key={item.id}
              to={`/noticia/${item.slug}`}
              className="group"
            >
              <article className="news-card bg-card rounded-lg overflow-hidden border border-border/50 h-full">
                <div className="aspect-video overflow-hidden">
                  <img
                    src={item.featured_image_url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600'}
                    alt={item.image_alt || item.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <Badge
                    className="text-white mb-2"
                    style={{ backgroundColor: category.color }}
                  >
                    {category.name}
                  </Badge>
                  <h2 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors mb-2">
                    {item.title}
                  </h2>
                  {item.excerpt && (
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                      {item.excerpt}
                    </p>
                  )}
                  {item.published_at && (
                    <time className="text-xs text-muted-foreground">
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
      )}
    </div>
  );
}
