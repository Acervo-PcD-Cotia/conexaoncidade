import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type AIAction = 
  | 'rewrite' 
  | 'optimize-title' 
  | 'generate-subtitle' 
  | 'summarize' 
  | 'suggest-tags' 
  | 'validate-seo'
  | 'format-conexao';

interface AIRequest {
  action: AIAction;
  content: string;
  title?: string;
  metaTitle?: string;
  metaDescription?: string;
}

const systemPrompts: Record<AIAction, string> = {
  'rewrite': `Você é um editor jornalístico experiente do portal "Conexão na Cidade", especializado em notícias locais.
Reescreva o texto fornecido em linguagem jornalística profissional, mantendo os fatos mas melhorando:
- Clareza e objetividade
- Estrutura em pirâmide invertida (mais importante primeiro)
- Tom informativo e imparcial
- Parágrafos curtos (máximo 3 frases)
Retorne APENAS o texto reescrito, sem explicações.`,

  'optimize-title': `Você é um especialista em SEO para portais de notícias locais.
Otimize o título fornecido para:
- Máximo 60 caracteres
- Incluir palavras-chave relevantes para busca local
- Ser atrativo mas não sensacionalista
- Manter a precisão factual
Retorne APENAS o título otimizado, sem explicações.`,

  'generate-subtitle': `Você é um editor do portal "Conexão na Cidade".
Crie um subtítulo jornalístico que:
- Complemente o título principal
- Adicione informação extra relevante
- Máximo 120 caracteres
- Tom informativo
Retorne APENAS o subtítulo, sem explicações.`,

  'summarize': `Você é um editor do portal "Conexão na Cidade".
Crie um resumo da notícia que:
- Tenha 2-3 frases
- Responda: O quê, quem, quando, onde (se aplicável)
- Seja claro e objetivo
- Ideal para compartilhamento em redes sociais
Retorne APENAS o resumo, sem explicações.`,

  'suggest-tags': `Você é um especialista em categorização de conteúdo jornalístico.
Analise o conteúdo e sugira 3-5 tags relevantes que:
- Sejam específicas para o contexto local
- Incluam temas, locais e personagens principais
- Facilitem a busca e navegação
Retorne as tags em formato JSON: ["tag1", "tag2", "tag3"]`,

  'validate-seo': `Você é um especialista em SEO para portais de notícias.
Analise o meta título e meta descrição fornecidos e retorne um JSON com:
{
  "metaTitle": {
    "valid": boolean,
    "length": number,
    "suggestion": "sugestão se inválido ou vazio"
  },
  "metaDescription": {
    "valid": boolean,
    "length": number,
    "suggestion": "sugestão se inválido ou vazio"
  },
  "score": number (0-100),
  "issues": ["lista de problemas encontrados"]
}
Meta título ideal: 50-60 caracteres. Meta descrição ideal: 150-160 caracteres.`,

  'format-conexao': `Você é o editor-chefe do portal "Conexão na Cidade".
Padronize a matéria no formato editorial do portal:
- Linguagem acessível mas profissional
- Tom informativo local
- Estrutura: Lead forte, desenvolvimento, conclusão
- Parágrafos curtos
- Evitar jargões técnicos desnecessários
- Manter proximidade com o leitor local
Retorne APENAS o texto formatado, sem explicações.`
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, content, title, metaTitle, metaDescription } = await req.json() as AIRequest;
    
    if (!action || !systemPrompts[action]) {
      return new Response(
        JSON.stringify({ error: 'Ação inválida' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key não configurada' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let userContent = content;
    
    if (action === 'optimize-title' && title) {
      userContent = `Título atual: ${title}\n\nConteúdo da notícia: ${content}`;
    } else if (action === 'generate-subtitle' && title) {
      userContent = `Título: ${title}\n\nConteúdo: ${content}`;
    } else if (action === 'validate-seo') {
      userContent = `Meta Título: ${metaTitle || '(vazio)'}\nMeta Descrição: ${metaDescription || '(vazio)'}\n\nConteúdo: ${content}`;
    }

    console.log(`Processing AI action: ${action}`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompts[action] },
          { role: 'user', content: userContent }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente em alguns segundos.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos insuficientes. Adicione créditos na sua conta.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Erro ao processar com IA' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content;

    if (!result) {
      console.error('Empty AI response');
      return new Response(
        JSON.stringify({ error: 'Resposta vazia da IA' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`AI action ${action} completed successfully`);

    return new Response(
      JSON.stringify({ result, action }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in news-ai function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
