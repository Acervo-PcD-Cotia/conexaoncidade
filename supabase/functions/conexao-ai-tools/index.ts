import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type ToolType = 
  | 'generate-topics' 
  | 'partner-quiz' 
  | 'google-checklist' 
  | 'pcd-form' 
  | 'content-opportunities';

const TOOL_PROMPTS: Record<ToolType, string> = {
  'generate-topics': `Você é um editor de pauta do portal "Conexão na Cidade".

TAREFA: Gerar 5-7 sugestões de pautas locais relevantes.

CRITÉRIOS:
- Foco em notícias locais e comunitárias
- Temas de interesse público
- Sazonalidade e eventos próximos
- Problemas e soluções locais
- Economia local e empreendedorismo
- Cultura e lazer na região
- Serviços públicos e cidadania

FORMATO DE RESPOSTA (JSON):
{
  "topics": [
    {
      "title": "Título sugestivo da pauta",
      "angle": "Ângulo/abordagem sugerida",
      "sources": ["Fonte 1", "Fonte 2"],
      "urgency": "alta|média|baixa",
      "category": "categoria sugerida"
    }
  ]
}`,

  'partner-quiz': `Você é um consultor de negócios locais do portal "Conexão na Cidade".

TAREFA: Analisar as respostas do quiz e gerar recomendações personalizadas para o parceiro.

ANÁLISE DEVE INCLUIR:
- Pontos fortes do negócio
- Oportunidades de melhoria
- Sugestões de visibilidade no portal
- Serviços recomendados do Conexão
- Próximos passos práticos

FORMATO DE RESPOSTA (JSON):
{
  "score": 0-100,
  "level": "iniciante|intermediário|avançado",
  "strengths": ["força 1", "força 2"],
  "improvements": ["melhoria 1", "melhoria 2"],
  "recommendations": [
    {
      "title": "Recomendação",
      "description": "Descrição detalhada",
      "priority": "alta|média|baixa",
      "action": "Ação específica"
    }
  ],
  "next_steps": ["passo 1", "passo 2", "passo 3"]
}`,

  'google-checklist': `Você é um especialista em presença digital local.

TAREFA: Gerar um checklist personalizado para melhorar a visibilidade no Google.

ITENS DO CHECKLIST:
- Google Meu Negócio
- Avaliações e reviews
- Fotos e informações atualizadas
- Horário de funcionamento
- Categoria correta
- Website e redes sociais
- Palavras-chave locais

FORMATO DE RESPOSTA (JSON):
{
  "checklist": [
    {
      "item": "Nome do item",
      "description": "O que fazer",
      "status": "pending",
      "priority": "alta|média|baixa",
      "impact": "Impacto esperado"
    }
  ],
  "estimated_time": "tempo estimado total",
  "expected_results": "resultados esperados"
}`,

  'pcd-form': `Você é um especialista em acessibilidade e inclusão.

TAREFA: Analisar as informações do serviço PcD e gerar um cadastro otimizado.

ANÁLISE DEVE INCLUIR:
- Validação das informações
- Sugestões de melhoria na descrição
- Tags de acessibilidade recomendadas
- Recursos de acessibilidade identificados
- Compliance com Lei Brasileira de Inclusão

FORMATO DE RESPOSTA (JSON):
{
  "validated": true|false,
  "improvements": ["sugestão 1", "sugestão 2"],
  "accessibility_tags": ["tag1", "tag2"],
  "resources": ["recurso 1", "recurso 2"],
  "lbi_compliance": {
    "score": 0-100,
    "issues": ["problema 1"],
    "recommendations": ["recomendação 1"]
  },
  "optimized_description": "descrição otimizada do serviço"
}`,

  'content-opportunities': `Você é um analista de conteúdo do portal "Conexão na Cidade".

TAREFA: Identificar oportunidades de conteúdo baseado nos dados fornecidos.

ANÁLISE DEVE INCLUIR:
- Lacunas de conteúdo
- Temas em alta na região
- Conteúdo evergreen recomendado
- Oportunidades sazonais
- Conteúdo para engajamento

FORMATO DE RESPOSTA (JSON):
{
  "opportunities": [
    {
      "type": "lacuna|tendência|sazonal|evergreen",
      "title": "Título da oportunidade",
      "description": "Por que explorar",
      "potential": "alto|médio|baixo",
      "suggested_format": "notícia|vídeo|guia|lista"
    }
  ],
  "quick_wins": ["vitória rápida 1", "vitória rápida 2"],
  "long_term": ["projeto longo prazo 1"]
}`
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tool, input } = await req.json();

    if (!tool || !TOOL_PROMPTS[tool as ToolType]) {
      return new Response(
        JSON.stringify({ error: 'Ferramenta inválida' }),
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

    console.log(`Processing tool: ${tool}`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: TOOL_PROMPTS[tool as ToolType] },
          { role: 'user', content: typeof input === 'string' ? input : JSON.stringify(input) }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error('Falha ao processar ferramenta');
    }

    const data = await response.json();
    let result = data.choices?.[0]?.message?.content;

    // Parse JSON from response
    try {
      result = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      result = JSON.parse(result);
    } catch {
      // Return as text if not JSON
      result = { text: result };
    }

    console.log(`Tool ${tool} completed successfully`);

    return new Response(
      JSON.stringify({ tool, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in conexao-ai-tools:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
