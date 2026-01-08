import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_TEXT_LENGTH = 50000;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { ref_id } = await req.json();

    if (!ref_id) {
      return new Response(
        JSON.stringify({ error: "ref_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch the ref
    const { data: ref, error: fetchError } = await supabase
      .from("journalist_style_refs")
      .select("*")
      .eq("id", ref_id)
      .single();

    if (fetchError || !ref) {
      throw new Error("Reference not found");
    }

    let extractedText = "";

    try {
      if (ref.kind === "link" && ref.url) {
        // Fetch and extract text from URL
        const response = await fetch(ref.url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; NewsBot/1.0)",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch URL: ${response.status}`);
        }

        const html = await response.text();
        
        // Simple text extraction - remove scripts, styles, and HTML tags
        extractedText = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .substring(0, MAX_TEXT_LENGTH);

      } else if ((ref.kind === "txt" || ref.kind === "pdf") && ref.storage_path) {
        // Download from storage
        const { data: fileData, error: downloadError } = await supabase.storage
          .from("journalist-style-refs")
          .download(ref.storage_path);

        if (downloadError) {
          throw new Error(`Failed to download file: ${downloadError.message}`);
        }

        if (ref.kind === "txt") {
          extractedText = (await fileData.text()).substring(0, MAX_TEXT_LENGTH);
        } else if (ref.kind === "pdf") {
          // For PDF, we'd need a proper parser. For now, just note it.
          // In production, you'd use a library like pdf-parse or call an API
          extractedText = `[PDF content from ${ref.file_name}. PDF parsing requires additional setup.]`;
        }
      } else {
        throw new Error("Invalid reference type or missing URL/file");
      }

      // Update ref with extracted text
      const { error: updateError } = await supabase
        .from("journalist_style_refs")
        .update({
          extracted_text: extractedText,
          status: "ingested",
          error_message: null,
        })
        .eq("id", ref_id);

      if (updateError) throw updateError;

      return new Response(
        JSON.stringify({
          success: true,
          extracted_length: extractedText.length,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } catch (extractError: unknown) {
      const errMsg = extractError instanceof Error ? extractError.message : "Unknown error";
      // Update ref with error
      await supabase
        .from("journalist_style_refs")
        .update({
          status: "failed",
          error_message: errMsg,
        })
        .eq("id", ref_id);

      throw extractError;
    }
  } catch (error: unknown) {
    console.error("Error ingesting style ref:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
