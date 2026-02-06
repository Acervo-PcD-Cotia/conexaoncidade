import { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";
import { sanitizeHtml } from "@/hooks/useSanitizedHtml";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { GeneratedNewsContent } from "@/types/conexao-ai";

interface AIContentPreviewProps {
  content: GeneratedNewsContent;
  variants?: {
    pcd?: string;
    instagram?: string;
    facebook?: string;
  };
  onPublish?: () => void;
  isPublishing?: boolean;
}

export function AIContentPreview({
  content,
  variants,
  onPublish,
  isPublishing = false,
}: AIContentPreviewProps) {
  const { toast } = useToast();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast({
      title: "Copiado!",
      description: "Texto copiado para a área de transferência.",
    });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const CopyButton = ({ text, field }: { text: string; field: string }) => (
    <Button
      variant="ghost"
      size="icon"
      className="h-6 w-6"
      onClick={() => copyToClipboard(text, field)}
    >
      {copiedField === field ? (
        <Check className="h-3 w-3 text-green-500" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </Button>
  );

  return (
    <div className="space-y-6">
      <Tabs defaultValue="news" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="news">Notícia</TabsTrigger>
          <TabsTrigger value="pcd" disabled={!variants?.pcd}>
            PcD
          </TabsTrigger>
          <TabsTrigger value="instagram" disabled={!variants?.instagram}>
            Instagram
          </TabsTrigger>
          <TabsTrigger value="facebook" disabled={!variants?.facebook}>
            Facebook
          </TabsTrigger>
        </TabsList>

        {/* News Content */}
        <TabsContent value="news" className="space-y-4 pt-4">
          {/* Chapéu */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">
                Chapéu
              </label>
              <CopyButton text={content.chapeu} field="chapeu" />
            </div>
            <div className="rounded-md bg-muted p-2">
              <Badge variant="secondary" className="uppercase">
                {content.chapeu}
              </Badge>
            </div>
          </div>

          {/* Título */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">
                Título ({content.titulo.length}/60 caracteres)
              </label>
              <CopyButton text={content.titulo} field="titulo" />
            </div>
            <div className="rounded-md bg-muted p-3">
              <h2 className="text-lg font-bold">{content.titulo}</h2>
            </div>
          </div>

          {/* Subtítulo */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">
                Subtítulo ({content.subtitulo.length}/120 caracteres)
              </label>
              <CopyButton text={content.subtitulo} field="subtitulo" />
            </div>
            <div className="rounded-md bg-muted p-3">
              <p className="text-sm text-muted-foreground">
                {content.subtitulo}
              </p>
            </div>
          </div>

          {/* Resumo */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">
                Resumo
              </label>
              <CopyButton text={content.resumo} field="resumo" />
            </div>
            <div className="rounded-md bg-muted p-3">
              <p className="text-sm">{content.resumo}</p>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">
                Conteúdo
              </label>
              <CopyButton text={content.conteudo} field="conteudo" />
            </div>
            <div
              className="prose prose-sm max-w-none rounded-md bg-muted p-4"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(content.conteudo) }}
            />
          </div>

          {/* SEO */}
          <div className="grid gap-4 rounded-lg border p-4">
            <h4 className="font-medium">SEO</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">
                  Meta Título ({content.meta_titulo.length}/60)
                </label>
                <CopyButton text={content.meta_titulo} field="meta_titulo" />
              </div>
              <p className="text-sm">{content.meta_titulo}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">
                  Meta Descrição ({content.meta_descricao.length}/160)
                </label>
                <CopyButton
                  text={content.meta_descricao}
                  field="meta_descricao"
                />
              </div>
              <p className="text-sm">{content.meta_descricao}</p>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Slug</label>
              <code className="block rounded bg-muted p-2 text-xs">
                /{content.slug}
              </code>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Tags Sugeridas
            </label>
            <div className="flex flex-wrap gap-2">
              {content.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* PcD Content */}
        <TabsContent value="pcd" className="space-y-4 pt-4">
          {variants?.pcd && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">
                  Versão Acessível (PcD News)
                </label>
                <CopyButton text={variants.pcd} field="pcd" />
              </div>
              <div className="prose prose-sm max-w-none rounded-md bg-muted p-4">
                <p className="whitespace-pre-wrap">{variants.pcd}</p>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Instagram Content */}
        <TabsContent value="instagram" className="space-y-4 pt-4">
          {variants?.instagram && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">
                  Legenda Instagram
                </label>
                <CopyButton text={variants.instagram} field="instagram" />
              </div>
              <div className="rounded-md bg-muted p-4">
                <p className="whitespace-pre-wrap text-sm">
                  {variants.instagram}
                </p>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Facebook Content */}
        <TabsContent value="facebook" className="space-y-4 pt-4">
          {variants?.facebook && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">
                  Post Facebook
                </label>
                <CopyButton text={variants.facebook} field="facebook" />
              </div>
              <div className="rounded-md bg-muted p-4">
                <p className="whitespace-pre-wrap text-sm">
                  {variants.facebook}
                </p>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Action buttons */}
      {onPublish && (
        <div className="flex gap-2 pt-4 border-t">
          <Button onClick={onPublish} disabled={isPublishing} className="flex-1">
            <ExternalLink className="mr-2 h-4 w-4" />
            {isPublishing ? "Publicando..." : "Publicar Notícia"}
          </Button>
        </div>
      )}
    </div>
  );
}
