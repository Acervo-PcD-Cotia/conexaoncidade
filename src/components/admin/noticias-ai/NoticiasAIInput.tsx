import { useState, useRef } from 'react';
import { Upload, Sparkles, Trash2, Loader2, FileText, Link, Layers, Zap, X, Star, Home, AlertTriangle, Newspaper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type DetectedMode = 'exclusiva' | 'manual' | 'json' | 'url' | 'batch' | 'auto';

export interface HighlightSettings {
  is_home_highlight: boolean;
  is_urgent: boolean;
  is_featured: boolean;
}

interface NoticiasAIInputProps {
  onGenerate: (content: string, mode: DetectedMode, imageUrls?: string[], highlights?: HighlightSettings) => Promise<void>;
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
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [highlights, setHighlights] = useState<HighlightSettings>({
    is_home_highlight: false,
    is_urgent: false,
    is_featured: false,
  });
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
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    
    for (const file of Array.from(files)) {
      if (!validTypes.includes(file.type)) {
        toast({
          title: 'Formato inválido',
          description: `${file.name}: Use JPG, PNG, WEBP ou GIF`,
          variant: 'destructive',
        });
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'Arquivo muito grande',
          description: `${file.name}: Máximo 10MB`,
          variant: 'destructive',
        });
        continue;
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

        setImageUrls(prev => [...prev, urlData.publicUrl]);
        onImageUpload?.();
      } catch (error) {
        console.error('Upload error:', error);
        toast({
          title: 'Erro no upload',
          description: `${file.name}: Tente novamente`,
          variant: 'destructive',
        });
      }
    }
    
    setUploadingImage(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    toast({
      title: 'Imagens enviadas',
      description: `${files.length} imagem(ns) anexada(s)`,
    });
  };

  const removeImage = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
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

    if (detectedMode === 'batch') {
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
      
      await onGenerate(content, detectedMode, imageUrls.length > 0 ? imageUrls : undefined, highlights);
      setBatchProgress(100);
      setTimeout(() => setBatchProgress(0), 500);
    } else {
      await onGenerate(content, detectedMode, imageUrls.length > 0 ? imageUrls : undefined, highlights);
    }
  };

  const handleClear = () => {
    setContent('');
    setImageUrls([]);
    setHighlights({
      is_home_highlight: false,
      is_urgent: false,
      is_featured: false,
    });
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
            
            return (
              <Badge 
                key={key} 
                variant={isActive ? 'default' : 'outline'}
                className={`${isActive ? config.color : ''} cursor-default`}
              >
                <Icon className="mr-1 h-3 w-3" />
                {config.label}
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

        {/* Image Upload + Highlights Section */}
        <div className="grid gap-4 md:grid-cols-2" data-tour="image-upload">
          {/* Image Upload Card */}
          <Card className="p-3 space-y-3">
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4 text-violet-500" />
              <span className="text-sm font-medium">Imagens</span>
              {imageUrls.length > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {imageUrls.length} anexada(s)
                </Badge>
              )}
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              className="hidden"
              multiple
            />
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              className="w-full"
            >
              {uploadingImage ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              {uploadingImage ? 'Enviando...' : 'Enviar Imagens'}
            </Button>
            
            {/* Image Thumbnails */}
            {imageUrls.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {imageUrls.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <img 
                      src={url} 
                      alt={`Imagem ${idx + 1}`} 
                      className="h-12 w-12 rounded object-cover border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] bg-primary text-primary-foreground px-1 rounded">
                        Hero
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Primeira imagem = Hero, demais = Galeria
            </p>
          </Card>

          {/* Highlights Card */}
          <Card className="p-3 space-y-3">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Destaques</span>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="highlight-home" className="text-sm flex items-center gap-1.5">
                    <Home className="h-3.5 w-3.5 text-blue-500" />
                    Home
                  </Label>
                  <p className="text-xs text-muted-foreground">Exibir na página inicial</p>
                </div>
                <Switch
                  id="highlight-home"
                  checked={highlights.is_home_highlight}
                  onCheckedChange={(checked) => setHighlights(prev => ({ ...prev, is_home_highlight: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="highlight-urgent" className="text-sm flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                    Urgente
                  </Label>
                  <p className="text-xs text-muted-foreground">Marcar como notícia urgente</p>
                </div>
                <Switch
                  id="highlight-urgent"
                  checked={highlights.is_urgent}
                  onCheckedChange={(checked) => setHighlights(prev => ({ ...prev, is_urgent: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="highlight-featured" className="text-sm flex items-center gap-1.5">
                    <Newspaper className="h-3.5 w-3.5 text-amber-500" />
                    Manchete
                  </Label>
                  <p className="text-xs text-muted-foreground">Destaque principal do dia</p>
                </div>
                <Switch
                  id="highlight-featured"
                  checked={highlights.is_featured}
                  onCheckedChange={(checked) => setHighlights(prev => ({ ...prev, is_featured: checked }))}
                />
              </div>
            </div>
          </Card>
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
