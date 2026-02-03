import { cn } from '@/lib/utils';

interface ArticleContentProps {
  html: string | null;
  className?: string;
}

export function ArticleContent({ html, className }: ArticleContentProps) {
  if (!html) return null;

  return (
    <div
      id="main-content"
      className={cn("prose-news text-lg", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
