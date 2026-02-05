import { cn } from '@/lib/utils';
import { useSanitizedHtml } from '@/hooks/useSanitizedHtml';

interface ArticleContentProps {
  html: string | null;
  className?: string;
}

export function ArticleContent({ html, className }: ArticleContentProps) {
  const sanitizedHtml = useSanitizedHtml(html);
  
  if (!html) return null;

  return (
    <div
      id="main-content"
      className={cn("prose-news text-lg", className)}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}
