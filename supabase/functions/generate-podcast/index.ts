import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const INTRO_TEXT = "Você está ouvindo o Conexão na Cidade. ";
const OUTRO_TEXT = " Para mais notícias e informações, acesse conexaonacidade.com.br.";

async function generateTTS(text: string, voiceId: string, apiKey: string): Promise<Response> {
  return fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
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
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { voiceId = 'onwK4e9ZLuTAKqWW03F9', previewVoice, sampleText } = body;

    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY not configured');
    }

    // --- Voice Preview Mode ---
    if (previewVoice) {
      const text = sampleText || "Você está ouvindo o Conexão na Cidade. Sua fonte de notícias local.";
      const ttsResponse = await generateTTS(text, voiceId, ELEVENLABS_API_KEY);

      if (!ttsResponse.ok) {
        const errorText = await ttsResponse.text();
        console.error('ElevenLabs preview error:', errorText);
        throw new Error(`ElevenLabs API error: ${ttsResponse.status}`);
      }

      const audioBuffer = await ttsResponse.arrayBuffer();
      return new Response(audioBuffer, {
        headers: { ...corsHeaders, 'Content-Type': 'audio/mpeg' },
      });
    }

    // --- Full Podcast Generation Mode ---
    const { newsId } = body;
    if (!newsId) {
      throw new Error('newsId is required');
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    await supabase.from('news').update({ podcast_status: 'generating' }).eq('id', newsId);
    await supabase.from('podcast_logs').insert({ news_id: newsId, action: 'generate', details: 'Iniciando geração do podcast' });

    const { data: news, error: newsError } = await supabase
      .from('news')
      .select('id, title, subtitle, content, excerpt')
      .eq('id', newsId)
      .single();

    if (newsError || !news) throw new Error('News not found');

    const contentText = news.content?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() || '';
    let podcastScript = INTRO_TEXT + `${news.title}. `;
    if (news.subtitle) podcastScript += `${news.subtitle}. `;
    podcastScript += contentText + OUTRO_TEXT;

    if (podcastScript.length > 5000) {
      const maxLen = 5000 - INTRO_TEXT.length - OUTRO_TEXT.length - news.title.length - 50;
      const trimmed = contentText.substring(0, maxLen) + '...';
      podcastScript = INTRO_TEXT + `${news.title}. ` + (news.subtitle ? `${news.subtitle}. ` : '') + trimmed + OUTRO_TEXT;
    }

    console.log(`Generating podcast for news ${newsId}, script: ${podcastScript.length} chars`);

    const ttsResponse = await generateTTS(podcastScript, voiceId, ELEVENLABS_API_KEY);

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text();
      console.error('ElevenLabs API error:', errorText);
      await supabase.from('news').update({ podcast_status: 'error' }).eq('id', newsId);
      await supabase.from('podcast_logs').insert({ news_id: newsId, action: 'error', details: `Erro na API ElevenLabs: ${ttsResponse.status}` });
      throw new Error(`ElevenLabs API error: ${ttsResponse.status}`);
    }

    const audioBuffer = await ttsResponse.arrayBuffer();
    const audioData = new Uint8Array(audioBuffer);
    const durationSeconds = Math.round(audioBuffer.byteLength / 16000);
    const fileName = `podcast-${newsId}-${Date.now()}.mp3`;

    const { error: uploadError } = await supabase.storage
      .from('podcast-audio')
      .upload(fileName, audioData, { contentType: 'audio/mpeg', upsert: true });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      await supabase.from('news').update({ podcast_status: 'error' }).eq('id', newsId);
      await supabase.from('podcast_logs').insert({ news_id: newsId, action: 'error', details: `Erro no upload: ${uploadError.message}` });
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    const { data: urlData } = supabase.storage.from('podcast-audio').getPublicUrl(fileName);
    const podcastUrl = urlData.publicUrl;

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

    await supabase.from('podcast_logs').insert({ news_id: newsId, action: 'generate', details: `Podcast gerado com sucesso (${durationSeconds}s)` });
    console.log(`Podcast generated successfully: ${podcastUrl}`);

    return new Response(
      JSON.stringify({ success: true, podcastUrl, durationSeconds }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-podcast:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
