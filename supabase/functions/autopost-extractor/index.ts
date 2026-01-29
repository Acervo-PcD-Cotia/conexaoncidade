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
    const { item_id } = await req.json();

    if (!item_id) {
      return new Response(
        JSON.stringify({ error: "item_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch ingest item
    const { data: item, error: itemError } = await supabase
      .from("autopost_ingest_items")
      .select("*")
      .eq("id", item_id)
      .single();

    if (itemError || !item) {
      return new Response(
        JSON.stringify({ error: "Item not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If already has clean content, skip
    if (item.original_content_clean && item.original_content_clean.length > 100) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          skipped: true, 
          message: "Content already extracted",
          word_count: item.word_count 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Extracting content for: ${item.original_title}`);

    // Update status to processing
    await supabase
      .from("autopost_ingest_items")
      .update({ status: "processing" })
      .eq("id", item_id);

    let cleanContent = "";
    let extractedImages: string[] = [];

    // Try to use existing content first (from RSS content:encoded)
    if (item.original_content && item.original_content.length > 200) {
      cleanContent = cleanHtml(item.original_content);
      extractedImages = extractImagesFromHtml(item.original_content);
    } else {
      // Fetch and parse the original URL
      try {
        const response = await fetch(item.original_url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; ConexaoNaCidadeBot/1.0)",
            "Accept": "text/html,application/xhtml+xml",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const html = await response.text();
        
        // Extract main content using common article selectors
        cleanContent = extractArticleContent(html);
        extractedImages = extractImagesFromHtml(html);
        
      } catch (fetchError: any) {
        console.error(`Failed to fetch URL: ${fetchError.message}`);
        // Fall back to excerpt
        cleanContent = item.original_excerpt || item.original_title;
      }
    }

    // Calculate word count
    const wordCount = cleanContent.split(/\s+/).filter(Boolean).length;

    // Update item with extracted content
    const updateData: Record<string, any> = {
      original_content_clean: cleanContent,
      word_count: wordCount,
      status: cleanContent.length > 100 ? "extracted" : "failed",
      processing_notes: cleanContent.length > 100 
        ? `Extracted ${wordCount} words` 
        : "Content too short after extraction",
    };

    // Store additional images if found
    if (extractedImages.length > 0 && !item.original_images) {
      updateData.original_images = extractedImages.slice(0, 10);
    }

    const { error: updateError } = await supabase
      .from("autopost_ingest_items")
      .update(updateData)
      .eq("id", item_id);

    if (updateError) {
      console.error("Failed to update item:", updateError);
      throw updateError;
    }

    console.log(`Extraction completed: ${wordCount} words`);

    return new Response(
      JSON.stringify({
        success: true,
        item_id,
        word_count: wordCount,
        content_length: cleanContent.length,
        images_found: extractedImages.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Extraction error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Clean HTML and extract text content
function cleanHtml(html: string): string {
  return html
    // Remove scripts and styles
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    // Remove comments
    .replace(/<!--[\s\S]*?-->/g, "")
    // Remove unwanted tags but keep content
    .replace(/<(header|footer|nav|aside|form|iframe|noscript)[^>]*>[\s\S]*?<\/\1>/gi, "")
    // Convert paragraphs and headings to newlines
    .replace(/<\/?(p|br|div|h[1-6])[^>]*>/gi, "\n")
    // Remove all other tags
    .replace(/<[^>]+>/g, "")
    // Decode HTML entities
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)))
    // Clean whitespace
    .replace(/\s+/g, " ")
    .replace(/\n\s*\n/g, "\n\n")
    .trim();
}

// Extract article content using common selectors
function extractArticleContent(html: string): string {
  // Common article container patterns
  const patterns = [
    /<article[^>]*>([\s\S]*?)<\/article>/i,
    /<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*class="[^"]*article[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*class="[^"]*post[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<main[^>]*>([\s\S]*?)<\/main>/i,
    /<div[^>]*id="content"[^>]*>([\s\S]*?)<\/div>/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      const content = cleanHtml(match[1]);
      if (content.length > 200) {
        return content;
      }
    }
  }

  // Fallback: clean the whole body
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    return cleanHtml(bodyMatch[1]).slice(0, 10000);
  }

  return cleanHtml(html).slice(0, 5000);
}

// Extract image URLs from HTML
function extractImagesFromHtml(html: string): string[] {
  const images: string[] = [];
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
  let match;

  while ((match = imgRegex.exec(html)) !== null) {
    const url = match[1];
    // Filter out small/icon images
    if (
      url &&
      !url.includes("icon") &&
      !url.includes("logo") &&
      !url.includes("avatar") &&
      !url.includes("1x1") &&
      !url.includes("spacer") &&
      (url.startsWith("http") || url.startsWith("//"))
    ) {
      images.push(url.startsWith("//") ? `https:${url}` : url);
    }
  }

  return [...new Set(images)];
}
