import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/xml",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const baseUrl = "https://conexaonacidade.com.br";

    // Fetch published news
    const { data: news, error: newsError } = await supabase
      .from("news")
      .select("slug, updated_at, is_indexable")
      .eq("status", "published")
      .is("deleted_at", null)
      .neq("is_indexable", false)
      .order("published_at", { ascending: false })
      .limit(1000);

    if (newsError) {
      console.error("Error fetching news:", newsError);
      throw newsError;
    }

    // Fetch categories
    const { data: categories, error: catError } = await supabase
      .from("categories")
      .select("slug, created_at")
      .eq("is_active", true);

    if (catError) {
      console.error("Error fetching categories:", catError);
      throw catError;
    }

    // Build sitemap XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>`;

    // Add categories
    for (const cat of categories || []) {
      xml += `
  <url>
    <loc>${baseUrl}/categoria/${cat.slug}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
    }

    // Add news
    for (const item of news || []) {
      const lastmod = item.updated_at ? new Date(item.updated_at).toISOString().split("T")[0] : "";
      xml += `
  <url>
    <loc>${baseUrl}/noticia/${item.slug}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
    }

    xml += `
</urlset>`;

    console.log(`Generated sitemap with ${(news?.length || 0) + (categories?.length || 0) + 1} URLs`);

    return new Response(xml, {
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://conexaonacidade.com.br/</loc>
    <priority>1.0</priority>
  </url>
</urlset>`,
      { headers: corsHeaders }
    );
  }
});
