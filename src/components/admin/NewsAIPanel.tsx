import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Sparkles, 
  FileText, 
  Target, 
  AlignLeft, 
  Tags, 
  Search,
  Newspaper,
  Loader2,
  Copy,
  Check
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

type AIAction = 
  | 'rewrite' 
  | 'optimize-title' 
  | 'generate-subtitle' 
  | 'summarize' 
  | 'suggest-tags' 
  | 'validate-seo'
  | 'format-conexao';

interface NewsAIPanelProps {
  content: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  onApplyTitle?: (title: string) => void;
  onApplySubtitle?: (subtitle: string) => void;
  onApplyContent?: (content: string) => void;
  onApplyTags?: (tags: string[]) => void;
  onApplyMetaTitle?: (metaTitle: string) => void;
  onApplyMetaDescription?: (metaDescription: string) => void;
}

interface AIButton {
  action: AIAction;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const aiButtons: AIButton[] = [
  { action: 'rewrite', label: 'Reescrever', icon: <FileText className="h-4 w-4" />, description: 'Texto jornalístico' },
  { action: 'optimize-title', label: 'Otimizar Título', icon: <Target className="h-4 w-4" />, description: 'SEO local' },
  { action: 'generate-subtitle', label: 'Gerar Subtítulo', icon: <AlignLeft className="h-4 w-4" />, description: 'Complementar' },
  { action: 'summarize', label: 'Resumir', icon: <FileText className="h-4 w-4" />, description: '2-3 frases' },
  { action: 'suggest-tags', label: 'Sugerir Tags', icon: <Tags className="h-4 w-4" />, description: '3-5 tags' },
  { action: 'validate-seo', label: 'Validar SEO', icon: <Search className="h-4 w-4" />, description: 'Meta dados' },
  { action: 'format-conexao', label: 'Formato Conexão', icon: <Newspaper className="h-4 w-4" />, description: 'Padronizar' },
];

export function NewsAIPanel({
  content,
  title,
  metaTitle,
  metaDescription,
  onApplyTitle,
  onApplySubtitle,
  onApplyContent,
  onApplyTags,
  onApplyMetaTitle,
  onApplyMetaDescription,
}: NewsAIPanelProps) {
  const [loading, setLoading] = useState<AIAction | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [resultAction, setResultAction] = useState<AIAction | null>(null);
  const [copied, setCopied] = useState(false);

  const handleAIAction = async (action: AIAction) => {
    if (!content && action !== 'validate-seo') {
      toast.error('Adicione conteúdo à notícia primeiro');
      return;
    }

    setLoading(action);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('news-ai', {
        body: { action, content, title, metaTitle, metaDescription }
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setResult(data.result);
      setResultAction(action);
      toast.success('Sugestão gerada com sucesso!');
    } catch (error) {
      console.error('AI error:', error);
      toast.error('Erro ao processar com IA');
    } finally {
      setLoading(null);
    }
  };

  const handleApply = () => {
    if (!result || !resultAction) return;

    switch (resultAction) {
      case 'optimize-title':
        onApplyTitle?.(result);
        break;
      case 'generate-subtitle':
        onApplySubtitle?.(result);
        break;
      case 'rewrite':
      case 'format-conexao':
        onApplyContent?.(result);
        break;
      case 'suggest-tags':
        try {
          const tags = JSON.parse(result);
          if (Array.isArray(tags)) {
            onApplyTags?.(tags);
          }
        } catch {
          toast.error('Erro ao processar tags');
        }
        break;
      case 'validate-seo':
        try {
          const seoData = JSON.parse(result);
          if (seoData.metaTitle?.suggestion) {
            onApplyMetaTitle?.(seoData.metaTitle.suggestion);
          }
          if (seoData.metaDescription?.suggestion) {
            onApplyMetaDescription?.(seoData.metaDescription.suggestion);
          }
        } catch {
          toast.error('Erro ao processar SEO');
        }
        break;
      case 'summarize':
        onApplyMetaDescription?.(result);
        break;
    }

    toast.success('Aplicado com sucesso!');
    setResult(null);
    setResultAction(null);
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Assistente de IA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {aiButtons.map((btn) => (
            <Button
              key={btn.action}
              variant="outline"
              size="sm"
              className="h-auto py-2 px-3 flex flex-col items-start gap-1"
              onClick={() => handleAIAction(btn.action)}
              disabled={loading !== null}
            >
              <div className="flex items-center gap-2 w-full">
                {loading === btn.action ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  btn.icon
                )}
                <span className="text-xs font-medium">{btn.label}</span>
              </div>
              <span className="text-[10px] text-muted-foreground">{btn.description}</span>
            </Button>
          ))}
        </div>

        {result && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-xs">
                Sugestão
              </Badge>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  onClick={handleCopy}
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
            </div>
            
            <Textarea
              value={result}
              readOnly
              className="text-xs min-h-[100px] bg-muted/50"
            />
            
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1"
                onClick={handleApply}
              >
                Aplicar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setResult(null)}
              >
                Descartar
              </Button>
            </div>
          </div>
        )}

        <p className="text-[10px] text-muted-foreground text-center">
          IA apenas sugere. Você decide e publica.
        </p>
      </CardContent>
    </Card>
  );
}
