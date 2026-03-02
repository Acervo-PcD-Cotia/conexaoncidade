import { useState, useMemo, useCallback, useRef } from 'react';
import { Copy, Check, Eye, Download, AlertTriangle, Loader2, Trash2, Image, Wand2, Upload, ClipboardPaste, FileJson } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArticlePreviewDialog } from './ArticlePreviewDialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface NewsLink {
  label: string;
  url: string;
}

interface NewsArticle {
  titulo: string;
  slug: string;
  resumo: string;
  conteudo: string;
  categoria: string;
  tags?: string[];
  imagem: {
    hero: string;
    og?: string;
    card?: string;
    alt: string;
    credito: string;
    galeria?: string[];
    galeriaSelected?: boolean[];
  };
  seo: {
    meta_titulo: string;
    meta_descricao: string;
  };
  fonte?: string;
  subtitulo?: string;
  chapeu?: string;
  editor?: string;
  destaque?: 'none' | 'home' | 'featured' | 'urgent';
  generateWebStory?: boolean;
  links?: NewsLink[];
  _duplicateInfo?: {
    matchType: string;
    existingId: string;
    existingTitle?: string;
  } | null;
}

interface NoticiasAIJsonTabProps {
  data: { noticias: NewsArticle[] } | null;
  hasLideBold?: boolean;
  autoFixEnabled: boolean;
  onAutoFixChange: (enabled: boolean) => void;
  onImport: () => Promise<void>;
  isImporting: boolean;
  onDataChange?: (data: { noticias: NewsArticle[] }) => void;
  onArticleUpdate?: (index: number, article: NewsArticle) => void;
}

export function NoticiasAIJsonTab({
  data,
  hasLideBold = true,
  autoFixEnabled,
  onAutoFixChange,
  onImport,
  isImporting,
  onDataChange,
  onArticleUpdate,
}: NoticiasAIJsonTabProps) {
  const [copied, setCopied] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [pasteContent, setPasteContent] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Count duplicates
  const duplicateCount = useMemo(() => {
    if (!data?.noticias) return 0;
    return data.noticias.filter(a => a._duplicateInfo).length;
  }, [data]);

  // Parse and validate JSON
  const handleParseJson = useCallback((raw: string) => {
    setParseError(null);
    try {
      const parsed = JSON.parse(raw);
      // Accept { noticias: [...] } or direct array
      const noticias = parsed.noticias ?? (Array.isArray(parsed) ? parsed : null);
      if (!noticias || !Array.isArray(noticias) || noticias.length === 0) {
        setParseError('JSON deve conter um array "noticias" com pelo menos 1 item.');
        return;
      }
      // Basic validation
      const invalid = noticias.findIndex((n: any) => !n.titulo && !n.title);
      if (invalid >= 0) {
        setParseError(`Notícia #${invalid + 1} não possui campo "titulo".`);
        return;
      }
      onDataChange?.({ noticias });
      setPasteContent('');
      toast({ title: `${noticias.length} notícia(s) carregada(s) do JSON` });
    } catch (e: any) {
      setParseError(`JSON inválido: ${e.message}`);
    }
  }, [onDataChange, toast]);

  // File upload handler
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      setParseError('Apenas arquivos .json são aceitos.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      handleParseJson(text);
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [handleParseJson]);

  // Remove duplicates handler
  const handleRemoveDuplicates = () => {
    if (!data || !onDataChange) return;
    const filtered = data.noticias.filter(a => !a._duplicateInfo);
    onDataChange({ noticias: filtered });
    toast({ title: `${duplicateCount} duplicata(s) removida(s)` });
  };

  const handleCopy = async () => {
    if (!data) return;
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    toast({ title: 'JSON copiado!' });
    setTimeout(() => setCopied(false), 2000);
  };

  // JSON import area (shown when no data)
  const renderImportArea = () => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileJson className="h-5 w-5 text-primary" />
          Importar JSON
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File upload drop zone */}
        <div
          className="flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed border-muted-foreground/30 p-8 transition-colors hover:border-primary/50 hover:bg-accent/30"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-10 w-10 text-muted-foreground/50" />
          <div className="text-center">
            <p className="font-medium">Clique para fazer upload de um arquivo .json</p>
            <p className="text-sm text-muted-foreground">ou cole o conteúdo JSON abaixo</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>

        {/* Paste area */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <ClipboardPaste className="h-4 w-4" />
            Colar JSON
          </Label>
          <Textarea
            placeholder='{"noticias": [{"titulo": "...", "resumo": "...", ...}]}'
            value={pasteContent}
            onChange={(e) => setPasteContent(e.target.value)}
            className="min-h-[200px] font-mono text-xs"
          />
        </div>

        {parseError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{parseError}</AlertDescription>
          </Alert>
        )}

        <Button
          onClick={() => handleParseJson(pasteContent)}
          disabled={!pasteContent.trim()}
          className="w-full"
        >
          <Download className="mr-2 h-4 w-4" />
          Carregar JSON
        </Button>
      </CardContent>
    </Card>
  );

  if (!data || !data.noticias?.length) {
    return renderImportArea();
  }

  return (
    <div className="space-y-4" data-tour="json-result">
      {/* Import new JSON option */}
      {renderImportArea()}
      {/* Controls */}
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="auto-fix"
                checked={autoFixEnabled}
                onCheckedChange={onAutoFixChange}
              />
              <Label htmlFor="auto-fix" className="text-sm">
                Auto-corrigir lide em negrito
              </Label>
            </div>
            <Badge variant="secondary">
              {data.noticias.length} artigo{data.noticias.length > 1 ? 's' : ''}
            </Badge>
            {duplicateCount > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                {duplicateCount} duplicata{duplicateCount > 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          <div className="flex gap-2">
            {duplicateCount > 0 && onDataChange && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemoveDuplicates}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Remover duplicatas ({duplicateCount})
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewIndex(0)}
            >
              <Eye className="mr-1 h-4 w-4" />
              Visualizar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
            >
              {copied ? <Check className="mr-1 h-4 w-4" /> : <Copy className="mr-1 h-4 w-4" />}
              Copiar JSON
            </Button>
            <Button
              size="sm"
              onClick={onImport}
              disabled={isImporting}
              className="bg-gradient-to-r from-emerald-500 to-green-600"
              data-tour="import-button"
            >
              {isImporting ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-1 h-4 w-4" />
              )}
              {isImporting ? 'Importando...' : 'Importar Notícias'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Warning if lide not bold */}
      {!hasLideBold && !autoFixEnabled && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-700">
            Alguns artigos não têm o lide em negrito. Ative a auto-correção para corrigir automaticamente.
          </AlertDescription>
        </Alert>
      )}

      {/* JSON Preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">JSON Gerado</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] rounded-lg border bg-muted/50 p-4">
            <pre className="text-xs">
              {JSON.stringify(data, null, 2)}
            </pre>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Article List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Artigos para Importar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.noticias.map((article, index) => {
            // Validação de campos
            const missingFields: string[] = [];
            if (!article.subtitulo) missingFields.push('subtítulo');
            if (!article.chapeu) missingFields.push('chapéu');
            if (!article.editor) missingFields.push('editor');
            if (!article.imagem?.og) missingFields.push('imagem OG');
            
            return (
              <div
                key={index}
                className={`flex items-center gap-4 rounded-lg border p-3 transition-colors hover:bg-accent/50 ${
                  article._duplicateInfo ? 'border-destructive/50 bg-destructive/5' : ''
                }`}
              >
                <div className="relative">
                  {article.imagem?.hero && (
                    <img
                      src={article.imagem.hero}
                      alt=""
                      className="h-16 w-24 rounded object-cover"
                    />
                  )}
                  {/* Gallery indicator */}
                  {article.imagem?.galeria && article.imagem.galeria.length > 0 && (
                    <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Image className="h-3 w-3" />
                      +{article.imagem.galeria.length}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  {/* Duplicate warning */}
                  {article._duplicateInfo && (
                    <div className="flex items-center gap-1 mb-1">
                      <Badge variant="destructive" className="text-xs gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Possível duplicata
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        ({article._duplicateInfo.matchType === 'slug' ? 'mesmo slug' : 
                          article._duplicateInfo.matchType === 'source_url' ? 'mesma fonte' : 
                          'título similar'})
                      </span>
                    </div>
                  )}
                  {article.chapeu && (
                    <span className="text-xs font-bold text-primary uppercase tracking-wide">
                      {article.chapeu}
                    </span>
                  )}
                  <h4 className="font-medium line-clamp-1">{article.titulo}</h4>
                  {article.subtitulo && (
                    <p className="text-xs text-muted-foreground italic line-clamp-1">{article.subtitulo}</p>
                  )}
                  <p className="text-sm text-muted-foreground line-clamp-1">{article.resumo}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs">{article.categoria}</Badge>
                    {article.fonte && (
                      <Badge variant="secondary" className="text-xs">
                        {(() => {
                          try {
                            return new URL(article.fonte).hostname.replace('www.', '');
                          } catch {
                            return 'fonte';
                          }
                        })()}
                      </Badge>
                    )}
                    {article.editor && (
                      <Badge variant="outline" className="text-xs text-muted-foreground">
                        Ed: {article.editor}
                      </Badge>
                    )}
                    {missingFields.length > 0 && (
                      <Badge variant="outline" className="text-xs text-amber-600 border-amber-300 bg-amber-50">
                        -{missingFields.length} campos
                      </Badge>
                    )}
                    {article.generateWebStory !== false && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="outline" className="text-xs text-purple-600 border-purple-300 bg-purple-50 gap-1">
                              <Wand2 className="h-3 w-3" />
                              WebStory
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>WebStory será gerada automaticamente</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    {article.links && article.links.length > 0 && (
                      <Badge variant="outline" className="text-xs text-blue-600 border-blue-300 bg-blue-50 gap-1">
                        🔗 {article.links.length} link(s)
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewIndex(index)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      {previewIndex !== null && (
        <ArticlePreviewDialog
          articles={data.noticias}
          currentIndex={previewIndex}
          onIndexChange={setPreviewIndex}
          onClose={() => setPreviewIndex(null)}
        />
      )}
    </div>
  );
}
