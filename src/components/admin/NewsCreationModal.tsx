import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileEdit, Bot, Wand2, Link2, FileText, Sparkles, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNewsCreation } from '@/contexts/NewsCreationContext';

interface NewsCreationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = 'choice' | 'ai-input';
type AIInputType = 'url' | 'text' | 'topics';

export function NewsCreationModal({ open, onOpenChange }: NewsCreationModalProps) {
  const navigate = useNavigate();
  const { setPrefillData, setOrigin } = useNewsCreation();
  
  const [step, setStep] = useState<Step>('choice');
  const [aiInputType, setAIInputType] = useState<AIInputType>('url');
  const [aiInput, setAIInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleManualChoice = () => {
    setOrigin('manual');
    onOpenChange(false);
    navigate('/admin/news/new?origin=manual');
    resetState();
  };

  const handleAIChoice = () => {
    setStep('ai-input');
  };

  const resetState = () => {
    setStep('choice');
    setAIInputType('url');
    setAIInput('');
    setIsProcessing(false);
  };

  const handleBack = () => {
    setStep('choice');
  };

  const detectMode = (content: string, inputType: AIInputType) => {
    if (inputType === 'url') {
      const urls = content.split('\n').filter(line => line.trim().match(/^https?:\/\//));
      return urls.length > 1 ? 'batch' : 'url';
    }
    if (inputType === 'topics') return 'exclusiva';
    return 'manual';
  };

  const handleGenerate = async () => {
    if (!aiInput.trim()) {
      toast.error('Por favor, insira o conteúdo para gerar a notícia');
      return;
    }

    setIsProcessing(true);

    try {
      const mode = detectMode(aiInput, aiInputType);
      
      const response = await supabase.functions.invoke('noticias-ai-generate', {
        body: { mode, content: aiInput, autoFixLide: true },
      });

      if (response.error) throw response.error;
      const data = response.data;

      if (data.error) {
        throw new Error(data.error);
      }

      // Extract the generated data
      let generatedData = null;
      
      if (data.mode === 'exclusiva' || data.mode === 'manual') {
        generatedData = data.manual;
      } else if (data.json?.noticias?.[0]) {
        generatedData = data.json.noticias[0];
      }

      if (!generatedData) {
        throw new Error('Nenhum dado gerado pela IA');
      }

      // Set prefill data
      setPrefillData({
        title: generatedData.titulo || '',
        slug: generatedData.slug || '',
        excerpt: generatedData.resumo || '',
        content: generatedData.conteudo || '',
        category_name: generatedData.categoria || '',
        tags: generatedData.tags || [],
        featured_image_url: generatedData.imagem?.hero || '',
        image_alt: generatedData.imagem?.alt || '',
        image_credit: generatedData.imagem?.credito || '',
        meta_title: generatedData.seo?.meta_titulo || '',
        meta_description: generatedData.seo?.meta_descricao || '',
        source: generatedData.fonte || aiInput,
      });

      setOrigin('ai');
      onOpenChange(false);
      navigate('/admin/news/new?origin=ai');
      resetState();
      toast.success('Notícia gerada com sucesso! Revise e complete os campos.');
    } catch (error) {
      console.error('Error generating:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao processar. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) resetState(); }}>
      <DialogContent className="sm:max-w-[600px]">
        {step === 'choice' ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Nova Notícia</DialogTitle>
              <DialogDescription>
                Escolha como deseja criar sua notícia
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-6 sm:grid-cols-2">
              {/* Manual Option */}
              <Card 
                className="group cursor-pointer border-2 p-6 transition-all hover:border-primary hover:bg-primary/5"
                onClick={handleManualChoice}
              >
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="rounded-full bg-muted p-4 transition-colors group-hover:bg-primary/10">
                    <FileEdit className="h-8 w-8 text-muted-foreground transition-colors group-hover:text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Cadastro Manual</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Preencha todos os campos manualmente
                    </p>
                  </div>
                  <Badge variant="outline" className="mt-2">
                    Controle total
                  </Badge>
                </div>
              </Card>

              {/* AI Option */}
              <Card 
                className="group cursor-pointer border-2 p-6 transition-all hover:border-violet-500 hover:bg-violet-500/5"
                onClick={handleAIChoice}
              >
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="rounded-full bg-violet-100 p-4 transition-colors group-hover:bg-violet-200 dark:bg-violet-900/30 dark:group-hover:bg-violet-900/50">
                    <Bot className="h-8 w-8 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Notícias AI</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Gere automaticamente a partir de fontes
                    </p>
                  </div>
                  <Badge className="mt-2 bg-violet-600 hover:bg-violet-700">
                    <Sparkles className="mr-1 h-3 w-3" />
                    Inteligência Artificial
                  </Badge>
                </div>
              </Card>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
                <Bot className="h-6 w-6 text-violet-500" />
                Notícias AI
              </DialogTitle>
              <DialogDescription>
                Forneça ao menos uma fonte para gerar a notícia
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Input Type Selection */}
              <RadioGroup 
                value={aiInputType} 
                onValueChange={(v) => setAIInputType(v as AIInputType)}
                className="grid grid-cols-3 gap-4"
              >
                <Label
                  htmlFor="ai-url"
                  className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                    aiInputType === 'url' ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20' : 'border-muted hover:border-muted-foreground/50'
                  }`}
                >
                  <RadioGroupItem value="url" id="ai-url" className="sr-only" />
                  <Link2 className={`h-5 w-5 ${aiInputType === 'url' ? 'text-violet-600' : 'text-muted-foreground'}`} />
                  <span className="text-sm font-medium">URL da fonte</span>
                </Label>

                <Label
                  htmlFor="ai-text"
                  className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                    aiInputType === 'text' ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20' : 'border-muted hover:border-muted-foreground/50'
                  }`}
                >
                  <RadioGroupItem value="text" id="ai-text" className="sr-only" />
                  <FileText className={`h-5 w-5 ${aiInputType === 'text' ? 'text-violet-600' : 'text-muted-foreground'}`} />
                  <span className="text-sm font-medium">Texto bruto</span>
                </Label>

                <Label
                  htmlFor="ai-topics"
                  className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                    aiInputType === 'topics' ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20' : 'border-muted hover:border-muted-foreground/50'
                  }`}
                >
                  <RadioGroupItem value="topics" id="ai-topics" className="sr-only" />
                  <Wand2 className={`h-5 w-5 ${aiInputType === 'topics' ? 'text-violet-600' : 'text-muted-foreground'}`} />
                  <span className="text-sm font-medium">Tópicos</span>
                </Label>
              </RadioGroup>

              {/* Input Area */}
              <div className="space-y-2">
                <Label>
                  {aiInputType === 'url' && 'Cole a URL da notícia original (ou múltiplas URLs, uma por linha)'}
                  {aiInputType === 'text' && 'Cole o texto bruto da notícia'}
                  {aiInputType === 'topics' && 'Descreva os tópicos principais da notícia'}
                </Label>
                <Textarea
                  placeholder={
                    aiInputType === 'url' 
                      ? 'https://exemplo.com/noticia-original\nhttps://outra-fonte.com/noticia' 
                      : aiInputType === 'text'
                        ? 'Cole aqui o texto completo da notícia...'
                        : 'Ex: Prefeito anuncia novo programa de habitação popular para 5 mil famílias na zona norte...'
                  }
                  value={aiInput}
                  onChange={(e) => setAIInput(e.target.value)}
                  className="min-h-[160px] resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  {aiInputType === 'url' && 'Suporta múltiplas URLs para importação em lote'}
                  {aiInputType === 'text' && 'A IA irá estruturar e formatar o conteúdo'}
                  {aiInputType === 'topics' && 'A IA irá criar uma notícia exclusiva baseada nos tópicos'}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                  Voltar
                </Button>
                <Button 
                  onClick={handleGenerate} 
                  disabled={!aiInput.trim() || isProcessing}
                  className="flex-1 bg-violet-600 hover:bg-violet-700"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Gerar com IA
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
