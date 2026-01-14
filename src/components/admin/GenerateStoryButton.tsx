import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wand2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GenerateStoryButtonProps {
  newsId: string;
  newsTitle: string;
  newsSummary?: string | null;
  newsImage?: string | null;
  newsSlug: string;
  newsCategory?: string | null;
  disabled?: boolean;
}

export function GenerateStoryButton({
  newsId,
  newsTitle,
  newsSummary,
  newsImage,
  newsSlug,
  newsCategory,
  disabled,
}: GenerateStoryButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 60);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      // Check if story already exists for this news
      const { data: existing } = await supabase
        .from("web_stories")
        .select("id, slug")
        .eq("news_id", newsId)
        .maybeSingle();

      if (existing) {
        toast.info("WebStory já existe para esta notícia");
        navigate(`/admin/stories/${existing.id}`);
        return;
      }

      const storySlug = `story-${generateSlug(newsTitle)}-${Date.now().toString(36)}`;
      const canonicalUrl = `https://conexaonacidade.com.br/noticia/${newsSlug}`;

      // Create the story
      const { data: story, error: storyError } = await supabase
        .from("web_stories")
        .insert({
          title: newsTitle,
          slug: storySlug,
          cover_image_url: newsImage,
          status: "draft",
          news_id: newsId,
        })
        .select()
        .single();

      if (storyError) throw storyError;

      // Generate the 5 standard slides
      const slides = [
        // Slide 1: Cover
        {
          story_id: story.id,
          slide_order: 0,
          background_image_url: newsImage,
          headline_text: newsCategory ? newsCategory.toUpperCase() : "NOTÍCIA",
          subheadline_text: newsTitle,
          duration_seconds: 5,
          animation_type: "fade",
        },
        // Slide 2: Context
        {
          story_id: story.id,
          slide_order: 1,
          background_color: "#1a1a2e",
          headline_text: "Contexto",
          content_html: newsSummary
            ? `<p class="text-xl text-white">${newsSummary.slice(0, 150)}${newsSummary.length > 150 ? "..." : ""}</p>`
            : `<p class="text-xl text-white">Confira os detalhes desta matéria.</p>`,
          duration_seconds: 6,
          animation_type: "slide-up",
        },
        // Slide 3: Highlight
        {
          story_id: story.id,
          slide_order: 2,
          background_image_url: newsImage,
          headline_text: "Destaque",
          content_html: `<p class="text-2xl font-bold text-white">Informação importante sobre o tema.</p>`,
          duration_seconds: 5,
          animation_type: "zoom",
        },
        // Slide 4: Additional Info
        {
          story_id: story.id,
          slide_order: 3,
          background_color: "#16213e",
          headline_text: "Saiba Mais",
          content_html: `<p class="text-lg text-white/90">Acompanhe todos os detalhes no portal.</p>`,
          duration_seconds: 5,
          animation_type: "slide-up",
        },
        // Slide 5: CTA
        {
          story_id: story.id,
          slide_order: 4,
          background_image_url: newsImage,
          headline_text: "Leia a matéria completa",
          cta_text: "Ler Notícia Completa",
          cta_url: canonicalUrl,
          duration_seconds: 8,
          animation_type: "fade",
        },
      ];

      const { error: slidesError } = await supabase
        .from("web_story_slides")
        .insert(slides);

      if (slidesError) throw slidesError;

      toast.success("WebStory criado com sucesso!");
      navigate(`/admin/stories/${story.id}`);
    } catch (error: any) {
      console.error("Error generating story:", error);
      toast.error("Erro ao gerar WebStory: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleGenerate}
      disabled={disabled || isGenerating}
      className="gap-2"
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Gerando...
        </>
      ) : (
        <>
          <Wand2 className="h-4 w-4" />
          Gerar WebStory
        </>
      )}
    </Button>
  );
}
