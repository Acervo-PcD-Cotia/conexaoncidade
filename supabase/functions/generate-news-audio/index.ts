import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { newsId, audioType = 'full', voiceId = 'JBFqnCBsd6RMkjVDRZzb' } = await req.json();

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
      .update({ audio_status: 'generating' })
      .eq('id', newsId);

    // Fetch news content
    const { data: news, error: newsError } = await supabase
      .from('news')
      .select('id, title, subtitle, content, excerpt, ai_summary_bullets')
      .eq('id', newsId)
      .single();

    if (newsError || !news) {
      throw new Error('News not found');
    }

    // Prepare text based on audio type
    let textToConvert = '';
    
    if (audioType === 'summary' && news.ai_summary_bullets?.length) {
      textToConvert = `${news.title}. ${news.ai_summary_bullets.join('. ')}`;
    } else if (audioType === 'editorial') {
      // Editorial style - intro + key points
      textToConvert = `${news.title}. ${news.subtitle || ''}. ${news.excerpt || ''}`;
    } else {
      // Full content - strip HTML tags
      const contentText = news.content?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() || '';
      textToConvert = `${news.title}. ${news.subtitle || ''}. ${contentText}`;
    }

    // Limit text to 5000 characters (ElevenLabs limit)
    if (textToConvert.length > 5000) {
      textToConvert = textToConvert.substring(0, 4997) + '...';
    }

    console.log(`Generating audio for news ${newsId}, type: ${audioType}, voice: ${voiceId}`);
    console.log(`Text length: ${textToConvert.length} characters`);

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
          text: textToConvert,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.6,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text();
      console.error('ElevenLabs API error:', errorText);
      
      await supabase
        .from('news')
        .update({ audio_status: 'error' })
        .eq('id', newsId);
        
      throw new Error(`ElevenLabs API error: ${ttsResponse.status}`);
    }

    const audioBuffer = await ttsResponse.arrayBuffer();
    const audioData = new Uint8Array(audioBuffer);

    // Calculate approximate duration (128kbps = 16000 bytes per second)
    const durationSeconds = Math.round(audioBuffer.byteLength / 16000);

    // Upload to Supabase Storage
    const fileName = `${newsId}-${audioType}-${Date.now()}.mp3`;
    
    const { error: uploadError } = await supabase.storage
      .from('news-audio')
      .upload(fileName, audioData, {
        contentType: 'audio/mpeg',
        upsert: true,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      
      await supabase
        .from('news')
        .update({ audio_status: 'error' })
        .eq('id', newsId);
        
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('news-audio')
      .getPublicUrl(fileName);

    const audioUrl = urlData.publicUrl;

    // Update news with audio info
    const { error: updateError } = await supabase
      .from('news')
      .update({
        audio_url: audioUrl,
        audio_duration_seconds: durationSeconds,
        audio_type: audioType,
        audio_voice_id: voiceId,
        audio_status: 'ready',
        audio_generated_at: new Date().toISOString(),
      })
      .eq('id', newsId);

    if (updateError) {
      console.error('News update error:', updateError);
      throw new Error(`Failed to update news: ${updateError.message}`);
    }

    console.log(`Audio generated successfully: ${audioUrl}`);

    return new Response(
      JSON.stringify({
        success: true,
        audioUrl,
        durationSeconds,
        audioType,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-news-audio:', error);
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
