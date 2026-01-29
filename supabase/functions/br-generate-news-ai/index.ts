import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GeneratedArticle {
  title: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  slug: string;
}

// Generate slug from title
function generateSlug(title: string): string {
  const date = new Date();
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  
  const slug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80);
  
  return `${slug}-${dateStr}`;
}

// Generate news article using Lovable AI
async function generateArticle(
  prompt: string,
  newsType: string
): Promise<GeneratedArticle | null> {
  const apiKey = Deno.env.get('LOVABLE_API_KEY');
  
  if (!apiKey) {
    console.error('LOVABLE_API_KEY not configured');
    return null;
  }
  
  const systemPrompt = `Você é um jornalista esportivo brasileiro experiente que escreve para o Portal Conexão na Cidade.
Seu estilo é:
- Objetivo e informativo
- Sem sensacionalismo
- Focado em dados e fatos
- Linguagem acessível
- SEO otimizado

Formato da resposta (JSON válido):
{
  "title": "Título da notícia (máximo 60 caracteres)",
  "content": "Conteúdo da notícia em HTML (300-500 palavras, use <p>, <strong>, <h3>)",
  "seoTitle": "Título SEO otimizado (máximo 60 caracteres)",
  "seoDescription": "Descrição meta (máximo 155 caracteres)"
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
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      return null;
    }
    
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error('No content in AI response');
      return null;
    }
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Could not extract JSON from AI response');
      return null;
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    return {
      title: parsed.title?.substring(0, 200) || 'Notícia do Brasileirão',
      content: parsed.content || '<p>Conteúdo não disponível.</p>',
      seoTitle: parsed.seoTitle?.substring(0, 60) || parsed.title?.substring(0, 60),
      seoDescription: parsed.seoDescription?.substring(0, 155) || '',
      slug: generateSlug(parsed.title || 'brasileirao'),
    };
    
  } catch (error) {
    console.error('Error generating article:', error);
    return null;
  }
}

// Build prompt for different news types
function buildPrompt(
  newsType: string,
  context: Record<string, any>
): string {
  switch (newsType) {
    case 'round_recap':
      return `Escreva uma notícia sobre o encerramento da rodada ${context.round} do Campeonato Brasileiro 2026.

Resultados principais:
${context.results || 'Rodada ainda em andamento'}

Mudanças na tabela:
- Líder: ${context.leader || 'A definir'}
- G4: ${context.g4 || 'Em disputa'}
- Z4: ${context.z4 || 'Situação indefinida'}

Destaques:
${context.highlights || 'Diversos jogos equilibrados na rodada'}

Foque nas principais mudanças na tabela e nos destaques da rodada.`;

    case 'standings_change':
      return `Escreva uma notícia sobre a mudança na classificação do Brasileirão 2026.

Situação atual:
- Time em destaque: ${context.team}
- Nova posição: ${context.position}º lugar
- Pontos: ${context.points}

O que aconteceu: ${context.reason || 'Vitória importante'}

Contexto da tabela:
${context.tableContext || 'Campeonato muito equilibrado'}

Foque no impacto dessa mudança para o time e para a competição.`;

    case 'where_to_watch':
      return `Escreva uma notícia sobre onde assistir ao jogo ${context.homeTeam} x ${context.awayTeam} pelo Campeonato Brasileiro 2026.

Informações do jogo:
- Data: ${context.matchDate}
- Horário: ${context.matchTime}
- Estádio: ${context.stadium || 'A confirmar'}

Transmissão:
- TV aberta: ${context.tvOpen?.join(', ') || 'Não disponível'}
- TV fechada: ${context.tvClosed?.join(', ') || 'Premiere'}
- Streaming: ${context.streaming?.join(', ') || 'Globoplay'}

Contexto do confronto:
${context.context || 'Jogo válido pela rodada do Brasileirão'}

Inclua informações sobre como assistir e um breve contexto sobre as equipes.`;

    case 'preview':
      return `Escreva uma prévia do clássico ${context.homeTeam} x ${context.awayTeam} pelo Campeonato Brasileiro 2026.

Informações:
- Rodada: ${context.round}
- Data: ${context.matchDate}
- Estádio: ${context.stadium}

Situação na tabela:
- ${context.homeTeam}: ${context.homePosition}º lugar, ${context.homePoints} pontos
- ${context.awayTeam}: ${context.awayPosition}º lugar, ${context.awayPoints} pontos

Histórico recente:
${context.history || 'Confrontos equilibrados nos últimos jogos'}

Foque na importância do jogo e no que esperar do confronto.`;

    default:
      return `Escreva uma notícia sobre o Campeonato Brasileiro 2026.
Contexto: ${JSON.stringify(context)}`;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  const startTime = Date.now();
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const body = await req.json().catch(() => ({}));
    const { 
      newsType = 'round_recap',
      context = {},
      autoPublish = false,
      relatedMatchId = null,
      relatedRound = null,
    } = body;
    
    console.log(`Generating ${newsType} article with context:`, context);
    
    // Build prompt
    const prompt = buildPrompt(newsType, context);
    
    // Generate article
    const article = await generateArticle(prompt, newsType);
    
    if (!article) {
      throw new Error('Failed to generate article');
    }
    
    // Check for duplicate slug
    const { data: existing } = await supabase
      .from('br_generated_news')
      .select('slug')
      .eq('slug', article.slug)
      .single();
    
    if (existing) {
      article.slug = `${article.slug}-${Date.now()}`;
    }
    
    // Save to database
    const { data: saved, error: saveError } = await supabase
      .from('br_generated_news')
      .insert({
        slug: article.slug,
        title: article.title,
        content: article.content,
        seo_title: article.seoTitle,
        seo_description: article.seoDescription,
        news_type: newsType,
        related_match_id: relatedMatchId,
        related_round: relatedRound,
        status: autoPublish ? 'published' : 'draft',
        published_at: autoPublish ? new Date().toISOString() : null,
      })
      .select()
      .single();
    
    if (saveError) {
      throw new Error(`Failed to save article: ${saveError.message}`);
    }
    
    // Log the generation
    await supabase.from('br_fetch_logs').insert({
      source_key: 'ai_generation',
      success: true,
      message: `Generated ${newsType} article: ${article.title}`,
      items_processed: 1,
      duration_ms: Date.now() - startTime,
    });
    
    return new Response(
      JSON.stringify({
        success: true,
        article: saved,
        duration: `${Date.now() - startTime}ms`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error: unknown) {
    console.error('News generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
