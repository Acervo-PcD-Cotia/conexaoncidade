import { useState, useRef } from 'react';
import { Upload, Sparkles, Trash2, Loader2, FileText, Link, Layers, Zap, X, Star, Home, AlertTriangle, Newspaper, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type DetectedMode = 'exclusiva' | 'manual' | 'json' | 'url' | 'batch' | 'auto';
type TabType = 'cadastro' | 'manual' | 'json' | 'link' | 'lote';

export interface HighlightSettings {
  is_home_highlight: boolean;
  is_urgent: boolean;
  is_featured: boolean;
  generateWebStory: boolean;
}

interface ManualFields {
  title: string;
  subtitle: string;
  chapeu: string;
  content: string;
  editor: string;
  source: string;
}

interface NoticiasAIInputProps {
  onGenerate: (content: string, mode: DetectedMode, imageUrls?: string[], highlights?: HighlightSettings) => Promise<void>;
  isProcessing: boolean;
  onImageUpload?: () => void;
  canUseBatch: boolean;
}

const TAB_CONFIG: Record<TabType, { label: string; icon: React.ElementType; description: string }> = {
  cadastro: { label: 'Cadastro', icon: Sparkles, description: 'Detecção automática de modo' },
  manual: { label: 'Cadastro Manual', icon: FileText, description: 'Campos estruturados para notícia' },
  json: { label: 'JSON', icon: FileText, description: 'Importação via JSON' },
  link: { label: 'Link', icon: Link, description: 'Extrair de uma URL' },
  lote: { label: 'Lote', icon: Layers, description: 'Processar múltiplas URLs' },
};

export function NoticiasAIInput({ onGenerate, isProcessing, onImageUpload, canUseBatch }: NoticiasAIInputProps) {
  const [activeTab, setActiveTab] = useState<TabType>('cadastro');
  
  // Cadastro (auto) state
  const [content, setContent] = useState('');
  
  // Manual state
  const [manualFields, setManualFields] = useState<ManualFields>({
    title: '',
    subtitle: '',
    chapeu: '',
    content: '',
    editor: 'Redação Conexão na Cidade',
    source: '',
  });
  
  // JSON state
  const [jsonContent, setJsonContent] = useState('');
  const [jsonValid, setJsonValid] = useState<boolean | null>(null);
  
  // Link state
  const [singleUrl, setSingleUrl] = useState('');
  
  // Lote state
  const [batchUrls, setBatchUrls] = useState('');
  
  // Common states
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [highlights, setHighlights] = useState<HighlightSettings>({
    is_home_highlight: false,
    is_urgent: false,
    is_featured: false,
    generateWebStory: true, // WebStory habilitado por padrão
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleAddImageUrl = () => {
    const url = imageUrlInput.trim();
    if (!url) return;

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      toast({
        title: 'URL inválida',
        description: 'A URL deve começar com http:// ou https://',
        variant: 'destructive',
      });
      return;
    }

    setImageUrls(prev => [...prev, url]);
    setImageUrlInput('');
    toast({
      title: 'Imagem adicionada',
      description: 'URL da imagem foi anexada',
    });
  };

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

  // URL count for batch mode
  const urlCount = batchUrls.trim().split('\n').filter(l => /^https?:\/\//i.test(l.trim())).length;

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

  const validateJson = (text: string) => {
    try {
      JSON.parse(text);
      setJsonValid(true);
      return true;
    } catch {
      setJsonValid(false);
      return false;
    }
  };

  const getContentAndMode = (): { content: string; mode: DetectedMode } => {
    switch (activeTab) {
      case 'cadastro':
        return { content, mode: detectMode(content) || 'auto' };
      case 'manual':
        return { 
          content: `CADASTRO MANUAL\n${JSON.stringify(manualFields)}`,
          mode: 'manual'
        };
      case 'json':
        return { content: `JSON\n${jsonContent}`, mode: 'json' };
      case 'link':
        return { content: singleUrl, mode: 'url' };
      case 'lote':
        return { content: batchUrls, mode: 'batch' };
      default:
        return { content: '', mode: 'auto' };
    }
  };

  const isContentEmpty = (): boolean => {
    switch (activeTab) {
      case 'cadastro':
        return !content.trim();
      case 'manual':
        return !manualFields.title.trim() || !manualFields.content.trim();
      case 'json':
        return !jsonContent.trim();
      case 'link':
        return !singleUrl.trim();
      case 'lote':
        return !batchUrls.trim();
      default:
        return true;
    }
  };

  const handleGenerate = async () => {
    if (isContentEmpty()) {
      toast({
        title: 'Conteúdo vazio',
        description: 'Preencha os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    if (activeTab === 'json' && !validateJson(jsonContent)) {
      toast({
        title: 'JSON inválido',
        description: 'Verifique a sintaxe do JSON',
        variant: 'destructive',
      });
      return;
    }

    if (activeTab === 'link' && !singleUrl.match(/^https?:\/\//i)) {
      toast({
        title: 'URL inválida',
        description: 'Digite uma URL válida começando com http:// ou https://',
        variant: 'destructive',
      });
      return;
    }

    const { content: processContent, mode } = getContentAndMode();

    if (mode === 'batch') {
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
      
      await onGenerate(processContent, mode, imageUrls.length > 0 ? imageUrls : undefined, highlights);
      setBatchProgress(100);
      setTimeout(() => setBatchProgress(0), 500);
    } else {
      await onGenerate(processContent, mode, imageUrls.length > 0 ? imageUrls : undefined, highlights);
    }
  };

  const handleClear = () => {
    setContent('');
    setManualFields({
      title: '',
      subtitle: '',
      chapeu: '',
      content: '',
      editor: 'Redação Conexão na Cidade',
      source: '',
    });
    setJsonContent('');
    setJsonValid(null);
    setSingleUrl('');
    setBatchUrls('');
    setImageUrls([]);
    setHighlights({
      is_home_highlight: false,
      is_urgent: false,
      is_featured: false,
      generateWebStory: true,
    });
  };

  const currentTabConfig = TAB_CONFIG[activeTab];

  return (
    <Card className="border-l-4 border-l-violet-500">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-violet-500" />
          Entrada de Conteúdo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)} className="w-full">
          <TabsList className="grid w-full grid-cols-5 h-auto">
            {Object.entries(TAB_CONFIG).map(([key, config]) => {
              const Icon = config.icon;
              return (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="flex flex-col gap-1 py-2 px-1 text-xs sm:flex-row sm:gap-2 sm:text-sm"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{config.label}</span>
                  <span className="sm:hidden">{config.label.split(' ')[0]}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Mode Info Alert */}
          <Alert className="mt-4 border-violet-200 bg-violet-50">
            <currentTabConfig.icon className="h-4 w-4 text-violet-600" />
            <AlertDescription className="text-violet-700">
              <strong>{currentTabConfig.label}:</strong> {currentTabConfig.description}
              {activeTab === 'lote' && urlCount > 0 && ` (${urlCount} URLs detectadas)`}
            </AlertDescription>
          </Alert>

          {/* Image Upload + Highlights Section (Common for all tabs) */}
          <div className="grid gap-4 md:grid-cols-2 mt-4" data-tour="image-upload">
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

              {/* Input para URL de Imagem */}
              <div className="flex gap-2">
                <Input
                  placeholder="https://exemplo.com/imagem.jpg"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddImageUrl()}
                  className="flex-1 text-xs"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleAddImageUrl}
                  disabled={!imageUrlInput.trim()}
                >
                  <Link className="h-4 w-4" />
                </Button>
              </div>
              
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
                
                <div className="flex items-center justify-between border-t pt-3">
                  <div className="space-y-0.5">
                    <Label htmlFor="highlight-webstory" className="text-sm flex items-center gap-1.5">
                      <Wand2 className="h-3.5 w-3.5 text-purple-500" />
                      WebStory
                    </Label>
                    <p className="text-xs text-muted-foreground">Gerar WebStory automaticamente</p>
                  </div>
                  <Switch
                    id="highlight-webstory"
                    checked={highlights.generateWebStory}
                    onCheckedChange={(checked) => setHighlights(prev => ({ ...prev, generateWebStory: checked }))}
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Tab Contents */}
          <TabsContent value="cadastro" className="mt-4">
            <Textarea
              placeholder={`Digite o conteúdo ou cole texto...

Dicas:
• Digite "EXCLUSIVA" no início para preservar o texto original
• Texto livre será processado pela IA automaticamente`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
              data-tour="content-input"
            />
          </TabsContent>

          <TabsContent value="manual" className="mt-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="manual-title" className="text-sm font-medium">
                  Título <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="manual-title"
                  placeholder="Título da notícia"
                  value={manualFields.title}
                  onChange={(e) => setManualFields(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="manual-chapeu" className="text-sm font-medium">Chapéu</Label>
                <Input
                  id="manual-chapeu"
                  placeholder="Ex: EDUCAÇÃO, POLÍTICA"
                  value={manualFields.chapeu}
                  onChange={(e) => setManualFields(prev => ({ ...prev, chapeu: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="manual-subtitle" className="text-sm font-medium">Subtítulo</Label>
              <Input
                id="manual-subtitle"
                placeholder="Subtítulo ou linha fina"
                value={manualFields.subtitle}
                onChange={(e) => setManualFields(prev => ({ ...prev, subtitle: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="manual-content" className="text-sm font-medium">
                Conteúdo <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="manual-content"
                placeholder="Conteúdo completo da notícia..."
                value={manualFields.content}
                onChange={(e) => setManualFields(prev => ({ ...prev, content: e.target.value }))}
                className="min-h-[150px]"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="manual-editor" className="text-sm font-medium">Editor</Label>
                <Input
                  id="manual-editor"
                  placeholder="Nome do editor"
                  value={manualFields.editor}
                  onChange={(e) => setManualFields(prev => ({ ...prev, editor: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="manual-source" className="text-sm font-medium">Fonte</Label>
                <Input
                  id="manual-source"
                  placeholder="Fonte original"
                  value={manualFields.source}
                  onChange={(e) => setManualFields(prev => ({ ...prev, source: e.target.value }))}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="json" className="mt-4 space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant={jsonValid === true ? 'default' : jsonValid === false ? 'destructive' : 'secondary'}>
                {jsonValid === true ? '✓ JSON válido' : jsonValid === false ? '✗ JSON inválido' : 'Aguardando JSON'}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => validateJson(jsonContent)}
                disabled={!jsonContent.trim()}
              >
                Validar
              </Button>
            </div>
            <Textarea
              placeholder={`Cole o JSON aqui...

Exemplo de estrutura:
{
  "titulo": "Título da notícia",
  "subtitulo": "Subtítulo opcional",
  "chapeu": "CATEGORIA",
  "conteudo": "Conteúdo da notícia...",
  "editor": "Nome do Editor",
  "fonte": "Fonte original",
  "imagem_principal": "https://...",
  "galeria": ["https://...", "https://..."]
}

Ou array de artigos: [ {...}, {...} ]`}
              value={jsonContent}
              onChange={(e) => {
                setJsonContent(e.target.value);
                setJsonValid(null);
              }}
              className="min-h-[200px] font-mono text-sm"
            />
          </TabsContent>

          <TabsContent value="link" className="mt-4 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="single-url" className="text-sm font-medium">URL da notícia</Label>
              <div className="flex gap-2">
                <Input
                  id="single-url"
                  placeholder="https://exemplo.com/noticia"
                  value={singleUrl}
                  onChange={(e) => setSingleUrl(e.target.value)}
                  className="flex-1"
                />
                {singleUrl && /^https?:\/\//i.test(singleUrl) && (
                  <Badge variant="secondary" className="self-center">
                    <Link className="h-3 w-3 mr-1" />
                    URL válida
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Cole a URL de uma notícia para extrair automaticamente o conteúdo
              </p>
            </div>
          </TabsContent>

          <TabsContent value="lote" className="mt-4 space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant={urlCount > 0 ? 'default' : 'secondary'} className="bg-purple-500">
                <Layers className="h-3 w-3 mr-1" />
                {urlCount} URL(s) detectada(s)
              </Badge>
            </div>
            <Textarea
              placeholder={`Cole múltiplas URLs, uma por linha:

https://exemplo.com/noticia-1
https://exemplo.com/noticia-2
https://exemplo.com/noticia-3
...`}
              value={batchUrls}
              onChange={(e) => setBatchUrls(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Cada URL será processada individualmente. Máximo recomendado: 10 URLs por lote.
            </p>
          </TabsContent>
        </Tabs>

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
            disabled={isContentEmpty() || isProcessing}
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
