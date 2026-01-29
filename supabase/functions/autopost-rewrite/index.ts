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
    const { item_id, style_profile_id } = await req.json();

    if (!item_id) {
      return new Response(
        JSON.stringify({ error: "item_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch ingest item with source info
    const { data: item, error: itemError } = await supabase
      .from("autopost_ingest_items")
      .select(`
        *,
        source:autopost_sources(*)
      `)
      .eq("id", item_id)
      .single();

    if (itemError || !item) {
      return new Response(
        JSON.stringify({ error: "Item not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Rewriting item: ${item.original_title}`);

    // Update status to processing
    await supabase
      .from("autopost_ingest_items")
      .update({ status: "processing" })
      .eq("id", item_id);

    // Build the rewrite prompt with regional context for Grande Cotia
    const clusterCities = [
      "Cotia", "Itapevi", "Vargem Grande Paulista", "São Roque", "Ibiúna",
      "Embu-Guaçu", "Embu das Artes", "Itapecerica da Serra", "São Lourenço da Serra",
      "São Paulo", "Osasco", "Jandira", "Carapicuíba", "Barueri"
    ];
    
    const systemPrompt = `Você é um editor jornalístico sênior do portal Conexão na Cidade.

SOBRE O PORTAL:
O Conexão na Cidade é o principal portal de notícias da região de Cotia e municípios vizinhos, conhecida como "Grande Cotia" ou "Região Oeste da Grande São Paulo".

MUNICÍPIOS DO CLUSTER:
- Cotia (cidade central)
- Itapevi, Vargem Grande Paulista, São Roque, Ibiúna
- Embu-Guaçu, Embu das Artes, Itapecerica da Serra, São Lourenço da Serra
- São Paulo, Osasco, Jandira, Carapicuíba, Barueri

REGRAS DE REESCRITA:
1. NUNCA copie o título ou estrutura original
2. Crie um texto 100% novo, como um jornalista humano faria
3. Mantenha fidelidade absoluta aos fatos e dados
4. Use linguagem clara, natural e regional
5. Insira contexto da região de Cotia quando fizer sentido
6. Mencione impacto em cidades vizinhas se relevante

TERMOS SEO REGIONAIS (usar naturalmente quando aplicável):
- "região de Cotia"
- "Grande Cotia"
- "municípios vizinhos"
- "{cidade} e região"

ESTRUTURA DO ARTIGO:
- Primeiro parágrafo: responda O QUÊ, QUEM, QUANDO, ONDE
- Parágrafos curtos (2-4 frases)
- Use subtítulos <h2> para dividir seções longas

REGRAS SEO:
- Título: 6-120 caracteres, com palavra-chave principal
- Meta título: máximo 60 caracteres
- Meta descrição: máximo 160 caracteres (call-to-action)
- Resumo/excerpt: máximo 160 caracteres
- Exatamente 12 tags relevantes
- Incluir nome da cidade nas tags quando identificável

IMPORTANTE: Retorne APENAS JSON válido, sem markdown ou texto adicional.`;

    const userPrompt = `Reescreva esta notícia:

TÍTULO ORIGINAL: ${item.original_title}

CONTEÚDO ORIGINAL:
${item.original_content || item.original_excerpt || "Sem conteúdo disponível"}

FONTE: ${item.source?.name || "Desconhecida"}
CIDADE DA FONTE: ${item.source?.city || "Não especificada"}

Retorne um JSON com esta estrutura exata:
{
  "title": "título reescrito (6-120 chars)",
  "summary": "resumo em 1-2 frases (max 160 chars)",
  "content_html": "<p>conteúdo HTML formatado com parágrafos</p>",
  "meta_title": "título SEO (max 60 chars)",
  "meta_description": "descrição meta (max 160 chars)",
  "tags": ["tag1", "tag2", ... até 12 tags],
  "slug": "url-amigavel-do-titulo",
  "cities_mentioned": ["Cotia", "outras cidades mencionadas"]
}`;

    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Call Lovable AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;

    if (!aiContent) {
      throw new Error("Empty AI response");
    }

    console.log("AI response received, parsing...");

    // Parse AI response
    let rewritten;
    try {
      // Clean the response (remove markdown code blocks if present)
      const cleanedContent = aiContent
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      rewritten = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiContent);
      throw new Error("Failed to parse AI response as JSON");
    }

    // Validate and sanitize the response
    const finalTitle = (rewritten.title || item.original_title).slice(0, 120);
    const summary = (rewritten.summary || "").slice(0, 160);
    const metaTitle = (rewritten.meta_title || finalTitle).slice(0, 60);
    const metaDescription = (rewritten.meta_description || summary).slice(0, 160);
    const tags = Array.isArray(rewritten.tags) ? rewritten.tags.slice(0, 12) : [];
    const slug = rewritten.slug || generateSlug(finalTitle);
    const contentHtml = rewritten.content_html || `<p>${summary}</p>`;
    const citiesMentioned = Array.isArray(rewritten.cities_mentioned) ? rewritten.cities_mentioned : [];

    // Generate source credit
    const sourceCredit = item.source?.credit_template
      ? item.source.credit_template.replace("{source_name}", item.source.name)
      : `Fonte: ${item.source?.name || "Não informada"}`;

    // Create rewritten post with cities mentioned
    const { data: post, error: postError } = await supabase
      .from("autopost_rewritten_posts")
      .insert({
        ingest_item_id: item_id,
        tenant_id: item.tenant_id,
        final_title: finalTitle,
        slug,
        summary,
        content_html: contentHtml,
        seo_meta_title: metaTitle,
        seo_meta_description: metaDescription,
        tags,
        cities_mentioned: citiesMentioned,
        source_credit: sourceCredit,
        source_url: item.original_url,
        hero_image_url: item.original_image_url,
        author_name: item.source?.default_author || "Redação",
        category_id: item.source?.default_category_id,
        publish_status: item.source?.require_review ? "pending" : "approved",
        quality_score: calculateQualityScore(rewritten),
        seo_score: calculateSeoScore(metaTitle, metaDescription, tags),
      })
      .select()
      .single();

    if (postError) {
      console.error("Failed to create post:", postError);
      throw postError;
    }

    // Update ingest item status
    await supabase
      .from("autopost_ingest_items")
      .update({ status: "processed" })
      .eq("id", item_id);

    console.log(`Rewrite completed: ${post.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        post_id: post.id,
        title: finalTitle,
        publish_status: post.publish_status,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Rewrite error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

function calculateQualityScore(rewritten: any): number {
  let score = 50;
  
  // Title quality
  if (rewritten.title?.length >= 20 && rewritten.title?.length <= 80) score += 10;
  
  // Summary quality
  if (rewritten.summary?.length >= 50 && rewritten.summary?.length <= 160) score += 10;
  
  // Content quality
  if (rewritten.content_html?.length >= 300) score += 15;
  if (rewritten.content_html?.includes("<p>")) score += 5;
  
  // Tags quality
  if (rewritten.tags?.length >= 8) score += 10;
  
  return Math.min(100, score);
}

function calculateSeoScore(metaTitle: string, metaDescription: string, tags: string[]): number {
  let score = 0;
  
  // Meta title (max 30 points)
  if (metaTitle.length >= 30 && metaTitle.length <= 60) score += 30;
  else if (metaTitle.length >= 20) score += 15;
  
  // Meta description (max 30 points)
  if (metaDescription.length >= 120 && metaDescription.length <= 160) score += 30;
  else if (metaDescription.length >= 80) score += 15;
  
  // Tags (max 40 points)
  if (tags.length === 12) score += 40;
  else if (tags.length >= 8) score += 25;
  else if (tags.length >= 5) score += 15;
  
  return score;
}
