import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Loader2, Calendar, Cloud, CloudOff, Search, Bot, FileEdit, Smartphone } from "lucide-react";
import { VOICES as PODCAST_VOICES, DEFAULT_VOICE_ID } from "@/constants/voices";
import { GenerateStoryButton } from "@/components/admin/GenerateStoryButton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNewsCreation, NewsOrigin } from "@/contexts/NewsCreationContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { NewsAIPanel } from "@/components/admin/NewsAIPanel";
import { SeoValidator } from "@/components/admin/SeoValidator";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { TagSelector } from "@/components/admin/TagSelector";
import { NewsPreview } from "@/components/admin/NewsPreview";
import { NewsValidationCard, validateNewsForm } from "@/components/admin/NewsValidationCard";
import { useRequireRole } from "@/hooks/useRequireRole";

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default function NewsEditor() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { prefillData, clearPrefillData, origin: contextOrigin } = useNewsCreation();
  const { userRole } = useRequireRole(["admin", "editor", "editor_chief", "reporter", "columnist", "collaborator"]);
  const isEditing = !!id;

  // Determine origin from URL or context
  const urlOrigin = searchParams.get('origin') as NewsOrigin | null;
  const origin: NewsOrigin = urlOrigin || contextOrigin || 'manual';

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    hat: "",
    slug: "",
    excerpt: "",
    content: "",
    source: "",
    featured_image_url: "",
    image_alt: "",
    image_credit: "",
    category_id: "",
    status: "published" as "draft" | "published" | "scheduled" | "archived" | "trash" | "review" | "approved",
    highlight: "none" as "none" | "home" | "urgent" | "featured",
    is_home_highlight: false,
    is_urgent: false,
    is_featured: false,
    is_blog: false,
    meta_title: "",
    meta_description: "",
    scheduled_at: "",
    is_indexable: true,
    auto_generate_podcast: true,
    auto_publish_podcast: true,
    podcast_voice_id: "onwK4e9ZLuTAKqWW03F9",
    auto_generate_webstory: true,
    editor_name: "",
  });

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Auto-save state
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasUnsavedChanges = useRef(false);
  const hasPrefilled = useRef(false);

  const { data: news, isLoading: loadingNews } = useQuery({
    queryKey: ["admin-news", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase.from("news").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
    enabled: isEditing,
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").eq("is_active", true).order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: newsTags = [] } = useQuery({
    queryKey: ["news-tags", id],
    queryFn: async () => {
      if (!id) return [];
      const { data } = await supabase.from("news_tags").select("tag_id").eq("news_id", id);
      return data?.map((t) => t.tag_id) || [];
    },
    enabled: isEditing,
  });

  // Prefill from AI generation
  useEffect(() => {
    if (!isEditing && prefillData && !hasPrefilled.current) {
      hasPrefilled.current = true;
      
      // Find category ID from name
      const categoryMatch = categories?.find(
        c => c.name.toLowerCase() === prefillData.category_name?.toLowerCase()
      );

      setFormData(prev => ({
        ...prev,
        title: prefillData.title || prev.title,
        slug: prefillData.slug || generateSlug(prefillData.title || ''),
        excerpt: prefillData.excerpt || prev.excerpt,
        content: prefillData.content || prev.content,
        featured_image_url: prefillData.featured_image_url || prev.featured_image_url,
        image_alt: prefillData.image_alt || prev.image_alt,
        image_credit: prefillData.image_credit || prev.image_credit,
        meta_title: prefillData.meta_title || prev.meta_title,
        meta_description: prefillData.meta_description || prev.meta_description,
        source: prefillData.source || prev.source,
        category_id: categoryMatch?.id || prev.category_id,
      }));

      // Handle tags - need to fetch or create them
      if (prefillData.tags?.length) {
        handlePrefillTags(prefillData.tags);
      }

      // Clear prefill data after using it
      clearPrefillData();
    }
  }, [prefillData, isEditing, categories, clearPrefillData]);

  const handlePrefillTags = async (tagNames: string[]) => {
    const tagIds: string[] = [];
    
    for (const tagName of tagNames.slice(0, 12)) {
      // Try to find existing tag
      let { data: existingTag } = await supabase
        .from('tags')
        .select('id')
        .ilike('name', tagName)
        .single();

      if (existingTag) {
        tagIds.push(existingTag.id);
      } else {
        // Create new tag
        const slug = tagName
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-');

        const { data: newTag } = await supabase
          .from('tags')
          .insert({ name: tagName, slug })
          .select()
          .single();

        if (newTag) {
          tagIds.push(newTag.id);
        }
      }
    }

    setSelectedTags(tagIds);
  };

  useEffect(() => {
    if (news) {
      setFormData({
        title: news.title || "",
        subtitle: news.subtitle || "",
        hat: news.hat || "",
        slug: news.slug || "",
        excerpt: news.excerpt || "",
        content: news.content || "",
        source: news.source || "",
        featured_image_url: news.featured_image_url || "",
        image_alt: news.image_alt || "",
        image_credit: news.image_credit || "",
        category_id: news.category_id || "",
        status: news.status || "published",
        highlight: news.highlight || "none",
        is_home_highlight: (news as any).is_home_highlight || false,
        is_urgent: (news as any).is_urgent || false,
        is_featured: (news as any).is_featured || false,
        meta_title: news.meta_title || "",
        meta_description: news.meta_description || "",
        scheduled_at: news.scheduled_at || "",
        is_indexable: news.is_indexable !== false,
        auto_generate_podcast: news.auto_generate_podcast ?? true,
        auto_publish_podcast: news.auto_publish_podcast ?? true,
        podcast_voice_id: (news as any).audio_voice_id || DEFAULT_VOICE_ID,
        auto_generate_webstory: (news as any).auto_generate_webstory ?? true,
        editor_name: news.editor_name || "",
      });
      setLastSaved(new Date(news.updated_at));
    }
  }, [news]);

  useEffect(() => {
    if (newsTags.length > 0) setSelectedTags(newsTags);
  }, [newsTags]);

  useEffect(() => {
    if (!isEditing && formData.title && !formData.slug) {
      setFormData((prev) => ({ ...prev, slug: generateSlug(prev.title) }));
    }
  }, [formData.title, isEditing]);

  // Validation
  const validation = useMemo(() => {
    return validateNewsForm({
      title: formData.title,
      excerpt: formData.excerpt,
      meta_title: formData.meta_title,
      meta_description: formData.meta_description,
      selectedTags,
      image_alt: formData.image_alt,
      category_id: formData.category_id,
      featured_image_url: formData.featured_image_url,
    });
  }, [formData, selectedTags]);

  const canSave = validation.valid;

  // Auto-save mutation
  const autoSaveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!id) return null;
      
      const { error } = await supabase
        .from("news")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
      
      if (error) throw error;
      return new Date();
    },
    onSuccess: (savedAt) => {
      if (savedAt) {
        setLastSaved(savedAt);
        hasUnsavedChanges.current = false;
      }
      setIsAutoSaving(false);
    },
    onError: () => {
      setIsAutoSaving(false);
    },
  });

  // Auto-save effect
  const triggerAutoSave = useCallback(() => {
    if (!isEditing || formData.status !== "draft" || !formData.title) return;
    
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    hasUnsavedChanges.current = true;
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      if (hasUnsavedChanges.current) {
        setIsAutoSaving(true);
        autoSaveMutation.mutate(formData);
      }
    }, 30000); // 30 segundos
  }, [formData, isEditing, autoSaveMutation]);

  useEffect(() => {
    if (isEditing && formData.status === "draft") {
      triggerAutoSave();
    }
    
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [formData, isEditing, triggerAutoSave]);

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        ...data,
        author_id: user?.id,
        origin: origin,
        published_at: data.status === "published" ? new Date().toISOString() : null,
      };

      if (isEditing) {
        const { data: updated, error } = await supabase.from("news").update(payload).eq("id", id).select().single();
        if (error) throw error;
        await supabase.from("news_tags").delete().eq("news_id", id);
        if (selectedTags.length > 0) {
          await supabase.from("news_tags").insert(selectedTags.map((tag_id) => ({ news_id: id!, tag_id })));
        }
        return updated;
      } else {
        const { data: created, error } = await supabase.from("news").insert(payload).select().single();
        if (error) throw error;
        if (selectedTags.length > 0) {
          await supabase.from("news_tags").insert(selectedTags.map((tag_id) => ({ news_id: created.id, tag_id })));
        }
        return created;
      }
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-news"] });
      toast.success(isEditing ? "Notícia atualizada!" : "Notícia criada!");
      setLastSaved(new Date());
      hasUnsavedChanges.current = false;
      
      // ============================================
      // AUTOMATIC GENERATION TRIGGERS (on publish)
      // ============================================
      if (data.status === "published") {
        const newsId = data.id;
        
        // 1. Generate AI Summary (always)
        supabase.functions.invoke('generate-news-summary', {
          body: { newsId }
        }).catch(err => console.error('[NewsEditor] Summary generation failed:', err));

        // 2. Generate TTS Audio (always)
        supabase.functions.invoke('generate-news-audio', {
          body: { newsId, audioType: 'full' }
        }).catch(err => console.error('[NewsEditor] Audio generation failed:', err));

        // 3. Generate WebStory (if enabled)
        if (data.auto_generate_webstory) {
          supabase.functions.invoke('generate-webstory', {
            body: { newsId }
          }).catch(err => console.error('[NewsEditor] WebStory generation failed:', err));
        }

        // 4. Generate Podcast (if enabled)
        if (data.auto_generate_podcast) {
          supabase.functions.invoke('generate-podcast', {
            body: { newsId, voiceId: formData.podcast_voice_id, autoPublish: data.auto_publish_podcast }
          }).catch(err => console.error('[NewsEditor] Podcast generation failed:', err));
        }

        console.log('[NewsEditor] Automated generation triggers fired for newsId:', newsId);
      }
      
      if (!isEditing) navigate(`/admin/news/${data.id}/edit`);
    },
    onError: (error) => toast.error("Erro ao salvar: " + (error as Error).message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canSave) {
      toast.error("Complete todas as validações obrigatórias antes de salvar");
      return;
    }

    if (!formData.title || !formData.slug) {
      toast.error("Título e slug são obrigatórios");
      return;
    }
    // Cancelar auto-save pendente
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    saveMutation.mutate(formData);
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    hasUnsavedChanges.current = true;
  };

  const canPublish = userRole === "admin" || userRole === "editor" || userRole === "editor_chief";

  if (loadingNews) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button type="button" variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl font-bold">{isEditing ? "Editar Notícia" : "Nova Notícia"}</h1>
            {/* Origin Badge */}
            {origin === 'ai' ? (
              <Badge className="bg-violet-600 hover:bg-violet-700" title="Método de entrada: IA">
                <Bot className="mr-1 h-3 w-3" />
                Entrada: IA
              </Badge>
            ) : (
              <Badge variant="outline" title="Método de entrada: Manual">
                <FileEdit className="mr-1 h-3 w-3" />
                Entrada: Manual
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Auto-save indicator */}
          {isEditing && formData.status === "draft" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {isAutoSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : lastSaved ? (
                <>
                  <Cloud className="h-4 w-4 text-green-500" />
                  <span>Salvo às {lastSaved.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                </>
              ) : hasUnsavedChanges.current ? (
                <>
                  <CloudOff className="h-4 w-4 text-yellow-500" />
                  <span>Alterações não salvas</span>
                </>
              ) : null}
            </div>
          )}
          
          <NewsPreview
            title={formData.title}
            subtitle={formData.subtitle}
            hat={formData.hat}
            content={formData.content}
            excerpt={formData.excerpt}
            featuredImageUrl={formData.featured_image_url}
            imageAlt={formData.image_alt}
            imageCredit={formData.image_credit}
            categoryName={categories?.find((c) => c.id === formData.category_id)?.name}
            categoryColor={categories?.find((c) => c.id === formData.category_id)?.color}
          />
          <Button type="submit" disabled={saveMutation.isPending || !canSave}>
            {saveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Salvar
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Conteúdo</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>
                  Chapéu 
                  <span className={`text-xs ml-2 ${formData.hat.length <= 19 ? 'text-muted-foreground' : 'text-destructive'}`}>
                    ({formData.hat.length}/19)
                  </span>
                </Label>
                <Input 
                  value={formData.hat} 
                  onChange={(e) => updateField("hat", e.target.value.slice(0, 19).toUpperCase())} 
                  placeholder="Ex: POLÍTICA" 
                  maxLength={19}
                  className="uppercase"
                />
                <p className="text-xs text-muted-foreground mt-1">Categoria editorial em maiúsculas</p>
              </div>
              <div>
                <Label>
                  Título * 
                  <span className={`text-xs ml-2 ${formData.title.length >= 6 && formData.title.length <= 120 ? 'text-green-600' : 'text-destructive'}`}>
                    ({formData.title.length}/120, mín. 6)
                  </span>
                </Label>
                <Input value={formData.title} onChange={(e) => updateField("title", e.target.value)} placeholder="Título da notícia" required />
              </div>
              <div>
                <Label>Subtítulo</Label>
                <Input value={formData.subtitle} onChange={(e) => updateField("subtitle", e.target.value)} placeholder="Linha de apoio" />
              </div>
              <div>
                <Label>Slug *</Label>
                <Input value={formData.slug} onChange={(e) => updateField("slug", e.target.value)} placeholder="url-da-noticia" required />
              </div>
              <div>
                <Label>Conteúdo</Label>
                <RichTextEditor content={formData.content} onChange={(c) => updateField("content", c)} />
              </div>
              <div>
                <Label>
                  Resumo / Lead *
                  <span className={`text-xs ml-2 ${formData.excerpt.length > 0 && formData.excerpt.length <= 160 ? 'text-green-600' : 'text-destructive'}`}>
                    ({formData.excerpt.length}/160)
                  </span>
                </Label>
                <Input 
                  value={formData.excerpt} 
                  onChange={(e) => updateField("excerpt", e.target.value.slice(0, 160))} 
                  placeholder="Breve resumo (máx. 160 caracteres)"
                  maxLength={160}
                />
              </div>
              <div>
                <Label>Fonte</Label>
                <Input value={formData.source} onChange={(e) => updateField("source", e.target.value)} placeholder="Origem da informação" />
              </div>
              <div>
                <Label>Editor / Revisão</Label>
                <Input 
                  value={formData.editor_name} 
                  onChange={(e) => updateField("editor_name", e.target.value)} 
                  placeholder="Nome do editor responsável pela revisão" 
                />
                <p className="text-xs text-muted-foreground mt-1">Será exibido no rodapé da notícia como "Edição:"</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Imagem *</CardTitle></CardHeader>
            <CardContent>
              <ImageUploader
                value={formData.featured_image_url}
                onChange={(url) => updateField("featured_image_url", url)}
                alt={formData.image_alt}
                onAltChange={(alt) => updateField("image_alt", alt)}
                credit={formData.image_credit}
                onCreditChange={(c) => updateField("image_credit", c)}
              />
              {!formData.image_alt && formData.featured_image_url && (
                <p className="text-xs text-destructive mt-2">⚠️ Texto alternativo (ALT) é obrigatório</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>SEO *</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>
                  Meta Título *
                  <span className={`text-xs ml-2 ${formData.meta_title.length > 0 && formData.meta_title.length <= 60 ? 'text-green-600' : 'text-destructive'}`}>
                    ({formData.meta_title.length}/60)
                  </span>
                </Label>
                <Input 
                  value={formData.meta_title} 
                  onChange={(e) => updateField("meta_title", e.target.value.slice(0, 60))} 
                  maxLength={60}
                  placeholder="Título para mecanismos de busca"
                />
              </div>
              <div>
                <Label>
                  Meta Descrição *
                  <span className={`text-xs ml-2 ${formData.meta_description.length > 0 && formData.meta_description.length <= 160 ? 'text-green-600' : 'text-destructive'}`}>
                    ({formData.meta_description.length}/160)
                  </span>
                </Label>
                <Input 
                  value={formData.meta_description} 
                  onChange={(e) => updateField("meta_description", e.target.value.slice(0, 160))} 
                  maxLength={160}
                  placeholder="Descrição para resultados de busca"
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/30">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label className="cursor-pointer">Permitir indexação</Label>
                    <p className="text-xs text-muted-foreground">
                      Permitir que buscadores indexem esta notícia
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formData.is_indexable}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_indexable: checked }))}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Validation Card - Most important */}
          <NewsValidationCard
            title={formData.title}
            excerpt={formData.excerpt}
            metaTitle={formData.meta_title}
            metaDescription={formData.meta_description}
            selectedTags={selectedTags}
            imageAlt={formData.image_alt}
            categoryId={formData.category_id}
            featuredImageUrl={formData.featured_image_url}
          />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Publicação
                {formData.status === "draft" && (
                  <Badge variant="outline" className="font-normal">
                    Auto-save ativo
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => updateField("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="review">Em Revisão</SelectItem>
                    {canPublish && <SelectItem value="approved">Aprovado</SelectItem>}
                    <SelectItem value="scheduled">Agendado</SelectItem>
                    {canPublish && <SelectItem value="published">Publicado</SelectItem>}
                    <SelectItem value="archived">Arquivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.status === "scheduled" && (
                <div>
                  <Label className="flex items-center gap-2"><Calendar className="h-4 w-4" />Agendar para</Label>
                  <Input type="datetime-local" value={formData.scheduled_at?.slice(0, 16) || ""} onChange={(e) => updateField("scheduled_at", e.target.value ? new Date(e.target.value).toISOString() : "")} />
                </div>
              )}
              {/* Destaques Individuais */}
              <div className="pt-4 border-t space-y-3">
                <p className="text-sm font-medium">⭐ Destaques</p>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">Home</Label>
                    <p className="text-xs text-muted-foreground">Exibir na página inicial</p>
                  </div>
                  <Switch
                    checked={formData.is_home_highlight}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_home_highlight: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">Urgente</Label>
                    <p className="text-xs text-muted-foreground">Marcar como notícia urgente</p>
                  </div>
                  <Switch
                    checked={formData.is_urgent}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_urgent: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">Manchete</Label>
                    <p className="text-xs text-muted-foreground">Destaque principal do dia</p>
                  </div>
                  <Switch
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
                  />
                </div>
              </div>
              <div>
                <Label>Categoria *</Label>
                <Select value={formData.category_id} onValueChange={(v) => updateField("category_id", v)}>
                  <SelectTrigger className={!formData.category_id ? "border-destructive" : ""}>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <TagSelector selectedTags={selectedTags} onChange={setSelectedTags} requiredCount={12} />

              {/* 🤖 Automações Section */}
              <div className="pt-4 border-t space-y-3">
                <p className="text-sm font-medium flex items-center gap-2">
                  🤖 Automações
                  <span className="text-xs font-normal text-muted-foreground">(ao publicar)</span>
                </p>
                
                {/* Gerar resumo */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">Gerar resumo da notícia</Label>
                    <p className="text-xs text-muted-foreground">Resumo com até 4 tópicos via IA</p>
                  </div>
                  <Switch
                    checked={true}
                    disabled
                    className="opacity-70"
                  />
                </div>

                {/* Gerar áudio */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">Gerar áudio da matéria</Label>
                    <p className="text-xs text-muted-foreground">Versão narrada pelo TTS</p>
                  </div>
                  <Switch
                    checked={true}
                    disabled
                    className="opacity-70"
                  />
                </div>

                {/* Podcast */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm">Publicar no Podcast/RSS</Label>
                      <p className="text-xs text-muted-foreground">Disponibiliza nas plataformas</p>
                    </div>
                    <Switch
                      checked={formData.auto_generate_podcast && formData.auto_publish_podcast}
                      onCheckedChange={(checked) => setFormData(prev => ({ 
                        ...prev, 
                        auto_generate_podcast: checked,
                        auto_publish_podcast: checked 
                      }))}
                    />
                  </div>
                  {formData.auto_generate_podcast && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Locutor(a)</Label>
                      <Select
                        value={formData.podcast_voice_id}
                        onValueChange={(val) => setFormData(prev => ({ ...prev, podcast_voice_id: val }))}
                      >
                        <SelectTrigger className="h-8 text-xs mt-1">
                          <SelectValue placeholder="Escolha a voz" />
                        </SelectTrigger>
                        <SelectContent>
                          {PODCAST_VOICES.map((v) => (
                            <SelectItem key={v.id} value={v.id}>
                              <span className="font-medium">{v.name}</span>
                              <span className="text-muted-foreground ml-1 text-xs">({v.gender})</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* WebStory */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">Gerar WebStory</Label>
                    <p className="text-xs text-muted-foreground">Story de 5 slides automático</p>
                  </div>
                  <Switch
                    checked={formData.auto_generate_webstory}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, auto_generate_webstory: checked }))}
                  />
                </div>

                {isEditing && id && (
                  <GenerateStoryButton
                    newsId={id}
                    newsTitle={formData.title}
                    newsSummary={formData.excerpt}
                    newsImage={formData.featured_image_url}
                    newsSlug={formData.slug}
                    newsCategory={categories?.find(c => c.id === formData.category_id)?.name}
                    disabled={!formData.title || !formData.slug}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          <SeoValidator 
            title={formData.title} 
            metaTitle={formData.meta_title} 
            metaDescription={formData.meta_description} 
            hat={formData.hat} 
            featuredImageUrl={formData.featured_image_url} 
            imageAlt={formData.image_alt} 
            slug={formData.slug}
            selectedTags={selectedTags}
            excerpt={formData.excerpt}
          />

          <NewsAIPanel
            content={formData.content}
            title={formData.title}
            metaTitle={formData.meta_title}
            metaDescription={formData.meta_description}
            onApplyTitle={(t) => updateField("title", t)}
            onApplySubtitle={(s) => updateField("subtitle", s)}
            onApplyContent={(c) => updateField("content", c)}
            onApplyMetaTitle={(m) => updateField("meta_title", m)}
            onApplyMetaDescription={(m) => updateField("meta_description", m)}
          />
        </div>
      </div>
    </form>
  );
}
