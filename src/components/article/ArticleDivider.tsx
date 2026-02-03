import { cn } from '@/lib/utils';

interface ArticleDividerProps {
  className?: string;
}

export function ArticleDivider({ className }: ArticleDividerProps) {
  return (
    <hr 
      className={cn(
        "article-divider border-t my-6 max-w-[820px] mx-auto",
        className
      )} 
    />
  );
}
