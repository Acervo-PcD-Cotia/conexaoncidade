import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  source_id?: string;
  feed_url: string;
  test_only?: boolean;
  tenant_id?: string;
}

interface FeedItem {
  title: string;
  url: string;
  summary?: string;
  content_html?: string;
  published_at?: string;
  author?: string;
  image_url?: string;
}

interface ParsedFeed {
  title: string;
  description?: string;
  items: FeedItem[];
}

async function fetchAndParseFeed(feedUrl: string): Promise<ParsedFeed> {
  const response = await fetch(feedUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; SyndicationBot/1.0)',
      'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml, application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch feed: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type') || '';
  const text = await response.text();

  // Try JSON feed first
  if (contentType.includes('json') || text.trim().startsWith('{')) {
    return parseJsonFeed(text);
  }

  // Parse as XML (RSS or Atom)
  return parseXmlFeed(text);
}

function parseJsonFeed(text: string): ParsedFeed {
  const data = JSON.parse(text);
  
  // JSON Feed format
  if (data.version?.startsWith('https://jsonfeed.org/')) {
    return {
      title: data.title || 'Untitled Feed',
      description: data.description,
      items: (data.items || []).map((item: Record<string, unknown>) => ({
        title: (item.title as string) || 'Untitled',
        url: (item.url as string) || (item.external_url as string) || '',
        summary: item.summary as string | undefined,
        content_html: (item.content_html as string) || (item.content_text as string),
        published_at: (item.date_published as string) || (item.date_modified as string),
        author: (item.author as { name?: string })?.name,
        image_url: (item.image as string) || (item.banner_image as string),
      })),
    };
  }

  throw new Error('Unknown JSON feed format');
}

function parseXmlFeed(text: string): ParsedFeed {
  // Simple XML parsing without external dependencies
  const isAtom = text.includes('<feed') && text.includes('xmlns="http://www.w3.org/2005/Atom"');
  
  if (isAtom) {
    return parseAtomFeed(text);
  }
  
  return parseRssFeed(text);
}

function parseRssFeed(text: string): ParsedFeed {
  const items: FeedItem[] = [];
  
  // Extract channel title
  const titleMatch = text.match(/<channel[^>]*>[\s\S]*?<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
  const title = titleMatch ? cleanXmlText(titleMatch[1]) : 'Untitled Feed';
  
  // Extract description
  const descMatch = text.match(/<channel[^>]*>[\s\S]*?<description[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i);
  const description = descMatch ? cleanXmlText(descMatch[1]) : undefined;
  
  // Extract items
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let itemMatch;
  
  while ((itemMatch = itemRegex.exec(text)) !== null) {
    const itemContent = itemMatch[1];
    
    const itemTitle = extractXmlValue(itemContent, 'title') || 'Untitled';
    const itemLink = extractXmlValue(itemContent, 'link') || extractXmlValue(itemContent, 'guid');
    const itemDescription = extractXmlValue(itemContent, 'description');
    const itemContent_html = extractXmlValue(itemContent, 'content:encoded');
    const itemPubDate = extractXmlValue(itemContent, 'pubDate');
    const itemAuthor = extractXmlValue(itemContent, 'author') || extractXmlValue(itemContent, 'dc:creator');
    
    // Try to extract image
    let imageUrl: string | undefined;
    const enclosureMatch = itemContent.match(/<enclosure[^>]*url=["']([^"']+)["'][^>]*type=["']image/i);
    if (enclosureMatch) {
      imageUrl = enclosureMatch[1];
    } else {
      const mediaMatch = itemContent.match(/<media:content[^>]*url=["']([^"']+)["']/i);
      if (mediaMatch) {
        imageUrl = mediaMatch[1];
      }
    }
    
    if (itemLink) {
      items.push({
        title: itemTitle,
        url: itemLink,
        summary: itemDescription,
        content_html: itemContent_html || itemDescription,
        published_at: itemPubDate ? new Date(itemPubDate).toISOString() : undefined,
        author: itemAuthor,
        image_url: imageUrl,
      });
    }
  }
  
  return { title, description, items };
}

function parseAtomFeed(text: string): ParsedFeed {
  const items: FeedItem[] = [];
  
  // Extract feed title
  const titleMatch = text.match(/<feed[^>]*>[\s\S]*?<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
  const title = titleMatch ? cleanXmlText(titleMatch[1]) : 'Untitled Feed';
  
  // Extract subtitle as description
  const subtitleMatch = text.match(/<subtitle[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/subtitle>/i);
  const description = subtitleMatch ? cleanXmlText(subtitleMatch[1]) : undefined;
  
  // Extract entries
  const entryRegex = /<entry[^>]*>([\s\S]*?)<\/entry>/gi;
  let entryMatch;
  
  while ((entryMatch = entryRegex.exec(text)) !== null) {
    const entryContent = entryMatch[1];
    
    const entryTitle = extractXmlValue(entryContent, 'title') || 'Untitled';
    
    // Get link - prefer alternate
    let entryLink: string | undefined;
    const linkMatch = entryContent.match(/<link[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["']/i);
    if (linkMatch) {
      entryLink = linkMatch[1];
    } else {
      const simpleLinkMatch = entryContent.match(/<link[^>]*href=["']([^"']+)["']/i);
      if (simpleLinkMatch) {
        entryLink = simpleLinkMatch[1];
      }
    }
    
    const entrySummary = extractXmlValue(entryContent, 'summary');
    const entryContentHtml = extractXmlValue(entryContent, 'content');
    const entryUpdated = extractXmlValue(entryContent, 'updated') || extractXmlValue(entryContent, 'published');
    const entryAuthor = entryContent.match(/<author[^>]*>[\s\S]*?<name[^>]*>([^<]+)<\/name>/i)?.[1];
    
    if (entryLink) {
      items.push({
        title: entryTitle,
        url: entryLink,
        summary: entrySummary,
        content_html: entryContentHtml || entrySummary,
        published_at: entryUpdated ? new Date(entryUpdated).toISOString() : undefined,
        author: entryAuthor,
      });
    }
  }
  
  return { title, description, items };
}

function extractXmlValue(xml: string, tagName: string): string | undefined {
  const regex = new RegExp(`<${tagName}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tagName}>`, 'i');
  const match = xml.match(regex);
  return match ? cleanXmlText(match[1]) : undefined;
}

function cleanXmlText(text: string): string {
  return text
    .replace(/<!\[CDATA\[/g, '')
    .replace(/\]\]>/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { source_id, feed_url, test_only = false, tenant_id }: RequestBody = await req.json();

    if (!feed_url) {
      return new Response(
        JSON.stringify({ error: "feed_url is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch and parse the feed
    console.log(`Fetching feed: ${feed_url}`);
    const parsedFeed = await fetchAndParseFeed(feed_url);
    console.log(`Parsed ${parsedFeed.items.length} items from feed`);

    // If test_only, return preview
    if (test_only) {
      return new Response(
        JSON.stringify({
          success: true,
          test_only: true,
          feed_title: parsedFeed.title,
          feed_description: parsedFeed.description,
          item_count: parsedFeed.items.length,
          preview_items: parsedFeed.items.slice(0, 5).map(item => ({
            title: item.title,
            url: item.url,
            published_at: item.published_at,
            author: item.author,
            has_content: !!item.content_html,
            has_image: !!item.image_url,
          })),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert items into syndication_inbox
    let insertedCount = 0;
    let duplicateCount = 0;
    const errors: string[] = [];

    for (const item of parsedFeed.items) {
      const insertData: Record<string, unknown> = {
        source_id: source_id || null,
        title: item.title,
        url: item.url,
        summary: item.summary || null,
        content_html: item.content_html || null,
        published_at: item.published_at || null,
        status: 'inbox',
      };

      // Add tenant_id if provided
      if (tenant_id) {
        insertData.tenant_id = tenant_id;
      }

      const { error: insertError } = await supabase
        .from('syndication_inbox')
        .upsert(insertData, {
          onConflict: tenant_id ? 'tenant_id,url' : 'url',
          ignoreDuplicates: true,
        });

      if (insertError) {
        if (insertError.code === '23505') {
          duplicateCount++;
        } else {
          console.error(`Error inserting item: ${insertError.message}`);
          errors.push(`${item.title}: ${insertError.message}`);
        }
      } else {
        insertedCount++;
      }
    }

    // Update source metadata if source_id provided
    if (source_id) {
      const { error: updateError } = await supabase
        .from('syndication_sources')
        .update({
          last_fetched_at: new Date().toISOString(),
          last_item_count: parsedFeed.items.length,
          error_count: errors.length > 0 ? 1 : 0,
          last_error: errors.length > 0 ? errors[0] : null,
        })
        .eq('id', source_id);

      if (updateError) {
        console.error(`Error updating source: ${updateError.message}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        feed_title: parsedFeed.title,
        total_items: parsedFeed.items.length,
        inserted_count: insertedCount,
        duplicate_count: duplicateCount,
        error_count: errors.length,
        errors: errors.slice(0, 5),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Internal server error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
