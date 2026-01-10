import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const feedId = url.searchParams.get('feedId');
    const tenantId = url.searchParams.get('tenantId');

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Fetch podcast feed info
    let feedQuery = supabase
      .from('podcast_feeds')
      .select('*')
      .eq('is_active', true);

    if (feedId) {
      feedQuery = feedQuery.eq('id', feedId);
    } else if (tenantId) {
      feedQuery = feedQuery.eq('tenant_id', tenantId).eq('feed_type', 'portal');
    }

    const { data: feed, error: feedError } = await feedQuery.single();

    if (feedError || !feed) {
      // Return default feed structure
      console.log('No feed found, generating default feed');
    }

    // Fetch news with podcast ready
    let newsQuery = supabase
      .from('news')
      .select(`
        id,
        title,
        subtitle,
        excerpt,
        slug,
        podcast_audio_url,
        audio_duration_seconds,
        published_at,
        featured_image_url,
        categories:category_id(name),
        profiles:author_id(full_name)
      `)
      .eq('status', 'published')
      .eq('podcast_status', 'published')
      .not('podcast_audio_url', 'is', null)
      .order('published_at', { ascending: false })
      .limit(100);

    if (feed?.tenant_id) {
      newsQuery = newsQuery.eq('tenant_id', feed.tenant_id);
    }

    if (feed?.category_id) {
      newsQuery = newsQuery.eq('category_id', feed.category_id);
    }

    if (feed?.author_id) {
      newsQuery = newsQuery.eq('author_id', feed.author_id);
    }

    const { data: newsItems, error: newsError } = await newsQuery;

    if (newsError) {
      console.error('Error fetching news:', newsError);
      throw new Error('Failed to fetch news');
    }

    const feedTitle = feed?.title || 'Portal de Notícias - Áudio';
    const feedDescription = feed?.description || 'Notícias em áudio do nosso portal';
    const feedLanguage = feed?.language || 'pt-BR';
    const feedImage = feed?.cover_image_url || '';
    const baseUrl = 'https://conexaonacidade.com.br';

    // Generate RSS XML
    const items = (newsItems || []).map((item: any) => {
      const pubDate = new Date(item.published_at).toUTCString();
      const duration = formatDuration(item.audio_duration_seconds || 0);
      const authorName = item.profiles?.full_name || 'Redação';
      const categoryName = item.categories?.name || 'Geral';

      return `
    <item>
      <title>${escapeXml(item.title)}</title>
      <description>${escapeXml(item.excerpt || item.subtitle || '')}</description>
      <link>${baseUrl}/noticia/${item.slug}</link>
      <guid isPermaLink="false">${item.id}</guid>
      <pubDate>${pubDate}</pubDate>
      <enclosure url="${escapeXml(item.podcast_audio_url)}" type="audio/mpeg" length="0"/>
      <itunes:duration>${duration}</itunes:duration>
      <itunes:author>${escapeXml(authorName)}</itunes:author>
      <itunes:summary>${escapeXml(item.excerpt || item.subtitle || '')}</itunes:summary>
      ${item.featured_image_url ? `<itunes:image href="${escapeXml(item.featured_image_url)}"/>` : ''}
      <category>${escapeXml(categoryName)}</category>
    </item>`;
    }).join('');

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
  xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(feedTitle)}</title>
    <description>${escapeXml(feedDescription)}</description>
    <language>${feedLanguage}</language>
    <link>${baseUrl}</link>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <itunes:author>Conexão na Cidade</itunes:author>
    <itunes:category text="News"/>
    <itunes:explicit>false</itunes:explicit>
    ${feedImage ? `<itunes:image href="${escapeXml(feedImage)}"/>` : ''}
    ${feedImage ? `<image><url>${escapeXml(feedImage)}</url><title>${escapeXml(feedTitle)}</title><link>${baseUrl}</link></image>` : ''}
    ${items}
  </channel>
</rss>`;

    return new Response(rss, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/rss+xml; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error in generate-podcast-feed:', error);
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
