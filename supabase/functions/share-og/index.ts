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
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");
    
    if (!slug) {
      return new Response("Missing slug", { status: 400 });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: news, error } = await supabase
      .from("news")
      .select("title, excerpt, meta_description, meta_title, featured_image_url, og_image_url, card_image_url, published_at, slug, summary_short, subtitle")
      .eq("slug", slug)
      .eq("status", "published")
      .is("deleted_at", null)
      .single();

    if (error || !news) {
      // Redirect to main site
      return new Response(null, {
        status: 302,
        headers: { Location: `https://conexaonacidade.com.br/noticia/${slug}` },
      });
    }

    const title = news.meta_title || news.title;
    const description = news.meta_description || news.summary_short || news.excerpt || news.subtitle || "";
    const image = news.og_image_url || news.featured_image_url || "https://conexaonacidade.com.br/og-image.png";
    const canonicalUrl = `https://conexaonacidade.com.br/noticia/${news.slug}`;
    const siteName = "Conexão na Cidade";

    // Detect if request is from a social media crawler
    const userAgent = (req.headers.get("user-agent") || "").toLowerCase();
    const isCrawler = [
      "facebookexternalhit", "twitterbot", "linkedinbot", "whatsapp",
      "telegrambot", "slackbot", "discordbot", "googlebot", "bingbot",
      "pinterest", "vkshare", "w3c_validator"
    ].some(bot => userAgent.includes(bot));

    // If not a crawler, redirect to the actual page
    if (!isCrawler) {
      return new Response(null, {
        status: 302,
        headers: { Location: canonicalUrl },
      });
    }

    // Serve rich HTML with OG meta tags for crawlers
    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)} | ${siteName}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${canonicalUrl}">
  
  <!-- Open Graph -->
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${escapeHtml(image)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:site_name" content="${siteName}">
  <meta property="og:locale" content="pt_BR">
  ${news.published_at ? `<meta property="article:published_time" content="${news.published_at}">` : ""}
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(image)}">
  <meta name="twitter:site" content="@conexaonacidade">
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(description)}</p>
  <a href="${canonicalUrl}">Leia mais em ${siteName}</a>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("share-og error:", err);
    return new Response("Internal error", { status: 500 });
  }
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
