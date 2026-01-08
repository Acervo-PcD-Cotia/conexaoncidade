import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Code, History, BarChart3, Globe, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNoticiasAIProgress } from '@/hooks/useNoticiasAIProgress';

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

type DetectedMode = 'exclusiva' | 'manual' | 'json' | 'url' | 'batch' | 'auto';

interface ManualData {
  titulo: string;
  slug: string;
  resumo: string;
  conteudo: string;
  categoria: string;
  tags?: string[];
  imagem: { hero: string; alt: string; credito: string };
  seo: { meta_titulo: string; meta_descricao: string };
  fonte?: string;
}

interface JsonData {
  noticias: Array<ManualData>;
}

export default function NoticiasAI() {
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

  const handleImport = async () => {
    if (!jsonData?.noticias?.length || !user) return;

    setIsImporting(true);
    try {
      let successCount = 0;
      
      for (const article of jsonData.noticias) {
        // Get category ID
        const { data: category } = await supabase
          .from('categories')
          .select('id')
          .ilike('name', article.categoria)
          .single();

        // Insert news
        const { data: news, error: newsError } = await supabase
          .from('news')
          .insert({
            title: article.titulo,
            slug: article.slug,
            excerpt: article.resumo,
            content: article.conteudo,
            category_id: category?.id || null,
            featured_image_url: article.imagem?.hero,
            image_alt: article.imagem?.alt,
            image_credit: article.imagem?.credito,
            meta_title: article.seo?.meta_titulo,
            meta_description: article.seo?.meta_descricao,
            source: article.fonte,
            author_id: user.id,
            status: 'published',
            published_at: new Date().toISOString(),
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
            import_type: jsonData.noticias.length > 1 ? 'batch' : 'individual',
            status: 'error',
            error_message: newsError.message,
          });
          continue;
        }

        // Log success
        await supabase.from('noticias_ai_imports').insert({
          user_id: user.id,
          title: article.titulo,
          source_url: article.fonte,
          source_name: article.fonte ? new URL(article.fonte).hostname.replace('www.', '') : null,
          import_type: jsonData.noticias.length > 1 ? 'batch' : 'json',
          status: 'success',
          format_corrected: autoFixEnabled,
          news_id: news.id,
        });

        // Insert tags if any
        if (article.tags?.length && news) {
          for (const tagName of article.tags.slice(0, 12)) {
            // Find or create tag
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

        successCount++;
      }

      // Update progress
      await incrementImports(successCount);
      
      if (!progress?.completed_milestones.includes('first_import')) {
        await completeMilestone('first_import');
      }

      toast({
        title: 'Importação concluída!',
        description: `${successCount} de ${jsonData.noticias.length} artigos importados.`,
      });

      // Clear JSON data after successful import
      setJsonData(null);
    } catch (error) {
      console.error('Error importing:', error);
      toast({
        title: 'Erro na importação',
        description: 'Alguns artigos podem não ter sido importados.',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
    }
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
      </div>
    </div>
  );
}
