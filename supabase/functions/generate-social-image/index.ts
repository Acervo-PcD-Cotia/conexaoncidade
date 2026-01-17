import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateImageRequest {
  newsId: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY is required for image generation');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { newsId } = await req.json() as GenerateImageRequest;

    if (!newsId) {
      throw new Error('newsId is required');
    }

    // Fetch news data
    const { data: news, error: newsError } = await supabase
      .from('news')
      .select(`
        id,
        title,
        excerpt,
        featured_image_url,
        category_id,
        categories(name, color)
      `)
      .eq('id', newsId)
      .single();

    if (newsError || !news) {
      throw new Error(`News not found: ${newsError?.message}`);
    }

    // Get category info (handle array result)
    const category = Array.isArray(news.categories) ? news.categories[0] : news.categories;
    const categoryName = category?.name || 'Notícias';
    const categoryColor = category?.color || 'blue';

    console.log(`Generating social images for news: ${news.title}`);

    // Generate 1:1 image (1080x1080) for feed
    const prompt1x1 = `Create a professional news social media card image in 1:1 aspect ratio (1080x1080). 
    Title: "${news.title}"
    Category: "${categoryName}"
    Style: Modern, clean, professional news media design with bold typography.
    Include: 
    - A prominent headline area with the title
    - The category name in a colored badge (${categoryColor})
    - A subtle "Conexão na Cidade" watermark/logo area at the bottom
    - Clean background with gradient overlay
    - Professional news publication aesthetic
    DO NOT include any faces or portraits. Focus on abstract, editorial design.
    Ultra high resolution.`;

    const prompt9x16 = `Create a professional news social media story image in 9:16 aspect ratio (1080x1920). 
    Title: "${news.title}"
    Category: "${categoryName}"
    Style: Modern, clean, vertical news story design optimized for mobile viewing.
    Include:
    - Large, readable headline in the upper third
    - The category name in a colored badge (${categoryColor})
    - A prominent "Conexão na Cidade" branding at the bottom
    - Engaging vertical composition with gradient overlays
    - Professional news publication aesthetic suitable for Instagram/WhatsApp stories
    DO NOT include any faces or portraits. Focus on abstract, editorial design.
    Ultra high resolution.`;

    // Generate images using Lovable AI
    const [response1x1, response9x16] = await Promise.all([
      fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image-preview",
          messages: [{ role: "user", content: prompt1x1 }],
          modalities: ["image", "text"]
        })
      }),
      fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image-preview",
          messages: [{ role: "user", content: prompt9x16 }],
          modalities: ["image", "text"]
        })
      })
    ]);

    const data1x1 = await response1x1.json();
    const data9x16 = await response9x16.json();

    const image1x1Base64 = data1x1.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const image9x16Base64 = data9x16.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!image1x1Base64 && !image9x16Base64) {
      throw new Error('Failed to generate any images');
    }

    const results: { feed_url?: string; story_url?: string } = {};

    // Upload 1:1 image if generated
    if (image1x1Base64) {
      const base64Data = image1x1Base64.replace(/^data:image\/\w+;base64,/, '');
      const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      
      const feedPath = `social/${newsId}/feed-1x1.png`;
      const { error: uploadError1 } = await supabase.storage
        .from('news-images')
        .upload(feedPath, imageBytes, {
          contentType: 'image/png',
          upsert: true
        });

      if (uploadError1) {
        console.error('Error uploading 1:1 image:', uploadError1);
      } else {
        const { data: publicUrl1 } = supabase.storage
          .from('news-images')
          .getPublicUrl(feedPath);
        results.feed_url = publicUrl1.publicUrl;
      }
    }

    // Upload 9:16 image if generated
    if (image9x16Base64) {
      const base64Data = image9x16Base64.replace(/^data:image\/\w+;base64,/, '');
      const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      
      const storyPath = `social/${newsId}/story-9x16.png`;
      const { error: uploadError2 } = await supabase.storage
        .from('news-images')
        .upload(storyPath, imageBytes, {
          contentType: 'image/png',
          upsert: true
        });

      if (uploadError2) {
        console.error('Error uploading 9:16 image:', uploadError2);
      } else {
        const { data: publicUrl2 } = supabase.storage
          .from('news-images')
          .getPublicUrl(storyPath);
        results.story_url = publicUrl2.publicUrl;
      }
    }

    // Update news with social image URLs
    if (results.feed_url || results.story_url) {
      await supabase
        .from('news')
        .update({
          social_image_1x1: results.feed_url || null,
          social_image_9x16: results.story_url || null,
          social_images_generated_at: new Date().toISOString()
        })
        .eq('id', newsId);
    }

    console.log('Social images generated successfully:', results);

    return new Response(JSON.stringify({
      success: true,
      images: results,
      newsId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error generating social images:', errorMessage);
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
