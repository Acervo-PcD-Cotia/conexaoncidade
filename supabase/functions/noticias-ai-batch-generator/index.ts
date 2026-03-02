import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface NewsLink {
  label: string;
  url: string;
}

interface NewsInput {
  linkMateria: string;
  linkImagem: string;
  dataPublicacao: string;
  title?: string;
  subtitle?: string;
  source?: string;
  description?: string;
  extraImages?: string[];
  links?: NewsLink[];
}

interface BatchRequest {
  quantidadeNoticias: number;
  noticias: NewsInput[];
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

function isValidImageUrl(imgUrl: string): boolean {
  if (!imgUrl) return false;
  const lowerUrl = imgUrl.toLowerCase();
  const excludePatterns = [
    'icon', 'logo', 'avatar', 'pixel', '1x1', 'gravatar', 'emoji',
    'sprite', 'button', 'banner-ad', '/themes/', '/modules/', 'widget',
    'tracking', 'spinner', 'loading', 'placeholder', 'blank', 'spacer',
    'social-', 'share-', 'print-', '.svg', 'data:image', '/favicon', 'badge'
  ];
  for (const pattern of excludePatterns) {
    if (lowerUrl.includes(pattern)) return false;
  }
  return true;
}

function normalizeImageUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    urlObj.search = '';
    return `${urlObj.origin}${urlObj.pathname}`;
  } catch {
    return url.replace(/\?.*$/, '');
  }
}

// Try Firecrawl first, then fallback to manual fetch
async function extractFromUrl(url: string): Promise<{
  title: string;
  subtitle: string;
  author: string;
  city: string;
  content: string;
  category: string;
  tags: string[];
  allImages: string[];
  charCount: number;
}> {
  const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');

  let title = '';
  let content = '';
  let allImages: string[] = [];

  if (FIRECRAWL_API_KEY) {
    try {
      const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          formats: ['markdown', 'html'],
          onlyMainContent: true,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          title = data.data.metadata?.title || data.data.metadata?.ogTitle || '';
          content = data.data.markdown || '';

          // Extract images
          const seenNormalized = new Set<string>();
          if (data.data.metadata?.ogImage && isValidImageUrl(data.data.metadata.ogImage)) {
            allImages.push(data.data.metadata.ogImage);
            seenNormalized.add(normalizeImageUrl(data.data.metadata.ogImage));
          }
          if (data.data.html) {
            const imageRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
            let match;
            while ((match = imageRegex.exec(data.data.html)) !== null) {
              let imgUrl = match[1];
              if (imgUrl.startsWith('/')) {
                try { imgUrl = `${new URL(url).origin}${imgUrl}`; } catch {}
              } else if (!imgUrl.startsWith('http')) continue;
              if (isValidImageUrl(imgUrl)) {
                const normalized = normalizeImageUrl(imgUrl);
                if (!seenNormalized.has(normalized)) {
                  seenNormalized.add(normalized);
                  allImages.push(imgUrl);
                }
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('Firecrawl error:', err);
    }
  }

  // Fallback
  if (!content || content.length < 100) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8'
        }
      });
      const html = await response.text();

      const titleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i) ||
                         html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch) title = titleMatch[1].trim();

      // Extract paragraphs
      const paragraphs: string[] = [];
      const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
      let pMatch;
      while ((pMatch = pRegex.exec(html)) !== null) {
        const text = pMatch[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim();
        if (text.length > 20) paragraphs.push(text);
      }
      if (paragraphs.length > 0) content = paragraphs.join('\n\n');

      // Extract images
      if (allImages.length === 0) {
        const ogImageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i);
        if (ogImageMatch && ogImageMatch[1]) allImages.push(ogImageMatch[1]);
      }
    } catch (err) {
      console.error('Fallback extraction error:', err);
    }
  }

  if (!title) title = 'Sem título';
  if (!content || content.length < 50) throw new Error(`Conteúdo insuficiente extraído de ${url}`);

  return {
    title,
    subtitle: '',
    author: '',
    city: '',
    content: content.substring(0, 12000),
    category: '',
    tags: [],
    allImages: allImages.slice(0, 5),
    charCount: content.length,
  };
}

interface AIProviderPayload {
  providerId?: string;
  model?: string;
}

function getAIEndpointAndHeaders(provider: AIProviderPayload): { url: string; headers: Record<string, string>; model: string } {
  const providerId = provider.providerId || "lovable";
  let model = provider.model || "google/gemini-2.5-flash";

  if (providerId === "abacus") {
    const apiKey = Deno.env.get("ABACUS_API_KEY");
    if (!apiKey) throw new Error("ABACUS_API_KEY não configurada. Adicione a chave nas configurações.");
    model = model === "auto" || model === "abacus/auto" ? "route-llm" : model;
    return {
      url: "https://routellm.abacus.ai/v1/chat/completions",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      model,
    };
  }

  // Default: Lovable AI gateway (covers lovable, gemini, openai providers)
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) throw new Error("LOVABLE_API_KEY não configurada.");
  if (model === "auto") model = "google/gemini-2.5-flash";
  return {
    url: "https://ai.gateway.lovable.dev/v1/chat/completions",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    model,
  };
}

async function rewriteWithAI(extracted: {
  title: string;
  content: string;
  charCount: number;
}, sourceUrl: string, imageUrl: string, dataPublicacao: string, provider: AIProviderPayload = {}, optionalFields?: { title?: string; subtitle?: string; source?: string; description?: string }): Promise<any> {
  const { url: aiUrl, headers: aiHeaders, model } = getAIEndpointAndHeaders(provider);

  const minChars = Math.floor(extracted.charCount * 0.95);
  const maxChars = Math.ceil(extracted.charCount * 1.05);

  const systemPrompt = `Você é a IA oficial de reescrita de notícias do portal Conexão na Cidade.

## REGRAS ABSOLUTAS
1. Reescreva INTEGRALMENTE o texto. NÃO copie estrutura literal.
2. NÃO resuma. NÃO expanda artificialmente.
3. Mantenha equivalência factual: datas, números, locais, nomes.
4. NÃO invente informação.
5. NÃO use travessão (—).
6. NÃO inclua URLs de imagens no conteúdo.
7. A reescrita DEVE ter entre ${minChars} e ${maxChars} caracteres (95-105% do original de ${extracted.charCount} chars).

## CATEGORIAS VÁLIDAS
Justiça, Geral, Saúde, Economia, Política, Meio Ambiente, Esportes, Direitos Humanos, Educação, Internacional, Cidades, Segurança Pública, Ciência, Tecnologia, Infraestrutura, Entretenimento, Cultura, Comportamento, Lifestyle, Emprego & Renda, Mobilidade Urbana, Inclusão & PCD, Projetos Sociais, Inovação Pública, Brasil

## ESTRUTURA HTML DO CONTEÚDO (OBRIGATÓRIO - Modelo Agência Brasil)
- Primeiro parágrafo = lide em <p><strong>...</strong></p>
- Sessões principais com <h2> (centralidade tópica, pelo menos 2-3 seções H2)
- Subtópicos com <h3> quando aplicável
- Citações em <blockquote>
- Parágrafos com <p>
- Sem estilos inline, sem classes, sem comentários

## TAGS (OBRIGATÓRIO 3-12)
- Tags devem ser NOMES PRÓPRIOS legíveis (ex: "Domingos Brazão", "Marielle Franco", "STF")
- NUNCA use formato slug nas tags (ex: NÃO use "domingos-brazao")
- Cada tag com máximo de 40 caracteres

## FORMATO DE SAÍDA (JSON PURO)
Responda APENAS com este JSON (sem markdown, sem comentários):
{
  "categoria": "",
  "titulo": "",
  "slug": "",
  "subtitulo": "",
  "chapeu": "",
  "resumo": "",
  "conteudo": "",
  "editor": "Redação Conexão na Cidade",
  "fonte": "${optionalFields?.source || sourceUrl}",
  "dataPublicacao": "${dataPublicacao}",
  "imagem": {
    "hero": "${imageUrl}",
    "og": "${imageUrl}",
    "card": "${imageUrl}",
    "alt": "",
    "credito": "Agência Brasil",
    "galeria": []
  },
  "tags": [],
  "seo": {
    "meta_titulo": "",
    "meta_descricao": ""
  },
  "destaque": "none",
  "generateWebStory": true
}

## LIMITES
- titulo: max 100 chars
- subtitulo: max 160 chars
- resumo: 140-200 chars, descritivo, jornalístico, diferente do subtitulo
- slug: kebab-case sem acentos
- seo.meta_titulo: max 60 chars
- seo.meta_descricao: max 160 chars
- tags: 3-12 itens, NOMES PRÓPRIOS legíveis
- chapeu: "CIDADE | CATEGORIA" ou "BRASIL | CATEGORIA"`;

  const extraContext: string[] = [];
  if (optionalFields?.title) extraContext.push(`Título sugerido (use como base, pode refinar): ${optionalFields.title}`);
  if (optionalFields?.subtitle) extraContext.push(`Subtítulo sugerido: ${optionalFields.subtitle}`);
  if (optionalFields?.source) extraContext.push(`Fonte oficial: ${optionalFields.source}`);
  if (optionalFields?.description) extraContext.push(`Descrição/contexto adicional: ${optionalFields.description}`);

  const contentToRewrite = extracted.content || optionalFields?.description || '';
  const effectiveCharCount = contentToRewrite.length || extracted.charCount;

  const userPrompt = `Reescreva esta notícia mantendo ${minChars}-${maxChars} caracteres:

Título: ${optionalFields?.title || extracted.title}
${extraContext.length > 0 ? '\n## Informações adicionais fornecidas pelo editor:\n' + extraContext.join('\n') + '\n' : ''}
Conteúdo Original (${effectiveCharCount} caracteres):
${contentToRewrite}`;

  console.log(`Using AI provider: ${provider.providerId || 'lovable'}, model: ${model}`);

  const response = await fetch(aiUrl, {
    method: "POST",
    headers: aiHeaders,
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('AI error:', response.status, errorText);

    if (response.status === 429) {
      throw new Error('Rate limit excedido. Tente novamente em alguns minutos.');
    }
    if (response.status === 402) {
      throw new Error('Créditos de IA insuficientes.');
    }
    throw new Error(`Falha na reescrita com IA (${response.status})`);
  }

  const data = await response.json();
  const aiContent = data.choices?.[0]?.message?.content || '';

  // Parse JSON from AI response
  const cleaned = aiContent.replace(/```json\n?|\n?```/g, '').trim();
  const parsed = JSON.parse(cleaned);

  // Ensure slug
  if (!parsed.slug) {
    parsed.slug = generateSlug(parsed.titulo || extracted.title);
  }

  // Ensure image
  if (!parsed.imagem || !parsed.imagem.hero) {
    parsed.imagem = {
      hero: imageUrl,
      og: imageUrl,
      card: imageUrl,
      alt: parsed.titulo || '',
      credito: 'Agência Brasil',
      galeria: []
    };
  }

  // Ensure required fields
  parsed.fonte = parsed.fonte || sourceUrl;
  parsed.dataPublicacao = dataPublicacao;
  parsed.destaque = parsed.destaque || 'none';
  parsed.generateWebStory = parsed.generateWebStory ?? true;

  // Normalize tags: convert slug-format to proper names (e.g., "domingos-brazao" → "Domingos Brazão")
  if (parsed.tags && Array.isArray(parsed.tags)) {
    parsed.tags = parsed.tags.map((tag: string) => {
      // If tag is in slug format (contains hyphens and no spaces), convert to proper name
      if (tag.includes('-') && !tag.includes(' ')) {
        return tag
          .split('-')
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
      }
      return tag;
    });
  }

  // Ensure tags 3-12
  if (!parsed.tags || parsed.tags.length < 3) {
    const fallback = [parsed.categoria || 'Notícias', 'Cotia', 'São Paulo', 'Atualidades'];
    parsed.tags = parsed.tags || [];
    for (const t of fallback) {
      if (parsed.tags.length >= 3) break;
      if (!parsed.tags.some((x: string) => x.toLowerCase() === t.toLowerCase())) {
        parsed.tags.push(t);
      }
    }
  }
  parsed.tags = parsed.tags.slice(0, 12);

  // ALWAYS force editor to Redação Conexão na Cidade
  parsed.editor = 'Redação Conexão na Cidade';

  // Truncate SEO
  if (parsed.seo) {
    parsed.seo.meta_titulo = (parsed.seo.meta_titulo || parsed.titulo)?.substring(0, 60);
    parsed.seo.meta_descricao = (parsed.seo.meta_descricao || parsed.resumo)?.substring(0, 160);
  }

  // Ensure chapeu format: "CIDADE | CATEGORIA" or "BRASIL | CATEGORIA"
  if (!parsed.chapeu || !parsed.chapeu.includes('|')) {
    const categoria = (parsed.categoria || 'GERAL').toUpperCase();
    const tagsLower = (parsed.tags || []).map((t: string) => t.toLowerCase());
    const isNacional = categoria === 'BRASIL' || categoria === 'INTERNACIONAL'
      || tagsLower.includes('brasil') || tagsLower.includes('nacional')
      || tagsLower.includes('governo federal');
    parsed.chapeu = isNacional ? `BRASIL | ${categoria}` : `COTIA | ${categoria}`;
  }

  // Ensure lide is bold
  if (parsed.conteudo && !parsed.conteudo.includes('<strong>')) {
    parsed.conteudo = parsed.conteudo.replace(
      /^(<p>)?([^<]+)/,
      '<p><strong>$2</strong></p>'
    );
  }

  // Ensure H2/H3 structure exists (Agência Brasil style)
  if (parsed.conteudo && !parsed.conteudo.includes('<h2>') && !parsed.conteudo.includes('<h2 ')) {
    // Content lacks H2 headings - the prompt should have generated them
    // but as fallback, we leave content as-is since forcing headers could break structure
    console.warn('Content lacks H2/H3 headers - AI should have generated them');
  }

  return parsed;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { quantidadeNoticias, noticias, aiProvider } = body as BatchRequest & { aiProvider?: AIProviderPayload };

    if (!noticias || !Array.isArray(noticias) || noticias.length === 0) {
      return new Response(
        JSON.stringify({ error: 'O campo "noticias" é obrigatório e deve conter pelo menos um item.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (noticias.length !== quantidadeNoticias) {
      console.warn(`quantidadeNoticias (${quantidadeNoticias}) differs from actual items (${noticias.length})`);
    }

    console.log(`AI Provider config:`, JSON.stringify(aiProvider || { providerId: 'lovable' }));

    const results: any[] = [];
    const errors: { index: number; url: string; error: string }[] = [];

    for (let i = 0; i < noticias.length; i++) {
      const item = noticias[i];
      console.log(`Processing ${i + 1}/${noticias.length}: ${item.linkMateria}`);

      try {
        if (!item.linkMateria || !item.linkMateria.startsWith('http')) {
          throw new Error('URL inválida');
        }

        const extracted = await extractFromUrl(item.linkMateria);

        const article = await rewriteWithAI(
          extracted,
          item.linkMateria,
          item.linkImagem || extracted.allImages[0] || '',
          item.dataPublicacao || new Date().toLocaleDateString('pt-BR'),
          aiProvider || {},
          { title: item.title, subtitle: item.subtitle, source: item.source, description: item.description }
        );

        // Override fonte with user-provided source if available
        if (item.source && article.fonte !== undefined) {
          article.fonte = item.source;
        }

        // Merge extra images into galeria
        if (item.extraImages && item.extraImages.length > 0) {
          const existingGaleria = article.imagem?.galeria || [];
          const validExtras = item.extraImages.filter((img: string) => img && img.startsWith('http'));
          article.imagem = {
            ...article.imagem,
            galeria: [...existingGaleria, ...validExtras],
          };
        }

        // Pass through links
        if (item.links && item.links.length > 0) {
          article.links = item.links.filter((l: NewsLink) => l.url);
        }

        results.push(article);
        console.log(`✓ Article ${i + 1} processed: ${article.titulo}`);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        console.error(`✕ Article ${i + 1} failed:`, errorMessage);
        errors.push({ index: i, url: item.linkMateria, error: errorMessage });

        // If rate limited or no credits, stop processing
        if (errorMessage.includes('Rate limit') || errorMessage.includes('Créditos')) {
          break;
        }
      }
    }

    // Validate: number of results matches expected
    const finalJson = { noticias: results };

    return new Response(
      JSON.stringify({
        success: true,
        json: finalJson,
        summary: {
          requested: quantidadeNoticias,
          processed: results.length,
          failed: errors.length,
        },
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Batch generator error:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Erro interno' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
