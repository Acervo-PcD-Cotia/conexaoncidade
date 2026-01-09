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
    const { post_id, approved_by } = await req.json();

    if (!post_id) {
      return new Response(
        JSON.stringify({ error: "post_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch rewritten post
    const { data: post, error: postError } = await supabase
      .from("autopost_rewritten_posts")
      .select(`
        *,
        ingest_item:autopost_ingest_items(
          source:autopost_sources(*)
        )
      `)
      .eq("id", post_id)
      .single();

    if (postError || !post) {
      return new Response(
        JSON.stringify({ error: "Post not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Publishing post: ${post.final_title}`);

    // Validate required fields
    const validationErrors: string[] = [];

    if (!post.final_title || post.final_title.length < 6) {
      validationErrors.push("Título deve ter pelo menos 6 caracteres");
    }
    if (post.final_title?.length > 120) {
      validationErrors.push("Título deve ter no máximo 120 caracteres");
    }
    if (!post.summary || post.summary.length > 160) {
      validationErrors.push("Resumo deve ter no máximo 160 caracteres");
    }
    if (!post.seo_meta_title || post.seo_meta_title.length > 60) {
      validationErrors.push("Meta título deve ter no máximo 60 caracteres");
    }
    if (!post.seo_meta_description || post.seo_meta_description.length > 160) {
      validationErrors.push("Meta descrição deve ter no máximo 160 caracteres");
    }
    if (!post.tags || post.tags.length !== 12) {
      validationErrors.push("Deve ter exatamente 12 tags");
    }
    if (!post.hero_image_url) {
      validationErrors.push("Imagem de capa é obrigatória");
    }
    if (!post.alt_text && post.hero_image_url) {
      // Auto-generate alt text if missing
      post.alt_text = `Imagem ilustrativa: ${post.final_title}`;
    }

    if (validationErrors.length > 0) {
      return new Response(
        JSON.stringify({ error: "Validation failed", details: validationErrors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Ensure unique slug
    let finalSlug = post.slug;
    let slugSuffix = 0;
    
    while (true) {
      const { data: existing } = await supabase
        .from("news")
        .select("id")
        .eq("slug", finalSlug)
        .limit(1);
      
      if (!existing || existing.length === 0) break;
      
      slugSuffix++;
      finalSlug = `${post.slug}-${slugSuffix}`;
    }

    // Create news article
    const { data: news, error: newsError } = await supabase
      .from("news")
      .insert({
        title: post.final_title,
        slug: finalSlug,
        excerpt: post.summary,
        content: post.content_html,
        author: post.author_name || "Redação",
        status: "published",
        published_at: new Date().toISOString(),
        category_id: post.category_id,
        image_url: post.hero_image_url,
        image_alt: post.alt_text,
        image_credit: post.image_credit,
        gallery_urls: post.gallery_urls,
        meta_title: post.seo_meta_title,
        meta_description: post.seo_meta_description,
        tags: post.tags,
        source: post.source_credit,
        source_url: post.source_url,
        tenant_id: post.tenant_id,
      })
      .select()
      .single();

    if (newsError) {
      console.error("Failed to create news:", newsError);
      throw newsError;
    }

    // Update post status
    await supabase
      .from("autopost_rewritten_posts")
      .update({
        publish_status: "published",
        published_at: new Date().toISOString(),
        published_news_id: news.id,
        approved_at: approved_by ? new Date().toISOString() : null,
        approved_by: approved_by || null,
      })
      .eq("id", post_id);

    // Update ingest item
    const ingestItemId = post.ingest_item_id;
    if (ingestItemId) {
      await supabase
        .from("autopost_ingest_items")
        .update({ status: "published" })
        .eq("id", ingestItemId);
    }

    // Update source stats
    const source = post.ingest_item?.source;
    if (source) {
      await supabase
        .from("autopost_sources")
        .update({
          total_items_published: (source.total_items_published || 0) + 1,
        })
        .eq("id", source.id);
    }

    // Create audit log
    await supabase
      .from("autopost_audit_logs")
      .insert({
        entity_type: "rewritten_post",
        entity_id: post_id,
        entity_name: post.final_title,
        action: "published",
        action_category: "publish",
        actor_user_id: approved_by || null,
        tenant_id: post.tenant_id,
        new_data: { news_id: news.id, slug: finalSlug },
      });

    console.log(`Published successfully: ${news.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        news_id: news.id,
        slug: finalSlug,
        url: `/noticia/${finalSlug}`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Publish error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
