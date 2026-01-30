import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { newsId } = await req.json();

    if (!newsId) {
      return new Response(
        JSON.stringify({ error: 'newsId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[generate-webstory] Starting generation for newsId:', newsId);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch news data
    const { data: news, error: newsError } = await supabase
      .from('news')
      .select('id, title, excerpt, featured_image_url, slug, category_id, categories:category_id(name)')
      .eq('id', newsId)
      .single();

    if (newsError || !news) {
      console.error('[generate-webstory] News not found:', newsError);
      return new Response(
        JSON.stringify({ error: 'News not found', details: newsError?.message }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[generate-webstory] News found:', news.title);

    // Check if WebStory already exists for this news
    const { data: existingStory } = await supabase
      .from('web_stories')
      .select('id')
      .eq('news_id', newsId)
      .maybeSingle();

    if (existingStory) {
      console.log('[generate-webstory] WebStory already exists:', existingStory.id);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'WebStory already exists',
          storyId: existingStory.id 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate slug for the story
    const storySlug = `story-${news.slug}`;
    const categoryName = (news as any).categories?.name || 'Notícias';

    // Create the WebStory
    const { data: story, error: storyError } = await supabase
      .from('web_stories')
      .insert({
        title: news.title,
        slug: storySlug,
        cover_image_url: news.featured_image_url,
        status: 'published',
        news_id: newsId,
        published_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (storyError) {
      console.error('[generate-webstory] Error creating story:', storyError);
      return new Response(
        JSON.stringify({ error: 'Failed to create story', details: storyError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[generate-webstory] Story created:', story.id);

    // Create 5 standard slides
    const slides = [
      // Slide 1: Cover
      {
        story_id: story.id,
        sort_order: 0,
        background_image_url: news.featured_image_url,
        headline_text: news.title,
        subheadline_text: categoryName.toUpperCase(),
      },
      // Slide 2: Context
      {
        story_id: story.id,
        sort_order: 1,
        background_image_url: news.featured_image_url,
        headline_text: 'Entenda o caso',
        subheadline_text: news.excerpt || 'Confira os detalhes desta notícia',
      },
      // Slide 3: Highlight
      {
        story_id: story.id,
        sort_order: 2,
        background_image_url: news.featured_image_url,
        headline_text: 'Destaques',
        subheadline_text: 'Os pontos principais desta história',
      },
      // Slide 4: Know More
      {
        story_id: story.id,
        sort_order: 3,
        background_image_url: news.featured_image_url,
        headline_text: 'Saiba mais',
        subheadline_text: 'Acompanhe no Portal Conexão',
      },
      // Slide 5: CTA
      {
        story_id: story.id,
        sort_order: 4,
        background_image_url: news.featured_image_url,
        headline_text: 'Leia a matéria completa',
        subheadline_text: 'Toque para acessar',
        cta_url: `/noticia/${news.slug}`,
        cta_text: 'Ler matéria',
      },
    ];

    const { error: slidesError } = await supabase
      .from('web_story_slides')
      .insert(slides);

    if (slidesError) {
      console.error('[generate-webstory] Error creating slides:', slidesError);
      // Don't fail completely, story is created
    } else {
      console.log('[generate-webstory] Slides created successfully');
    }

    return new Response(
      JSON.stringify({
        success: true,
        storyId: story.id,
        storySlug: story.slug,
        message: 'WebStory generated successfully',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[generate-webstory] Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
