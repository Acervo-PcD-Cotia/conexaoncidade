import { useState, useRef } from 'react';
import { Upload, Sparkles, Trash2, Loader2, AlertCircle, FileText, Link, Layers, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type DetectedMode = 'exclusiva' | 'manual' | 'json' | 'url' | 'batch' | 'auto';

interface NoticiasAIInputProps {
  onGenerate: (content: string, mode: DetectedMode, imageUrl?: string) => Promise<void>;
  isProcessing: boolean;
  onImageUpload?: () => void;
  canUseBatch: boolean;
}

const MODE_CONFIG: Record<DetectedMode, { label: string; color: string; icon: React.ElementType; description: string }> = {
  exclusiva: { label: 'EXCLUSIVA', color: 'bg-red-500 text-white', icon: Zap, description: 'Preserva texto original' },
  manual: { label: 'CADASTRO MANUAL', color: 'bg-blue-500 text-white', icon: FileText, description: 'Campos para copiar' },
  json: { label: 'JSON', color: 'bg-emerald-500 text-white', icon: FileText, description: 'Importação automática' },
  url: { label: 'LINK', color: 'bg-gray-500 text-white', icon: Link, description: 'Extrai de URL' },
  batch: { label: 'LOTE', color: 'bg-purple-500 text-white', icon: Layers, description: 'Múltiplas URLs' },
  auto: { label: 'AUTO', color: 'bg-gray-400 text-white', icon: Sparkles, description: 'Detecção automática' },
};

export function NoticiasAIInput({ onGenerate, isProcessing, onImageUpload, canUseBatch }: NoticiasAIInputProps) {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const detectMode = (text: string): DetectedMode => {
    const trimmed = text.trim().toUpperCase();
    
    if (trimmed.startsWith('EXCLUSIVA')) return 'exclusiva';
    if (trimmed.startsWith('CADASTRO MANUAL')) return 'manual';
    if (trimmed.startsWith('JSON')) return 'json';
    
    const lines = text.trim().split('\n').filter(l => l.trim());
    const urlPattern = /^https?:\/\//i;
    
    if (lines.length === 1 && urlPattern.test(lines[0].trim())) return 'url';
    if (lines.length > 1 && lines.every(l => urlPattern.test(l.trim()))) return 'batch';
    
    return 'auto';
  };

  const detectedMode = detectMode(content);
  const modeConfig = MODE_CONFIG[detectedMode];
  const urlCount = detectedMode === 'batch' ? content.trim().split('\n').filter(l => /^https?:\/\//i.test(l.trim())).length : 0;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Formato inválido',
        description: 'Use JPG, PNG, WEBP ou GIF',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'Máximo 10MB',
        variant: 'destructive',
      });
      return;
    }

    setUploadingImage(true);
    try {
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const { data, error } = await supabase.storage
        .from('news-images')
        .upload(`noticias-ai/${fileName}`, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('news-images')
        .getPublicUrl(data.path);

      setImageUrl(urlData.publicUrl);
      onImageUpload?.();
      toast({
        title: 'Imagem enviada',
        description: 'URL copiada automaticamente',
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Erro no upload',
        description: 'Tente novamente',
        variant: 'destructive',
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleGenerate = async () => {
    if (!content.trim()) {
      toast({
        title: 'Conteúdo vazio',
        description: 'Digite ou cole o conteúdo para processar',
        variant: 'destructive',
      });
      return;
    }

    if (detectedMode === 'batch' && !canUseBatch) {
      toast({
        title: 'Recurso bloqueado',
        description: 'Modo lote disponível a partir do nível Intermediário',
        variant: 'destructive',
      });
      return;
    }

    if (detectedMode === 'batch') {
      // Simulate batch progress
      setBatchProgress(0);
      const interval = setInterval(() => {
        setBatchProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return prev;
          }
          return prev + Math.random() * 15;
        });
      }, 500);
      
      await onGenerate(content, detectedMode, imageUrl || undefined);
      setBatchProgress(100);
      setTimeout(() => setBatchProgress(0), 500);
    } else {
      await onGenerate(content, detectedMode, imageUrl || undefined);
    }
  };

  const handleClear = () => {
    setContent('');
    setImageUrl(null);
  };

  return (
    <Card className="border-l-4 border-l-violet-500">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-violet-500" />
          Entrada de Conteúdo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mode Badges */}
        <div className="flex flex-wrap gap-2" data-tour="mode-badges">
          {Object.entries(MODE_CONFIG).filter(([key]) => key !== 'auto').map(([key, config]) => {
            const Icon = config.icon;
            const isActive = detectedMode === key;
            const isLocked = key === 'batch' && !canUseBatch;
            
            return (
              <Badge 
                key={key} 
                variant={isActive ? 'default' : 'outline'}
                className={`${isActive ? config.color : ''} ${isLocked ? 'opacity-50' : ''} cursor-default`}
              >
                <Icon className="mr-1 h-3 w-3" />
                {config.label}
                {isLocked && ' 🔒'}
              </Badge>
            );
          })}
        </div>

        {/* Current Mode Info */}
        {detectedMode !== 'auto' && (
          <Alert className="border-violet-200 bg-violet-50">
            <modeConfig.icon className="h-4 w-4 text-violet-600" />
            <AlertDescription className="text-violet-700">
              <strong>Modo {modeConfig.label}:</strong> {modeConfig.description}
              {detectedMode === 'batch' && urlCount > 0 && ` (${urlCount} URLs detectadas)`}
            </AlertDescription>
          </Alert>
        )}

        {/* Image Upload Button */}
        <div className="flex gap-2" data-tour="image-upload">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImage}
          >
            {uploadingImage ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            {uploadingImage ? 'Enviando...' : 'Enviar Imagem'}
          </Button>
          {imageUrl && (
            <Badge variant="secondary" className="gap-1">
              <img src={imageUrl} alt="" className="h-4 w-4 rounded object-cover" />
              Imagem anexada
            </Badge>
          )}
        </div>

        {/* Textarea */}
        <Textarea
          placeholder={`Digite o conteúdo ou cole URLs...

Dicas:
• Digite "EXCLUSIVA" no início para preservar o texto original
• Digite "CADASTRO MANUAL" para campos formatados
• Digite "JSON" para gerar JSON importável
• Cole uma URL para extrair automaticamente
• Cole múltiplas URLs (uma por linha) para modo lote`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[200px] font-mono text-sm"
          data-tour="content-input"
        />

        {/* Batch Progress */}
        {batchProgress > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Processando lote...</span>
              <span>{Math.round(batchProgress)}%</span>
            </div>
            <Progress value={batchProgress} className="h-2" />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2" data-tour="generate-button">
          <Button
            onClick={handleGenerate}
            disabled={!content.trim() || isProcessing}
            className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
          >
            {isProcessing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            {isProcessing ? 'Processando...' : 'Gerar Notícia'}
          </Button>
          <Button variant="outline" onClick={handleClear} disabled={isProcessing}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
