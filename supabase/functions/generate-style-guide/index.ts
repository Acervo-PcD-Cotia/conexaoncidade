import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { style_profile_id, created_by } = await req.json();

    if (!style_profile_id) {
      return new Response(
        JSON.stringify({ error: "style_profile_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch ingested refs
    const { data: refs, error: refsError } = await supabase
      .from("journalist_style_refs")
      .select("title, extracted_text")
      .eq("style_profile_id", style_profile_id)
      .eq("status", "ingested")
      .not("extracted_text", "is", null);

    if (refsError) throw refsError;

    if (!refs || refs.length === 0) {
      return new Response(
        JSON.stringify({ error: "Nenhuma referência processada encontrada. Adicione referências e aguarde a ingestão." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Combine extracted texts
    const combinedText = refs
      .map((ref) => `### ${ref.title}\n\n${ref.extracted_text}`)
      .join("\n\n---\n\n")
      .substring(0, 50000); // Limit to 50k chars

    // Generate style guide using AI
    const aiResponse = await fetch("https://api.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Você é um especialista em análise de estilo jornalístico. Analise os textos de referência e extraia um guia de estilo compacto e acionável.

O guia deve conter:
1. VOZ E TOM: Características de voz (formal/informal, distante/próximo, etc.)
2. ESTRUTURA: Como o autor organiza o conteúdo (lide, parágrafos, transições)
3. VOCABULÁRIO: Palavras e expressões características
4. FORMATAÇÃO: Uso de negrito, aspas, listas, subtítulos
5. EVITAR: O que o autor NÃO faz ou evita
6. MODELO DE LIDE: Um template baseado no estilo do autor

Seja específico e prático. O guia será usado para reescrever artigos neste estilo.`,
          },
          {
            role: "user",
            content: `Analise estes textos de referência e gere um guia de estilo:\n\n${combinedText}`,
          },
        ],
        max_tokens: 2000,
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      throw new Error(`AI API error: ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const styleGuideText = aiData.choices?.[0]?.message?.content || "";

    if (!styleGuideText) {
      throw new Error("AI did not return a style guide");
    }

    // Get next version number
    const { data: versions } = await supabase
      .from("journalist_style_versions")
      .select("version_number")
      .eq("style_profile_id", style_profile_id)
      .order("version_number", { ascending: false })
      .limit(1);

    const nextVersion = (versions?.[0]?.version_number || 0) + 1;

    // Save new version
    const { data: newVersion, error: insertError } = await supabase
      .from("journalist_style_versions")
      .insert({
        style_profile_id,
        version_number: nextVersion,
        style_guide_text: styleGuideText,
        generated_from_refs: true,
        generated_at: new Date().toISOString(),
        created_by,
        is_current: true,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({
        success: true,
        version: newVersion,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error generating style guide:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
