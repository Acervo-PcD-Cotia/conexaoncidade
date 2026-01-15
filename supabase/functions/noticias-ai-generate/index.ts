import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateRequest {
  mode: 'exclusiva' | 'manual' | 'json' | 'url' | 'batch' | 'auto';
  content: string;
  imageUrl?: string;
  autoFixLide?: boolean;
}

interface NewsArticle {
  titulo: string;
  slug: string;
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
  subtitulo?: string;
  chapeu?: string;
  editor?: string;
  destaque?: 'none' | 'home' | 'featured' | 'urgent';
}

// Helper: Check if string is an image URL
function isImageUrl(url?: string): boolean {
  if (!url) return false;
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
  const lowerUrl = url.toLowerCase();
  return imageExtensions.some(ext => lowerUrl.includes(ext));
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
function ensureRequiredFields(article: NewsArticle, sourceUrl?: string): NewsArticle {
  return {
    ...article,
    subtitulo: article.subtitulo || article.resumo?.substring(0, 100) || 'Saiba mais sobre esta notícia',
    chapeu: article.chapeu || article.categoria?.toUpperCase() || 'NOTÍCIAS',
    editor: article.editor || 'Redação Conexão na Cidade',
    fonte: sourceUrl || sanitizeSource(article.fonte),
    conteudo: sanitizeContent(article.conteudo, sourceUrl || article.fonte),
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
    
    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i) ||
                       html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i);
    const title = titleMatch ? titleMatch[1].trim() : 'Sem título';
    
    // Extract main content (simplified - real implementation would be more robust)
    const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
                         html.match(/<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    let content = articleMatch ? articleMatch[1] : '';
    
    // Clean HTML tags but keep paragraphs
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
      allImages: allImages.slice(0, 5), // Max 5 images
      wordCount
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
    let { mode, content, imageUrl, autoFixLide = true } = body;
    
    // Auto-detect mode if not specified
    if (mode === 'auto' || !mode) {
      mode = detectMode(content) as GenerateRequest['mode'];
    }
    
    console.log(`Processing with mode: ${mode}`);
    
    const systemPrompt = `Você é um jornalista experiente seguindo o padrão editorial da Agência Brasil.

REGRAS CRÍTICAS:
1. REESCREVA mantendo APROXIMADAMENTE O MESMO TAMANHO da matéria original
2. NÃO INCLUA URLs de imagens no texto - as imagens são tratadas separadamente
3. NÃO INCLUA tags <img> no conteúdo
4. NÃO CRIE conteúdo novo ou invente informações
5. PRESERVE todos os dados factuais: nomes, datas, locais, valores

REGRAS DE FORMATAÇÃO AGÊNCIA BRASIL:
1. LIDE (1º parágrafo) SEMPRE em <strong>texto completo do lide</strong>
2. CITAÇÕES de fontes: "declaração", <strong>afirmou Fulano em entrevista.</strong>
3. LINKS externos: <a href="url"><strong>texto do link</strong></a> (negrito + sublinhado)
4. INTERTÍTULOS: <h2>Título da Seção</h2> (sem decoração, sem negrito extra)
5. BLOCKQUOTES para citações longas: <blockquote><p>"citação completa aqui"</p></blockquote>
6. PARÁGRAFOS separados por <p>...</p>
7. LISTAS quando apropriado: <ul><li>item</li></ul>

ESTRUTURA DA NOTÍCIA:
- Lide (quem, o quê, quando, onde, como, por quê) - OBRIGATORIAMENTE EM NEGRITO
- Desenvolvimento com intertítulos H2
- Citações de especialistas/autoridades
- Contexto e repercussão
- Conclusão ou próximos passos

LIMITES:
- Se a matéria original tem ~500 palavras, a reescrita deve ter ~450-550 palavras
- Se tem ~1000 palavras, deve ter ~900-1100 palavras
- Título: max 100 caracteres
- Resumo/excerpt: max 160 caracteres
- Meta description: max 160 caracteres
- Meta title: max 60 caracteres
- Tags: max 40 chars cada, máximo 12 tags
- Categorias: Política, Economia, Esportes, Cultura, Tecnologia, Saúde, Educação, Cidade, Brasil, Mundo

FORMATO JSON COMPLETO:
{
  "noticias": [{
    "titulo": "Título da notícia (max 100 chars)",
    "slug": "titulo-em-kebab-case",
    "subtitulo": "Linha fina descritiva que complementa o título",
    "chapeu": "CATEGORIA EM MAIÚSCULAS",
    "resumo": "Resumo breve (max 160 chars)",
    "conteudo": "<p><strong>Lide completo em negrito com todas as informações principais.</strong></p><h2>Intertítulo</h2><p>Desenvolvimento...</p><blockquote><p>\\"Citação longa\\"</p></blockquote><p>O ministro <strong>afirmou em entrevista.</strong></p>",
    "categoria": "Nome da categoria",
    "tags": ["tag1", "tag2"],
    "imagem": {
      "hero": "URL da imagem principal",
      "og": "URL imagem OG 1200x630",
      "card": "URL imagem card 800x450",
      "alt": "Descrição acessível da imagem",
      "credito": "AGÊNCIA/FOTÓGRAFO/PROIBIDA REPRODUÇÃO"
    },
    "seo": {
      "meta_titulo": "Meta título otimizado (max 60 chars)",
      "meta_descricao": "Meta descrição com palavras-chave (max 160 chars)"
    },
    "fonte": "URL da fonte original",
    "editor": "Nome do Editor"
  }]
}`;
    
    let result: any;
    
    switch (mode) {
      case 'exclusiva': {
        // Preserve original text, just format it
        const cleanContent = content.replace(/^EXCLUSIVA\s*/i, '').trim();
        result = {
          mode: 'exclusiva',
          manual: {
            titulo: cleanContent.split('\n')[0].substring(0, 100),
            slug: generateSlug(cleanContent.split('\n')[0]),
            resumo: cleanContent.substring(0, 160),
            conteudo: `<p>${cleanContent.split('\n').join('</p><p>')}</p>`,
            categoria: 'Cidade',
            fonte: '',
            imagem: { hero: imageUrl || '', alt: '', credito: '', galeria: [] },
            seo: {
              meta_titulo: cleanContent.split('\n')[0].substring(0, 60),
              meta_descricao: cleanContent.substring(0, 160)
            }
          }
        };
        break;
      }
      
      case 'manual': {
        const cleanContent = content.replace(/^CADASTRO MANUAL\s*/i, '').trim();
        const aiResult = await generateWithAI(cleanContent, systemPrompt);
        const parsed = JSON.parse(aiResult.replace(/```json\n?|\n?```/g, ''));
        const article = parsed.noticias[0];
        
        result = {
          mode: 'manual',
          manual: {
            ...article,
            conteudo: autoFixLide ? autoFixFirstParagraph(article.conteudo) : article.conteudo,
            imagem: { ...article.imagem, hero: imageUrl || article.imagem.hero, galeria: [] }
          }
        };
        break;
      }
      
      case 'json': {
        const cleanContent = content.replace(/^JSON\s*/i, '').trim();
        const aiResult = await generateWithAI(cleanContent, systemPrompt);
        let parsed = JSON.parse(aiResult.replace(/```json\n?|\n?```/g, ''));
        
        // Ensure required fields and auto-fix lide
        if (parsed.noticias) {
          parsed.noticias = parsed.noticias.map((article: NewsArticle) => {
            const enriched = ensureRequiredFields(article);
            return {
              ...enriched,
              conteudo: autoFixLide ? autoFixFirstParagraph(enriched.conteudo) : enriched.conteudo
            };
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
          
          // Set images with gallery
          if (extracted.allImages.length > 0) {
            parsed.noticias[0].imagem = {
              ...parsed.noticias[0].imagem,
              hero: extracted.allImages[0],
              galeria: extracted.allImages.slice(1) // Additional images
            };
          }
          
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
        
        for (const url of urls) {
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
              
              // Set images with gallery
              if (extracted.allImages.length > 0) {
                article.imagem = {
                  ...article.imagem,
                  hero: extracted.allImages[0],
                  galeria: extracted.allImages.slice(1) // Additional images
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
          parsed.noticias = parsed.noticias.map((article: NewsArticle) => {
            const enriched = ensureRequiredFields(article);
            return {
              ...enriched,
              conteudo: autoFixLide ? autoFixFirstParagraph(enriched.conteudo) : enriched.conteudo
            };
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
