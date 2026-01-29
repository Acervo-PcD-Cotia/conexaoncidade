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
    const { post_id, force_regenerate = false } = await req.json();

    if (!post_id) {
      return new Response(
        JSON.stringify({ error: "post_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch rewritten post
    const { data: post, error: postError } = await supabase
      .from("autopost_rewritten_posts")
      .select("*")
      .eq("id", post_id)
      .single();

    if (postError || !post) {
      return new Response(
        JSON.stringify({ error: "Post not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Skip if already has images and not forcing regeneration
    if (post.hero_image_url && !force_regenerate) {
      console.log("Post already has hero image, skipping generation");
      return new Response(
        JSON.stringify({ 
          success: true, 
          skipped: true, 
          message: "Image already exists" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    console.log(`Generating image for: ${post.final_title}`);

    // Determine the city context
    const cities = post.cities_mentioned || [];
    const primaryCity = cities[0] || "Cotia";
    
    // Build the image prompt
    const imagePrompt = buildImagePrompt(post.final_title, post.summary, primaryCity);

    console.log("Image prompt:", imagePrompt);

    // Generate image using Lovable AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: imagePrompt,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Image API error:", errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI Image API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const imageData = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageData || !imageData.startsWith("data:image")) {
      console.error("No image data in response");
      throw new Error("Failed to generate image");
    }

    console.log("Image generated, uploading to storage...");

    // Convert base64 to buffer
    const base64Data = imageData.split(",")[1];
    const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    // Upload to Supabase Storage
    const timestamp = Date.now();
    const heroPath = `autopost/${post_id}/hero-${timestamp}.webp`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("news-images")
      .upload(heroPath, imageBuffer, {
        contentType: "image/webp",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("news-images")
      .getPublicUrl(heroPath);

    const heroUrl = urlData.publicUrl;

    // Generate alt text
    const altText = `Imagem ilustrativa sobre ${extractTopic(post.final_title)} na região de ${primaryCity}`;
    const imageCredit = "Imagem gerada por IA | Conexão na Cidade";

    // Update post with image URLs
    const { error: updateError } = await supabase
      .from("autopost_rewritten_posts")
      .update({
        hero_image_url: heroUrl,
        og_image_url: heroUrl, // Use same for OG initially
        card_image_url: heroUrl, // Use same for card initially
        alt_text: altText,
        image_credit: imageCredit,
        updated_at: new Date().toISOString(),
      })
      .eq("id", post_id);

    if (updateError) {
      console.error("Failed to update post:", updateError);
      throw updateError;
    }

    console.log(`Image generation completed: ${heroUrl}`);

    return new Response(
      JSON.stringify({
        success: true,
        post_id,
        hero_url: heroUrl,
        alt_text: altText,
        image_credit: imageCredit,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Image generation error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function buildImagePrompt(title: string, summary: string, city: string): string {
  // Extract the main topic from the title
  const topic = extractTopic(title);
  
  return `Gere uma imagem fotorrealista para uma notícia de jornal.

TEMA DA NOTÍCIA: ${topic}

CONTEXTO: ${summary || title}

CIDADE/REGIÃO: ${city}, região de Cotia, São Paulo, Brasil

REQUISITOS OBRIGATÓRIOS:
- Estilo fotográfico jornalístico, realista
- Cenário urbano brasileiro típico de cidade de médio porte
- Iluminação natural, cores vibrantes
- Pessoas genéricas (se houver), nunca políticos ou celebridades reais
- SEM NENHUM TEXTO na imagem
- SEM logos, marcas ou elementos identificáveis
- Composição horizontal (16:9)
- Qualidade alta, foco nítido

Gere uma imagem profissional que poderia ser usada como foto de capa de uma matéria jornalística.`;
}

function extractTopic(title: string): string {
  // Remove common article words and simplify
  return title
    .replace(/^(como|por que|quando|onde|o que|quem|qual)\s+/gi, "")
    .replace(/[!?.,;:]+/g, "")
    .trim()
    .slice(0, 100);
}
