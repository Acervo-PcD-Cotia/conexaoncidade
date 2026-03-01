import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HighlightSettings {
  is_home_highlight: boolean;
  is_urgent: boolean;
  is_featured: boolean;
}

interface GenerateRequest {
  mode: 'exclusiva' | 'manual' | 'json' | 'url' | 'batch' | 'auto';
  content: string;
  imageUrls?: string[];
  highlights?: HighlightSettings;
  autoFixLide?: boolean;
}

interface NewsArticle {
  titulo: string;
  slug: string;
  subtitulo: string;  // Obrigatório: linha fina (0-160 chars)
  chapeu: string;     // Obrigatório: categoria em MAIÚSCULAS
  resumo: string;
  conteudo: string;
  categoria: string;
  tags: string[];
  imagem: {
    hero: string;
    og?: string;
    card?: string;
    alt: string;
    credito: string;
    galeria?: string[];
  };
  seo: {
    meta_titulo: string;
    meta_descricao: string;
  };
  fonte: string;
  editor?: string;
  destaque: 'none' | 'home' | 'featured' | 'urgent';
  generateWebStory: boolean;
  is_home_highlight?: boolean;
  is_urgent?: boolean;
  is_featured?: boolean;
}

// Helper: Check if string is an image URL
function isImageUrl(url?: unknown): boolean {
  if (!url || typeof url !== 'string') return false;
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
  const lowerUrl = url.toLowerCase();
  return imageExtensions.some(ext => lowerUrl.includes(ext));
}

// Helper: Sanitize source - remove image URLs
function sanitizeSource(source?: unknown): string {
  if (!source || typeof source !== 'string') return '';
  if (isImageUrl(source)) return '';
  return source;
}

// Helper: Remove image URLs and img tags from content
function sanitizeContent(content: string, sourceUrl?: string): string {
  let cleaned = content
    // Remove <img> tags
    .replace(/<img[^>]*>/gi, '')
    // Remove raw image URLs in text
    .replace(/https?:\/\/[^\s<>"]+\.(jpg|jpeg|png|gif|webp|svg|bmp)[^\s<>"]*/gi, '')
    // Remove empty paragraphs
    .replace(/<p>\s*<\/p>/gi, '')
    // Clean up multiple line breaks
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();
  
  // Add source link at end if provided
  if (sourceUrl) {
    try {
      const domain = new URL(sourceUrl).hostname.replace('www.', '');
      const sourceLine = `<p class="source-link"><em>Fonte: <a href="${sourceUrl}" target="_blank" rel="noopener">${domain}</a></em></p>`;
      cleaned = cleaned + sourceLine;
    } catch {
      // Invalid URL, skip source link
    }
  }
  
  return cleaned;
}

// Helper: Ensure article has all required fields with fallbacks
// Helper: Gerar chapéu baseado na origem (municipal vs nacional)
function generateChapeu(article: NewsArticle): string {
  if (article.chapeu && article.chapeu.includes('|')) return article.chapeu;
  
  const categoria = (article.categoria || 'GERAL').toUpperCase();
  
  // Detectar se é notícia nacional via tags, categoria ou contexto
  const tagsLower = (article.tags || []).map(t => t.toLowerCase());
  const isNacional = categoria === 'BRASIL' || categoria === 'INTERNACIONAL'
    || tagsLower.includes('brasil') || tagsLower.includes('nacional')
    || tagsLower.includes('governo federal');
  
  if (isNacional) {
    return `BRASIL | ${categoria}`;
  }
  
  // Para municipal, usar a cidade da primeira tag ou "COTIA" como default
  const cidadeTag = (article.tags || []).find(t => {
    const lower = t.toLowerCase();
    return !['cotia', 'são paulo', 'regional', 'atualidades', 'destaque'].includes(lower)
      && t.length > 2 && t.length < 30
      && /^[A-ZÀ-Úa-zà-ú\s-]+$/.test(t);
  });
  
  const prefixo = (cidadeTag || 'COTIA').toUpperCase();
  return `${prefixo} | ${categoria}`;
}

// REGRA BLINDADA: Garantir mínimo 3 tags, máximo 12 tags
function ensureRequiredFields(article: NewsArticle, sourceUrl?: string): NewsArticle {
  let tags = article.tags || [];
  
  // Se menos de 3 tags, complementar com tags contextuais (Cotia/SP)
  if (tags.length < 3) {
    const fallbackTags = [
      article.categoria || 'Notícias',
      'Cotia',                    // Cidade principal do portal
      'São Paulo',                // Estado
      'Atualidades',
      'Destaque',
      'Região Metropolitana',
    ];
    while (tags.length < 3 && fallbackTags.length > 0) {
      const tag = fallbackTags.shift();
      if (tag && !tags.some(t => t.toLowerCase() === tag.toLowerCase())) {
        tags.push(tag);
      }
    }
  }
  
  // Truncar campos SEO para limites oficiais
  const metaTitulo = (article.seo?.meta_titulo || article.titulo)?.substring(0, 60);
  const metaDescricao = (article.seo?.meta_descricao || article.resumo)?.substring(0, 160);
  
  return {
    ...article,
    tags: tags.slice(0, 12),  // Limitar a 12 tags (máximo)
    subtitulo: (article.subtitulo || article.resumo?.substring(0, 100) || 'Saiba mais sobre esta notícia').substring(0, 160),
    chapeu: generateChapeu({ ...article, tags }),
    // ALWAYS force editor to Redação Conexão na Cidade, ignoring AI response
    editor: 'Redação Conexão na Cidade',
    fonte: sourceUrl || sanitizeSource(article.fonte),
    conteudo: sanitizeContent(article.conteudo, sourceUrl || article.fonte),
    // Aplicar limites SEO obrigatórios
    seo: {
      meta_titulo: metaTitulo,
      meta_descricao: metaDescricao,
    },
  };
}

function detectMode(content: string): string {
  const trimmed = content.trim().toUpperCase();
  
  if (trimmed.startsWith('EXCLUSIVA')) return 'exclusiva';
  if (trimmed.startsWith('CADASTRO MANUAL')) return 'manual';
  if (trimmed.startsWith('JSON')) return 'json';
  
  // Check for URLs
  const lines = content.trim().split('\n').filter(l => l.trim());
  const urlPattern = /^https?:\/\//i;
  
  if (lines.length === 1 && urlPattern.test(lines[0].trim())) return 'url';
  if (lines.length > 1 && lines.every(l => urlPattern.test(l.trim()))) return 'batch';
  
  return 'auto';
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 80);
}

function autoFixFirstParagraph(content: string): string {
  // Check if first paragraph is already bold
  const trimmed = content.trim();
  if (trimmed.startsWith('<p><strong>') || trimmed.startsWith('<strong>')) {
    return content;
  }
  
  // Find the first paragraph and make it bold
  const firstParagraphMatch = trimmed.match(/^(<p>)?([^<]+)(<\/p>)?/);
  if (firstParagraphMatch) {
    const firstParagraph = firstParagraphMatch[2];
    const rest = trimmed.substring(firstParagraphMatch[0].length);
    return `<p><strong>${firstParagraph}</strong></p>${rest}`;
  }
  
  return content;
}

// Helper: Check if image URL is valid (not logo, icon, small, etc.)
function isValidImageUrl(imgUrl: string): boolean {
  if (!imgUrl) return false;
  
  const lowerUrl = imgUrl.toLowerCase();
  
  // Exclude patterns for logos, icons, and junk images
  const excludePatterns = [
    'icon', 'logo', 'avatar', 'pixel', '1x1', 'gravatar', 'emoji',
    'transparencia', 'ebc.png', 'sprite', 'button', 'banner-ad',
    '/themes/', '/modules/', '/misc/', 'widget', 'tracking',
    'spinner', 'loading', 'placeholder', 'blank', 'spacer',
    'social-', 'share-', 'print-', 'download-', 'arrow-',
    '.svg', 'data:image', '/favicon', 'badge', 'selo-'
  ];
  
  for (const pattern of excludePatterns) {
    if (lowerUrl.includes(pattern)) return false;
  }
  
  // Exclude small dimension patterns like /50x50/, /100x100/
  if (/\/\d{1,3}x\d{1,3}[\/\.]/i.test(imgUrl)) return false;
  
  // Must be a valid image extension
  const hasValidExtension = /\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(imgUrl) ||
    lowerUrl.includes('.jpg') || lowerUrl.includes('.jpeg') ||
    lowerUrl.includes('.png') || lowerUrl.includes('.webp');
  
  return hasValidExtension;
}

// Helper: Normalize URL for comparison (remove query params, size variations)
function normalizeImageUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // Remove query parameters
    urlObj.search = '';
    // Remove common size patterns from path
    let path = urlObj.pathname
      .replace(/\/\d+x\d+\//gi, '/')
      .replace(/_\d+x\d+\./gi, '.')
      .replace(/-\d+x\d+\./gi, '.');
    return `${urlObj.origin}${path}`;
  } catch {
    return url.replace(/\?.*$/, '').replace(/\/\d+x\d+\//gi, '/');
  }
}

// Domain-specific content selectors for known sites
const domainSelectors: Record<string, { content: string[]; excludeFromContent: string[] }> = {
  'agenciabrasil.ebc.com.br': {
    content: [
      'div.field--name-body',
      'div.node__content',
      'div.field--type-text-with-summary',
      'article.node--type-noticia .field--name-body',
    ],
    excludeFromContent: ['div.share-buttons', 'div.related', 'div.tags', 'footer']
  },
  'gov.br': {
    content: [
      'div.content-area',
      'main.main-content',
      'div#content-core',
      'div.documentContent'
    ],
    excludeFromContent: ['nav', 'aside', 'footer', 'div.share']
  },
  'g1.globo.com': {
    content: [
      'article.content',
      'div.mc-article-body',
      'div.content-text'
    ],
    excludeFromContent: ['div.entities', 'div.related']
  }
};

// Extract content using Firecrawl API (primary method)
async function extractWithFirecrawl(url: string): Promise<{
  title: string;
  content: string;
  allImages: string[];
  wordCount: number;
} | null> {
  const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
  if (!FIRECRAWL_API_KEY) {
    console.log('FIRECRAWL_API_KEY not configured, using fallback extraction');
    return null;
  }

  try {
    console.log(`Extracting with Firecrawl: ${url}`);
    
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        formats: ['markdown', 'html'],
        onlyMainContent: true, // Removes headers, footers, navs automatically
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Firecrawl API error:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    
    if (!data.success || !data.data) {
      console.error('Firecrawl returned unsuccessful response:', data);
      return null;
    }

    const scraped = data.data;
    const title = scraped.metadata?.title || scraped.metadata?.ogTitle || 'Sem título';
    const content = scraped.markdown || '';
    
    console.log(`Firecrawl extracted: title="${title}", content length=${content.length}`);

    // Extract images from HTML response
    const allImages: string[] = [];
    const seenNormalized = new Set<string>();
    
    // Get og:image first
    if (scraped.metadata?.ogImage && isValidImageUrl(scraped.metadata.ogImage)) {
      allImages.push(scraped.metadata.ogImage);
      seenNormalized.add(normalizeImageUrl(scraped.metadata.ogImage));
    }
    
    // Extract images from HTML
    if (scraped.html) {
      const imageRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
      let match;
      while ((match = imageRegex.exec(scraped.html)) !== null) {
        let imgUrl = match[1];
        
        // Convert relative URLs to absolute
        if (imgUrl.startsWith('/')) {
          try {
            const baseUrl = new URL(url);
            imgUrl = `${baseUrl.origin}${imgUrl}`;
          } catch {}
        } else if (!imgUrl.startsWith('http')) {
          continue;
        }
        
        if (isValidImageUrl(imgUrl)) {
          const normalized = normalizeImageUrl(imgUrl);
          if (!seenNormalized.has(normalized)) {
            seenNormalized.add(normalized);
            allImages.push(imgUrl);
          }
        }
      }
    }

    const wordCount = content.split(/\s+/).filter(Boolean).length;
    
    console.log(`Firecrawl found ${allImages.length} images, ${wordCount} words`);

    return {
      title,
      content: content.substring(0, 10000),
      allImages: allImages.slice(0, 5),
      wordCount
    };
  } catch (error) {
    console.error('Firecrawl extraction error:', error);
    return null;
  }
}

// Fallback extraction using manual HTML parsing
async function extractWithFallback(url: string): Promise<{
  title: string;
  content: string;
  allImages: string[];
  wordCount: number;
}> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8'
    }
  });
  const html = await response.text();
  
  console.log(`Fallback: Fetched ${url}, HTML length: ${html.length}`);
  
  // Extract title
  const titleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i) ||
                     html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : 'Sem título';
  
  // Determine domain for specific selectors
  let hostname = '';
  try {
    hostname = new URL(url).hostname.replace('www.', '');
  } catch {}
  
  let content = '';
  
  // Try domain-specific selectors first
  const domainConfig = domainSelectors[hostname];
  if (domainConfig) {
    console.log(`Using domain-specific selectors for: ${hostname}`);
    
    for (const selector of domainConfig.content) {
      const selectorParts = selector.split(/\s+/);
      const lastPart = selectorParts[selectorParts.length - 1];
      
      if (lastPart.startsWith('.')) {
        const className = lastPart.substring(1);
        const pattern = new RegExp(`<div[^>]*class="[^"]*${className.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^"]*"[^>]*>([\\s\\S]*?)(?=<div[^>]*class="|<\\/article>|<footer|$)`, 'i');
        const match = html.match(pattern);
        if (match && match[1] && match[1].length > 200) {
          content = match[1];
          console.log(`Found content with selector: ${selector}, length: ${content.length}`);
          break;
        }
      }
    }
  }
  
  // Fallback: Try generic selectors
  if (!content || content.length < 200) {
    const genericSelectors = [
      /<article[^>]*class="[^"]*noticia[^"]*"[^>]*>([\s\S]*?)<\/article>/i,
      /<div[^>]*class="[^"]*post-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*class="[^"]*article-body[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<main[^>]*>([\s\S]*?)<\/main>/i,
      /<article[^>]*>([\s\S]*?)<\/article>/i,
    ];
    
    for (const pattern of genericSelectors) {
      const match = html.match(pattern);
      if (match && match[1] && match[1].length > content.length) {
        content = match[1];
        break;
      }
    }
  }
  
  // Extract paragraphs from content area
  if (content) {
    const paragraphs: string[] = [];
    const pRegex = /<p[^>]*>([^<]+(?:<[^\/p][^>]*>[^<]*<\/[^>]+>[^<]*)*)<\/p>/gi;
    let pMatch;
    while ((pMatch = pRegex.exec(content)) !== null) {
      const text = pMatch[1]
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .trim();
      if (text.length > 20) {
        paragraphs.push(text);
      }
    }
    
    if (paragraphs.length > 0) {
      content = paragraphs.join('\n\n');
    } else {
      content = content
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<nav[\s\S]*?<\/nav>/gi, '')
        .replace(/<footer[\s\S]*?<\/footer>/gi, '')
        .replace(/<aside[\s\S]*?<\/aside>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }
  }
  
  console.log(`Fallback extracted content length: ${content.length}`);
  
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  
  // Extract images
  const allImages: string[] = [];
  const seenNormalized = new Set<string>();
  
  const ogImageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i);
  if (ogImageMatch && ogImageMatch[1]) {
    const ogImage = ogImageMatch[1];
    if (isValidImageUrl(ogImage)) {
      allImages.push(ogImage);
      seenNormalized.add(normalizeImageUrl(ogImage));
    }
  }
  
  const contentArea = content || html;
  const imageRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = imageRegex.exec(contentArea)) !== null) {
    let imgUrl = match[1];
    
    if (imgUrl.startsWith('/')) {
      try {
        const baseUrl = new URL(url);
        imgUrl = `${baseUrl.origin}${imgUrl}`;
      } catch {}
    } else if (!imgUrl.startsWith('http')) {
      continue;
    }
    
    if (isValidImageUrl(imgUrl)) {
      const normalized = normalizeImageUrl(imgUrl);
      if (!seenNormalized.has(normalized)) {
        seenNormalized.add(normalized);
        allImages.push(imgUrl);
      }
    }
  }
  
  return {
    title,
    content: content.substring(0, 8000),
    allImages: allImages.slice(0, 5),
    wordCount
  };
}

// Main extraction function - tries Firecrawl first, then fallback
async function extractFromUrl(url: string): Promise<{ 
  title: string; 
  content: string; 
  imageUrl?: string;
  allImages: string[];
  wordCount: number;
}> {
  try {
    // Try Firecrawl first (best quality)
    const firecrawlResult = await extractWithFirecrawl(url);
    
    if (firecrawlResult && firecrawlResult.content.length > 100) {
      return {
        ...firecrawlResult,
        imageUrl: firecrawlResult.allImages[0]
      };
    }
    
    // Fallback to manual extraction
    console.log('Using fallback extraction method');
    const fallbackResult = await extractWithFallback(url);
    
    return {
      ...fallbackResult,
      imageUrl: fallbackResult.allImages[0]
    };
  } catch (error) {
    console.error('Error extracting from URL:', error);
    throw new Error(`Falha ao extrair conteúdo de ${url}`);
  }
}

async function generateWithAI(prompt: string, systemPrompt: string): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
  
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    console.error('AI API error:', error);
    throw new Error('Falha na geração com IA');
  }
  
  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const body: GenerateRequest = await req.json();
    let { mode, content, imageUrls, highlights, autoFixLide = true } = body;
    
    // Helper to apply highlights to article
    const applyHighlights = (article: any) => {
      if (highlights) {
        article.is_home_highlight = highlights.is_home_highlight;
        article.is_urgent = highlights.is_urgent;
        article.is_featured = highlights.is_featured;
      }
      return article;
    };
    
    // Helper to apply images to article
    const applyImages = (article: any, imgs?: string[]) => {
      if (imgs && imgs.length > 0) {
        article.imagem = {
          ...article.imagem,
          hero: imgs[0],
          galeria: imgs.slice(1)
        };
      }
      return article;
    };
    
    // Auto-detect mode if not specified
    if (mode === 'auto' || !mode) {
      mode = detectMode(content) as GenerateRequest['mode'];
    }
    
    console.log(`Processing with mode: ${mode}, images: ${imageUrls?.length || 0}, highlights: ${JSON.stringify(highlights)}`);
    
    // PROMPT MESTRE OFICIAL — NOTÍCIAS AI (v2)
    const systemPrompt = `Você é a IA oficial de geração e reescrita de notícias do portal **Conexão na Cidade**.

## 1. FORMATO DE SAÍDA (OBRIGATÓRIO)
Sempre responda EXCLUSIVAMENTE em JSON válido. Nunca escreva texto fora do JSON.

## 2. CATEGORIAS (WHITELIST FIXA)
Use SOMENTE uma destas categorias:
Brasil, Cidades, Política, Economia, Justiça, Segurança Pública, Saúde, Educação, Ciência, Tecnologia, Meio Ambiente, Infraestrutura, Esportes, Entretenimento, Cultura, Comportamento, Lifestyle, Emprego & Renda, Mobilidade Urbana, Inclusão & PCD, Projetos Sociais, Inovação Pública, Conexão Academy, Web Rádio, Web TV, Geral

## 3. REGRA DE CATEGORIA INTELIGENTE (ANTES DO FALLBACK)
Antes de usar "Geral":
1. Analise título + subtítulo + conteúdo semanticamente
2. Tente encaixar a notícia em UMA categoria existente da whitelist
3. Use palavras-chave e contexto
4. Só use "Geral" se NENHUMA categoria fizer sentido
Se a categoria original não estiver na whitelist:
- categoria final = "Geral"
- a categoria original vira TAG obrigatória

## 4. REGRAS EDITORIAIS (OBRIGATÓRIO)
- 1 cidade por resposta
- Gerar até 12 notícias relevantes por resposta
- Reescrever mantendo ~95-105% do tamanho original (NUNCA resumir)
- Preservar todos os dados factuais (datas, números, locais, serviços, regras)
- NUNCA inventar informações
- NUNCA usar travessão (—) em nenhuma hipótese
- SEMPRE mencionar "Cotia" no corpo das notícias de cidades vizinhas
- Fonte sempre oficial (prefeitura/secretaria/governo)
- NÃO incluir URLs de imagens dentro do conteúdo

## 4.1 SEO SEMÂNTICO (OBRIGATÓRIO)
Aplique a metodologia SEO Genome:
- H1: Título com palavra-chave principal (campo "titulo")
- H2: Sessões principais com centralidade tópica clara
- H3: Subtópicos estratégicos dentro de cada H2
- Distribua termos relacionados naturalmente nos parágrafos
- Cada sessão H2 deve reforçar o tema central sem misturar intenções de busca
- Aplique desambiguação quando necessário (ex: separar "plano de saúde" de "saúde pública")
- Construção progressiva de relevância: cada parágrafo acumula autoridade semântica
- Use perguntas reais do Google como subtítulos H3 quando aplicável

## 5. CONTEÚDO HTML — PADRÃO AGÊNCIA BRASIL (OBRIGATÓRIO)
O campo "conteudo" deve seguir EXATAMENTE o modelo editorial da Agência Brasil.
Tags permitidas: &lt;p&gt;, &lt;h2&gt;, &lt;h3&gt;, &lt;blockquote&gt;, &lt;strong&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;li&gt;, &lt;a&gt;

### ESTRUTURA DO CORPO (seguir esta ordem):
1. **Lide (1º parágrafo)**: Resumo factual com as informações-chave em &lt;strong&gt;.
   Exemplo: &lt;p&gt;&lt;strong&gt;O Brasil registrou 88 casos confirmados do vírus Mpox&lt;/strong&gt;, com a maioria sendo no estado de São Paulo, que desde janeiro contabiliza 62 casos.&lt;/p&gt;
   IMPORTANTE: O &lt;strong&gt; envolve APENAS a frase-chave, NÃO o parágrafo inteiro.

2. **Desenvolvimento com H2**: Cada seção principal usa &lt;h2&gt; como pergunta ou afirmação direta.
   Exemplos de H2 estilo Agência Brasil:
   - "O que é Mpox e quais são os sintomas?"
   - "Como a Mpox é transmitida?"
   - "Qual é o tratamento?"
   Formato: perguntas reais que o leitor faria, em linguagem clara.

3. **Parágrafos com negrito editorial**: Ao longo do texto, use &lt;strong&gt; para destacar
   frases-chave, dados importantes ou declarações relevantes DENTRO dos parágrafos.
   Exemplo: &lt;p&gt;&lt;strong&gt;O intervalo de tempo entre o primeiro contato com o vírus até o início dos sinais é de 3 a 16 dias, mas pode chegar a 21 dias.&lt;/strong&gt;&lt;/p&gt;

4. **Citações em blockquote**: Para declarações oficiais ou falas de autoridades.
   Formato: &lt;blockquote&gt;&lt;p&gt;"Pessoas com suspeita ou confirmação da doença devem cumprir isolamento imediato", orienta o Ministério da Saúde.&lt;/p&gt;&lt;/blockquote&gt;

5. **Subtópicos com H3**: Para detalhamentos dentro de seções H2 (ex: dados regionais, listas).

6. **Links inline**: Use &lt;a href="URL"&gt;texto descritivo&lt;/a&gt; quando referenciar termos
   que possuem matérias relacionadas ou fontes oficiais.

### REGRAS DE FORMATAÇÃO:
- Parágrafos curtos (3-5 frases) para facilitar a leitura
- Alternar parágrafos normais com parágrafos que possuem &lt;strong&gt; em frases-chave
- Blockquotes apenas para citações diretas com aspas
- H2 devem ser perguntas ou títulos descritivos curtos
- NÃO usar itálico
- NÃO usar travessão (—) em nenhuma hipótese

PROIBIÇÕES:
- NÃO inclua URLs de imagens no conteúdo
- NÃO inclua tags HTML fora da lista permitida
- NÃO inclua o array "tags" dentro do conteúdo
- NÃO use travessão (—) em nenhuma hipótese
- NÃO envolva o parágrafo inteiro em &lt;strong&gt; (apenas frases-chave)

## 6. TAGS (OBRIGATÓRIO 3-12)
- Mínimo: 3 tags
- Máximo: 12 tags
- SEMPRE incluir:
  1) A CIDADE principal da notícia como tag limpa (ex: "Itapevi")
  2) "Cotia"
  3) Tema(s) relevante(s)
- Se categoria final virar "Geral", a categoria original vira TAG obrigatória
- Tags devem ter no máximo 40 caracteres cada

## 7. LIMITES DE CARACTERES (VALIDAÇÃO OBRIGATÓRIA)
- titulo: 10 a 100 caracteres
- subtitulo: 0 a 160 caracteres (curto e direto)
- resumo: 30 a 160 caracteres
- seo.meta_titulo: máximo 60 caracteres
- seo.meta_descricao: máximo 160 caracteres
- slug: apenas a-z, 0-9 e hífen (kebab-case)
NUNCA ultrapasse estes limites.

## 8. CAMPOS OBRIGATÓRIOS DO JSON
Cada notícia DEVE conter:
categoria, titulo, slug, subtitulo, chapeu, resumo, conteudo, fonte, imagem(hero,og,card,alt,credito,galeria), tags, seo(meta_titulo,meta_descricao), destaque, generateWebStory

Regras específicas:
- chapeu = "CIDADE | CATEGORIA" para fontes municipais (ex: "COTIA | SAÚDE") ou "BRASIL | CATEGORIA" para fontes nacionais (ex: "BRASIL | ECONOMIA"). Nunca depender das tags para o chapéu.
- destaque deve ser um destes: none, home, featured, urgent
- generateWebStory deve ser true por padrão

## 9. FORMATO JSON DE SAÍDA (OBRIGATÓRIO)
{
  "noticias": [{
    "categoria": "Categoria da whitelist",
    "titulo": "Título (max 100 chars)",
    "slug": "titulo-em-kebab-case",
    "subtitulo": "Linha fina descritiva (max 160 chars)",
    "chapeu": "CIDADE | CATEGORIA ou BRASIL | CATEGORIA",
    "resumo": "Resumo (max 160 chars)",
    "conteudo": "<p><strong>Lide...</strong></p><h2>...</h2><p>...</p>",
    "fonte": "URL oficial da fonte",
    "imagem": {
      "hero": "URL",
      "og": "URL 1200x630",
      "card": "URL 800x450",
      "alt": "Descrição acessível",
      "credito": "Prefeitura/Secretaria/Agência + URL oficial",
      "galeria": []
    },
    "tags": ["Cidade", "Cotia", "tema1"],
    "seo": {
      "meta_titulo": "Meta título (max 60)",
      "meta_descricao": "Meta descrição (max 160)"
    },
    "destaque": "none",
    "generateWebStory": true
  }]
}

## REGRA FINAL ABSOLUTA
Se qualquer regra acima for violada, a resposta é considerada inválida.
Valide TUDO antes de responder. Responda APENAS com JSON válido.`;
    
    let result: any;
    
    switch (mode) {
      case 'exclusiva': {
        // Preserve original text, just format it
        const cleanContent = content.replace(/^EXCLUSIVA\s*/i, '').trim();
        let article: any = {
          titulo: cleanContent.split('\n')[0].substring(0, 100),
          slug: generateSlug(cleanContent.split('\n')[0]),
          resumo: cleanContent.substring(0, 160),
          conteudo: `<p>${cleanContent.split('\n').join('</p><p>')}</p>`,
          categoria: 'Cidade',
          fonte: '',
          imagem: { hero: imageUrls?.[0] || '', alt: '', credito: '', galeria: imageUrls?.slice(1) || [] },
          seo: {
            meta_titulo: cleanContent.split('\n')[0].substring(0, 60),
            meta_descricao: cleanContent.substring(0, 160)
          }
        };
        article = applyHighlights(article);
        result = {
          mode: 'exclusiva',
          manual: article
        };
        break;
      }
      
      case 'manual': {
        const cleanContent = content.replace(/^CADASTRO MANUAL\s*/i, '').trim();
        const aiResult = await generateWithAI(cleanContent, systemPrompt);
        const parsed = JSON.parse(aiResult.replace(/```json\n?|\n?```/g, ''));
        let article = parsed.noticias[0];
        
        article = applyImages(article, imageUrls);
        article = applyHighlights(article);
        article.conteudo = autoFixLide ? autoFixFirstParagraph(article.conteudo) : article.conteudo;
        
        result = {
          mode: 'manual',
          manual: article
        };
        break;
      }
      
      case 'json': {
        const cleanContent = content.replace(/^JSON\s*/i, '').trim();
        
        // Try to parse user JSON directly first (skip AI if valid)
        let parsed: any = null;
        let usedAI = false;
        
        try {
          const directParsed = JSON.parse(cleanContent);
          // Check if it's a valid news JSON structure
          const articles = directParsed.noticias || (Array.isArray(directParsed) ? directParsed : null);
          if (articles && Array.isArray(articles) && articles.length > 0 && articles[0].titulo && articles[0].conteudo) {
            // Valid structured JSON — use directly without AI
            parsed = directParsed.noticias ? directParsed : { noticias: directParsed };
            console.log(`JSON mode: Direct parse OK, ${parsed.noticias.length} article(s), skipping AI`);
          }
        } catch {
          // Not valid JSON, will use AI
        }
        
        // Fallback to AI if direct parse failed (raw text input)
        if (!parsed) {
          console.log('JSON mode: Using AI to generate from raw text');
          const aiResult = await generateWithAI(cleanContent, systemPrompt);
          parsed = JSON.parse(aiResult.replace(/```json\n?|\n?```/g, ''));
          usedAI = true;
        }
        
        // Ensure required fields and auto-fix lide
        if (parsed.noticias) {
          parsed.noticias = parsed.noticias.map((article: NewsArticle, idx: number) => {
            let enriched = ensureRequiredFields(article);
            enriched.conteudo = autoFixLide ? autoFixFirstParagraph(enriched.conteudo) : enriched.conteudo;
            
            // Apply images and highlights to first article only
            if (idx === 0) {
              enriched = applyImages(enriched, imageUrls);
              enriched = applyHighlights(enriched);
            }
            
            return enriched;
          });
        }
        
        result = {
          mode: 'json',
          json: parsed,
          hasLideBold: parsed.noticias?.every((a: NewsArticle) => 
            a.conteudo.includes('<strong>') || a.conteudo.includes('<b>')
          )
        };
        break;
      }
      
      case 'url': {
        const url = content.trim();
        const extracted = await extractFromUrl(url);
        
        // Calculate character limits (95%-105% of original)
        const charCount = extracted.content.length;
        const minChars = Math.floor(charCount * 0.95);
        const maxChars = Math.ceil(charCount * 1.05);
        
        const aiResult = await generateWithAI(
          `URL: ${url}\nTítulo: ${extracted.title}\nConteúdo Original (${charCount} caracteres, ${extracted.wordCount} palavras):\n${extracted.content}\n\n⚠️ REGRA CRÍTICA DE TAMANHO:\n- A matéria original tem ${charCount} caracteres\n- Sua reescrita DEVE ter entre ${minChars} e ${maxChars} caracteres (95%-105% do original)\n- NÃO encurte a matéria. NÃO omita informações.\n- NÃO inclua URLs de imagens no texto.`,
          systemPrompt
        );
        let parsed = JSON.parse(aiResult.replace(/```json\n?|\n?```/g, ''));
        
        if (parsed.noticias?.[0]) {
          // Ensure required fields with fallbacks and add source link
          parsed.noticias[0] = ensureRequiredFields(parsed.noticias[0], url);
          
          // Set images: user-provided or extracted
          if (imageUrls && imageUrls.length > 0) {
            parsed.noticias[0] = applyImages(parsed.noticias[0], imageUrls);
          } else if (extracted.allImages.length > 0) {
            const heroUrl = extracted.allImages[0];
            const heroNormalized = normalizeImageUrl(heroUrl);
            
            // Filter gallery to exclude duplicates of hero image
            const galeria = extracted.allImages.slice(1).filter(img => {
              const imgNormalized = normalizeImageUrl(img);
              return imgNormalized !== heroNormalized;
            });
            
            parsed.noticias[0].imagem = {
              ...parsed.noticias[0].imagem,
              hero: heroUrl,
              galeria: galeria
            };
          }
          
          // Apply highlights
          parsed.noticias[0] = applyHighlights(parsed.noticias[0]);
          
          if (autoFixLide) {
            parsed.noticias[0].conteudo = autoFixFirstParagraph(parsed.noticias[0].conteudo);
          }
        }
        
        result = {
          mode: 'url',
          json: parsed,
          sourceUrl: url
        };
        break;
      }
      
      case 'batch': {
        const urls = content.trim().split('\n').filter(u => u.trim()).slice(0, 10);
        const results: any[] = [];
        const errors: string[] = [];
        
        for (let i = 0; i < urls.length; i++) {
          const url = urls[i];
          try {
            const extracted = await extractFromUrl(url.trim());
            
            // Calculate character limits (95%-105% of original)
            const charCount = extracted.content.length;
            const minChars = Math.floor(charCount * 0.95);
            const maxChars = Math.ceil(charCount * 1.05);
            
            const aiResult = await generateWithAI(
              `URL: ${url}\nTítulo: ${extracted.title}\nConteúdo Original (${charCount} caracteres, ${extracted.wordCount} palavras):\n${extracted.content}\n\n⚠️ REGRA CRÍTICA DE TAMANHO:\n- A matéria original tem ${charCount} caracteres\n- Sua reescrita DEVE ter entre ${minChars} e ${maxChars} caracteres (95%-105% do original)\n- NÃO encurte a matéria. NÃO omita informações.\n- NÃO inclua URLs de imagens no texto.`,
              systemPrompt
            );
            let parsed = JSON.parse(aiResult.replace(/```json\n?|\n?```/g, ''));
            
            if (parsed.noticias?.[0]) {
              // Ensure required fields with fallbacks and add source link
              let article = ensureRequiredFields(parsed.noticias[0], url.trim());
              
              // Set images: user-provided (only first URL) or extracted
              if (i === 0 && imageUrls && imageUrls.length > 0) {
                article = applyImages(article, imageUrls);
                article = applyHighlights(article);
              } else if (extracted.allImages.length > 0) {
                const heroUrl = extracted.allImages[0];
                const heroNormalized = normalizeImageUrl(heroUrl);
                
                // Filter gallery to exclude duplicates of hero image
                const galeria = extracted.allImages.slice(1).filter(img => {
                  const imgNormalized = normalizeImageUrl(img);
                  return imgNormalized !== heroNormalized;
                });
                
                article.imagem = {
                  ...article.imagem,
                  hero: heroUrl,
                  galeria: galeria
                };
              }
              
              if (autoFixLide) {
                article.conteudo = autoFixFirstParagraph(article.conteudo);
              }
              results.push(article);
            }
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            errors.push(`${url}: ${errorMessage}`);
          }
        }
        
        result = {
          mode: 'batch',
          json: { noticias: results },
          summary: {
            total: urls.length,
            success: results.length,
            failed: errors.length
          },
          errors
        };
        break;
      }
      
      
      default: {
        // Auto mode - let AI decide
        const aiResult = await generateWithAI(content, systemPrompt);
        let parsed = JSON.parse(aiResult.replace(/```json\n?|\n?```/g, ''));
        
        // Ensure required fields and auto-fix lide
        if (parsed.noticias) {
          parsed.noticias = parsed.noticias.map((article: NewsArticle, idx: number) => {
            let enriched = ensureRequiredFields(article);
            enriched.conteudo = autoFixLide ? autoFixFirstParagraph(enriched.conteudo) : enriched.conteudo;
            
            // Apply images and highlights to first article only
            if (idx === 0) {
              enriched = applyImages(enriched, imageUrls);
              enriched = applyHighlights(enriched);
            }
            
            return enriched;
          });
        }
        
        result = {
          mode: 'auto',
          json: parsed
        };
      }
    }
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (err) {
    console.error('Error in noticias-ai-generate:', err);
    const errorMessage = err instanceof Error ? err.message : 'Erro ao processar solicitação';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
