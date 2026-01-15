import { useState } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageGalleryPicker } from './ImageGalleryPicker';

interface NewsArticle {
  titulo: string;
  slug: string;
  resumo: string;
  conteudo: string;
  categoria: string;
  tags?: string[];
  imagem: {
    hero: string;
    og?: string;
    card?: string;
    alt: string;
    credito: string;
    galeria?: string[];
    galeriaSelected?: boolean[];
  };
  seo: {
    meta_titulo: string;
    meta_descricao: string;
  };
  fonte?: string;
  subtitulo?: string;
  chapeu?: string;
  editor?: string;
}

interface ArticlePreviewDialogProps {
  articles: NewsArticle[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  onArticleUpdate?: (index: number, article: NewsArticle) => void;
}

export function ArticlePreviewDialog({
  articles,
  currentIndex,
  onIndexChange,
  onClose,
  onArticleUpdate,
}: ArticlePreviewDialogProps) {
  const [activeTab, setActiveTab] = useState('content');
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

  const handleSelectionChange = (selected: boolean[]) => {
    if (!onArticleUpdate) return;
    const updatedArticle = {
      ...article,
      imagem: {
        ...article.imagem,
        galeriaSelected: selected,
      },
    };
    onArticleUpdate(currentIndex, updatedArticle);
  };

  const handleHeroChange = (newHeroUrl: string, oldHeroUrl: string) => {
    if (!onArticleUpdate) return;
    const updatedGaleria = [
      oldHeroUrl,
      ...(article.imagem.galeria?.filter((u) => u !== newHeroUrl) || []),
    ];
    const updatedArticle = {
      ...article,
      imagem: {
        ...article.imagem,
        hero: newHeroUrl,
        galeria: updatedGaleria,
        galeriaSelected: updatedGaleria.map(() => true),
      },
    };
    onArticleUpdate(currentIndex, updatedArticle);
  };

  if (!article) return null;

  const galleryImages = article.imagem?.galeria || [];
  const gallerySelected = article.imagem?.galeriaSelected || galleryImages.map(() => true);
  const hasGallery = galleryImages.length > 0;

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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <div className="border-b px-4">
            <TabsList className="h-10">
              <TabsTrigger value="content">Conteúdo</TabsTrigger>
              <TabsTrigger value="images" className="flex items-center gap-1.5">
                <Image className="h-4 w-4" />
                Imagens
                {hasGallery && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {galleryImages.length + 1}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="max-h-[calc(90vh-140px)]">
            <TabsContent value="content" className="m-0 p-4 space-y-4">
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
                    {(() => {
                      try {
                        return new URL(article.fonte).hostname.replace('www.', '');
                      } catch {
                        return 'fonte';
                      }
                    })()}
                  </Badge>
                )}
              </div>

              {/* Hat/Chapeu */}
              {article.chapeu && (
                <span className="text-xs font-bold text-primary uppercase tracking-wide">
                  {article.chapeu}
                </span>
              )}

              {/* Title */}
              <h1 className="text-2xl font-bold">{article.titulo}</h1>

              {/* Subtitle */}
              {article.subtitulo && (
                <p className="text-lg text-muted-foreground italic">{article.subtitulo}</p>
              )}

              {/* Excerpt */}
              <p className="text-lg text-muted-foreground">{article.resumo}</p>

              {/* Content */}
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: article.conteudo }}
              />

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="images" className="m-0 p-4">
              <ImageGalleryPicker
                heroImage={article.imagem?.hero || ''}
                galleryImages={galleryImages}
                selectedImages={gallerySelected}
                onSelectionChange={handleSelectionChange}
                onHeroChange={onArticleUpdate ? handleHeroChange : undefined}
              />
            </TabsContent>

            <TabsContent value="seo" className="m-0 p-4 space-y-4">
              {/* SEO Info */}
              <div className="space-y-4">
                <div className="rounded-lg border p-4 space-y-3">
                  <h3 className="text-sm font-medium">Meta Tags</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-muted-foreground">Meta Título</span>
                      <p className="text-sm font-medium">{article.seo?.meta_titulo}</p>
                      <span className="text-xs text-muted-foreground">
                        {article.seo?.meta_titulo?.length || 0}/60 caracteres
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Meta Descrição</span>
                      <p className="text-sm">{article.seo?.meta_descricao}</p>
                      <span className="text-xs text-muted-foreground">
                        {article.seo?.meta_descricao?.length || 0}/160 caracteres
                      </span>
                    </div>
                  </div>
                </div>

                {/* Slug */}
                <div className="rounded-lg border p-4">
                  <span className="text-xs text-muted-foreground">Slug</span>
                  <p className="text-sm font-mono">{article.slug}</p>
                </div>

                {/* Editor */}
                {article.editor && (
                  <div className="rounded-lg border p-4">
                    <span className="text-xs text-muted-foreground">Editor</span>
                    <p className="text-sm">{article.editor}</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
