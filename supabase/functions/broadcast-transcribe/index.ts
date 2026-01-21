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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { broadcastId, audioText, speakerName, isFinal } = await req.json();

    if (!broadcastId) {
      return new Response(
        JSON.stringify({ error: "broadcastId é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If audioText is provided directly (from speech recognition on client)
    // just store it without calling AI
    if (audioText) {
      const { error: insertError } = await supabase
        .from("broadcast_transcripts")
        .insert({
          broadcast_id: broadcastId,
          text: audioText.trim(),
          speaker_name: speakerName || null,
          is_final: isFinal ?? true,
          timestamp_ms: Date.now(),
        });

      if (insertError) {
        console.error("Error inserting transcript:", insertError);
        throw insertError;
      }

      return new Response(
        JSON.stringify({ success: true, text: audioText }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // For future: audio transcription via Gemini
    // Currently we rely on browser's SpeechRecognition API
    // which sends text directly to this function
    
    // Call Lovable AI (Gemini) for text processing/cleanup
    const transcriptionResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: "Você é um assistente de transcrição. Corrija erros ortográficos e pontuação do texto fornecido, mantendo o significado original. Retorne apenas o texto corrigido."
          },
          {
            role: "user",
            content: audioText || ""
          }
        ],
        max_tokens: 500,
      }),
    });

    if (!transcriptionResponse.ok) {
      const errorText = await transcriptionResponse.text();
      console.error("AI Gateway error:", transcriptionResponse.status, errorText);
      
      if (transcriptionResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (transcriptionResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error("Erro na transcrição");
    }

    const result = await transcriptionResponse.json();
    const transcribedText = result.choices?.[0]?.message?.content?.trim();

    if (!transcribedText) {
      return new Response(
        JSON.stringify({ text: "" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert transcript into database
    const { error: insertError } = await supabase
      .from("broadcast_transcripts")
      .insert({
        broadcast_id: broadcastId,
        text: transcribedText,
        speaker_name: speakerName || null,
        is_final: isFinal ?? true,
        timestamp_ms: Date.now(),
      });

    if (insertError) {
      console.error("Error inserting transcript:", insertError);
    }

    console.log(`Transcript stored for broadcast ${broadcastId}: "${transcribedText.substring(0, 50)}..."`);

    return new Response(
      JSON.stringify({ success: true, text: transcribedText }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Transcription error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro ao transcrever" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
