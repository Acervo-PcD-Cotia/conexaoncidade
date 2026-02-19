import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cluster cities for the Grande Cotia region
const CLUSTER_CITIES = [
  'Cotia', 'Itapevi', 'Vargem Grande Paulista', 'São Roque', 'Ibiúna',
  'Embu-Guaçu', 'Embu das Artes', 'Itapecerica da Serra', 'São Lourenço da Serra',
  'São Paulo', 'Osasco', 'Jandira', 'Carapicuíba', 'Barueri'
];

// Generate 12 mandatory tags
function generateMandatoryTags(city: string, title: string, content: string): string[] {
  const tags: string[] = [];
  tags.push(city);
  tags.push('regional');
  tags.push('grande cotia');
  tags.push('prefeitura');
  tags.push('governo municipal');
  tags.push('serviço público');
  tags.push('administração');
  tags.push('região oeste');
  tags.push('são paulo');
  tags.push('interior paulista');

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

  return [...new Set(tags)];
}

// Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

// Sanitize HTML
function sanitizeHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '');
}

// Extract clean text from HTML
function extractText(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Validate image URL
async function validateImageUrl(url: string): Promise<string | null> {
  if (!url) return null;
  try {
    const response = await fetch(url, { method: 'HEAD' });
    if (response.ok) return url;
  } catch {}

  const altUrl = url.endsWith('.jpeg')
    ? url.replace(/\.jpeg$/i, '.jpg')
    : url.endsWith('.jpg')
    ? url.replace(/\.jpg$/i, '.jpeg')
    : null;

  if (altUrl) {
    try {
      const response = await fetch(altUrl, { method: 'HEAD' });
      if (response.ok) {
        console.log(`[Image] Fixed extension: ${url} -> ${altUrl}`);
        return altUrl;
      }
    } catch {}
  }

  console.log(`[Image] URL not accessible: ${url}`);
  return null;
}

// Fetch full content from URL
async function fetchFullContent(url: string): Promise<{ content: string; images: string[] }> {
  console.log(`[Fetch] Getting content from: ${url}`);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
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
      if (match && match[1].length > 200) {
        content = match[1];
        break;
      }
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
    throw error;
  }
}

// Rewrite content using Lovable AI
async function rewriteWithAI(
  originalTitle: string,
  originalContent: string,
  city: string,
  apiKey: string
): Promise<{
  title: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  summary: string;
}> {
  console.log(`[AI] Rewriting content for ${city}...`);

  const cleanContent = extractText(originalContent).substring(0, 4000);

  const systemPrompt = `Você é um editor jornalístico especializado em notícias regionais da Grande Cotia, SP.
Sua tarefa é reescrever notícias de prefeituras de forma 100% original, NUNCA copiando título ou estrutura.

REGRAS OBRIGATÓRIAS:
1. Criar título COMPLETAMENTE NOVO (nunca usar palavras do título original na mesma ordem)
2. Incluir contexto geográfico ("região de Cotia", "Grande Cotia", "região oeste de SP")
3. Mencionar naturalmente cidades vizinhas quando relevante
4. Manter tom jornalístico profissional
5. Usar parágrafos curtos (máx 3 linhas)
6. O conteúdo deve ter entre 300-600 palavras
7. Formato: HTML limpo com <p>, <strong>, <ul>, <li> apenas

CIDADE FONTE: ${city}

Retorne um JSON válido com:
{
  "title": "Título completamente novo (máx 70 caracteres)",
  "content": "Conteúdo HTML reescrito",
  "metaTitle": "Meta title SEO (máx 60 caracteres)",
  "metaDescription": "Meta description (máx 155 caracteres)",
  "summary": "Resumo em 1-2 frases (máx 200 caracteres)"
}`;

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
        { role: 'user', content: `TÍTULO ORIGINAL: ${originalTitle}\n\nCONTEÚDO ORIGINAL:\n${cleanContent}` }
      ],
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[AI] Error: ${response.status} - ${errorText}`);
    throw new Error(`AI rewrite failed: ${response.status}`);
  }

  const data = await response.json();
  const resultText = data.choices?.[0]?.message?.content || '';

  try {
    const result = JSON.parse(resultText);
    return {
      title: result.title || originalTitle,
      content: result.content || `<p>${cleanContent}</p>`,
      metaTitle: result.metaTitle || result.title?.substring(0, 60) || '',
      metaDescription: result.metaDescription || '',
      summary: result.summary || '',
    };
  } catch (e) {
    console.error('[AI] Failed to parse response:', resultText);
    throw new Error('Failed to parse AI response');
  }
}

// Check if article already exists in news table (duplicate detection)
async function checkDuplicate(supabase: any, canonicalUrl: string, title: string): Promise<{ isDuplicate: boolean; reason: string }> {
  // Check by source URL
  const { data: byUrl } = await supabase
    .from('news')
    .select('id, title')
    .or(`source.eq.${canonicalUrl},source_url.eq.${canonicalUrl}`)
    .limit(1);

  if (byUrl && byUrl.length > 0) {
    console.log(`[Duplicate] Found by URL: ${canonicalUrl}`);
    return { isDuplicate: true, reason: `Já publicado: URL duplicada (${byUrl[0].title?.substring(0, 50)})` };
  }

  // Check by slug
  const slug = generateSlug(title);
  const { data: bySlug } = await supabase
    .from('news')
    .select('id, title')
    .eq('slug', slug)
    .limit(1);

  if (bySlug && bySlug.length > 0) {
    return { isDuplicate: true, reason: `Já publicado: slug duplicado` };
  }

  return { isDuplicate: false, reason: '' };
}

// Publish a processed item to news table
async function publishItemToNews(supabase: any, item: any, source: any): Promise<{ newsId: string; slug: string; title: string }> {
  const rewrittenTitle = item.rewritten_title || item.title || 'Notícia';
  const rewrittenContent = item.rewritten_content || item.content || '';
  const metaTitle = item.seo_meta_title || rewrittenTitle.substring(0, 60);
  const metaDescription = item.seo_meta_description || '';
  const excerpt = extractText(rewrittenContent).substring(0, 160);
  const imageUrl = item.generated_image_url || item.image_url || null;
  const tags = generateMandatoryTags(source.city, rewrittenTitle, rewrittenContent);

  // Ensure unique slug
  const baseSlug = generateSlug(rewrittenTitle);
  const timestamp = Date.now().toString(36);
  let slug = `${baseSlug}-${timestamp}`;

  // Get or create "Cidades" category
  let categoryId: string | null = null;
  const { data: category } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', 'cidades')
    .single();
  categoryId = category?.id || null;

  // Validate image URL
  const validatedImageUrl = imageUrl ? await validateImageUrl(imageUrl) : null;
  const finalImageUrl = validatedImageUrl || imageUrl;

  // PRESERVE original published date from the source
  const publishedAt = item.published_at || new Date().toISOString();

  // Insert into news
  const { data: newsEntry, error: newsError } = await supabase
    .from('news')
    .insert({
      title: rewrittenTitle,
      slug: slug,
      content: rewrittenContent,
      excerpt: excerpt,
      featured_image_url: finalImageUrl,
      og_image_url: finalImageUrl,
      card_image_url: finalImageUrl,
      image_alt: `Imagem ilustrativa: ${source.city}`,
      image_credit: 'IA | Conexão na Cidade',
      meta_title: metaTitle,
      meta_description: metaDescription,
      source: item.canonical_url,
      status: 'published',
      published_at: publishedAt,
      original_published_at: publishedAt,
      origin: 'autopost',
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
      .from('tags')
      .select('id')
      .eq('name', tagName)
      .single();

    if (existingTag) {
      tagId = existingTag.id;
    } else {
      const { data: newTag } = await supabase
        .from('tags')
        .insert({
          name: tagName,
          slug: generateSlug(tagName)
        })
        .select('id')
        .single();

      if (!newTag) continue;
      tagId = newTag.id;
    }

    await supabase
      .from('news_tags')
      .insert({ news_id: newsEntry.id, tag_id: tagId })
      .select();
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
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { item_id, auto_publish = false } = await req.json();

    if (!item_id) throw new Error('item_id is required');

    console.log(`[Process] Starting item: ${item_id}, auto_publish: ${auto_publish}`);

    // Get item with source info
    const { data: item, error: itemError } = await supabase
      .from('regional_ingest_items')
      .select('*, regional_sources(city, name, mode, tags_default)')
      .eq('id', item_id)
      .single();

    if (itemError || !item) {
      throw new Error(`Item not found: ${itemError?.message}`);
    }

    const source = item.regional_sources as { city: string; name: string; mode: string; tags_default: string[] };

    // ─── If item is already processed, just publish it (skip reprocessing) ──────
    if (item.status === 'processed' && auto_publish) {
      console.log(`[Process] Item already processed, publishing directly: ${item.rewritten_title}`);

      // Check for duplicates before publishing
      const dupCheck = await checkDuplicate(supabase, item.canonical_url, item.rewritten_title || item.title);
      if (dupCheck.isDuplicate) {
        console.log(`[Process] Duplicate detected, marking as skipped: ${dupCheck.reason}`);
        await supabase
          .from('regional_ingest_items')
          .update({ status: 'skipped', error_message: dupCheck.reason })
          .eq('id', item_id);

        return new Response(JSON.stringify({
          success: true,
          item_id,
          status: 'skipped',
          reason: dupCheck.reason,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const published = await publishItemToNews(supabase, item, source);

      await supabase
        .from('regional_ingest_items')
        .update({
          status: 'published',
          news_id: published.newsId,
          published_at_portal: new Date().toISOString(),
        })
        .eq('id', item_id);

      console.log(`[Process] Published directly: ${published.newsId}`);
      return new Response(JSON.stringify({
        success: true,
        item_id,
        status: 'published',
        news_id: published.newsId,
        slug: published.slug,
        title: published.title,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ─── Skip if already published or skipped ───────────────────────────────────
    if (item.status === 'published' || item.status === 'skipped') {
      return new Response(JSON.stringify({
        success: true,
        item_id,
        status: item.status,
        message: 'Item already processed',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ─── Check for duplicates BEFORE processing ──────────────────────────────────
    const dupCheck = await checkDuplicate(supabase, item.canonical_url, item.title);
    if (dupCheck.isDuplicate) {
      console.log(`[Process] Duplicate detected before processing: ${dupCheck.reason}`);
      await supabase
        .from('regional_ingest_items')
        .update({ status: 'skipped', error_message: dupCheck.reason })
        .eq('id', item_id);

      return new Response(JSON.stringify({
        success: true,
        item_id,
        status: 'skipped',
        reason: dupCheck.reason,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Mark as processing
    await supabase
      .from('regional_ingest_items')
      .update({
        status: 'processing',
        processing_started_at: new Date().toISOString(),
      })
      .eq('id', item_id);

    try {
      // 1. Fetch full content
      const { content: fullContent, images } = await fetchFullContent(item.canonical_url);

      // 2. Rewrite with AI
      const rewritten = await rewriteWithAI(
        item.title || 'Notícia',
        fullContent || item.excerpt || '',
        source.city,
        lovableApiKey
      );

      // 3. Generate tags
      const tags = generateMandatoryTags(source.city, rewritten.title, rewritten.content);

      // 4. Generate slug
      const baseSlug = generateSlug(rewritten.title);
      const timestamp = Date.now().toString(36);
      const slug = `${baseSlug}-${timestamp}`;

      // 5. Determine image
      const candidateImageUrl = images[0] || item.image_url || null;
      const validatedImageUrl = candidateImageUrl ? await validateImageUrl(candidateImageUrl) : null;
      const finalImageUrl = validatedImageUrl || candidateImageUrl;

      // 6. Update item as processed
      await supabase
        .from('regional_ingest_items')
        .update({
          status: 'processed',
          content: fullContent,
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

      console.log(`[Process] Item processed successfully: ${rewritten.title}`);

      // 7. Auto-publish if requested
      const shouldPublish = auto_publish || source.mode === 'auto_publish';

      if (shouldPublish) {
        console.log('[Process] Auto-publishing to news...');

        // Re-fetch updated item for publish
        const { data: updatedItem } = await supabase
          .from('regional_ingest_items')
          .select('*')
          .eq('id', item_id)
          .single();

        const published = await publishItemToNews(supabase, updatedItem || {
          ...item,
          rewritten_title: rewritten.title,
          rewritten_content: rewritten.content,
          seo_meta_title: rewritten.metaTitle,
          seo_meta_description: rewritten.metaDescription,
          generated_image_url: finalImageUrl,
        }, source);

        await supabase
          .from('regional_ingest_items')
          .update({
            status: 'published',
            news_id: published.newsId,
            published_at_portal: new Date().toISOString(),
          })
          .eq('id', item_id);

        console.log(`[Process] Published as news: ${published.newsId}`);

        return new Response(JSON.stringify({
          success: true,
          item_id,
          status: 'published',
          news_id: published.newsId,
          slug: published.slug,
          title: rewritten.title,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({
        success: true,
        item_id,
        status: 'processed',
        title: rewritten.title,
        tags,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (processError) {
      const errorMessage = processError instanceof Error ? processError.message : 'Unknown error';
      console.error(`[Process] Error: ${errorMessage}`);

      await supabase
        .from('regional_ingest_items')
        .update({
          status: 'failed',
          error_message: errorMessage,
          retry_count: (item.retry_count || 0) + 1,
        })
        .eq('id', item_id);

      throw processError;
    }

  } catch (error) {
    console.error('[Regional Process] Fatal error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
