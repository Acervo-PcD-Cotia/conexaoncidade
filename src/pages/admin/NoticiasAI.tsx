import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FileText, Code, History, BarChart3, Globe, Clock, PlusCircle, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNoticiasAIProgress } from '@/hooks/useNoticiasAIProgress';
import { Card } from '@/components/ui/card';

import { NoticiasAIHeader } from '@/components/admin/noticias-ai/NoticiasAIHeader';
import { NoticiasAIInput } from '@/components/admin/noticias-ai/NoticiasAIInput';
import { NoticiasAIManualTab } from '@/components/admin/noticias-ai/NoticiasAIManualTab';
import { NoticiasAIJsonTab } from '@/components/admin/noticias-ai/NoticiasAIJsonTab';
import { NoticiasAIHistoryTab } from '@/components/admin/noticias-ai/NoticiasAIHistoryTab';
import { NoticiasAIStatsTab } from '@/components/admin/noticias-ai/NoticiasAIStatsTab';
import { NoticiasAISourcesTab } from '@/components/admin/noticias-ai/NoticiasAISourcesTab';
import { NoticiasAISchedulesTab } from '@/components/admin/noticias-ai/NoticiasAISchedulesTab';
import { NoticiasAIProgress } from '@/components/admin/noticias-ai/NoticiasAIProgress';
import { NoticiasAITips } from '@/components/admin/noticias-ai/NoticiasAITips';
import { NoticiasAITutorial } from '@/components/admin/noticias-ai/NoticiasAITutorial';
import { DuplicateWarningDialog } from '@/components/admin/noticias-ai/DuplicateWarningDialog';

type DetectedMode = 'exclusiva' | 'manual' | 'json' | 'url' | 'batch' | 'auto';

interface ManualData {
  titulo: string;
  slug: string;
  resumo: string;
  conteudo: string;
  categoria: string;
  tags?: string[];
  imagem: { 
    hero: string; 
    og?: string;      // Imagem OG/Social 1200x630
    card?: string;    // Imagem Card 800x450
    alt: string; 
    credito: string;
    galeria?: string[];  // Imagens adicionais da galeria
  };
  seo: { meta_titulo: string; meta_descricao: string };
  fonte?: string;
  subtitulo?: string;     // Linha fina
  chapeu?: string;        // Categoria em maiúsculas
  editor?: string;        // Nome do editor
  destaque?: 'none' | 'home' | 'featured' | 'urgent';
}

interface JsonData {
  noticias: Array<ManualData>;
}

export default function NoticiasAI() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    progress,
    loading: progressLoading,
    completeMilestone,
    incrementImports,
    getNextMilestones,
    getProgressPercentage,
    canAccessFeature,
  } = useNoticiasAIProgress();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [activeTab, setActiveTab] = useState('manual');
  const [manualData, setManualData] = useState<ManualData | null>(null);
  const [jsonData, setJsonData] = useState<JsonData | null>(null);
  const [hasLideBold, setHasLideBold] = useState(true);
  const [autoFixEnabled, setAutoFixEnabled] = useState(true);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  
  // Duplicate detection state
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [currentDuplicate, setCurrentDuplicate] = useState<{
    articleTitle: string;
    matchType: 'slug' | 'source_url' | 'title_similarity';
    existingId: string;
    existingTitle?: string;
    articleIndex: number;
  } | null>(null);
  const [importQueue, setImportQueue] = useState<ManualData[]>([]);
  const [currentImportIndex, setCurrentImportIndex] = useState(0);

  // Track first visit
  useEffect(() => {
    if (progress && !progress.completed_milestones.includes('first_visit')) {
      completeMilestone('first_visit');
    }
  }, [progress, completeMilestone]);

  const handleGenerate = async (content: string, mode: DetectedMode, imageUrl?: string) => {
    setIsProcessing(true);
    try {
      const response = await supabase.functions.invoke('noticias-ai-generate', {
        body: { mode, content, imageUrl, autoFixLide: autoFixEnabled },
      });

      if (response.error) throw response.error;
      const data = response.data;

      if (data.error) {
        throw new Error(data.error);
      }

      // Update state based on mode
      if (data.mode === 'exclusiva' || data.mode === 'manual') {
        setManualData(data.manual);
        setActiveTab('manual');
        completeMilestone(mode === 'exclusiva' ? 'first_exclusiva' : 'first_text');
      } else if (data.mode === 'json' || data.mode === 'url' || data.mode === 'batch' || data.mode === 'auto') {
        setJsonData(data.json);
        setHasLideBold(data.hasLideBold !== false);
        setActiveTab('json');
        
        if (mode === 'url') completeMilestone('first_link');
        else if (mode === 'batch') completeMilestone('first_batch');
        else if (mode === 'json') completeMilestone('first_json');
      }

      toast({ title: 'Conteúdo processado com sucesso!' });
    } catch (error) {
      console.error('Error generating:', error);
      toast({
        title: 'Erro ao processar',
        description: error instanceof Error ? error.message : 'Tente novamente',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Check for duplicates before import
  const checkDuplicate = async (article: ManualData): Promise<{ isDuplicate: boolean; existingId?: string; matchType?: string; existingTitle?: string }> => {
    try {
      const { data, error } = await supabase.rpc('check_duplicate_news', {
        p_slug: article.slug,
        p_source_url: article.fonte || '',
        p_title: article.titulo,
      });
      
      if (error) {
        console.error('Error checking duplicate:', error);
        return { isDuplicate: false };
      }
      
      if (data && data.length > 0 && data[0].is_duplicate) {
        // Fetch existing article title
        const { data: existingNews } = await supabase
          .from('news')
          .select('title')
          .eq('id', data[0].existing_id)
          .single();
        
        return {
          isDuplicate: true,
          existingId: data[0].existing_id,
          matchType: data[0].match_type,
          existingTitle: existingNews?.title,
        };
      }
      
      return { isDuplicate: false };
    } catch (err) {
      console.error('Duplicate check error:', err);
      return { isDuplicate: false };
    }
  };

  // Helper: Check if string is an image URL
  const isImageUrl = (url?: string): boolean => {
    if (!url) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
    return imageExtensions.some(ext => url.toLowerCase().includes(ext));
  };

  // Helper: Sanitize source - remove image URLs
  const sanitizeSource = (source?: string): string | null => {
    if (!source) return null;
    if (isImageUrl(source)) return null;
    return source;
  };

  // Import single article
  const importArticle = async (article: ManualData): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Get category ID
      const { data: category } = await supabase
        .from('categories')
        .select('id')
        .ilike('name', article.categoria)
        .single();

      // Fallbacks for required fields
      const subtitle = article.subtitulo || article.resumo?.substring(0, 100) || null;
      const editorName = article.editor || 'Redação Conexão na Cidade';
      const chapeu = article.chapeu || article.categoria?.toUpperCase() || null;
      const sanitizedSource = sanitizeSource(article.fonte);

      // Insert news with extended fields, fallbacks and gallery
      const { data: news, error: newsError } = await supabase
        .from('news')
        .insert({
          title: article.titulo,
          slug: article.slug,
          subtitle: subtitle,
          hat: chapeu,
          excerpt: article.resumo,
          content: article.conteudo,
          category_id: category?.id || null,
          featured_image_url: article.imagem?.hero,
          og_image_url: article.imagem?.og || article.imagem?.hero || null,
          card_image_url: article.imagem?.card || article.imagem?.hero || null,
          image_alt: article.imagem?.alt,
          image_credit: article.imagem?.credito,
          meta_title: article.seo?.meta_titulo,
          meta_description: article.seo?.meta_descricao,
          source: sanitizedSource,
          author_id: user.id,
          editor_name: editorName,
          highlight: article.destaque || 'none',
          status: 'published',
          published_at: new Date().toISOString(),
          origin: 'ai',
          gallery_urls: article.imagem?.galeria || [],
        })
        .select()
        .single();

      if (newsError) {
        console.error('Error importing article:', newsError);
        
        // Log error
        await supabase.from('noticias_ai_imports').insert({
          user_id: user.id,
          title: article.titulo,
          source_url: article.fonte,
          source_name: article.fonte ? new URL(article.fonte).hostname.replace('www.', '') : null,
          import_type: 'individual',
          status: 'error',
          error_message: newsError.message,
        });
        return false;
      }

      // Log success
      await supabase.from('noticias_ai_imports').insert({
        user_id: user.id,
        title: article.titulo,
        source_url: article.fonte,
        source_name: article.fonte ? new URL(article.fonte).hostname.replace('www.', '') : null,
        import_type: importQueue.length > 1 ? 'batch' : 'json',
        status: 'success',
        format_corrected: autoFixEnabled,
        news_id: news.id,
      });

      // Insert tags if any
      if (article.tags?.length && news) {
        for (const tagName of article.tags.slice(0, 12)) {
          let { data: tag } = await supabase
            .from('tags')
            .select('id')
            .ilike('name', tagName)
            .single();

          if (!tag) {
            const slug = tagName.toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/[^a-z0-9\s-]/g, '')
              .replace(/\s+/g, '-');

            const { data: newTag } = await supabase
              .from('tags')
              .insert({ name: tagName, slug })
              .select()
              .single();
            
            tag = newTag;
          }

          if (tag) {
            await supabase
              .from('news_tags')
              .insert({ news_id: news.id, tag_id: tag.id })
              .maybeSingle();
          }
        }
      }

      return true;
    } catch (err) {
      console.error('Import error:', err);
      return false;
    }
  };

  // Process import queue - accepts articles directly to avoid race condition
  const processImportQueue = async (
    startIndex: number = 0, 
    skipDuplicateCheck: boolean = false,
    articles?: ManualData[] // Pass articles directly to avoid state race condition
  ) => {
    const queue = articles || importQueue;
    
    if (!queue.length) {
      console.warn('processImportQueue: queue is empty');
      setIsImporting(false);
      return;
    }
    
    console.log(`Iniciando importação de ${queue.length} artigos a partir do índice ${startIndex}`);
    setIsImporting(true);
    let successCount = 0;
    
    for (let i = startIndex; i < queue.length; i++) {
      const article = queue[i];
      console.log(`Processando artigo ${i + 1}/${queue.length}: ${article.titulo}`);
      
      // Check for duplicates unless skipping
      if (!skipDuplicateCheck) {
        const duplicateResult = await checkDuplicate(article);
        
        if (duplicateResult.isDuplicate) {
          // Pause and show dialog
          setCurrentImportIndex(i);
          setCurrentDuplicate({
            articleTitle: article.titulo,
            matchType: duplicateResult.matchType as 'slug' | 'source_url' | 'title_similarity',
            existingId: duplicateResult.existingId!,
            existingTitle: duplicateResult.existingTitle,
            articleIndex: i,
          });
          setDuplicateDialogOpen(true);
          return; // Stop processing, will resume after user decision
        }
      }
      
      const success = await importArticle(article);
      if (success) {
        successCount++;
        console.log(`Artigo importado com sucesso: ${article.titulo}`);
      } else {
        console.error(`Falha ao importar: ${article.titulo}`);
      }
    }
    
    // All done
    await incrementImports(successCount);
    
    if (!progress?.completed_milestones.includes('first_import')) {
      await completeMilestone('first_import');
    }
    
    console.log(`Importação concluída: ${successCount}/${queue.length} artigos`);
    
    toast({
      title: 'Importação concluída!',
      description: `${successCount} de ${queue.length} artigos importados.`,
    });
    
    setJsonData(null);
    setImportQueue([]);
    setCurrentImportIndex(0);
    setIsImporting(false);
  };

  const handleImport = async () => {
    if (!jsonData?.noticias?.length || !user) {
      console.warn('handleImport: nenhuma notícia para importar ou usuário não autenticado');
      return;
    }
    
    const articles = jsonData.noticias;
    console.log(`handleImport: iniciando importação de ${articles.length} artigos`);
    
    // Set state for UI tracking
    setImportQueue(articles);
    setCurrentImportIndex(0);
    
    // Pass articles directly to avoid race condition with setState
    await processImportQueue(0, false, articles);
  };

  const handleSkipDuplicate = () => {
    setDuplicateDialogOpen(false);
    // Continue with next item, passing importQueue to avoid race condition
    processImportQueue(currentImportIndex + 1, false, importQueue);
  };

  const handleImportAnyway = async () => {
    setDuplicateDialogOpen(false);
    // Import this one (skip duplicate check) then continue
    const article = importQueue[currentImportIndex];
    await importArticle(article);
    processImportQueue(currentImportIndex + 1, false, importQueue);
  };

  const handleImageUpload = () => {
    if (!progress?.completed_milestones.includes('first_image')) {
      completeMilestone('first_image');
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    if (tab === 'history' && !progress?.completed_milestones.includes('viewed_history')) {
      completeMilestone('viewed_history');
    }
    if (tab === 'stats' && !progress?.completed_milestones.includes('viewed_stats')) {
      completeMilestone('viewed_stats');
    }
  };

  const handleStartTour = () => {
    // For now, just open the tutorial
    setTutorialOpen(true);
  };

  if (progressLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-100/20 via-background to-background">
      <div className="container max-w-7xl space-y-6 p-6">
        {/* Header */}
        <NoticiasAIHeader
          level={progress?.level || 'beginner'}
          points={progress?.points || 0}
          progressPercentage={getProgressPercentage()}
          onStartTour={handleStartTour}
          onOpenTutorial={() => setTutorialOpen(true)}
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Quick Create Card */}
            <Card className="border-dashed border-2 border-violet-200 bg-gradient-to-r from-violet-50/50 to-purple-50/50 p-4 dark:border-violet-800 dark:from-violet-900/10 dark:to-purple-900/10">
              <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <div className="flex items-center gap-3">
                  <PlusCircle className="h-5 w-5 text-violet-600" />
                  <div>
                    <p className="font-medium text-sm">Criar notícia individual?</p>
                    <p className="text-xs text-muted-foreground">Use o fluxo unificado com todas as validações</p>
                  </div>
                </div>
                <Button 
                  onClick={() => navigate('/admin/news')}
                  variant="outline" 
                  size="sm"
                  className="border-violet-300 text-violet-600 hover:bg-violet-50 dark:border-violet-700 dark:hover:bg-violet-900/20"
                >
                  Ir para Notícias
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>
            
            {/* Input Card */}
            <NoticiasAIInput
              onGenerate={handleGenerate}
              isProcessing={isProcessing}
              onImageUpload={handleImageUpload}
              canUseBatch={canAccessFeature('batch')}
            />

            {/* Result Tabs */}
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="manual" className="gap-1">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Manual</span>
                </TabsTrigger>
                <TabsTrigger value="json" className="gap-1">
                  <Code className="h-4 w-4" />
                  <span className="hidden sm:inline">JSON</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="gap-1">
                  <History className="h-4 w-4" />
                  <span className="hidden sm:inline">Histórico</span>
                </TabsTrigger>
                <TabsTrigger value="stats" className="gap-1">
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Stats</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="sources" 
                  className="gap-1"
                  disabled={!canAccessFeature('sources')}
                >
                  <Globe className="h-4 w-4" />
                  <span className="hidden sm:inline">Fontes</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="schedules" 
                  className="gap-1"
                  disabled={!canAccessFeature('schedules')}
                >
                  <Clock className="h-4 w-4" />
                  <span className="hidden sm:inline">Agenda</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="manual" className="mt-4">
                <NoticiasAIManualTab data={manualData} />
              </TabsContent>

              <TabsContent value="json" className="mt-4">
                <NoticiasAIJsonTab
                  data={jsonData}
                  hasLideBold={hasLideBold}
                  autoFixEnabled={autoFixEnabled}
                  onAutoFixChange={setAutoFixEnabled}
                  onImport={handleImport}
                  isImporting={isImporting}
                />
              </TabsContent>

              <TabsContent value="history" className="mt-4">
                <NoticiasAIHistoryTab />
              </TabsContent>

              <TabsContent value="stats" className="mt-4">
                <NoticiasAIStatsTab />
              </TabsContent>

              <TabsContent value="sources" className="mt-4">
                <NoticiasAISourcesTab />
              </TabsContent>

              <TabsContent value="schedules" className="mt-4">
                <NoticiasAISchedulesTab />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <NoticiasAIProgress
              nextMilestones={getNextMilestones()}
              completedMilestones={progress?.completed_milestones || []}
              progressPercentage={getProgressPercentage()}
            />
            <NoticiasAITips onOpenTutorial={() => setTutorialOpen(true)} />
          </div>
        </div>

        {/* Tutorial Dialog */}
        <NoticiasAITutorial open={tutorialOpen} onOpenChange={setTutorialOpen} />
        
        {/* Duplicate Warning Dialog */}
        <DuplicateWarningDialog
          open={duplicateDialogOpen}
          onOpenChange={setDuplicateDialogOpen}
          duplicate={currentDuplicate}
          onSkip={handleSkipDuplicate}
          onImportAnyway={handleImportAnyway}
          isLoading={isImporting}
        />
      </div>
    </div>
  );
}
