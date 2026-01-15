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

async function extractFromUrl(url: string): Promise<{ title: string; content: string; imageUrl?: string }> {
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
    
    const imageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i);
    const imageUrl = imageMatch ? imageMatch[1] : undefined;
    
    return { title, content: content.substring(0, 5000), imageUrl };
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
  "chapeu": "CATEGORIA",
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
          const article = await generateWithAI(
            `URL: ${url}\nTítulo: ${extracted.title}\nConteúdo: ${extracted.content}`
          );
          
          article.fonte = url.trim();
          if (extracted.imageUrl && !article.imagem?.hero) {
            article.imagem = { ...article.imagem, hero: extracted.imageUrl };
          }
          if (autoFixLide && article.conteudo) {
            article.conteudo = autoFixFirstParagraph(article.conteudo);
          }
          
          return { url, article };
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
