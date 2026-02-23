import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BatchRequest {
  urls: string[];
  sourceId?: string;
  autoFixLide?: boolean;
}

// Helper: Check if string is an image URL
function isImageUrl(url?: string): boolean {
  if (!url) return false;
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
  return imageExtensions.some(ext => url.toLowerCase().includes(ext));
}

// Helper: Sanitize source - remove image URLs
function sanitizeSource(source?: string): string {
  if (!source) return '';
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
// Helper: Gerar chapéu com nova lógica CIDADE | CATEGORIA ou BRASIL | CATEGORIA
function generateChapeuFromArticle(article: any): string {
  if (article.chapeu && article.chapeu.includes('|')) return article.chapeu;
  const categoria = (article.categoria || 'GERAL').toUpperCase();
  const tagsLower = (article.tags || []).map((t: string) => t.toLowerCase());
  const isNacional = categoria === 'BRASIL' || categoria === 'INTERNACIONAL'
    || tagsLower.includes('brasil') || tagsLower.includes('nacional');
  if (isNacional) return `BRASIL | ${categoria}`;
  const cidadeTag = (article.tags || []).find((t: string) => {
    const lower = t.toLowerCase();
    return !['cotia', 'são paulo', 'regional', 'atualidades', 'destaque'].includes(lower)
      && t.length > 2 && t.length < 30 && /^[A-ZÀ-Úa-zà-ú\s-]+$/.test(t);
  });
  return `${(cidadeTag || 'COTIA').toUpperCase()} | ${categoria}`;
}

function ensureRequiredFields(article: any, sourceUrl?: string): any {
  return {
    ...article,
    subtitulo: article.subtitulo || article.resumo?.substring(0, 100) || 'Saiba mais sobre esta notícia',
    chapeu: generateChapeuFromArticle(article),
    editor: article.editor || 'Redação Conexão na Cidade',
    fonte: sourceUrl || sanitizeSource(article.fonte),
    conteudo: sanitizeContent(article.conteudo, sourceUrl || article.fonte),
  };
}

async function extractFromUrl(url: string): Promise<{ 
  title: string; 
  content: string; 
  imageUrl?: string;
  allImages: string[];
  wordCount: number;
}> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    const html = await response.text();
    
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i) ||
                       html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i);
    const title = titleMatch ? titleMatch[1].trim() : 'Sem título';
    
    const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
                         html.match(/<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    let content = articleMatch ? articleMatch[1] : '';
    
    content = content
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Count words for length reference
    const wordCount = content.split(/\s+/).filter(Boolean).length;
    
    // Extract ALL images from the page
    const allImages: string[] = [];
    
    // Get og:image first (main image)
    const ogImageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i);
    if (ogImageMatch && ogImageMatch[1]) {
      allImages.push(ogImageMatch[1]);
    }
    
    // Extract images from content
    const imageRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    let match;
    while ((match = imageRegex.exec(html)) !== null) {
      const imgUrl = match[1];
      // Filter out icons, trackers, logos, small images
      const isValidImage = imgUrl && 
        !imgUrl.includes('icon') && 
        !imgUrl.includes('logo') && 
        !imgUrl.includes('avatar') &&
        !imgUrl.includes('pixel') &&
        !imgUrl.includes('1x1') &&
        !imgUrl.includes('gravatar') &&
        !imgUrl.includes('emoji') &&
        (imgUrl.endsWith('.jpg') || imgUrl.endsWith('.jpeg') || 
         imgUrl.endsWith('.png') || imgUrl.endsWith('.webp') ||
         imgUrl.includes('.jpg') || imgUrl.includes('.jpeg') || 
         imgUrl.includes('.png') || imgUrl.includes('.webp')) &&
        !allImages.includes(imgUrl);
      
      if (isValidImage) {
        // Convert relative URLs to absolute
        let absoluteUrl = imgUrl;
        if (imgUrl.startsWith('/')) {
          try {
            const baseUrl = new URL(url);
            absoluteUrl = `${baseUrl.origin}${imgUrl}`;
          } catch {}
        }
        allImages.push(absoluteUrl);
      }
    }
    
    return { 
      title, 
      content: content.substring(0, 5000), 
      imageUrl: allImages[0],
      allImages: allImages.slice(0, 5),
      wordCount
    };
  } catch (error) {
    console.error('Error extracting from URL:', error);
    throw new Error(`Falha ao extrair: ${url}`);
  }
}

function autoFixFirstParagraph(content: string): string {
  const trimmed = content.trim();
  if (trimmed.startsWith('<p><strong>') || trimmed.startsWith('<strong>')) {
    return content;
  }
  
  const firstParagraphMatch = trimmed.match(/^(<p>)?([^<]+)(<\/p>)?/);
  if (firstParagraphMatch) {
    const firstParagraph = firstParagraphMatch[2];
    const rest = trimmed.substring(firstParagraphMatch[0].length);
    return `<p><strong>${firstParagraph}</strong></p>${rest}`;
  }
  
  return content;
}

async function generateWithAI(prompt: string): Promise<any> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
  
  const systemPrompt = `Você é um jornalista experiente seguindo o padrão editorial da Agência Brasil.

REGRAS CRÍTICAS:
1. REESCREVA mantendo APROXIMADAMENTE O MESMO TAMANHO da matéria original
2. NÃO INCLUA URLs de imagens no texto - as imagens são tratadas separadamente
3. NÃO INCLUA tags <img> no conteúdo
4. NÃO CRIE conteúdo novo ou invente informações
5. PRESERVE todos os dados factuais: nomes, datas, locais, valores

REGRAS DE FORMATAÇÃO AGÊNCIA BRASIL:
1. LIDE (1º parágrafo) SEMPRE em <strong>texto completo</strong>
2. CITAÇÕES: "declaração", <strong>afirmou Fulano.</strong>
3. LINKS: <a href="url"><strong>texto</strong></a>
4. INTERTÍTULOS: <h2>Título</h2> (limpo, sem decoração)
5. BLOCKQUOTES: <blockquote><p>"citação"</p></blockquote>
6. CRÉDITO DE IMAGEM: AGÊNCIA/FOTÓGRAFO/REPRODUÇÃO

LIMITES:
- Título: max 100 chars
- Resumo: max 160 chars
- Meta title: max 60 chars
- Meta desc: max 160 chars
- Tags: max 12, cada max 40 chars

FORMATO JSON COMPLETO:
{
  "titulo": "...",
  "slug": "...",
  "subtitulo": "Linha fina descritiva",
  "chapeu": "CIDADE | CATEGORIA ou BRASIL | CATEGORIA",
  "resumo": "...",
  "conteudo": "<p><strong>Lide em negrito</strong></p><h2>Intertítulo</h2><p>Texto...</p>",
  "categoria": "...",
  "tags": ["..."],
  "imagem": { "hero": "", "og": "", "card": "", "alt": "", "credito": "FONTE/CRÉDITO" },
  "seo": { "meta_titulo": "...", "meta_descricao": "..." },
  "fonte": "",
  "editor": "Nome Editor"
}`;
  
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
    throw new Error('AI API error');
  }
  
  const data = await response.json();
  const content = data.choices[0]?.message?.content || '{}';
  return JSON.parse(content.replace(/```json\n?|\n?```/g, ''));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { urls, autoFixLide = true }: BatchRequest = await req.json();
    
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      throw new Error('URLs array is required');
    }
    
    const limitedUrls = urls.slice(0, 10);
    const results: any[] = [];
    const errors: { url: string; error: string }[] = [];
    
    // Process URLs in parallel with concurrency limit
    const batchSize = 3;
    for (let i = 0; i < limitedUrls.length; i += batchSize) {
      const batch = limitedUrls.slice(i, i + batchSize);
      
      const batchResults = await Promise.allSettled(
        batch.map(async (url) => {
          const extracted = await extractFromUrl(url.trim());
          
          // Calculate character limits (95%-105% of original)
          const charCount = extracted.content.length;
          const minChars = Math.floor(charCount * 0.95);
          const maxChars = Math.ceil(charCount * 1.05);
          
          const article = await generateWithAI(
            `URL: ${url}\nTítulo: ${extracted.title}\nConteúdo Original (${charCount} caracteres, ${extracted.wordCount} palavras):\n${extracted.content}\n\n⚠️ REGRA CRÍTICA DE TAMANHO:\n- A matéria original tem ${charCount} caracteres\n- Sua reescrita DEVE ter entre ${minChars} e ${maxChars} caracteres (95%-105% do original)\n- NÃO encurte a matéria. NÃO omita informações.\n- NÃO inclua URLs de imagens no texto.`
          );
          
          // Ensure required fields with fallbacks and add source link
          let enrichedArticle = ensureRequiredFields(article, url.trim());
          
          // Set images with gallery
          if (extracted.allImages.length > 0) {
            enrichedArticle.imagem = {
              ...enrichedArticle.imagem,
              hero: extracted.allImages[0],
              galeria: extracted.allImages.slice(1) // Additional images
            };
          }
          
          if (autoFixLide && enrichedArticle.conteudo) {
            enrichedArticle.conteudo = autoFixFirstParagraph(enrichedArticle.conteudo);
          }
          
          return { url, article: enrichedArticle };
        })
      );
      
      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          const url = batch[batchResults.indexOf(result)];
          errors.push({ url, error: result.reason?.message || 'Unknown error' });
        }
      }
    }
    
    return new Response(JSON.stringify({
      results: results.map(r => ({ url: r.url, success: true, data: r.article })),
      errors,
      summary: {
        total: limitedUrls.length,
        success: results.length,
        failed: errors.length
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (err) {
    console.error('Error in reporter-batch:', err);
    const errorMessage = err instanceof Error ? err.message : 'Erro ao processar lote';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
