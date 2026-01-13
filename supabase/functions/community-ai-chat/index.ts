import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Você é a IA assistente da Comunidade Conexão na Cidade, um portal de notícias e comunidade digital de Cotia, SP.

SUAS ESPECIALIDADES:
- Notícias locais e regionais de Cotia
- Serviços públicos da cidade (saúde, educação, transporte)
- Direitos das pessoas com deficiência (PcD) e acessibilidade
- Eventos e campanhas comunitárias
- Informações sobre o portal Conexão na Cidade
- Gamificação da comunidade (pontos, níveis, badges)

DIRETRIZES:
- Use linguagem simples, acessível e acolhedora
- Seja objetivo e direto nas respostas
- Quando não souber algo específico, indique onde o usuário pode buscar a informação
- Encoraje a participação na comunidade
- Promova a inclusão e acessibilidade
- Nunca invente informações sobre serviços públicos ou direitos
- Responda sempre em português brasileiro

SOBRE A COMUNIDADE:
- Membros ganham pontos por participar (posts +10, comentários +5, etc.)
- Níveis: Apoiador, Colaborador, Embaixador, Líder
- Badges temáticos: Aliado PcD, Conhecedor da Cidade, Voluntário Ativo, etc.
- A comunidade tem acesso a benefícios exclusivos como cupons locais

SOBRE COTIA:
- Cidade da Região Metropolitana de São Paulo
- População de aproximadamente 250 mil habitantes
- Bairros principais: Centro, Granja Viana, Caucaia do Alto, Jardim Atalaia
- Conhecida pelo comércio e indústria`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Community AI chat request from user: ${userId}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.slice(-10), // Keep last 10 messages for context
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Muitas requisições. Aguarde um momento." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Limite de uso atingido. Entre em contato com o suporte." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Erro no serviço de IA");
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "Desculpe, não consegui processar sua mensagem.";

    console.log(`AI response generated for user: ${userId}`);

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Community AI chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
