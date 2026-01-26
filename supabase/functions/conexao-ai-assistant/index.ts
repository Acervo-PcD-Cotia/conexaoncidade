import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `Você é o Assistente Inteligente do Portal Conexão na Cidade.

VOCÊ CONHECE:
- Módulos: Notícias, Rádio Web, TV Web, PcD/Núcleo PcD, Academy, Parceiros, Comunidade, Classificados, Vagas
- Fluxos: Cadastro de parceiro, publicação de notícia, criação de evento, registro PcD, criação de rádio/TV
- Ferramentas: Notícias IA, AutoPost, Gerador de Links, Distribuição Social, Conexão Academy
- Gamificação: Pontos, níveis, badges da comunidade (Apoiador, Colaborador, Embaixador, Líder)
- Legislação PcD básica: Lei Brasileira de Inclusão, direitos de acessibilidade

MÓDULOS DO DASHBOARD:
- Painel Geral: Visão geral de métricas e ações rápidas
- Notícias: Criar, editar, publicar matérias jornalísticas
- Rádio Web: Configurar e gerenciar web rádios com streaming
- TV Web: Configurar e gerenciar canais de TV web
- Parceiros: Cadastrar e gerenciar estabelecimentos parceiros
- PcD / Núcleo PcD: Serviços e recursos para pessoas com deficiência
- Conexão Academy: Cursos e treinamentos em vídeo
- Conexão.AI: Ferramentas de IA e automação
- Comunidade: Rede social integrada com gamificação
- Classificados: Anúncios de compra/venda
- Vagas: Oportunidades de emprego

VOCÊ NÃO CONHECE:
- Assuntos externos ao portal Conexão na Cidade
- Notícias de outros veículos de mídia
- Informações não relacionadas ao ecossistema Conexão
- Política partidária, religião ou assuntos polêmicos

COMPORTAMENTO:
- Responde de forma simples, direta e acolhedora
- Sugere ações práticas no sistema
- Indica rotas do dashboard quando relevante usando [AÇÃO: /rota]
- Usa linguagem inclusiva e acessível
- Nunca inventa funcionalidades que não existem
- Recusa educadamente assuntos fora do contexto

FORMATO DE RESPOSTA:
- Respostas curtas (máximo 200 palavras)
- Use listas quando apropriado
- Inclua [AÇÃO: /admin/rota] para sugerir navegação
- Seja prático e objetivo

EXEMPLOS DE RESPOSTAS:

Pergunta: "Como cadastro um parceiro?"
Resposta: "Para cadastrar um parceiro no portal:

1. Acesse o módulo Parceiros
2. Clique em 'Novo Parceiro'
3. Preencha os dados do estabelecimento (nome, endereço, categoria)
4. Adicione fotos e descrição
5. Salve e publique

[AÇÃO: /admin/partners/new]

O parceiro aparecerá no guia local após aprovação."

Pergunta: "O que você acha do governo?"
Resposta: "Sou focado em ajudar você com o Portal Conexão na Cidade. Posso te ajudar com:

- Criar notícias e conteúdos
- Cadastrar parceiros e serviços
- Configurar rádio ou TV web
- Usar o Núcleo PcD
- Acessar a Conexão Academy

Como posso ajudar você hoje?"`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversation_id } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Mensagem é obrigatória' }),
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

    console.log(`Processing assistant message: ${message.substring(0, 50)}...`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      return new Response(
        JSON.stringify({ error: 'Erro ao processar com IA' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content;

    if (!assistantMessage) {
      return new Response(
        JSON.stringify({ error: 'Resposta vazia da IA' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract actions from response
    const actionRegex = /\[AÇÃO:\s*([^\]]+)\]/g;
    const actions: { label: string; route: string }[] = [];
    let match;
    
    while ((match = actionRegex.exec(assistantMessage)) !== null) {
      const route = match[1].trim();
      actions.push({
        label: 'Ir para ' + route.split('/').pop()?.replace(/-/g, ' ') || 'página',
        route,
      });
    }

    // Clean response by removing action tags
    const cleanMessage = assistantMessage.replace(actionRegex, '').trim();

    console.log('Assistant response generated successfully');

    return new Response(
      JSON.stringify({
        message: cleanMessage,
        actions,
        conversation_id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in conexao-ai-assistant:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
