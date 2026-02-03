import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.90.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Guia Comercial SEO Edge Function
 * Generates sitemaps, structured data, and SEO metadata
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    switch (action) {
      case 'sitemap':
        return await generateSitemap(supabase);
      
      case 'category-data':
        const categorySlug = url.searchParams.get('slug');
        return await getCategoryData(supabase, categorySlug);
      
      case 'city-data':
        const city = url.searchParams.get('city');
        return await getCityData(supabase, city);
      
      case 'business-structured':
        const businessSlug = url.searchParams.get('slug');
        return await getBusinessStructuredData(supabase, businessSlug);
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in guia-seo function:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function generateSitemap(supabase: any) {
  const baseUrl = 'https://conexaonacidade.com.br';

  // Fetch all active businesses
  const { data: businesses } = await supabase
    .from('businesses')
    .select('slug, updated_at, plan')
    .eq('is_active', true)
    .order('updated_at', { ascending: false });

  // Fetch all categories
  const { data: categories } = await supabase
    .from('business_categories')
    .select('slug, created_at')
    .eq('is_active', true);

  // Fetch unique cities
  const { data: cities } = await supabase
    .from('businesses')
    .select('city')
    .eq('is_active', true);
  
  const uniqueCities = [...new Set((cities?.map((c: { city: string }) => c.city) || []) as string[])];

  // Build sitemap XML
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Main guia page
  xml += `  <url>
    <loc>${baseUrl}/guia</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>\n`;

  // Category pages
  for (const cat of categories || []) {
    xml += `  <url>
    <loc>${baseUrl}/guia/categoria/${cat.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
  }

  // City pages
  for (const city of uniqueCities) {
    const citySlug = (city as string).toLowerCase().replace(/\s+/g, '-');
    xml += `  <url>
    <loc>${baseUrl}/guia/cidade/${citySlug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
  }

  // Business pages
  for (const biz of businesses || []) {
    const priority = biz.plan === 'premium' ? '0.9' : biz.plan === 'pro' ? '0.7' : '0.6';
    xml += `  <url>
    <loc>${baseUrl}/guia/${biz.slug}</loc>
    <lastmod>${new Date(biz.updated_at).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>\n`;
  }

  xml += '</urlset>';

  return new Response(xml, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/xml',
    },
  });
}

async function getCategoryData(supabase: any, slug: string | null) {
  if (!slug) {
    return new Response(
      JSON.stringify({ error: 'Slug required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const { data: category } = await supabase
    .from('business_categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (!category) {
    return new Response(
      JSON.stringify({ error: 'Category not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const { count: businessCount } = await supabase
    .from('businesses')
    .select('id', { count: 'exact', head: true })
    .eq('category_main', slug)
    .eq('is_active', true);

  return new Response(
    JSON.stringify({
      ...category,
      business_count: businessCount,
      seo: {
        title: category.seo_title || `${category.name} | Guia Comercial`,
        description: category.seo_description || 
          `Encontre os melhores profissionais de ${category.name} na sua região. ${businessCount} empresas cadastradas.`,
        h1: `${category.name}`,
      },
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getCityData(supabase: any, city: string | null) {
  if (!city) {
    return new Response(
      JSON.stringify({ error: 'City required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const cityName = city.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());

  const { count: businessCount } = await supabase
    .from('businesses')
    .select('id', { count: 'exact', head: true })
    .ilike('city', cityName)
    .eq('is_active', true);

  // Get category distribution
  const { data: categoryData } = await supabase
    .from('businesses')
    .select('category_main')
    .ilike('city', cityName)
    .eq('is_active', true);

  const categoryDistribution: Record<string, number> = {};
  for (const biz of categoryData || []) {
    categoryDistribution[biz.category_main] = (categoryDistribution[biz.category_main] || 0) + 1;
  }

  // Get neighborhoods
  const { data: neighborhoods } = await supabase
    .from('businesses')
    .select('neighborhoods')
    .ilike('city', cityName)
    .eq('is_active', true);

  const uniqueNeighborhoods = [...new Set(
    (neighborhoods || []).flatMap((b: any) => b.neighborhoods || [])
  )];

  return new Response(
    JSON.stringify({
      city: cityName,
      business_count: businessCount,
      categories: categoryDistribution,
      neighborhoods: uniqueNeighborhoods,
      seo: {
        title: `Empresas em ${cityName} | Guia Comercial`,
        description: `Encontre ${businessCount} empresas e profissionais em ${cityName}. Restaurantes, serviços, saúde, beleza e muito mais.`,
        h1: `Empresas e Serviços em ${cityName}`,
      },
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getBusinessStructuredData(supabase: any, slug: string | null) {
  if (!slug) {
    return new Response(
      JSON.stringify({ error: 'Slug required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (!business) {
    return new Response(
      JSON.stringify({ error: 'Business not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Build JSON-LD structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": business.name,
    "description": business.description_short || business.tagline,
    "url": `https://conexaonacidade.com.br/guia/${business.slug}`,
    "telephone": business.phone || business.whatsapp,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": business.city,
      "addressRegion": business.state,
      "streetAddress": business.address,
    },
    ...(business.logo_url && { "image": business.logo_url }),
    ...(business.avg_rating > 0 && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": business.avg_rating,
        "reviewCount": business.review_count,
      },
    }),
    ...(business.opening_hours && {
      "openingHoursSpecification": formatOpeningHours(business.opening_hours),
    }),
    "priceRange": "$$",
  };

  return new Response(
    JSON.stringify({
      business,
      structuredData,
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

interface OpeningHoursInfo {
  open: string;
  close: string;
  closed?: boolean;
}

function formatOpeningHours(hours: Record<string, OpeningHoursInfo | undefined>) {
  const dayMap: Record<string, string> = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
  };

  const specs = [];
  for (const [day, info] of Object.entries(hours || {})) {
    if (info && !info.closed) {
      specs.push({
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": dayMap[day],
        "opens": info.open,
        "closes": info.close,
      });
    }
  }
  return specs;
}
