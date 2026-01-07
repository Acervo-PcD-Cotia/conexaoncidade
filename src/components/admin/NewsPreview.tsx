import { useState } from "react";
import { Eye, Monitor, Smartphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NewsPreviewProps {
  title: string;
  subtitle?: string;
  hat?: string;
  content?: string;
  excerpt?: string;
  featuredImageUrl?: string;
  imageAlt?: string;
  imageCredit?: string;
  categoryName?: string;
  categoryColor?: string;
}

export function NewsPreview({
  title,
  subtitle,
  hat,
  content,
  excerpt,
  featuredImageUrl,
  imageAlt,
  imageCredit,
  categoryName = "Notícia",
  categoryColor = "hsl(var(--primary))",
}: NewsPreviewProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Eye className="h-4 w-4" />
          Preview
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="flex items-center justify-between">
            Preview da Notícia
          </DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="home" className="w-full">
          <div className="px-4">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="home" className="gap-2">
                <Monitor className="h-4 w-4" />
                Card na Home
              </TabsTrigger>
              <TabsTrigger value="detail" className="gap-2">
                <Smartphone className="h-4 w-4" />
                Página da Notícia
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="h-[70vh]">
            <TabsContent value="home" className="p-4 pt-2">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Card Default */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Card Padrão</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <article className="overflow-hidden rounded-lg border bg-card">
                      {featuredImageUrl && (
                        <div className="aspect-[16/10] overflow-hidden">
                          <img
                            src={featuredImageUrl}
                            alt={imageAlt || title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-3">
                        <Badge
                          variant="outline"
                          className="mb-1.5 text-[10px] px-1.5 py-0"
                          style={{ borderColor: categoryColor, color: categoryColor }}
                        >
                          {categoryName}
                        </Badge>
                        <h3 className="mb-1.5 font-heading text-base font-semibold leading-tight line-clamp-2">
                          {title || "Título da notícia"}
                        </h3>
                        {excerpt && (
                          <p className="mb-2 text-xs text-muted-foreground line-clamp-2">
                            {excerpt}
                          </p>
                        )}
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          Agora
                        </div>
                      </div>
                    </article>
                  </CardContent>
                </Card>

                {/* Card Horizontal */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Card Horizontal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <article className="flex gap-3 rounded-lg border bg-card p-2">
                      {featuredImageUrl && (
                        <div className="h-16 w-20 shrink-0 overflow-hidden rounded-md">
                          <img
                            src={featuredImageUrl}
                            alt={imageAlt || title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex flex-1 flex-col justify-between min-w-0">
                        <div>
                          <Badge
                            variant="outline"
                            className="mb-1 text-[10px] px-1.5 py-0"
                            style={{ borderColor: categoryColor, color: categoryColor }}
                          >
                            {categoryName}
                          </Badge>
                          <h3 className="font-heading text-sm font-medium leading-tight line-clamp-2">
                            {title || "Título da notícia"}
                          </h3>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          Agora
                        </div>
                      </div>
                    </article>
                  </CardContent>
                </Card>

                {/* Manchete */}
                <Card className="md:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Manchete Principal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <article className="relative overflow-hidden rounded-lg border">
                      {featuredImageUrl && (
                        <div className="aspect-[21/9] overflow-hidden">
                          <img
                            src={featuredImageUrl}
                            alt={imageAlt || title}
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        {hat && (
                          <Badge className="mb-2 bg-primary text-primary-foreground">
                            {hat}
                          </Badge>
                        )}
                        <h2 className="font-heading text-2xl font-bold leading-tight mb-2">
                          {title || "Título da notícia"}
                        </h2>
                        {subtitle && (
                          <p className="text-sm text-white/80">{subtitle}</p>
                        )}
                      </div>
                    </article>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="detail" className="p-4 pt-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Página de Detalhes</CardTitle>
                </CardHeader>
                <CardContent>
                  <article className="max-w-2xl mx-auto">
                    {/* Breadcrumb */}
                    <nav className="mb-4 text-xs text-muted-foreground">
                      Home / {categoryName} / {title?.slice(0, 30)}...
                    </nav>

                    {/* Hat + Category */}
                    <div className="flex items-center gap-2 mb-3">
                      {hat && (
                        <Badge variant="secondary" className="text-xs">
                          {hat}
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className="text-xs"
                        style={{ borderColor: categoryColor, color: categoryColor }}
                      >
                        {categoryName}
                      </Badge>
                    </div>

                    {/* Title */}
                    <h1 className="font-heading text-2xl md:text-3xl font-bold leading-tight mb-3">
                      {title || "Título da notícia"}
                    </h1>

                    {/* Subtitle */}
                    {subtitle && (
                      <p className="text-lg text-muted-foreground mb-4">{subtitle}</p>
                    )}

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6 pb-4 border-b">
                      <span>Por Redação</span>
                      <span>•</span>
                      <span>Publicado agora</span>
                    </div>

                    {/* Featured Image */}
                    {featuredImageUrl && (
                      <figure className="mb-6">
                        <div className="aspect-video overflow-hidden rounded-lg">
                          <img
                            src={featuredImageUrl}
                            alt={imageAlt || title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        {(imageAlt || imageCredit) && (
                          <figcaption className="mt-2 text-xs text-muted-foreground text-center">
                            {imageAlt}
                            {imageCredit && <span className="ml-1">Foto: {imageCredit}</span>}
                          </figcaption>
                        )}
                      </figure>
                    )}

                    {/* Content Preview */}
                    <div className="prose prose-sm max-w-none">
                      {content ? (
                        <div dangerouslySetInnerHTML={{ __html: content }} />
                      ) : (
                        <p className="text-muted-foreground italic">
                          O conteúdo da notícia aparecerá aqui...
                        </p>
                      )}
                    </div>
                  </article>
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}