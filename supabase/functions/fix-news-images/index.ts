const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface NewsItem {
  id: string;
  title: string;
  source: string | null;
  featured_image_url: string | null;
}

interface ExtractResult {
  id: string;
  title: string;
  currentImage: string | null;
  extractedImages: string[];
  recommendedImage: string | null;
  status: 'success' | 'error';
  message?: string;
}

interface ApplyResult {
  id: string;
  title: string;
  status: 'success' | 'error';
  message?: string;
  newImage?: string;
}

// Filter out small images (logos, icons, etc.)
function filterValidImages(images: string[]): string[] {
  const excludePatterns = [
    /logo/i,
    /icon/i,
    /favicon/i,
    /avatar/i,
    /banner-\d+x\d+/i,
    /ads?[-_]/i,
    /pixel/i,
    /tracking/i,
    /spinner/i,
    /loading/i,
    /placeholder/i,
    /data:image/i,
    /1x1/,
    /spacer/i,
  ];

  return images.filter(url => {
    // Exclude data URIs and very short URLs
    if (url.startsWith('data:') || url.length < 20) return false;
    
    // Exclude patterns
    if (excludePatterns.some(pattern => pattern.test(url))) return false;
    
    // Must have valid image extension or be from known CDNs
    const hasImageExt = /\.(jpg|jpeg|png|gif|webp)/i.test(url);
    const isFromCDN = /wp-content|uploads|images|media|static|cdn/i.test(url);
    
    return hasImageExt || isFromCDN;
  });
}

// Extract images from page content using Firecrawl
async function extractImagesFromSource(sourceUrl: string): Promise<string[]> {
  const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
  if (!apiKey) {
    console.error('FIRECRAWL_API_KEY not configured');
    return [];
  }

  try {
    console.log(`Scraping images from: ${sourceUrl}`);
    
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: sourceUrl,
        formats: ['html', 'links'],
        onlyMainContent: false,
        waitFor: 2000,
      }),
    });

    if (!response.ok) {
      console.error(`Firecrawl error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const html = data.data?.html || data.html || '';
    const metadata = data.data?.metadata || data.metadata || {};
    
    const images: string[] = [];
    
    // 1. Get og:image (highest priority)
    if (metadata.ogImage) {
      images.push(metadata.ogImage);
    }
    
    // 2. Get twitter:image
    if (metadata.twitterImage && metadata.twitterImage !== metadata.ogImage) {
      images.push(metadata.twitterImage);
    }
    
    // 3. Extract images from HTML
    const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
    let match;
    while ((match = imgRegex.exec(html)) !== null) {
      const imgUrl = match[1];
      if (imgUrl && !images.includes(imgUrl)) {
        // Make relative URLs absolute
        if (imgUrl.startsWith('/')) {
          try {
            const baseUrl = new URL(sourceUrl);
            images.push(`${baseUrl.origin}${imgUrl}`);
          } catch {
            // Skip invalid URLs
          }
        } else if (imgUrl.startsWith('http')) {
          images.push(imgUrl);
        }
      }
    }
    
    // 4. Look for srcset images (often higher resolution)
    const srcsetRegex = /srcset=["']([^"']+)["']/gi;
    while ((match = srcsetRegex.exec(html)) !== null) {
      const srcset = match[1];
      const urls = srcset.split(',').map(s => s.trim().split(' ')[0]);
      urls.forEach(url => {
        if (url && url.startsWith('http') && !images.includes(url)) {
          images.push(url);
        }
      });
    }

    // Filter and deduplicate
    const validImages = filterValidImages([...new Set(images)]);
    console.log(`Found ${validImages.length} valid images`);
    
    return validImages;
  } catch (error) {
    console.error(`Error extracting images from ${sourceUrl}:`, error);
    return [];
  }
}

// Validate if image URL is accessible
async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentType = response.headers.get('content-type') || '';
    return response.ok && contentType.startsWith('image/');
  } catch {
    return false;
  }
}

// Find best image (largest, most likely to be main content)
function selectBestImage(images: string[]): string | null {
  if (images.length === 0) return null;
  
  // Prefer images with size indicators suggesting larger images
  const sizePatterns = [
    /(\d{3,4})x(\d{3,4})/,  // 1200x630, 1920x1080, etc.
    /-large/i,
    /-full/i,
    /-original/i,
    /hero/i,
    /featured/i,
    /main/i,
    /cover/i,
  ];
  
  // Score each image
  const scored = images.map(url => {
    let score = 0;
    
    // Check for size indicators
    const sizeMatch = url.match(/(\d{3,4})x(\d{3,4})/);
    if (sizeMatch) {
      const width = parseInt(sizeMatch[1]);
      const height = parseInt(sizeMatch[2]);
      score += Math.min(width * height / 10000, 100); // Max 100 points for size
    }
    
    // Bonus for hero/featured keywords
    sizePatterns.forEach(pattern => {
      if (pattern.test(url)) score += 20;
    });
    
    // Prefer wp-content uploads (usually main content)
    if (/wp-content\/uploads/i.test(url)) score += 30;
    
    // Slight preference for first images (usually og:image)
    score += (images.indexOf(url) === 0) ? 15 : 0;
    
    return { url, score };
  });
  
  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);
  
  return scored[0]?.url || images[0] || null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      newsIds,
      mode = 'extract', // 'extract' | 'apply'
      imageUrl,         // For manual apply mode
    } = await req.json().catch(() => ({}));
    
    if (!newsIds || !Array.isArray(newsIds) || newsIds.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'newsIds array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch news items
    const { data: newsItems, error: fetchError } = await supabase
      .from('news')
      .select('id, title, source, featured_image_url')
      .in('id', newsIds);

    if (fetchError) {
      throw new Error(`Error fetching news: ${fetchError.message}`);
    }

    if (!newsItems || newsItems.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No news items found', results: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${newsItems.length} news items in ${mode} mode`);

    // MODE: Extract images from sources
    if (mode === 'extract') {
      const results: ExtractResult[] = [];

      for (const item of newsItems as NewsItem[]) {
        console.log(`\nExtracting images for: ${item.title}`);
        
        // Extract URL from source field
        const urlMatch = item.source?.match(/https?:\/\/[^\s\]]+/);
        const sourceUrl = urlMatch ? urlMatch[0] : null;

        if (!sourceUrl) {
          results.push({
            id: item.id,
            title: item.title,
            currentImage: item.featured_image_url,
            extractedImages: [],
            recommendedImage: null,
            status: 'error',
            message: 'No valid URL in source field',
          });
          continue;
        }

        // Add delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));

        const extractedImages = await extractImagesFromSource(sourceUrl);
        const recommendedImage = selectBestImage(extractedImages);

        results.push({
          id: item.id,
          title: item.title,
          currentImage: item.featured_image_url,
          extractedImages,
          recommendedImage,
          status: extractedImages.length > 0 ? 'success' : 'error',
          message: extractedImages.length > 0 
            ? `Found ${extractedImages.length} images` 
            : 'No images found',
        });
      }

      return new Response(
        JSON.stringify({ success: true, mode: 'extract', results }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // MODE: Apply manual image URL
    if (mode === 'apply' && imageUrl) {
      const results: ApplyResult[] = [];

      for (const item of newsItems as NewsItem[]) {
        try {
          const { error: updateError } = await supabase
            .from('news')
            .update({
              featured_image_url: imageUrl,
              og_image_url: imageUrl,
              card_image_url: imageUrl,
            })
            .eq('id', item.id);

          if (updateError) throw updateError;

          results.push({
            id: item.id,
            title: item.title,
            status: 'success',
            message: 'Image updated',
            newImage: imageUrl,
          });
        } catch (err) {
          results.push({
            id: item.id,
            title: item.title,
            status: 'error',
            message: err instanceof Error ? err.message : 'Unknown error',
          });
        }
      }

      return new Response(
        JSON.stringify({ success: true, mode: 'apply', results }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Invalid mode or missing parameters' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
