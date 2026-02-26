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
    <header className="max-w-[820px] mx-auto px-4 md:px-6 pt-10 pb-6">
      {/* Chapéu (Category Label) - centered pill like Agência Brasil */}
      <div className="flex justify-center mb-5">
        {categorySlug ? (
          <Link to={`/categoria/${categorySlug}`}>
            <span className="article-chapeu-pill inline-block text-xs font-semibold uppercase tracking-wider px-4 py-1.5 rounded-full hover:opacity-80 transition-opacity">
              {categoryDisplay}
            </span>
          </Link>
        ) : (
          <span className="article-chapeu-pill inline-block text-xs font-semibold uppercase tracking-wider px-4 py-1.5 rounded-full">
            {categoryDisplay}
          </span>
        )}
      </div>

      {/* Title (H1) - centered, large, bold */}
      <h1 
        id="news-title"
        className="text-2xl md:text-3xl lg:text-[2.5rem] font-bold leading-tight text-foreground mb-4 text-center"
      >
        {title}
      </h1>

      {/* Linha Fina (Subtitle) - centered */}
      {subtitle && (
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-6 text-center max-w-[700px] mx-auto">
          {subtitle}
        </p>
      )}

      {/* Thin separator */}
      <hr className="border-t border-border/50 mb-4" />

      {/* Meta (Author, Source, Date) - left aligned like Agência Brasil */}
      <div className="flex flex-col gap-1 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <span className="font-bold uppercase tracking-wide text-foreground text-xs">
            {authorName}
          </span>
          {source && !source.startsWith('http') && (
            <span className="text-xs">– {source}</span>
          )}
        </div>
        {formattedDate && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <time dateTime={publishedAt || undefined}>
              Publicado em {formattedDate}
            </time>
          </div>
        )}
      </div>
    </header>
  );
}
