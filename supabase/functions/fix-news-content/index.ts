const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const CONTENT_RECOVERY_PROMPT = `Você é um editor especializado em recuperação de conteúdo jornalístico.

TAREFA: Recuperar o conteúdo COMPLETO de uma notícia a partir da URL da fonte original.

REGRAS CRÍTICAS:
1. NÃO resuma o conteúdo - preserve 95 a 105% do tamanho original
2. Mantenha todos os parágrafos, citações e detalhes do original
3. Formate o conteúdo em HTML com tags <p> para cada parágrafo
4. O primeiro parágrafo (lead) deve estar em <p><strong>...texto...</strong></p>
5. Preserve a estrutura narrativa original
6. Se não conseguir acessar o conteúdo, retorne erro

Retorne APENAS um JSON válido:
{
  "content_html": "<p><strong>Lead aqui...</strong></p><p>Parágrafo 2...</p>...",
  "word_count": 350,
  "preview": "Primeiros 150 caracteres do conteúdo..."
}`;

const TITLE_FIX_PROMPT = `Você é um editor de títulos jornalísticos especializado em SEO.

TAREFA: Aprimorar o título e criar/melhorar o subtítulo de uma notícia.

REGRAS:
1. Título: máximo 60 caracteres, deve ser impactante e conter palavra-chave
2. Subtítulo/Excerpt: máximo 160 caracteres, deve complementar o título
3. NÃO altere o conteúdo da notícia
4. Mantenha fidelidade total ao conteúdo original
5. Não invente informações

Retorne APENAS um JSON válido:
{
  "new_title": "Título aprimorado (max 60 chars)",
  "new_excerpt": "Subtítulo que complementa o título (max 160 chars)",
  "meta_title": "Título para SEO (max 60 chars)",
  "meta_description": "Descrição para SEO (max 160 chars)"
}`;

async function scrapeUrlContent(url: string): Promise<string | null> {
  // Try Firecrawl first if available
  const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
  
  if (firecrawlKey) {
    try {
      const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${firecrawlKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          formats: ['markdown'],
          onlyMainContent: true,
          waitFor: 3000,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.data?.markdown || data.markdown || '';
        if (content && content.length > 100) {
          console.log(`Firecrawl: Got ${content.length} chars from ${url}`);
          return content;
        }
      }
    } catch (e) {
      console.error('Firecrawl failed:', e);
    }
  }

  // Fallback: direct fetch
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) return null;
    
    const html = await response.text();
    // Strip HTML tags for basic content
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    console.log(`Direct fetch: Got ${text.length} chars from ${url}`);
    return text.length > 100 ? text : null;
  } catch (e) {
    console.error('Direct fetch failed:', e);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { newsId, sourceUrl, mode = 'content' } = await req.json().catch(() => ({}));

    if (!newsId) {
      return new Response(
        JSON.stringify({ success: false, error: 'newsId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'LOVABLE_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch the news item
    const { data: newsItem, error: fetchError } = await supabase
      .from('news')
      .select('id, title, source, content, subtitle, excerpt, meta_title, meta_description')
      .eq('id', newsId)
      .single();

    if (fetchError || !newsItem) {
      return new Response(
        JSON.stringify({ success: false, error: 'News item not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${mode} for: ${newsItem.title}`);

    // ============ MODE: CONTENT RECOVERY ============
    if (mode === 'content') {
      // Extract URL from source field
      const urlMatch = (sourceUrl || newsItem.source || '').match(/https?:\/\/[^\s\]"']+/);
      const targetUrl = urlMatch ? urlMatch[0] : null;

      if (!targetUrl) {
        return new Response(
          JSON.stringify({ success: false, error: 'No valid URL found in source field' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Scraping content from: ${targetUrl}`);
      const scrapedContent = await scrapeUrlContent(targetUrl);

      if (!scrapedContent || scrapedContent.length < 50) {
        // Fallback: use AI to generate content based on title + source info
        console.log('Scraping failed, using AI fallback with title...');
        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-3-flash-preview',
            messages: [
              {
                role: 'system',
                content: `Você é um jornalista que recupera conteúdo perdido de notícias.
                Baseado no título e na URL da fonte, gere um conteúdo jornalístico completo.
                REGRAS: NÃO resuma - crie um artigo completo de ao menos 400 palavras.
                Formate em HTML com <p> para cada parágrafo.
                Primeiro parágrafo: <p><strong>Lead...</strong></p>
                Retorne JSON: {"content_html": "...", "word_count": 400, "preview": "..."}`
              },
              {
                role: 'user',
                content: `Título: "${newsItem.title}"\nFonte: ${targetUrl}\n\nGere o conteúdo completo desta notícia.`
              }
            ],
          }),
        });

        if (!aiResponse.ok) {
          throw new Error(`AI API error: ${aiResponse.status}`);
        }

        const aiData = await aiResponse.json();
        let rawContent = aiData.choices?.[0]?.message?.content || '';
        rawContent = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        const parsed = JSON.parse(rawContent);
        
        // Update the news item
        const { error: updateError } = await supabase
          .from('news')
          .update({ content: parsed.content_html })
          .eq('id', newsId);

        if (updateError) throw updateError;

        return new Response(
          JSON.stringify({ success: true, preview: parsed.preview, word_count: parsed.word_count, source: 'ai_generated' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Have scraped content - use AI to format it properly
      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-3-flash-preview',
          messages: [
            { role: 'system', content: CONTENT_RECOVERY_PROMPT },
            {
              role: 'user',
              content: `Título da notícia: "${newsItem.title}"\n\nConteúdo original extraído:\n${scrapedContent.substring(0, 8000)}`
            }
          ],
        }),
      });

      if (!aiResponse.ok) {
        throw new Error(`AI API error: ${aiResponse.status}`);
      }

      const aiData = await aiResponse.json();
      let rawContent = aiData.choices?.[0]?.message?.content || '';
      rawContent = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const parsed = JSON.parse(rawContent);

      // Update the news item (column is 'content' in this DB)
      const { error: updateError } = await supabase
        .from('news')
        .update({ content: parsed.content_html })
        .eq('id', newsId);

      if (updateError) throw updateError;

      return new Response(
        JSON.stringify({ success: true, preview: parsed.preview, word_count: parsed.word_count, source: 'scraped' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ============ MODE: TITLE FIX ============
    if (mode === 'title') {
      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-3-flash-preview',
          messages: [
            { role: 'system', content: TITLE_FIX_PROMPT },
            {
              role: 'user',
              content: `Título atual: "${newsItem.title}"\nSubtítulo atual: "${newsItem.subtitle || newsItem.excerpt || '(vazio)'}"\n\nConteúdo (primeiros 1000 chars): ${(newsItem.content || '').replace(/<[^>]+>/g, ' ').substring(0, 1000)}`
            }
          ],
        }),
      });

      if (!aiResponse.ok) {
        throw new Error(`AI API error: ${aiResponse.status}`);
      }

      const aiData = await aiResponse.json();
      let rawContent = aiData.choices?.[0]?.message?.content || '';
      rawContent = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const parsed = JSON.parse(rawContent);

      // Update the news item title and subtitle only (not the body content)
      const { error: updateError } = await supabase
        .from('news')
        .update({
          title: parsed.new_title,
          subtitle: parsed.new_excerpt,
          excerpt: parsed.new_excerpt,
          meta_title: parsed.meta_title,
          meta_description: parsed.meta_description,
        })
        .eq('id', newsId);

      if (updateError) throw updateError;

      return new Response(
        JSON.stringify({ success: true, newTitle: parsed.new_title, newExcerpt: parsed.new_excerpt }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Invalid mode. Use "content" or "title"' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('fix-news-content error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
