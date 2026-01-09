import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FeedItem {
  title: string;
  link: string;
  pubDate?: string;
  description?: string;
  content?: string;
  author?: string;
  enclosure?: { url: string };
  "media:content"?: { url: string };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { source_id, trigger_type = "manual" } = await req.json();

    if (!source_id) {
      return new Response(
        JSON.stringify({ error: "source_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch source configuration
    const { data: source, error: sourceError } = await supabase
      .from("autopost_sources")
      .select("*")
      .eq("id", source_id)
      .single();

    if (sourceError || !source) {
      console.error("Source not found:", sourceError);
      return new Response(
        JSON.stringify({ error: "Source not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create ingest job
    const { data: job, error: jobError } = await supabase
      .from("autopost_ingest_jobs")
      .insert({
        source_id,
        trigger_type,
        status: "running",
        started_at: new Date().toISOString(),
        tenant_id: source.tenant_id,
      })
      .select()
      .single();

    if (jobError) {
      console.error("Failed to create job:", jobError);
      throw jobError;
    }

    console.log(`Starting ingest job ${job.id} for source ${source.name}`);

    let itemsFound = 0;
    let itemsNew = 0;
    let itemsDuplicated = 0;
    let itemsErrored = 0;

    try {
      // Parse RSS feed
      const feedUrl = source.feed_url || source.site_url;
      const feedResponse = await fetch(feedUrl, {
        headers: { "User-Agent": "AutoPostBot/1.0" },
      });

      if (!feedResponse.ok) {
        throw new Error(`Feed fetch failed: ${feedResponse.status}`);
      }

      const feedXml = await feedResponse.text();
      const items = parseRssFeed(feedXml);
      itemsFound = items.length;

      console.log(`Found ${itemsFound} items in feed`);

      // Process each item
      const limit = source.per_run_limit || 10;
      const itemsToProcess = items.slice(0, limit);

      for (const item of itemsToProcess) {
        try {
          // Generate content hash and title fingerprint
          const contentHash = await generateHash(item.link + (item.content || item.description || ""));
          const titleFingerprint = normalizeTitle(item.title);

          // Check for duplicates
          const { data: existingItem } = await supabase
            .from("autopost_ingest_items")
            .select("id")
            .or(`content_hash.eq.${contentHash},title_fingerprint.eq.${titleFingerprint}`)
            .eq("tenant_id", source.tenant_id)
            .limit(1)
            .single();

          if (existingItem) {
            itemsDuplicated++;
            console.log(`Duplicate found for: ${item.title}`);
            continue;
          }

          // Extract image URL
          const imageUrl = extractImageUrl(item);

          // Insert new item
          const { error: insertError } = await supabase
            .from("autopost_ingest_items")
            .insert({
              source_id,
              job_id: job.id,
              tenant_id: source.tenant_id,
              original_title: item.title,
              original_url: item.link,
              original_excerpt: item.description?.slice(0, 500),
              original_content: item.content,
              original_author: item.author,
              original_image_url: imageUrl,
              original_published_at: item.pubDate ? new Date(item.pubDate).toISOString() : null,
              content_hash: contentHash,
              title_fingerprint: titleFingerprint,
              status: "captured",
            });

          if (insertError) {
            console.error(`Failed to insert item: ${insertError.message}`);
            itemsErrored++;
          } else {
            itemsNew++;
            console.log(`Captured: ${item.title}`);
          }
        } catch (itemError) {
          console.error(`Error processing item: ${itemError}`);
          itemsErrored++;
        }
      }

      // Update job status
      await supabase
        .from("autopost_ingest_jobs")
        .update({
          status: "completed",
          ended_at: new Date().toISOString(),
          items_found: itemsFound,
          items_new: itemsNew,
          items_duplicated: itemsDuplicated,
          items_errored: itemsErrored,
        })
        .eq("id", job.id);

      // Update source stats
      const newHealthScore = Math.max(0, Math.min(100, 
        source.health_score ? source.health_score + (itemsNew > 0 ? 5 : -2) : (itemsNew > 0 ? 80 : 50)
      ));

      await supabase
        .from("autopost_sources")
        .update({
          last_run_at: new Date().toISOString(),
          next_run_at: new Date(Date.now() + (source.schedule_frequency_minutes || 60) * 60000).toISOString(),
          health_score: newHealthScore,
          success_count: (source.success_count || 0) + (itemsNew > 0 ? 1 : 0),
          error_count: itemsErrored > 0 ? (source.error_count || 0) + 1 : source.error_count,
          total_items_captured: (source.total_items_captured || 0) + itemsNew,
        })
        .eq("id", source_id);

      console.log(`Job completed: ${itemsNew} new, ${itemsDuplicated} duplicates, ${itemsErrored} errors`);

      return new Response(
        JSON.stringify({
          success: true,
          job_id: job.id,
          items_found: itemsFound,
          items_new: itemsNew,
          items_duplicated: itemsDuplicated,
          items_errored: itemsErrored,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } catch (processError: any) {
      // Update job with error
      await supabase
        .from("autopost_ingest_jobs")
        .update({
          status: "failed",
          ended_at: new Date().toISOString(),
          error_message: processError.message,
          items_found: itemsFound,
          items_new: itemsNew,
          items_duplicated: itemsDuplicated,
          items_errored: itemsErrored,
        })
        .eq("id", job.id);

      throw processError;
    }

  } catch (error: any) {
    console.error("Ingest error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Simple RSS parser
function parseRssFeed(xml: string): FeedItem[] {
  const items: FeedItem[] = [];
  
  // Match <item> or <entry> tags
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>|<entry[^>]*>([\s\S]*?)<\/entry>/gi;
  let match;
  
  while ((match = itemRegex.exec(xml)) !== null) {
    const content = match[1] || match[2];
    
    const title = extractTag(content, "title");
    const link = extractTag(content, "link") || extractAttr(content, "link", "href");
    const pubDate = extractTag(content, "pubDate") || extractTag(content, "published") || extractTag(content, "updated");
    const description = extractTag(content, "description") || extractTag(content, "summary");
    const contentEncoded = extractTag(content, "content:encoded") || extractTag(content, "content");
    const author = extractTag(content, "author") || extractTag(content, "dc:creator");
    
    if (title && link) {
      items.push({
        title: decodeHtmlEntities(title),
        link,
        pubDate,
        description: description ? decodeHtmlEntities(description) : undefined,
        content: contentEncoded ? decodeHtmlEntities(contentEncoded) : undefined,
        author: author ? decodeHtmlEntities(author) : undefined,
      });
    }
  }
  
  return items;
}

function extractTag(content: string, tagName: string): string | undefined {
  const regex = new RegExp(`<${tagName}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tagName}>|<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i");
  const match = regex.exec(content);
  return match ? (match[1] || match[2])?.trim() : undefined;
}

function extractAttr(content: string, tagName: string, attrName: string): string | undefined {
  const regex = new RegExp(`<${tagName}[^>]*${attrName}=["']([^"']+)["']`, "i");
  const match = regex.exec(content);
  return match ? match[1] : undefined;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]+>/g, ""); // Strip HTML tags
}

function extractImageUrl(item: FeedItem): string | undefined {
  // Check enclosure
  if (item.enclosure?.url) return item.enclosure.url;
  if (item["media:content"]?.url) return item["media:content"].url;
  
  // Extract from content/description
  const content = item.content || item.description || "";
  const imgMatch = /<img[^>]+src=["']([^"']+)["']/i.exec(content);
  return imgMatch ? imgMatch[1] : undefined;
}

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 100);
}

async function generateHash(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 64);
}
