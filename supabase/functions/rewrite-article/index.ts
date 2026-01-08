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

    const { 
      imported_article_id, 
      override_style_profile_id, 
      target_user_id,
      created_by,
    } = await req.json();

    if (!imported_article_id) {
      return new Response(
        JSON.stringify({ error: "imported_article_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch imported article with source article
    const { data: importedArticle, error: fetchError } = await supabase
      .from("imported_articles")
      .select(`
        *,
        source_article:articles!imported_articles_source_article_id_fkey(
          id, title, summary, content_html, author_name, category
        ),
        source_site:sites!imported_articles_source_site_id_fkey(id, name)
      `)
      .eq("id", imported_article_id)
      .single();

    if (fetchError || !importedArticle) {
      throw new Error("Imported article not found");
    }

    const sourceArticle = importedArticle.source_article;
    if (!sourceArticle?.content_html) {
      throw new Error("Source article has no content");
    }

    // Resolve style
    const resolveResponse = await fetch(`${supabaseUrl}/functions/v1/resolve-style`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${supabaseServiceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        target_site_id: importedArticle.target_site_id,
        target_user_id,
        override_style_profile_id,
      }),
    });

    if (!resolveResponse.ok) {
      throw new Error("Failed to resolve style");
    }

    const styleData = await resolveResponse.json();

    // Rewrite using AI
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
            content: `Você é um jornalista profissional. Reescreva o artigo seguindo EXATAMENTE o guia de estilo fornecido.

REGRAS OBRIGATÓRIAS:
1. Mantenha todas as informações factuais (datas, nomes, números, citações)
2. Preserve a estrutura geral (título, lead, desenvolvimento, conclusão)
3. Aplique o estilo de voz, tom e formatação do guia
4. Mantenha os créditos originais
5. Não invente informações
6. Retorne apenas o HTML do conteúdo reescrito

GUIA DE ESTILO A SEGUIR:
${styleData.style_guide_text}`,
          },
          {
            role: "user",
            content: `Reescreva este artigo:

TÍTULO: ${sourceArticle.title}

RESUMO: ${sourceArticle.summary || ""}

CONTEÚDO:
${sourceArticle.content_html}

CRÉDITO ORIGINAL: ${importedArticle.credited_text || `Fonte: ${importedArticle.source_site?.name}`}`,
          },
        ],
        max_tokens: 4000,
        temperature: 0.4,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      throw new Error(`AI API error: ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const rewrittenContent = aiData.choices?.[0]?.message?.content || "";

    if (!rewrittenContent) {
      throw new Error("AI did not return rewritten content");
    }

    // Create target article if not exists
    let targetArticleId = importedArticle.target_article_id;
    
    if (!targetArticleId) {
      const { data: newArticle, error: createError } = await supabase
        .from("articles")
        .insert({
          site_id: importedArticle.target_site_id,
          title: sourceArticle.title,
          slug: `${sourceArticle.id}-rewritten-${Date.now()}`,
          summary: sourceArticle.summary,
          content_html: rewrittenContent,
          author_name: sourceArticle.author_name,
          category: sourceArticle.category,
          canonical_url: importedArticle.canonical_url,
          status: "draft",
        })
        .select()
        .single();

      if (createError) throw createError;
      targetArticleId = newArticle.id;

      // Update imported article with target
      await supabase
        .from("imported_articles")
        .update({ target_article_id: targetArticleId })
        .eq("id", imported_article_id);
    } else {
      // Update existing article
      await supabase
        .from("articles")
        .update({ content_html: rewrittenContent })
        .eq("id", targetArticleId);
    }

    // Create article version for audit
    const promptHash = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(styleData.style_guide_text + sourceArticle.content_html)
    );
    const hashArray = Array.from(new Uint8Array(promptHash));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);

    await supabase.from("article_versions").insert({
      article_id: targetArticleId,
      site_id: importedArticle.target_site_id,
      kind: "rewritten",
      content_html: rewrittenContent,
      created_by,
      style_profile_id: styleData.style_profile_id,
      style_version_id: styleData.style_version_id,
      rewrite_engine: "gemini-2.5-flash",
      rewrite_prompt_hash: hashHex,
    });

    return new Response(
      JSON.stringify({
        success: true,
        target_article_id: targetArticleId,
        rewritten_content: rewrittenContent,
        style_source: styleData.source,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error rewriting article:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
