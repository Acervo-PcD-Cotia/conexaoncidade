import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CLUSTER_CITIES = [
  'Cotia', 'Itapevi', 'Vargem Grande Paulista', 'São Roque', 'Ibiúna',
  'Embu-Guaçu', 'Embu das Artes', 'Itapecerica da Serra', 'São Lourenço da Serra',
  'São Paulo', 'Osasco', 'Jandira', 'Carapicuíba', 'Barueri'
];

function generateMandatoryTags(city: string, title: string, content: string): string[] {
  const tags: string[] = [city, 'regional', 'grande cotia', 'prefeitura', 'governo municipal',
    'serviço público', 'administração', 'região oeste', 'são paulo', 'interior paulista'];

  const lowerContent = (title + ' ' + content).toLowerCase();
  if (lowerContent.includes('saúde') || lowerContent.includes('hospital') || lowerContent.includes('ubs')) {
    tags.push('saúde');
  } else if (lowerContent.includes('educação') || lowerContent.includes('escola') || lowerContent.includes('creche')) {
    tags.push('educação');
  } else if (lowerContent.includes('obra') || lowerContent.includes('pavimentação') || lowerContent.includes('infraestrutura')) {
    tags.push('obras');
  } else if (lowerContent.includes('cultura') || lowerContent.includes('evento') || lowerContent.includes('festival')) {
    tags.push('cultura');
  } else if (lowerContent.includes('segurança') || lowerContent.includes('guarda') || lowerContent.includes('polícia')) {
    tags.push('segurança');
  } else if (lowerContent.includes('social') || lowerContent.includes('assistência') || lowerContent.includes('cras')) {
    tags.push('assistência social');
  } else {
    tags.push('notícias locais');
  }

  const topicKeywords = title.split(' ')
    .filter(w => w.length > 5)
    .map(w => w.toLowerCase().replace(/[^a-záàâãéèêíïóôõöúç]/gi, ''))
    .filter(w => !['prefeitura', 'municipal', 'cidade', 'sobre', 'para', 'como', 'quando'].includes(w));

  if (topicKeywords.length > 0) {
    tags.push(topicKeywords[0]);
  } else {
    tags.push('atualidades');
  }

  return [...new Set(tags)].slice(0, 12);
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

function sanitizeHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '');
}

function extractText(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

async function validateImageUrl(url: string): Promise<string | null> {
  if (!url) return null;
  try {
    const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
    if (response.ok) return url;
  } catch {}
  return null;
}

// ============================================================
// QUALITY GATE: Validates news before publishing
// Returns array of blocking errors (empty = OK to publish)
// ============================================================
function validateNewsQuality(params: {
  title: string;
  content: string;
  source: string | null;
  imageUrl: string | null;
}): string[] {
  const errors: string[] = [];

  // 1. Title must not contain HTML entities
  if (
    params.title &&
    (/&#[0-9]+;/.test(params.title) ||
      /&amp;/.test(params.title) ||
      /&lt;/.test(params.title) ||
      /&gt;/.test(params.title) ||
      /&quot;/.test(params.title) ||
      /&#x[0-9a-fA-F]+;/.test(params.title) ||
      /&[a-z]+;/.test(params.title))
  ) {
    errors.push('Título contém entidades HTML não decodificadas (ex: &#250; ou &amp;)');
  }

  // 2. Content must exist and have meaningful length
  const plainText = extractText(params.content || '');
  if (!params.content || plainText.length < 200) {
    errors.push(`Conteúdo insuficiente: apenas ${plainText.length} caracteres de texto (mínimo: 200)`);
  }

  // 3. Source is mandatory
  if (!params.source || params.source.trim() === '') {
    errors.push('Notícia sem fonte de referência');
  }

  // 4. Image must not be a known generic/thumbnail image
  if (params.imageUrl) {
    const lowerUrl = params.imageUrl.toLowerCase();
    if (
      lowerUrl.includes('_0001') ||
      lowerUrl.includes('-120x86') ||
      lowerUrl.includes('-150x') ||
      lowerUrl.includes('generico') ||
      lowerUrl.includes('placeholder') ||
      lowerUrl.includes('default-image') ||
      lowerUrl.includes('no-image') ||
      lowerUrl.includes('thumbnail')
    ) {
      errors.push('Imagem genérica ou thumbnail detectada (muito pequena ou sem relação com a notícia)');
    }
  }

  return errors;
}

async function fetchFullContent(url: string): Promise<{ content: string; images: string[] }> {
  console.log(`[Fetch] Getting content from: ${url}`);
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const html = await response.text();
    let content = '';
    const contentPatterns = [
      /<article[^>]*>([\s\S]*?)<\/article>/i,
      /<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*class="[^"]*post[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<main[^>]*>([\s\S]*?)<\/main>/i,
    ];

    for (const pattern of contentPatterns) {
      const match = html.match(pattern);
      if (match && match[1].length > 200) { content = match[1]; break; }
    }

    if (!content) {
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      content = bodyMatch ? bodyMatch[1] : html;
    }

    const images: string[] = [];
    const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
    let imgMatch;
    while ((imgMatch = imgRegex.exec(content)) !== null) {
      if (imgMatch[1] && !imgMatch[1].includes('logo') && !imgMatch[1].includes('icon')) {
        images.push(imgMatch[1]);
      }
    }

    content = sanitizeHtml(content);
    return { content, images };
  } catch (error) {
    console.error(`[Fetch] Error: ${error}`);
    return { content: '', images: [] };
  }
}

// Rewrite with AI — returns null on failure (allowing fallback to direct publish)
async function rewriteWithAI(
  originalTitle: string,
  originalContent: string,
  city: string,
  apiKey: string
): Promise<{ title: string; content: string; metaTitle: string; metaDescription: string; summary: string } | null> {
  console.log(`[AI] Rewriting content for ${city}...`);

  const cleanContent = extractText(originalContent).substring(0, 4000);

  const systemPrompt = `Você é um redator especialista em SEO semântico e jornalismo regional da Grande Cotia, SP.
Reescreva a notícia de forma 100% original, aplicando a metodologia SEO Genome.

REGRAS:
1. Criar título COMPLETAMENTE NOVO (máx 70 caracteres) com palavra-chave principal
2. Incluir contexto geográfico ("região de Cotia", "Grande Cotia")
3. Tom jornalístico profissional, parágrafos curtos (máx 3 linhas)
4. Conteúdo entre 300-600 palavras
5. NUNCA usar travessão (—)
6. Formato HTML: <p>, <h2>, <h3>, <strong>, <ul>, <li>
7. Primeiro parágrafo: lide em <strong>
8. Use <h2> para sessões com centralidade tópica
9. Use <h3> para subtópicos com termos relacionados
10. Distribua palavras-chave relacionadas naturalmente
11. Cada sessão acumula relevância semântica progressiva

CIDADE FONTE: ${city}

Retorne JSON válido:
{
  "title": "Título novo (máx 70 chars)",
  "content": "HTML reescrito com h2/h3 semânticos",
  "metaTitle": "Meta title SEO (máx 60 chars)",
  "metaDescription": "Meta description (máx 155 chars)",
  "summary": "Resumo 1-2 frases (máx 200 chars)"
}`;

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `TÍTULO: ${originalTitle}\n\nCONTEÚDO:\n${cleanContent}` }
        ],
        response_format: { type: 'json_object' },
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[AI] Error: ${response.status} - ${errorText}`);
      return null; // Return null to trigger fallback
    }

    const data = await response.json();
    const resultText = data.choices?.[0]?.message?.content || '';
    const result = JSON.parse(resultText);
    return {
      title: result.title || originalTitle,
      content: result.content || `<p>${cleanContent}</p>`,
      metaTitle: result.metaTitle || result.title?.substring(0, 60) || '',
      metaDescription: result.metaDescription || '',
      summary: result.summary || '',
    };
  } catch (e) {
    console.error('[AI] Failed:', e);
    return null; // Return null to trigger fallback
  }
}

// Build direct content from original without AI rewrite
function buildDirectContent(title: string, excerpt: string, content: string, city: string): {
  title: string; content: string; metaTitle: string; metaDescription: string; summary: string;
} {
  const cleanExcerpt = extractText(excerpt || '').substring(0, 300);
  const cleanContent = extractText(content || '').substring(0, 2000);
  const bodyText = cleanContent || cleanExcerpt || title;

  // Build simple HTML content from original
  const paragraphs = bodyText.split(/\.\s+/)
    .filter(p => p.trim().length > 20)
    .slice(0, 8)
    .map(p => `<p>${p.trim()}${p.trim().endsWith('.') ? '' : '.'}</p>`)
    .join('\n');

  const htmlContent = paragraphs || `<p><strong>${cleanExcerpt || title}</strong></p>`;
  const metaTitle = title.substring(0, 60);
  const metaDesc = cleanExcerpt.substring(0, 155) || title.substring(0, 155);
  const summary = cleanExcerpt.substring(0, 200) || title.substring(0, 200);

  return { title, content: htmlContent, metaTitle, metaDescription: metaDesc, summary };
}

async function checkDuplicate(supabase: any, canonicalUrl: string, title: string): Promise<{ isDuplicate: boolean; reason: string }> {
  if (canonicalUrl) {
    const { data: byUrl } = await supabase
      .from('news')
      .select('id, title')
      .or(`source.eq.${canonicalUrl},source_url.eq.${canonicalUrl}`)
      .limit(1);

    if (byUrl && byUrl.length > 0) {
      return { isDuplicate: true, reason: `Já publicado: URL duplicada` };
    }
  }

  const slug = generateSlug(title);
  const { data: bySlug } = await supabase
    .from('news')
    .select('id')
    .eq('slug', slug)
    .limit(1);

  if (bySlug && bySlug.length > 0) {
    return { isDuplicate: true, reason: `Já publicado: slug duplicado` };
  }

  return { isDuplicate: false, reason: '' };
}

async function publishItemToNews(supabase: any, item: any, source: any): Promise<{ newsId: string; slug: string; title: string }> {
  const rewrittenTitle = item.rewritten_title || item.title || 'Notícia';
  const rewrittenContent = item.rewritten_content || item.content || '';

  // ── QUALITY GATE ────────────────────────────────────────────
  const imageUrl0 = item.generated_image_url || item.image_url || null;
  const qualityErrors = validateNewsQuality({
    title: rewrittenTitle,
    content: rewrittenContent,
    source: item.canonical_url || item.source_url || source?.name || null,
    imageUrl: imageUrl0,
  });

  if (qualityErrors.length > 0) {
    console.warn(`[QualityGate] BLOQUEADO: "${rewrittenTitle}" — ${qualityErrors.join('; ')}`);
    throw new Error(`Bloqueado pelo Quality Gate: ${qualityErrors.join('; ')}`);
  }
  console.log(`[QualityGate] OK: "${rewrittenTitle}"`);
  // ────────────────────────────────────────────────────────────
  const metaTitle = item.seo_meta_title || rewrittenTitle.substring(0, 60);
  const metaDescription = item.seo_meta_description || '';
  const excerpt = extractText(rewrittenContent).substring(0, 160) || extractText(item.excerpt || '').substring(0, 160);
  const imageUrl = item.generated_image_url || item.image_url || null;
  const tags = generateMandatoryTags(source.city, rewrittenTitle, rewrittenContent);

  const baseSlug = generateSlug(rewrittenTitle);
  const timestamp = Date.now().toString(36);
  const slug = `${baseSlug}-${timestamp}`;

  let categoryId: string | null = null;
  const { data: category } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', 'cidades')
    .single();
  categoryId = category?.id || null;

  const validatedImageUrl = imageUrl ? await validateImageUrl(imageUrl) : null;
  const finalImageUrl = validatedImageUrl || imageUrl;

  // PRESERVE original published date from the source
  const publishedAt = item.published_at || new Date().toISOString();

  // Gerar chapéu: CIDADE | CATEGORIA ou BRASIL | CATEGORIA
  const isNacional = source.city.toLowerCase() === 'nacional';
  const chapeuPrefix = isNacional ? 'BRASIL' : source.city.toUpperCase();
  const chapeu = `${chapeuPrefix} | CIDADES`;

  const { data: newsEntry, error: newsError } = await supabase
    .from('news')
    .insert({
      title: rewrittenTitle,
      slug,
      content: rewrittenContent,
      excerpt,
      hat: chapeu,
      featured_image_url: finalImageUrl,
      og_image_url: finalImageUrl,
      card_image_url: finalImageUrl,
      image_alt: `Imagem: ${source.city} - ${rewrittenTitle.substring(0, 50)}`,
      image_credit: 'Prefeitura Municipal | Conexão na Cidade',
      meta_title: metaTitle,
      meta_description: metaDescription,
      source: item.canonical_url,
      status: 'published',
      published_at: publishedAt,
      original_published_at: publishedAt,
      origin: 'ai',
      category_id: categoryId,
    })
    .select('id')
    .single();

  if (newsError) {
    console.error('[Publish] Failed to create news:', newsError);
    throw new Error(`Failed to publish: ${newsError.message}`);
  }

  // Create/link tags
  for (const tagName of tags) {
    let tagId: string;
    const { data: existingTag } = await supabase
      .from('tags').select('id').eq('name', tagName).single();

    if (existingTag) {
      tagId = existingTag.id;
    } else {
      const { data: newTag } = await supabase
        .from('tags').insert({ name: tagName, slug: generateSlug(tagName) }).select('id').single();
      if (!newTag) continue;
      tagId = newTag.id;
    }

    await supabase.from('news_tags').insert({ news_id: newsEntry.id, tag_id: tagId }).select();
  }

  return { newsId: newsEntry.id, slug, title: rewrittenTitle };
}

// Main handler
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { item_id, auto_publish = false, skip_ai = false } = await req.json();

    if (!item_id) throw new Error('item_id is required');

    console.log(`[Process] Starting item: ${item_id}, auto_publish: ${auto_publish}, skip_ai: ${skip_ai}`);

    const { data: item, error: itemError } = await supabase
      .from('regional_ingest_items')
      .select('*, regional_sources(city, name, mode, tags_default)')
      .eq('id', item_id)
      .single();

    if (itemError || !item) {
      throw new Error(`Item not found: ${itemError?.message}`);
    }

    const source = item.regional_sources as { city: string; name: string; mode: string; tags_default: string[] };

    // ─── If item is already processed, just publish it ──────────────────────────
    if (item.status === 'processed' && auto_publish) {
      console.log(`[Process] Item already processed, publishing directly: ${item.rewritten_title}`);

      const dupCheck = await checkDuplicate(supabase, item.canonical_url, item.rewritten_title || item.title);
      if (dupCheck.isDuplicate) {
        await supabase.from('regional_ingest_items')
          .update({ status: 'skipped', error_message: dupCheck.reason })
          .eq('id', item_id);
        return new Response(JSON.stringify({ success: true, item_id, status: 'skipped', reason: dupCheck.reason }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const published = await publishItemToNews(supabase, item, source);
      await supabase.from('regional_ingest_items')
        .update({ status: 'published', news_id: published.newsId, published_at_portal: new Date().toISOString() })
        .eq('id', item_id);

      return new Response(JSON.stringify({ success: true, item_id, status: 'published', news_id: published.newsId, slug: published.slug, title: published.title }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ─── Skip if already published or skipped ───────────────────────────────────
    if (item.status === 'published' || item.status === 'skipped') {
      return new Response(JSON.stringify({ success: true, item_id, status: item.status, message: 'Already done' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ─── Check for duplicates BEFORE processing ──────────────────────────────────
    const dupCheck = await checkDuplicate(supabase, item.canonical_url, item.title);
    if (dupCheck.isDuplicate) {
      await supabase.from('regional_ingest_items')
        .update({ status: 'skipped', error_message: dupCheck.reason })
        .eq('id', item_id);
      return new Response(JSON.stringify({ success: true, item_id, status: 'skipped', reason: dupCheck.reason }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Mark as processing
    await supabase.from('regional_ingest_items')
      .update({ status: 'processing', processing_started_at: new Date().toISOString() })
      .eq('id', item_id);

    try {
      // 1. Fetch full content (best-effort, won't block if fails)
      const { content: fullContent, images } = await fetchFullContent(item.canonical_url);

      // 2. Try AI rewrite — fall back to direct content if AI fails or is skipped
      let rewritten: { title: string; content: string; metaTitle: string; metaDescription: string; summary: string } | null = null;

      if (!skip_ai && lovableApiKey) {
        rewritten = await rewriteWithAI(item.title || 'Notícia', fullContent || item.excerpt || '', source.city, lovableApiKey);
      }

      // FALLBACK: If AI failed/unavailable, use original content directly
      if (!rewritten) {
        console.log(`[Process] AI unavailable, using direct content for: ${item.title}`);
        rewritten = buildDirectContent(item.title, item.excerpt || '', fullContent || item.content || '', source.city);
      }

      const tags = generateMandatoryTags(source.city, rewritten.title, rewritten.content);
      const baseSlug = generateSlug(rewritten.title);
      const timestamp = Date.now().toString(36);
      const slug = `${baseSlug}-${timestamp}`;

      const candidateImageUrl = images[0] || item.image_url || null;
      const validatedImageUrl = candidateImageUrl ? await validateImageUrl(candidateImageUrl) : null;
      const finalImageUrl = validatedImageUrl || candidateImageUrl;

      // Update item as processed
      await supabase.from('regional_ingest_items')
        .update({
          status: 'processed',
          content: fullContent || item.content,
          rewritten_title: rewritten.title,
          rewritten_content: rewritten.content,
          seo_meta_title: rewritten.metaTitle,
          seo_meta_description: rewritten.metaDescription,
          generated_image_url: finalImageUrl,
          processed_at: new Date().toISOString(),
          error_message: null,
          retry_count: 0,
        })
        .eq('id', item_id);

      console.log(`[Process] Item processed: ${rewritten.title}`);

      // Auto-publish if requested
      const shouldPublish = auto_publish || source.mode === 'auto_publish';

      if (shouldPublish) {
        console.log('[Process] Auto-publishing to news...');

        const { data: updatedItem } = await supabase
          .from('regional_ingest_items').select('*').eq('id', item_id).single();

        const published = await publishItemToNews(supabase, updatedItem || {
          ...item,
          rewritten_title: rewritten.title,
          rewritten_content: rewritten.content,
          seo_meta_title: rewritten.metaTitle,
          seo_meta_description: rewritten.metaDescription,
          generated_image_url: finalImageUrl,
        }, source);

        await supabase.from('regional_ingest_items')
          .update({ status: 'published', news_id: published.newsId, published_at_portal: new Date().toISOString() })
          .eq('id', item_id);

        console.log(`[Process] Published: ${published.newsId}`);

        return new Response(JSON.stringify({ success: true, item_id, status: 'published', news_id: published.newsId, slug: published.slug, title: rewritten.title }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ success: true, item_id, status: 'processed', title: rewritten.title, tags }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (processError) {
      const errorMessage = processError instanceof Error ? processError.message : 'Unknown error';
      console.error(`[Process] Error: ${errorMessage}`);

      await supabase.from('regional_ingest_items')
        .update({ status: 'failed', error_message: errorMessage, retry_count: (item.retry_count || 0) + 1 })
        .eq('id', item_id);

      throw processError;
    }

  } catch (error) {
    console.error('[Regional Process] Fatal error:', error);
    return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
