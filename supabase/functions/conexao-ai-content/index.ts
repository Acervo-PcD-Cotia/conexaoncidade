import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const NEWS_GENERATION_PROMPT = `Você é o editor-chefe do portal "Conexão na Cidade", especializado em jornalismo local e comunitário.

TAREFA: Gerar uma notícia completa no padrão editorial do portal.

ESTRUTURA OBRIGATÓRIA (retorne em JSON):
{
  "titulo": "Título otimizado para SEO, máximo 60 caracteres",
  "slug": "titulo-em-formato-url-amigavel",
  "chapeu": "CIDADE | CATEGORIA (ex: COTIA | ECONOMIA) ou BRASIL | CATEGORIA (ex: BRASIL | SAÚDE)",
  "subtitulo": "Linha fina que complementa o título, máximo 120 caracteres",
  "resumo": "2-3 frases respondendo O QUÊ, QUEM, QUANDO, ONDE. Ideal para redes sociais.",
  "conteudo": "Corpo da notícia em HTML com parágrafos <p>. Estrutura: Lead forte, desenvolvimento, conclusão. Parágrafos curtos (2-4 frases). Mínimo 3 parágrafos.",
  "meta_titulo": "Título para SEO, máximo 60 caracteres",
  "meta_descricao": "Descrição para SEO, máximo 160 caracteres",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}

ESTILO EDITORIAL:
- Linguagem acessível mas profissional
- Tom informativo local
- Estrutura em pirâmide invertida
- Parágrafos curtos
- Evitar jargões técnicos
- Manter proximidade com o leitor local
- Usar voz ativa
- Ser objetivo e imparcial

REGRAS DE SEO:
- Título com palavra-chave principal no início
- Meta descrição com call-to-action implícito
- Tags específicas para contexto local
- Slug sem acentos ou caracteres especiais

IMPORTANTE: Retorne APENAS o JSON válido, sem markdown ou explicações.`;

const PCD_ADAPTATION_PROMPT = `Adapte o conteúdo para o público PcD (Pessoa com Deficiência):

DIRETRIZES:
- Linguagem clara e simples
- Frases curtas
- Descrição de elementos visuais
- Termos corretos (pessoa com deficiência, não "deficiente")
- Destacar informações de acessibilidade
- Mencionar recursos disponíveis quando relevante

Retorne o texto adaptado mantendo a estrutura de parágrafos.`;

const INSTAGRAM_PROMPT = `Crie uma legenda para Instagram baseada na notícia.

FORMATO:
- Máximo 2200 caracteres
- Primeira linha impactante (hook)
- Emojis estratégicos
- Hashtags relevantes no final (5-10)
- Call-to-action no final

Retorne apenas o texto da legenda.`;

const FACEBOOK_PROMPT = `Crie um post para Facebook baseado na notícia.

FORMATO:
- Tom conversacional
- Link preview será adicionado automaticamente
- Máximo 500 caracteres antes do link
- Pergunta ou call-to-action para engajamento

Retorne apenas o texto do post.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { input, type, variants = ['news'] } = await req.json();

    if (!input) {
      return new Response(
        JSON.stringify({ error: 'Conteúdo de entrada é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'API key não configurada' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating content from ${type}: ${input.substring(0, 100)}...`);

    // Generate main news content
    const newsResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: NEWS_GENERATION_PROMPT },
          { 
            role: 'user', 
            content: type === 'theme' 
              ? `Crie uma notícia sobre o tema: ${input}`
              : type === 'url'
              ? `Reescreva esta notícia no padrão Conexão: ${input}`
              : `Complete e profissionalize este rascunho: ${input}`
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!newsResponse.ok) {
      throw new Error('Falha ao gerar notícia');
    }

    const newsData = await newsResponse.json();
    let newsContent = newsData.choices?.[0]?.message?.content;

    // Parse JSON from response
    try {
      // Remove markdown code blocks if present
      newsContent = newsContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      newsContent = JSON.parse(newsContent);
    } catch {
      console.error('Failed to parse news JSON:', newsContent);
      return new Response(
        JSON.stringify({ error: 'Erro ao processar resposta da IA' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result: Record<string, unknown> = { news: newsContent, variants: {} };

    // Generate variants in parallel
    const variantPromises: Promise<void>[] = [];

    if (variants.includes('pcd')) {
      variantPromises.push(
        (async () => {
          const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${LOVABLE_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash',
              messages: [
                { role: 'system', content: PCD_ADAPTATION_PROMPT },
                { role: 'user', content: `Título: ${newsContent.titulo}\n\nConteúdo: ${newsContent.conteudo}` }
              ],
            }),
          });
          const data = await response.json();
          (result.variants as Record<string, string>).pcd = data.choices?.[0]?.message?.content;
        })()
      );
    }

    if (variants.includes('instagram')) {
      variantPromises.push(
        (async () => {
          const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${LOVABLE_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash',
              messages: [
                { role: 'system', content: INSTAGRAM_PROMPT },
                { role: 'user', content: `Título: ${newsContent.titulo}\nResumo: ${newsContent.resumo}` }
              ],
            }),
          });
          const data = await response.json();
          (result.variants as Record<string, string>).instagram = data.choices?.[0]?.message?.content;
        })()
      );
    }

    if (variants.includes('facebook')) {
      variantPromises.push(
        (async () => {
          const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${LOVABLE_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash',
              messages: [
                { role: 'system', content: FACEBOOK_PROMPT },
                { role: 'user', content: `Título: ${newsContent.titulo}\nResumo: ${newsContent.resumo}` }
              ],
            }),
          });
          const data = await response.json();
          (result.variants as Record<string, string>).facebook = data.choices?.[0]?.message?.content;
        })()
      );
    }

    await Promise.all(variantPromises);

    console.log('Content generation completed successfully');

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in conexao-ai-content:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
