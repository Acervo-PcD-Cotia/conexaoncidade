import { useMemo, useState } from 'react';
import { List, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NewsTableOfContentsProps {
  contentHtml: string;
  className?: string;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function NewsTableOfContents({ contentHtml, className }: NewsTableOfContentsProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const tocItems = useMemo(() => {
    if (!contentHtml) return [];

    const items: TocItem[] = [];
    
    // Match h2 tags and extract their content
    const h2Regex = /<h2[^>]*>(.*?)<\/h2>/gi;
    let match;
    let index = 0;

    while ((match = h2Regex.exec(contentHtml)) !== null) {
      // Clean HTML tags from the heading text
      const text = match[1].replace(/<[^>]*>/g, '').trim();
      if (text) {
        const id = `heading-${index}`;
        items.push({ id, text, level: 2 });
        index++;
      }
    }

    return items;
  }, [contentHtml]);

  // Don't render if less than 3 headings
  if (tocItems.length < 3) {
    return null;
  }

  const handleScrollTo = (id: string, index: number) => {
    // Find all h2 elements in the article content
    const articleContent = document.querySelector('.prose-news');
    if (!articleContent) return;

    const headings = articleContent.querySelectorAll('h2');
    const targetHeading = headings[index];
    
    if (targetHeading) {
      targetHeading.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav
      className={cn(
        "border border-border rounded-xl overflow-hidden bg-card",
        className
      )}
      aria-label="Sumário do artigo"
    >
      {/* Header - Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors"
        aria-expanded={isExpanded}
        aria-controls="toc-content"
      >
        <div className="flex items-center gap-2">
          <List className="h-5 w-5 text-primary" />
          <span className="font-semibold">Nesta matéria</span>
          <span className="text-xs text-muted-foreground">({tocItems.length} tópicos)</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>

      {/* Content */}
      <div
        id="toc-content"
        className={cn(
          "overflow-hidden transition-all duration-300",
          isExpanded ? "max-h-96" : "max-h-0"
        )}
      >
        <ol className="p-4 space-y-2 bg-background">
          {tocItems.map((item, index) => (
            <li key={item.id}>
              <button
                onClick={() => handleScrollTo(item.id, index)}
                className="flex items-start gap-3 w-full text-left group p-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center">
                  {index + 1}
                </span>
                <span className="text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {item.text}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
