import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Plus, Trash2, GripVertical, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface SlideForm {
  id?: string;
  sort_order: number;
  background_image_url: string;
  background_color: string;
  content_html: string;
  duration_seconds: number;
  animation_type: string;
  cta_text: string;
  cta_url: string;
}

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export default function StoryEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    cover_image_url: "",
    status: "draft" as "draft" | "published" | "archived",
    meta_title: "",
    meta_description: "",
  });

  const [slides, setSlides] = useState<SlideForm[]>([]);

  // Fetch story if editing
  const { data: story, isLoading } = useQuery({
    queryKey: ["admin-story", id],
    queryFn: async () => {
      if (!id) return null;
      const { data: storyData, error: storyError } = await supabase
        .from("web_stories")
        .select("*")
        .eq("id", id)
        .single();
      if (storyError) throw storyError;

      const { data: slidesData, error: slidesError } = await supabase
        .from("web_story_slides")
        .select("*")
        .eq("story_id", id)
        .order("sort_order");
      if (slidesError) throw slidesError;

      return { ...storyData, slides: slidesData };
    },
    enabled: isEditing,
  });

  // Populate form when editing
  useEffect(() => {
    if (story) {
      setFormData({
        title: story.title || "",
        slug: story.slug || "",
        cover_image_url: story.cover_image_url || "",
        status: story.status || "draft",
        meta_title: story.meta_title || "",
        meta_description: story.meta_description || "",
      });
      setSlides(
        story.slides?.map((s: any) => ({
          id: s.id,
          sort_order: s.sort_order,
          background_image_url: s.background_image_url || "",
          background_color: s.background_color || "#000000",
          content_html: s.content_html || "",
          duration_seconds: s.duration_seconds || 5,
          animation_type: s.animation_type || "fade",
          cta_text: s.cta_text || "",
          cta_url: s.cta_url || "",
        })) || []
      );
    }
  }, [story]);

  // Auto-generate slug
  useEffect(() => {
    if (!isEditing && formData.title && !formData.slug) {
      setFormData((prev) => ({ ...prev, slug: generateSlug(prev.title) }));
    }
  }, [formData.title, isEditing]);

  const addSlide = () => {
    setSlides((prev) => [
      ...prev,
      {
        sort_order: prev.length,
        background_image_url: "",
        background_color: "#000000",
        content_html: "",
        duration_seconds: 5,
        animation_type: "fade",
        cta_text: "",
        cta_url: "",
      },
    ]);
  };

  const removeSlide = (index: number) => {
    setSlides((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSlide = (index: number, updates: Partial<SlideForm>) => {
    setSlides((prev) =>
      prev.map((slide, i) => (i === index ? { ...slide, ...updates } : slide))
    );
  };

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const storyPayload = {
        ...formData,
        author_id: user?.id,
        published_at: formData.status === "published" ? new Date().toISOString() : null,
      };

      let storyId = id;

      if (isEditing) {
        const { error } = await supabase
          .from("web_stories")
          .update(storyPayload)
          .eq("id", id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("web_stories")
          .insert(storyPayload)
          .select()
          .single();
        if (error) throw error;
        storyId = data.id;
      }

      // Handle slides
      if (storyId) {
        // Delete existing slides if editing
        if (isEditing) {
          await supabase.from("web_story_slides").delete().eq("story_id", storyId);
        }

        // Insert new slides
        if (slides.length > 0) {
          const slidesPayload = slides.map((slide, index) => ({
            story_id: storyId,
            sort_order: index,
            background_image_url: slide.background_image_url || null,
            background_color: slide.background_color,
            content_html: slide.content_html || null,
            duration_seconds: slide.duration_seconds,
            animation_type: slide.animation_type,
            cta_text: slide.cta_text || null,
            cta_url: slide.cta_url || null,
          }));

          const { error } = await supabase.from("web_story_slides").insert(slidesPayload);
          if (error) throw error;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-stories"] });
      toast.success(isEditing ? "Story atualizada!" : "Story criada!");
      navigate("/admin/stories");
    },
    onError: (error) => {
      toast.error("Erro ao salvar: " + (error as Error).message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.slug) {
      toast.error("Título e slug são obrigatórios");
      return;
    }
    saveMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button type="button" variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold">
              {isEditing ? "Editar Story" : "Nova Story"}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {formData.slug && formData.status === "published" && (
            <Button type="button" variant="outline" asChild>
              <a href={`/stories/${formData.slug}`} target="_blank" rel="noreferrer">
                <Eye className="mr-2 h-4 w-4" />
                Visualizar
              </a>
            </Button>
          )}
          <Button type="submit" disabled={saveMutation.isPending}>
            <Save className="mr-2 h-4 w-4" />
            {saveMutation.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="cover">URL da Capa</Label>
                <Input
                  id="cover"
                  value={formData.cover_image_url}
                  onChange={(e) =>
                    setFormData({ ...formData, cover_image_url: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) =>
                    setFormData({ ...formData, status: v as typeof formData.status })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="published">Publicada</SelectItem>
                    <SelectItem value="archived">Arquivada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Slides */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Slides ({slides.length})</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addSlide}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Slide
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {slides.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                  Nenhum slide adicionado. Clique em "Adicionar Slide" para começar.
                </p>
              ) : (
                slides.map((slide, index) => (
                  <div
                    key={index}
                    className="rounded-lg border p-4 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Slide {index + 1}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => removeSlide(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label>Imagem de Fundo</Label>
                        <Input
                          value={slide.background_image_url}
                          onChange={(e) =>
                            updateSlide(index, { background_image_url: e.target.value })
                          }
                          placeholder="https://..."
                        />
                      </div>
                      <div>
                        <Label>Cor de Fundo</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={slide.background_color}
                            onChange={(e) =>
                              updateSlide(index, { background_color: e.target.value })
                            }
                            className="h-10 w-14 p-1"
                          />
                          <Input
                            value={slide.background_color}
                            onChange={(e) =>
                              updateSlide(index, { background_color: e.target.value })
                            }
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label>Conteúdo HTML</Label>
                      <Textarea
                        value={slide.content_html}
                        onChange={(e) =>
                          updateSlide(index, { content_html: e.target.value })
                        }
                        rows={3}
                        className="font-mono text-sm"
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <Label>Duração (seg)</Label>
                        <Input
                          type="number"
                          value={slide.duration_seconds}
                          onChange={(e) =>
                            updateSlide(index, {
                              duration_seconds: parseInt(e.target.value) || 5,
                            })
                          }
                          min={1}
                          max={30}
                        />
                      </div>
                      <div>
                        <Label>Animação</Label>
                        <Select
                          value={slide.animation_type}
                          onValueChange={(v) =>
                            updateSlide(index, { animation_type: v })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fade">Fade</SelectItem>
                            <SelectItem value="slide">Slide</SelectItem>
                            <SelectItem value="zoom">Zoom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label>Texto do CTA</Label>
                        <Input
                          value={slide.cta_text}
                          onChange={(e) =>
                            updateSlide(index, { cta_text: e.target.value })
                          }
                          placeholder="Saiba mais"
                        />
                      </div>
                      <div>
                        <Label>URL do CTA</Label>
                        <Input
                          value={slide.cta_url}
                          onChange={(e) =>
                            updateSlide(index, { cta_url: e.target.value })
                          }
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="relative mx-auto aspect-[9/16] w-full max-w-[200px] overflow-hidden rounded-2xl border-4 border-foreground/20"
                style={{
                  backgroundColor:
                    slides[0]?.background_color || "#000",
                }}
              >
                {slides[0]?.background_image_url && (
                  <img
                    src={slides[0].background_image_url}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
                <div className="absolute inset-x-0 bottom-8 p-4">
                  {slides[0]?.content_html && (
                    <div
                      className="text-center text-xs"
                      dangerouslySetInnerHTML={{ __html: slides[0].content_html }}
                    />
                  )}
                </div>
                {/* Progress bars */}
                <div className="absolute left-0 right-0 top-2 flex gap-1 px-2">
                  {slides.map((_, i) => (
                    <div
                      key={i}
                      className={`h-0.5 flex-1 rounded-full ${
                        i === 0 ? "bg-white" : "bg-white/40"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Mostrando slide 1 de {slides.length || 1}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
