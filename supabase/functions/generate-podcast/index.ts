import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const INTRO_TEXT = "Você está ouvindo o Conexão na Cidade. ";
const OUTRO_TEXT = " Para mais notícias e informações, acesse conexaonacidade.com.br.";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { newsId, voiceId = 'onwK4e9ZLuTAKqWW03F9' } = await req.json();

    if (!newsId) {
      throw new Error('newsId is required');
    }

    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY not configured');
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Update news status to generating
    await supabase
      .from('news')
      .update({ podcast_status: 'generating' })
      .eq('id', newsId);

    // Log the generation start
    await supabase.from('podcast_logs').insert({
      news_id: newsId,
      action: 'generate',
      details: 'Iniciando geração do podcast',
    });

    // Fetch news content
    const { data: news, error: newsError } = await supabase
      .from('news')
      .select('id, title, subtitle, content, excerpt')
      .eq('id', newsId)
      .single();

    if (newsError || !news) {
      throw new Error('News not found');
    }

    // Prepare podcast script with intro and outro
    const contentText = news.content?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() || '';
    
    let podcastScript = INTRO_TEXT;
    podcastScript += `${news.title}. `;
    if (news.subtitle) {
      podcastScript += `${news.subtitle}. `;
    }
    podcastScript += contentText;
    podcastScript += OUTRO_TEXT;

    // Limit text to 5000 characters (ElevenLabs limit)
    if (podcastScript.length > 5000) {
      // Trim content while keeping intro and outro
      const maxContentLength = 5000 - INTRO_TEXT.length - OUTRO_TEXT.length - news.title.length - 50;
      const trimmedContent = contentText.substring(0, maxContentLength) + '...';
      podcastScript = INTRO_TEXT + `${news.title}. ` + (news.subtitle ? `${news.subtitle}. ` : '') + trimmedContent + OUTRO_TEXT;
    }

    console.log(`Generating podcast for news ${newsId}`);
    console.log(`Script length: ${podcastScript.length} characters`);

    // Call ElevenLabs TTS API
    const ttsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: podcastScript,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.4,
            similarity_boost: 0.7,
            style: 0.45,
            use_speaker_boost: true,
            speed: 1.0,
          },
        }),
      }
    );

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text();
      console.error('ElevenLabs API error:', errorText);
      
      await supabase
        .from('news')
        .update({ podcast_status: 'error' })
        .eq('id', newsId);

      await supabase.from('podcast_logs').insert({
        news_id: newsId,
        action: 'error',
        details: `Erro na API ElevenLabs: ${ttsResponse.status}`,
      });
        
      throw new Error(`ElevenLabs API error: ${ttsResponse.status}`);
    }

    const audioBuffer = await ttsResponse.arrayBuffer();
    const audioData = new Uint8Array(audioBuffer);

    // Calculate approximate duration (128kbps = 16000 bytes per second)
    const durationSeconds = Math.round(audioBuffer.byteLength / 16000);

    // Upload to Supabase Storage
    const fileName = `podcast-${newsId}-${Date.now()}.mp3`;
    
    const { error: uploadError } = await supabase.storage
      .from('podcast-audio')
      .upload(fileName, audioData, {
        contentType: 'audio/mpeg',
        upsert: true,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      
      await supabase
        .from('news')
        .update({ podcast_status: 'error' })
        .eq('id', newsId);

      await supabase.from('podcast_logs').insert({
        news_id: newsId,
        action: 'error',
        details: `Erro no upload: ${uploadError.message}`,
      });
        
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('podcast-audio')
      .getPublicUrl(fileName);

    const podcastUrl = urlData.publicUrl;

    // Update news with podcast info
    const { error: updateError } = await supabase
      .from('news')
      .update({
        podcast_audio_url: podcastUrl,
        podcast_status: 'ready',
        podcast_generated_at: new Date().toISOString(),
        audio_duration_seconds: durationSeconds,
      })
      .eq('id', newsId);

    if (updateError) {
      console.error('News update error:', updateError);
      throw new Error(`Failed to update news: ${updateError.message}`);
    }

    // Log success
    await supabase.from('podcast_logs').insert({
      news_id: newsId,
      action: 'generate',
      details: `Podcast gerado com sucesso (${durationSeconds}s)`,
    });

    console.log(`Podcast generated successfully: ${podcastUrl}`);

    return new Response(
      JSON.stringify({
        success: true,
        podcastUrl,
        durationSeconds,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-podcast:', error);
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
