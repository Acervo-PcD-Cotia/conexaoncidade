import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';

interface ArticleHeaderProps {
  categoryDisplay: string;
  categorySlug?: string;
  title: string;
  subtitle?: string | null;
  authorName: string;
  publishedAt: string | null;
  source?: string | null;
}

export function ArticleHeader({
  categoryDisplay,
  categorySlug,
  title,
  subtitle,
  authorName,
  publishedAt,
  source,
}: ArticleHeaderProps) {
  const formattedDate = publishedAt
    ? format(new Date(publishedAt), "dd/MM/yyyy '-' HH:mm", { locale: ptBR })
    : null;

  return (
    <header className="max-w-[820px] mx-auto px-4 md:px-6 pt-8 pb-6">
      {/* Chapéu (Category Label) */}
      {categorySlug ? (
        <Link to={`/categoria/${categorySlug}`}>
          <span className="article-chapeu uppercase tracking-widest text-xs font-semibold pb-1 inline-block mb-4 hover:opacity-80 transition-opacity">
            {categoryDisplay}
          </span>
        </Link>
      ) : (
        <span className="article-chapeu uppercase tracking-widest text-xs font-semibold pb-1 inline-block mb-4">
          {categoryDisplay}
        </span>
      )}

      {/* Title (H1) */}
      <h1 
        id="news-title"
        className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight text-foreground mb-4"
      >
        {title}
      </h1>

      {/* Linha Fina (Subtitle) */}
      {subtitle && (
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-6">
          {subtitle}
        </p>
      )}

      {/* Meta (Author, Source, Date) */}
      <div className="flex flex-col md:flex-row md:items-center gap-2 text-sm text-muted-foreground">
        <span className="font-semibold uppercase tracking-wide text-foreground">
          {authorName}
        </span>
        {source && !source.startsWith('http') && (
          <span className="hidden md:inline">– {source}</span>
        )}
        {formattedDate && (
          <>
            <span className="hidden md:inline text-muted-foreground">|</span>
            <time dateTime={publishedAt || undefined}>
              Publicado em {formattedDate} • Brasília
            </time>
          </>
        )}
      </div>
    </header>
  );
}
