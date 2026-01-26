import { useState } from "react";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { AIContentPreview } from "@/components/conexao-ai/AIContentPreview";
import { useGenerateContent, useCreateContentDraft } from "@/hooks/useConexaoAI";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { GeneratedNewsContent } from "@/types/conexao-ai";

export default function ConexaoAICreator() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const generateContent = useGenerateContent();
  const createDraft = useCreateContentDraft();

  const [input, setInput] = useState("");
  const [inputType, setInputType] = useState<"theme" | "draft" | "url">("theme");
  const [variants, setVariants] = useState<string[]>(["news"]);
  const [generatedContent, setGeneratedContent] = useState<{
    news: GeneratedNewsContent;
    variants?: {
      pcd?: string;
      instagram?: string;
      facebook?: string;
    };
  } | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const handleVariantChange = (variant: string, checked: boolean) => {
    if (checked) {
      setVariants((prev) => [...prev, variant]);
    } else {
      setVariants((prev) => prev.filter((v) => v !== variant));
    }
  };

  const handleGenerate = async () => {
    if (!input.trim()) {
      toast({
        variant: "destructive",
        title: "Campo obrigatório",
        description: "Digite um tema, rascunho ou URL para gerar o conteúdo.",
      });
      return;
    }

    try {
      const result = await generateContent.mutateAsync({
        input: input.trim(),
        type: inputType,
        variants: variants as ("news" | "pcd" | "instagram" | "facebook")[],
      });

      setGeneratedContent(result);
      
      // Save as draft
      await createDraft.mutateAsync({
        type: "news",
        title: result.news.titulo,
        content: {
          ...result.news,
          instagram_caption: result.variants?.instagram,
          facebook_caption: result.variants?.facebook,
          pcd_content: result.variants?.pcd,
        },
      });

      toast({
        title: "Conteúdo gerado!",
        description: "A notícia foi criada e salva como rascunho.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao gerar",
        description: error instanceof Error ? error.message : "Tente novamente.",
      });
    }
  };

  const handlePublish = async () => {
    if (!generatedContent) return;

    setIsPublishing(true);
    try {
      // Insert into news table
      const { data, error } = await supabase
        .from("news")
        .insert({
          title: generatedContent.news.titulo,
          slug: generatedContent.news.slug,
          content: generatedContent.news.conteudo,
          excerpt: generatedContent.news.resumo,
          meta_title: generatedContent.news.meta_titulo,
          meta_description: generatedContent.news.meta_descricao,
          status: "published",
          published_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Notícia publicada!",
        description: "A matéria foi publicada com sucesso.",
      });

      // Navigate to the news list
      navigate("/admin/noticias");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao publicar",
        description: error instanceof Error ? error.message : "Tente novamente.",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/conexao-ai")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Criador de Conteúdo</h1>
          <p className="text-sm text-muted-foreground">
            Gere notícias completas no padrão Conexão na Cidade
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input section */}
        <div className="space-y-6">
          {/* Input type */}
          <div className="space-y-3">
            <Label>Tipo de entrada</Label>
            <RadioGroup
              value={inputType}
              onValueChange={(value) => setInputType(value as "theme" | "draft" | "url")}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="theme" id="theme" />
                <Label htmlFor="theme" className="font-normal cursor-pointer">
                  Tema/Ideia
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="draft" id="draft" />
                <Label htmlFor="draft" className="font-normal cursor-pointer">
                  Rascunho
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="url" id="url" />
                <Label htmlFor="url" className="font-normal cursor-pointer">
                  URL de referência
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Input text */}
          <div className="space-y-2">
            <Label htmlFor="input">
              {inputType === "theme" && "Descreva o tema ou ideia da notícia"}
              {inputType === "draft" && "Cole seu rascunho aqui"}
              {inputType === "url" && "Cole a URL de referência"}
            </Label>
            <Textarea
              id="input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                inputType === "theme"
                  ? "Ex: Nova ciclovia inaugurada no centro da cidade"
                  : inputType === "draft"
                  ? "Cole aqui o texto que você já escreveu..."
                  : "https://exemplo.com/noticia-de-referencia"
              }
              className="min-h-[200px]"
            />
          </div>

          {/* Variants */}
          <div className="space-y-3">
            <Label>Gerar variantes</Label>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="news"
                  checked={variants.includes("news")}
                  disabled
                />
                <Label htmlFor="news" className="font-normal cursor-pointer">
                  Notícia (obrigatório)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pcd"
                  checked={variants.includes("pcd")}
                  onCheckedChange={(checked) => handleVariantChange("pcd", !!checked)}
                />
                <Label htmlFor="pcd" className="font-normal cursor-pointer">
                  Versão PcD
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="instagram"
                  checked={variants.includes("instagram")}
                  onCheckedChange={(checked) => handleVariantChange("instagram", !!checked)}
                />
                <Label htmlFor="instagram" className="font-normal cursor-pointer">
                  Instagram
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="facebook"
                  checked={variants.includes("facebook")}
                  onCheckedChange={(checked) => handleVariantChange("facebook", !!checked)}
                />
                <Label htmlFor="facebook" className="font-normal cursor-pointer">
                  Facebook
                </Label>
              </div>
            </div>
          </div>

          {/* Generate button */}
          <Button
            onClick={handleGenerate}
            disabled={generateContent.isPending || !input.trim()}
            className="w-full"
            size="lg"
          >
            {generateContent.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Gerar Conteúdo
              </>
            )}
          </Button>
        </div>

        {/* Preview section */}
        <div className="rounded-lg border bg-card">
          {generatedContent ? (
            <div className="p-4">
              <h2 className="mb-4 font-semibold">Prévia do Conteúdo</h2>
              <AIContentPreview
                content={generatedContent.news}
                variants={generatedContent.variants}
                onPublish={handlePublish}
                isPublishing={isPublishing}
              />
            </div>
          ) : (
            <div className="flex h-full min-h-[400px] items-center justify-center p-8 text-center">
              <div>
                <Sparkles className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 font-medium text-muted-foreground">
                  Prévia do conteúdo
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  O conteúdo gerado aparecerá aqui
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
