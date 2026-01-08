import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RSSItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  imageUrl?: string;
  author?: string;
}

interface RSSFeed {
  title: string;
  description: string;
  link: string;
  items: RSSItem[];
  feedType: 'rss' | 'atom';
}

function extractTextContent(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const match = xml.match(regex);
  if (!match) return '';
  
  // Handle CDATA
  let content = match[1];
  const cdataMatch = content.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
  if (cdataMatch) {
    content = cdataMatch[1];
  }
  
  // Remove HTML tags for description
  return content.replace(/<[^>]+>/g, '').trim();
}

function extractAttribute(xml: string, tag: string, attr: string): string {
  const regex = new RegExp(`<${tag}[^>]*${attr}=["']([^"']+)["']`, 'i');
  const match = xml.match(regex);
  return match ? match[1] : '';
}

function extractImageFromItem(itemXml: string): string | undefined {
  // Try media:content
  let imageUrl = extractAttribute(itemXml, 'media:content', 'url');
  if (imageUrl) return imageUrl;
  
  // Try enclosure
  imageUrl = extractAttribute(itemXml, 'enclosure', 'url');
  if (imageUrl && itemXml.includes('type="image')) return imageUrl;
  
  // Try media:thumbnail
  imageUrl = extractAttribute(itemXml, 'media:thumbnail', 'url');
  if (imageUrl) return imageUrl;
  
  // Try to find image in content/description
  const contentMatch = itemXml.match(/<img[^>]*src=["']([^"']+)["']/i);
  if (contentMatch) return contentMatch[1];
  
  return undefined;
}

function parseRSS(xml: string): RSSFeed {
  const isAtom = xml.includes('<feed') && xml.includes('xmlns="http://www.w3.org/2005/Atom"');
  
  if (isAtom) {
    return parseAtom(xml);
  }
  
  // Parse RSS 2.0
  const title = extractTextContent(xml, 'title');
  const description = extractTextContent(xml, 'description');
  const link = extractTextContent(xml, 'link');
  
  const items: RSSItem[] = [];
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let match;
  
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    items.push({
      title: extractTextContent(itemXml, 'title'),
      link: extractTextContent(itemXml, 'link'),
      description: extractTextContent(itemXml, 'description'),
      pubDate: extractTextContent(itemXml, 'pubDate'),
      imageUrl: extractImageFromItem(itemXml),
      author: extractTextContent(itemXml, 'author') || extractTextContent(itemXml, 'dc:creator'),
    });
  }
  
  return {
    title,
    description,
    link,
    items,
    feedType: 'rss',
  };
}

function parseAtom(xml: string): RSSFeed {
  const title = extractTextContent(xml, 'title');
  const subtitle = extractTextContent(xml, 'subtitle');
  
  // Extract link href for Atom
  const linkMatch = xml.match(/<link[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["']/i) ||
                    xml.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["']alternate["']/i);
  const link = linkMatch ? linkMatch[1] : '';
  
  const items: RSSItem[] = [];
  const entryRegex = /<entry[^>]*>([\s\S]*?)<\/entry>/gi;
  let match;
  
  while ((match = entryRegex.exec(xml)) !== null) {
    const entryXml = match[1];
    
    // Extract link for entry
    const entryLinkMatch = entryXml.match(/<link[^>]*href=["']([^"']+)["']/i);
    const entryLink = entryLinkMatch ? entryLinkMatch[1] : '';
    
    items.push({
      title: extractTextContent(entryXml, 'title'),
      link: entryLink,
      description: extractTextContent(entryXml, 'summary') || extractTextContent(entryXml, 'content'),
      pubDate: extractTextContent(entryXml, 'published') || extractTextContent(entryXml, 'updated'),
      imageUrl: extractImageFromItem(entryXml),
      author: extractTextContent(entryXml, 'name'),
    });
  }
  
  return {
    title,
    description: subtitle,
    link,
    items,
    feedType: 'atom',
  };
}

async function detectAndParseFeed(url: string): Promise<RSSFeed | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    
    const contentType = response.headers.get('content-type') || '';
    const text = await response.text();
    
    // Check if it's XML/RSS/Atom
    const isXml = contentType.includes('xml') || 
                  text.trim().startsWith('<?xml') ||
                  text.includes('<rss') ||
                  text.includes('<feed');
    
    if (!isXml) {
      // Try to find RSS feed link in HTML
      const rssLink = text.match(/<link[^>]*type=["']application\/(rss|atom)\+xml["'][^>]*href=["']([^"']+)["']/i);
      if (rssLink) {
        // Found RSS link, fetch it
        const feedUrl = rssLink[2].startsWith('http') ? rssLink[2] : new URL(rssLink[2], url).href;
        return detectAndParseFeed(feedUrl);
      }
      
      return null;
    }
    
    return parseRSS(text);
  } catch (error) {
    console.error('Error fetching/parsing feed:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { url, maxItems = 10 } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Parsing feed from: ${url}`);
    
    const feed = await detectAndParseFeed(url);
    
    if (!feed) {
      return new Response(
        JSON.stringify({ 
          error: 'Could not parse feed',
          isRss: false,
          suggestion: 'This URL does not appear to be an RSS/Atom feed. Try finding the RSS feed URL on the website.'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Limit items
    feed.items = feed.items.slice(0, maxItems);
    
    return new Response(
      JSON.stringify({
        success: true,
        isRss: true,
        feed,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('RSS Parser error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({ error: `Failed to parse feed: ${message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
