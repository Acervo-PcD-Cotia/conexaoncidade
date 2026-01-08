import { ChevronLeft, ChevronRight, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NewsArticle {
  titulo: string;
  slug: string;
  resumo: string;
  conteudo: string;
  categoria: string;
  tags?: string[];
  imagem: {
    hero: string;
    alt: string;
    credito: string;
  };
  seo: {
    meta_titulo: string;
    meta_descricao: string;
  };
  fonte?: string;
}

interface ArticlePreviewDialogProps {
  articles: NewsArticle[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

export function ArticlePreviewDialog({
  articles,
  currentIndex,
  onIndexChange,
  onClose,
}: ArticlePreviewDialogProps) {
  const article = articles[currentIndex];
  const hasMultiple = articles.length > 1;

  const goToPrev = () => {
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < articles.length - 1) {
      onIndexChange(currentIndex + 1);
    }
  };

  if (!article) return null;

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-hidden p-0">
        <DialogHeader className="border-b p-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              Preview do Artigo
              {hasMultiple && (
                <Badge variant="secondary">
                  {currentIndex + 1} de {articles.length}
                </Badge>
              )}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {hasMultiple && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={goToPrev}
                    disabled={currentIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={goToNext}
                    disabled={currentIndex === articles.length - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-80px)]">
          <div className="space-y-4 p-4">
            {/* Hero Image */}
            {article.imagem?.hero && (
              <div className="relative overflow-hidden rounded-lg">
                <img
                  src={article.imagem.hero}
                  alt={article.imagem.alt || article.titulo}
                  className="aspect-video w-full object-cover"
                />
                {article.imagem.credito && (
                  <span className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
                    {article.imagem.credito}
                  </span>
                )}
              </div>
            )}

            {/* Category & Source */}
            <div className="flex flex-wrap gap-2">
              <Badge>{article.categoria}</Badge>
              {article.fonte && (
                <Badge variant="outline" className="gap-1">
                  <ExternalLink className="h-3 w-3" />
                  {new URL(article.fonte).hostname.replace('www.', '')}
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold">{article.titulo}</h1>

            {/* Excerpt */}
            <p className="text-lg text-muted-foreground">{article.resumo}</p>

            {/* Content */}
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: article.conteudo }}
            />

            {/* Tags */}
            {article.tags?.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* SEO Info */}
            <div className="rounded-lg border bg-muted/50 p-4">
              <h3 className="mb-2 text-sm font-medium">SEO</h3>
              <div className="space-y-1 text-sm">
                <p><strong>Meta Título:</strong> {article.seo?.meta_titulo}</p>
                <p><strong>Meta Descrição:</strong> {article.seo?.meta_descricao}</p>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
