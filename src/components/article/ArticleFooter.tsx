import { Link } from 'react-router-dom';
import { ShareButtons } from '@/components/news/ShareButtons';

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface ArticleFooterProps {
  tags?: Tag[] | null;
  newsId: string;
  newsTitle: string;
  currentUrl: string;
  onShare?: (platform: string) => void;
}

export function ArticleFooter({
  tags,
  newsId,
  newsTitle,
  currentUrl,
  onShare,
}: ArticleFooterProps) {
  return (
    <footer className="border-t pt-8 space-y-8 article-footer mt-8" aria-label="Informações adicionais">
      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Link
              key={tag.id}
              to={`/busca?tag=${tag.slug}`}
              className="article-tag bg-transparent border px-4 py-2 rounded-full text-sm transition-colors hover:bg-[var(--category-color)] hover:text-white hover:border-[var(--category-color)]"
            >
              {tag.name}
            </Link>
          ))}
        </div>
      )}

      {/* Share Section - Centered */}
      <div className="text-center py-6 border-t">
        <p className="text-sm font-medium text-foreground mb-4">Compartilhe essa notícia</p>
        <div className="flex justify-center">
          <ShareButtons 
            url={currentUrl} 
            title={newsTitle} 
            contentId={newsId}
            contentType="news"
            variant="circular"
            onShare={onShare}
          />
        </div>
      </div>
    </footer>
  );
}
