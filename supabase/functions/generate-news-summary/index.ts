import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { newsId } = await req.json();

    if (!newsId) {
      throw new Error('newsId is required');
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Fetch news content
    const { data: news, error: newsError } = await supabase
      .from('news')
      .select('id, title, subtitle, content, excerpt')
      .eq('id', newsId)
      .single();

    if (newsError || !news) {
      throw new Error('News not found');
    }

    // Prepare content for summary
    const contentText = news.content?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() || '';
    const fullText = `${news.title}. ${news.subtitle || ''}. ${contentText}`;

    console.log(`Generating summary for news ${newsId}`);
    console.log(`Content length: ${fullText.length} characters`);

    // Use Lovable AI (Gemini) to generate summary
    const aiResponse = await fetch('https://api.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `Você é um editor jornalístico profissional. Sua tarefa é gerar resumos objetivos e factuais de notícias.

REGRAS:
- Gere entre 3 e 6 tópicos no formato bullet point
- Use frases curtas e objetivas (máximo 20 palavras por tópico)
- Responda às perguntas: O quê? Quem? Quando? Onde?
- Não inclua opiniões ou adjetivos excessivos
- Mantenha o tom neutro e profissional
- Use o estilo de grandes portais como G1, UOL, NYT

FORMATO DE RESPOSTA:
Retorne APENAS um array JSON com as strings dos tópicos, sem nenhum texto adicional.
Exemplo: ["Tópico 1 aqui", "Tópico 2 aqui", "Tópico 3 aqui"]`,
          },
          {
            role: 'user',
            content: `Gere um resumo em bullet points para a seguinte notícia:\n\n${fullText.substring(0, 8000)}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const summaryText = aiData.choices?.[0]?.message?.content || '';

    console.log('AI response:', summaryText);

    // Parse JSON array from response
    let bullets: string[] = [];
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(summaryText.trim());
      if (Array.isArray(parsed)) {
        bullets = parsed.filter(item => typeof item === 'string' && item.length > 0);
      }
    } catch {
      // If not valid JSON, try to extract bullet points from text
      const lines = summaryText.split('\n').filter((line: string) => line.trim().length > 0);
      bullets = lines.map((line: string) => 
        line.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '').trim()
      ).filter((line: string) => line.length > 10);
    }

    if (bullets.length === 0) {
      throw new Error('Failed to generate valid summary bullets');
    }

    // Limit to 6 bullets
    bullets = bullets.slice(0, 6);

    console.log(`Generated ${bullets.length} summary bullets`);

    // Update news with summary
    const { error: updateError } = await supabase
      .from('news')
      .update({
        ai_summary_bullets: bullets,
        ai_summary_generated_at: new Date().toISOString(),
      })
      .eq('id', newsId);

    if (updateError) {
      console.error('News update error:', updateError);
      throw new Error(`Failed to update news: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        bullets,
        count: bullets.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-news-summary:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
