import { useState, useRef, useEffect } from 'react';
import { Upload, Sparkles, Trash2, Loader2, FileText, Link, Layers, Zap, X, Star, Home, AlertTriangle, Newspaper, Wand2, Download, AlertCircle, PlusCircle, Copy } from 'lucide-react';
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
import { ALLOWED_CATEGORIES, isValidCategory } from '@/constants/categories';
import { getAIProviderConfig } from '@/hooks/useAIProvider';

// Template JSON oficial do Prompt Mestre — Notícias AI (v2)
const JSON_TEMPLATE = {
  noticias: [
    {
      categoria: "Cidades",
      titulo: "Título da notícia (máx 100 caracteres)",
      slug: "titulo-da-noticia-em-kebab-case",
      subtitulo: "Linha fina descritiva (máx 160 caracteres)",
      chapeu: "CIDADES",
      editor: "Redação Conexão na Cidade",
      resumo: "Resumo com 30 a 160 caracteres para exibição em cards.",
      conteudo: "<p><strong>Primeiro parágrafo em negrito (Lide obrigatório).</strong></p><h2>Subtítulo de seção</h2><p>Desenvolvimento do texto com pelo menos 100 caracteres. Proibido usar travessão (—).</p>",
      fonte: "https://prefeitura.gov.br/noticia-original",
      imagem: {
        hero: "https://exemplo.com/imagem-principal.jpg",
        og: "https://exemplo.com/imagem-og-1200x630.jpg",
        card: "https://exemplo.com/imagem-card-800x450.jpg",
        alt: "Descrição acessível da imagem",
        credito: "Foto: Prefeitura Municipal / Divulgação",
        galeria: ["https://exemplo.com/foto2.jpg", "https://exemplo.com/foto3.jpg"]
      },
      tags: ["Cotia", "São Paulo", "Prefeitura", "Investimento", "Obras", "Desenvolvimento"],
      seo: {
        meta_titulo: "Meta título SEO (máx 60 caracteres)",
        meta_descricao: "Meta descrição para SEO (máx 160 caracteres)."
      },
      destaque: "none",
      generateWebStory: true
    }
  ]
};

// Categorias válidas (referência rápida para mensagens de erro)
const CATEGORIES_HINT = ALLOWED_CATEGORIES.slice(0, 8).join(', ') + '...';

// Interface para erros de validação
interface ValidationError {
  field: string;
  message: string;
  type: 'error' | 'warning';
  articleIndex?: number;
  hint?: string;        // Dica de como corrigir
  expected?: string;    // Valor esperado
  actual?: string;      // Valor encontrado
}

// Função de validação do JSON
const validateNewsJson = (text: string): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  try {
    const parsed = JSON.parse(text);
    
    // Verifica estrutura raiz
    if (!parsed.noticias && !Array.isArray(parsed)) {
      errors.push({ 
        field: 'raiz', 
        message: 'Estrutura raiz inválida', 
        type: 'error',
        hint: 'O JSON deve conter { "noticias": [...] } ou ser um array direto de artigos',
        expected: '{ "noticias": [ { ... } ] }',
      });
      return errors;
    }
    
    const articles = parsed.noticias || parsed;
    
    if (!Array.isArray(articles)) {
      errors.push({ 
        field: 'noticias', 
        message: 'O campo "noticias" deve ser um array', 
        type: 'error',
        hint: 'Envolva os artigos em colchetes: "noticias": [ { artigo1 }, { artigo2 } ]',
      });
      return errors;
    }

    if (articles.length === 0) {
      errors.push({
        field: 'noticias',
        message: 'Array de notícias está vazio',
        type: 'error',
        hint: 'Adicione pelo menos um artigo dentro do array "noticias"',
      });
      return errors;
    }
    
    articles.forEach((article: any, index: number) => {
      const prefix = articles.length > 1 ? `Artigo ${index + 1}` : 'Artigo';
      const titleHint = article.titulo ? ` ("${article.titulo.substring(0, 30)}${article.titulo.length > 30 ? '...' : ''}")` : '';
      const label = `${prefix}${titleHint}`;
      
      // === CAMPOS OBRIGATÓRIOS ===
      
      if (!article.titulo) {
        errors.push({ 
          field: 'titulo', 
          message: `${label} → Título ausente`,
          type: 'error', 
          articleIndex: index,
          hint: 'Adicione "titulo": "Texto do título" ao artigo',
        });
      } else if (article.titulo.length < 10) {
        errors.push({ 
          field: 'titulo', 
          message: `${label} → Título muito curto`,
          type: 'error', 
          articleIndex: index,
          actual: `${article.titulo.length} caracteres`,
          expected: 'Mínimo 10 caracteres',
        });
      }
      
      if (!article.slug) {
        errors.push({ 
          field: 'slug', 
          message: `${label} → Slug ausente`,
          type: 'error', 
          articleIndex: index,
          hint: 'Gere o slug a partir do título: "meu-titulo-em-kebab-case"',
        });
      } else if (!/^[a-z0-9-]+$/.test(article.slug)) {
        errors.push({ 
          field: 'slug', 
          message: `${label} → Slug com caracteres inválidos`,
          type: 'error', 
          articleIndex: index,
          actual: `"${article.slug.substring(0, 40)}"`,
          expected: 'Apenas letras minúsculas (a-z), números (0-9) e hífens (-)',
          hint: 'Remova acentos, espaços e caracteres especiais',
        });
      }
      
      if (!article.resumo) {
        errors.push({ 
          field: 'resumo', 
          message: `${label} → Resumo ausente`,
          type: 'error', 
          articleIndex: index,
          hint: 'Adicione "resumo": "Texto descritivo de 30-160 caracteres"',
        });
      } else if (article.resumo.length < 30) {
        errors.push({ 
          field: 'resumo', 
          message: `${label} → Resumo muito curto`,
          type: 'error', 
          articleIndex: index,
          actual: `${article.resumo.length} caracteres`,
          expected: 'Mínimo 30 caracteres',
        });
      }
      
      if (!article.conteudo) {
        errors.push({ 
          field: 'conteudo', 
          message: `${label} → Conteúdo HTML ausente`,
          type: 'error', 
          articleIndex: index,
          hint: 'Adicione "conteudo": "<p><strong>Lide em negrito.</strong></p><p>Texto...</p>"',
        });
      } else if (article.conteudo.length < 100) {
        errors.push({ 
          field: 'conteudo', 
          message: `${label} → Conteúdo muito curto`,
          type: 'error', 
          articleIndex: index,
          actual: `${article.conteudo.length} caracteres`,
          expected: 'Mínimo 100 caracteres de HTML',
        });
      }
      
      if (!article.categoria) {
        errors.push({ 
          field: 'categoria', 
          message: `${label} → Categoria ausente`,
          type: 'error', 
          articleIndex: index,
          hint: `Categorias válidas: ${CATEGORIES_HINT}`,
        });
      } else if (!isValidCategory(article.categoria)) {
        errors.push({
          field: 'categoria',
          message: `${label} → Categoria "${article.categoria}" não está na whitelist`,
          type: 'warning',
          articleIndex: index,
          hint: `Será convertida em tag e a categoria "Geral" será usada. Categorias válidas: ${CATEGORIES_HINT}`,
        });
      }
      
      // === TAGS (3-12) ===
      if (!article.tags || !Array.isArray(article.tags)) {
        errors.push({ 
          field: 'tags', 
          message: `${label} → Tags ausentes ou formato inválido`,
          type: 'error', 
          articleIndex: index,
          hint: 'Adicione "tags": ["Tag1", "Tag2", "Tag3"] (mínimo 3)',
          expected: 'Array com 3 a 12 strings',
        });
      } else if (article.tags.length < 3) {
        errors.push({ 
          field: 'tags', 
          message: `${label} → Poucas tags`,
          type: 'error', 
          articleIndex: index,
          actual: `${article.tags.length} tag(s)`,
          expected: 'Mínimo 3 tags',
        });
      } else if (article.tags.length > 12) {
        errors.push({ 
          field: 'tags', 
          message: `${label} → Tags em excesso`,
          type: 'error', 
          articleIndex: index,
          actual: `${article.tags.length} tags`,
          expected: 'Máximo 12 tags',
        });
      }
      
      // === LIMITES DE CARACTERES (avisos) ===
      if (article.titulo && article.titulo.length > 100) {
        errors.push({ 
          field: 'titulo', 
          message: `${label} → Título longo demais`,
          type: 'warning', 
          articleIndex: index,
          actual: `${article.titulo.length} caracteres`,
          expected: 'Máximo 100 caracteres',
        });
      }
      
      if (article.resumo && article.resumo.length > 160) {
        errors.push({ 
          field: 'resumo', 
          message: `${label} → Resumo longo demais`,
          type: 'warning', 
          articleIndex: index,
          actual: `${article.resumo.length} caracteres`,
          expected: 'Máximo 160 caracteres',
        });
      }
      
      if (article.seo?.meta_titulo && article.seo.meta_titulo.length > 60) {
        errors.push({ 
          field: 'seo.meta_titulo', 
          message: `${label} → Meta título excede limite SEO`,
          type: 'warning', 
          articleIndex: index,
          actual: `${article.seo.meta_titulo.length} caracteres`,
          expected: 'Máximo 60 caracteres (será truncado)',
        });
      }
      
      if (article.seo?.meta_descricao && article.seo.meta_descricao.length > 160) {
        errors.push({ 
          field: 'seo.meta_descricao', 
          message: `${label} → Meta descrição excede limite SEO`,
          type: 'warning', 
          articleIndex: index,
          actual: `${article.seo.meta_descricao.length} caracteres`,
          expected: 'Máximo 160 caracteres (será truncado)',
        });
      }
      
      if (!article.imagem?.hero) {
        errors.push({ 
          field: 'imagem.hero', 
          message: `${label} → Sem imagem principal`,
          type: 'warning', 
          articleIndex: index,
          hint: 'Adicione "imagem": { "hero": "https://url-da-imagem.jpg", "alt": "Descrição", "credito": "Fonte" }',
        });
      }
      
      if (article.destaque && !['none', 'home', 'featured', 'urgent'].includes(article.destaque)) {
        errors.push({ 
          field: 'destaque', 
          message: `${label} → Valor de destaque inválido`,
          type: 'error', 
          articleIndex: index,
          actual: `"${article.destaque}"`,
          expected: '"none", "home", "featured" ou "urgent"',
        });
      }
      
      if (article.generateWebStory !== undefined && typeof article.generateWebStory !== 'boolean') {
        errors.push({ 
          field: 'generateWebStory', 
          message: `${label} → Tipo inválido para generateWebStory`,
          type: 'warning', 
          articleIndex: index,
          actual: `${typeof article.generateWebStory} (${JSON.stringify(article.generateWebStory)})`,
          expected: 'true ou false (boolean, sem aspas)',
        });
      }
      
      if (article.subtitulo && article.subtitulo.length > 160) {
        errors.push({ 
          field: 'subtitulo', 
          message: `${label} → Subtítulo longo demais`,
          type: 'warning', 
          articleIndex: index,
          actual: `${article.subtitulo.length} caracteres`,
          expected: 'Máximo 160 caracteres (será truncado)',
        });
      }
      
      // Validar tags individuais
      if (article.tags && Array.isArray(article.tags)) {
        article.tags.forEach((tag: string, tagIndex: number) => {
          if (tag && tag.length > 40) {
            errors.push({
              field: `tags[${tagIndex}]`,
              message: `${label} → Tag "${tag.substring(0, 20)}..." muito longa`,
              type: 'warning',
              articleIndex: index,
              actual: `${tag.length} caracteres`,
              expected: 'Máximo 40 caracteres por tag',
            });
          }
        });
      }

      // === CAMPOS RECOMENDADOS ===
      if (!article.editor) {
        errors.push({
          field: 'editor',
          message: `${label} → Editor não informado`,
          type: 'warning',
          articleIndex: index,
          hint: 'Será preenchido automaticamente como "Redação Conexão na Cidade"',
        });
      }

      if (!article.fonte) {
        errors.push({
          field: 'fonte',
          message: `${label} → Fonte/URL original não informada`,
          type: 'warning',
          articleIndex: index,
          hint: 'Recomendado para rastreabilidade e créditos',
        });
      }

      if (!article.seo) {
        errors.push({
          field: 'seo',
          message: `${label} → Bloco SEO ausente`,
          type: 'warning',
          articleIndex: index,
          hint: 'Adicione "seo": { "meta_titulo": "...", "meta_descricao": "..." }',
        });
      }
    });
    
  } catch (e: any) {
    // Tentar extrair posição do erro de parse
    const posMatch = e.message?.match(/position\s+(\d+)/i) || e.message?.match(/at\s+(\d+)/i);
    const lineMatch = e.message?.match(/line\s+(\d+)/i);
    
    let positionHint = '';
    if (lineMatch) {
      positionHint = ` (linha ~${lineMatch[1]})`;
    } else if (posMatch) {
      const pos = parseInt(posMatch[1]);
      const lines = text.substring(0, pos).split('\n');
      positionHint = ` (linha ~${lines.length}, coluna ~${lines[lines.length - 1].length + 1})`;
    }
    
    // Detectar erros comuns de sintaxe
    let hint = 'Verifique vírgulas, aspas, chaves {} e colchetes []';
    if (e.message?.includes('Unexpected token')) {
      const tokenMatch = e.message.match(/Unexpected token\s*(.)/);
      if (tokenMatch) {
        hint = `Caractere inesperado "${tokenMatch[1]}"${positionHint}. Verifique se há vírgula faltando ou sobrando`;
      }
    } else if (e.message?.includes('Unexpected end')) {
      hint = 'JSON incompleto — verifique se todas as chaves {} e colchetes [] estão fechados';
    } else if (e.message?.includes('Expected')) {
      hint = `${e.message}${positionHint}`;
    }
    
    errors.push({ 
      field: 'sintaxe JSON', 
      message: `Erro de parse${positionHint}`,
      type: 'error',
      hint,
    });
  }
  
  return errors;
};

type DetectedMode = 'exclusiva' | 'manual' | 'json' | 'url' | 'batch' | 'auto';
type TabType = 'cadastro' | 'manual' | 'json' | 'link' | 'lote' | 'gerador';

interface GeneratorNewsItem {
  linkMateria: string;
  linkImagem: string;
  dataPublicacao: string;
  title: string;
  subtitle: string;
  source: string;
  description: string;
}

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
  gerador: { label: 'Gerador', icon: Zap, description: 'Gerador automático: insira links + imagens + datas' },
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
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  
  // Link state
  const [singleUrl, setSingleUrl] = useState('');
  
  // Lote state
  const [batchUrls, setBatchUrls] = useState('');
  
  // Gerador state
  const [generatorItems, setGeneratorItems] = useState<GeneratorNewsItem[]>([
    { linkMateria: '', linkImagem: '', dataPublicacao: '', title: '', subtitle: '', source: '', description: '' }
  ]);
  const [generatorProgress, setGeneratorProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatorResult, setGeneratorResult] = useState<string | null>(null);
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

  // Validação em tempo real (debounced)
  useEffect(() => {
    if (!jsonContent.trim()) {
      setValidationErrors([]);
      return;
    }
    
    const timer = setTimeout(() => {
      setValidationErrors(validateNewsJson(jsonContent));
    }, 500);
    
    return () => clearTimeout(timer);
  }, [jsonContent]);

  const handleDownloadTemplate = () => {
    const blob = new Blob([JSON.stringify(JSON_TEMPLATE, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template-noticias.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Template baixado!',
      description: 'Edite o arquivo e cole o conteúdo aqui',
    });
  };

  // Generator helpers
  const addGeneratorItem = () => {
    setGeneratorItems(prev => [...prev, { linkMateria: '', linkImagem: '', dataPublicacao: '', title: '', subtitle: '', source: '', description: '' }]);
  };

  const removeGeneratorItem = (index: number) => {
    setGeneratorItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateGeneratorItem = (index: number, field: keyof GeneratorNewsItem, value: string) => {
    setGeneratorItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const handleGeneratorSubmit = async () => {
    const validItems = generatorItems.filter(item => item.linkMateria.trim());
    if (validItems.length === 0) {
      toast({ title: 'Nenhuma URL preenchida', variant: 'destructive' });
      return;
    }

    setIsGenerating(true);
    setGeneratorProgress(0);
    setGeneratorResult(null);

    const progressInterval = setInterval(() => {
      setGeneratorProgress(prev => {
        if (prev >= 90) { clearInterval(progressInterval); return prev; }
        return prev + (90 / (validItems.length * 10));
      });
    }, 1000);

    try {
      const aiProvider = getAIProviderConfig();
      console.log('Using AI provider:', aiProvider);

      const response = await supabase.functions.invoke('noticias-ai-batch-generator', {
        body: {
          quantidadeNoticias: validItems.length,
          noticias: validItems,
          aiProvider: {
            providerId: aiProvider.providerId,
            model: aiProvider.model,
          },
        },
      });

      clearInterval(progressInterval);
      setGeneratorProgress(100);

      if (response.error) {
        const errMsg = typeof response.error === 'object' 
          ? (response.error as any).message || JSON.stringify(response.error)
          : String(response.error);
        throw new Error(errMsg);
      }

      const data = response.data;
      console.log('Generator response data:', data);
      
      if (data?.error) throw new Error(data.error);

      if (data?.json) {
        const jsonData = data.json;
        
        // Check if noticias array is actually populated
        if (!jsonData.noticias || jsonData.noticias.length === 0) {
          const errorDetails = data.errors?.map((e: any) => `• ${e.url}: ${e.error}`).join('\n') || 'Nenhuma notícia foi processada com sucesso.';
          throw new Error(`Nenhuma notícia gerada.\n${errorDetails}`);
        }

        const jsonOutput = JSON.stringify(jsonData, null, 2);
        setGeneratorResult(jsonOutput);

        // Also set it in the JSON tab for direct import
        setJsonContent(jsonOutput);
        
        toast({
          title: `✓ ${data.summary?.processed || 0} notícia(s) gerada(s)`,
          description: data.summary?.failed > 0 
            ? `${data.summary.failed} falha(s). O JSON está pronto para importação.` 
            : 'JSON gerado com sucesso! Clique em "Importar" para processar.',
        });
      } else {
        throw new Error('Resposta inválida do servidor. Tente novamente.');
      }
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Generator error:', error);
      toast({
        title: 'Erro no gerador',
        description: error instanceof Error ? error.message : 'Tente novamente',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
      setTimeout(() => setGeneratorProgress(0), 1500);
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
      case 'gerador':
        return !generatorItems.some(item => item.linkMateria.trim());
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
    setGeneratorItems([{ linkMateria: '', linkImagem: '', dataPublicacao: '', title: '', subtitle: '', source: '', description: '' }]);
    setGeneratorResult(null);
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
          <TabsList className="grid w-full grid-cols-6 h-auto">
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
            {/* Header com badges e botões */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={jsonValid === true ? 'default' : jsonValid === false ? 'destructive' : 'secondary'}>
                {jsonValid === true ? '✓ JSON válido' : jsonValid === false ? '✗ JSON inválido' : 'Aguardando JSON'}
              </Badge>
              
              {validationErrors.length > 0 && (
                <>
                  <Badge variant="destructive">
                    {validationErrors.filter(e => e.type === 'error').length} erro(s)
                  </Badge>
                  <Badge variant="outline" className="text-amber-600 border-amber-300">
                    {validationErrors.filter(e => e.type === 'warning').length} aviso(s)
                  </Badge>
                </>
              )}
              
              <div className="flex-1" />
              
              <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                <Download className="mr-1 h-4 w-4" />
                Baixar Template
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => validateJson(jsonContent)}
                disabled={!jsonContent.trim()}
              >
                Validar
              </Button>
            </div>
            
            {/* Lista de erros de validação */}
            {validationErrors.length > 0 && (
              <div className="rounded-lg border p-3 space-y-0.5 max-h-48 overflow-y-auto bg-muted/30">
                {/* Sumário */}
                <div className="flex items-center gap-2 pb-2 mb-2 border-b border-border/50">
                  <span className="text-xs font-medium text-foreground flex-1">
                    {validationErrors.filter(e => e.type === 'error').length > 0 && (
                      <span className="text-destructive mr-3">
                        ✕ {validationErrors.filter(e => e.type === 'error').length} erro(s) bloqueante(s)
                      </span>
                    )}
                    {validationErrors.filter(e => e.type === 'warning').length > 0 && (
                      <span className="text-amber-600">
                        ⚠ {validationErrors.filter(e => e.type === 'warning').length} aviso(s)
                      </span>
                    )}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[10px] gap-1"
                    onClick={() => {
                      const text = validationErrors.map(err => {
                        let line = `[${err.type === 'error' ? 'ERRO' : 'AVISO'}] ${err.field}: ${err.message}`;
                        if (err.actual) line += ` | Atual: ${err.actual}`;
                        if (err.expected) line += ` | Esperado: ${err.expected}`;
                        if (err.hint) line += ` | Dica: ${err.hint}`;
                        return line;
                      }).join('\n');
                      navigator.clipboard.writeText(text).then(() => {
                        toast({ title: 'Erros e avisos copiados!' });
                      }).catch(() => {
                        toast({ title: 'Erro ao copiar', variant: 'destructive' });
                      });
                    }}
                  >
                    <Copy className="h-3 w-3" />
                    Copiar
                  </Button>
                </div>
                {validationErrors.map((err, idx) => (
                  <div 
                    key={idx} 
                    className={`text-xs py-1 px-2 rounded ${
                      err.type === 'error' 
                        ? 'text-destructive bg-destructive/5' 
                        : 'text-amber-700 dark:text-amber-400 bg-amber-500/5'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {err.type === 'error' ? (
                        <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      ) : (
                        <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-1.5 flex-wrap">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-mono shrink-0">
                            {err.field}
                          </Badge>
                          <span className="font-medium">{err.message}</span>
                        </div>
                        {(err.actual || err.expected) && (
                          <div className="mt-0.5 text-[11px] opacity-80 pl-0.5">
                            {err.actual && <span>Atual: <code className="bg-muted px-1 rounded">{err.actual}</code></span>}
                            {err.actual && err.expected && <span className="mx-1">→</span>}
                            {err.expected && <span>Esperado: <code className="bg-muted px-1 rounded">{err.expected}</code></span>}
                          </div>
                        )}
                        {err.hint && (
                          <div className="mt-0.5 text-[11px] opacity-70 pl-0.5 italic">
                            💡 {err.hint}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Textarea do JSON */}
            <Textarea
              placeholder={`Cole o JSON aqui ou baixe o template de exemplo...

Estrutura esperada:
{
  "noticias": [
    {
      "titulo": "Título da notícia (obrigatório, máx 100)",
      "slug": "slug-kebab-case (obrigatório)",
      "subtitulo": "Linha fina (máx 160)",
      "chapeu": "CATEGORIA EM MAIÚSCULO",
      "editor": "Redação Conexão na Cidade",
      "resumo": "Resumo 30-160 caracteres (obrigatório)",
      "conteudo": "<p><strong>Lide em negrito.</strong></p>...",
      "categoria": "Cidades (obrigatório, da whitelist)",
      "tags": ["Tag1", "Tag2", "Tag3"] (3 a 12 tags),
      "fonte": "https://url-fonte-original",
      "destaque": "none | home | featured | urgent",
      "generateWebStory": true,
      "imagem": {
        "hero": "https://imagem-principal.jpg",
        "og": "https://og-1200x630.jpg",
        "card": "https://card-800x450.jpg",
        "alt": "Descrição da imagem",
        "credito": "Foto: Autor / Fonte",
        "galeria": ["url1.jpg", "url2.jpg"]
      },
      "seo": {
        "meta_titulo": "Título SEO (máx 60)",
        "meta_descricao": "Descrição SEO (máx 160)"
      }
    }
  ]
}`}
              value={jsonContent}
              onChange={(e) => {
                setJsonContent(e.target.value);
                setJsonValid(null);
              }}
              className={`min-h-[200px] font-mono text-sm ${
                validationErrors.some(e => e.type === 'error') 
                  ? 'border-destructive focus-visible:ring-destructive' 
                  : ''
              }`}
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

          <TabsContent value="gerador" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-amber-500">
                  <Zap className="h-3 w-3 mr-1" />
                  {generatorItems.filter(i => i.linkMateria.trim()).length} notícia(s)
                </Badge>
              </div>
              <Button variant="outline" size="sm" onClick={addGeneratorItem}>
                <PlusCircle className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {generatorItems.map((item, idx) => (
                <Card key={idx} className="p-3 space-y-2 border-l-2 border-l-amber-400">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">Notícia {idx + 1}</span>
                    {generatorItems.length > 1 && (
                      <Button variant="ghost" size="sm" onClick={() => removeGeneratorItem(idx)} className="h-6 w-6 p-0">
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <Input
                    placeholder="https://... (link da matéria)"
                    value={item.linkMateria}
                    onChange={(e) => updateGeneratorItem(idx, 'linkMateria', e.target.value)}
                    className="text-sm"
                  />
                  <div className="grid grid-cols-[7fr_3fr] gap-2">
                    <Input
                      placeholder="https://... (link da imagem)"
                      value={item.linkImagem}
                      onChange={(e) => updateGeneratorItem(idx, 'linkImagem', e.target.value)}
                      className="text-sm"
                    />
                    <Input
                      placeholder="DD/MM/AAAA"
                      value={item.dataPublicacao}
                      onChange={(e) => updateGeneratorItem(idx, 'dataPublicacao', e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <Input
                    placeholder="Título (opcional)"
                    value={item.title}
                    onChange={(e) => updateGeneratorItem(idx, 'title', e.target.value)}
                    className="text-sm"
                  />
                  <Input
                    placeholder="Subtítulo (opcional)"
                    value={item.subtitle}
                    onChange={(e) => updateGeneratorItem(idx, 'subtitle', e.target.value)}
                    className="text-sm"
                  />
                  <Input
                    placeholder="Fonte (opcional)"
                    value={item.source}
                    onChange={(e) => updateGeneratorItem(idx, 'source', e.target.value)}
                    className="text-sm"
                  />
                  <Textarea
                    placeholder="Descrição (opcional) — resumo ou corpo da notícia"
                    value={item.description}
                    onChange={(e) => updateGeneratorItem(idx, 'description', e.target.value)}
                    className="text-sm min-h-[60px]"
                    rows={2}
                  />
                </Card>
              ))}
            </div>

            {generatorProgress > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Extraindo e reescrevendo...</span>
                  <span>{Math.round(generatorProgress)}%</span>
                </div>
                <Progress value={generatorProgress} className="h-2" />
              </div>
            )}

            {generatorResult && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="default" className="bg-green-600">✓ JSON gerado</Badge>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(generatorResult);
                        toast({ title: 'JSON copiado!' });
                      }}
                    >
                      Copiar JSON
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const blob = new Blob([generatorResult], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `noticias-geradas-${Date.now()}.json`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        toast({ title: 'JSON baixado!' });
                      }}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Baixar
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setActiveTab('json');
                        toast({ title: 'Pronto para importar', description: 'Clique em "Gerar Notícia" para processar o JSON.' });
                      }}
                    >
                      Importar →
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={generatorResult}
                  readOnly
                  className="min-h-[150px] font-mono text-xs"
                />
              </div>
            )}

            <Button
              onClick={handleGeneratorSubmit}
              disabled={!generatorItems.some(i => i.linkMateria.trim()) || isGenerating}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
            >
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Zap className="mr-2 h-4 w-4" />
              )}
              {isGenerating ? 'Gerando...' : `Gerar ${generatorItems.filter(i => i.linkMateria.trim()).length} Notícia(s) em JSON`}
            </Button>
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

        {/* Action Buttons (hidden on gerador tab since it has its own button) */}
        {activeTab !== 'gerador' && (
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
        )}
      </CardContent>
    </Card>
  );
}
