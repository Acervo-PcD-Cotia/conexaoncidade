import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QRGenerateRequest {
  link_id: string;
  size?: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: QRGenerateRequest = await req.json();
    const { link_id, size = 256 } = body;

    console.log('[qr-generator] Generating QR for link:', link_id);

    if (!link_id) {
      return new Response(JSON.stringify({ error: 'link_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get link details
    const { data: link, error: linkError } = await supabase
      .from('links')
      .select('*')
      .eq('id', link_id)
      .single();

    if (linkError || !link) {
      return new Response(JSON.stringify({ error: 'Link not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if QR already exists for this link
    const { data: existingQR } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('link_id', link_id)
      .eq('size', size)
      .single();

    if (existingQR && existingQR.storage_url) {
      console.log('[qr-generator] Returning existing QR:', existingQR.id);
      return new Response(JSON.stringify({
        qr_id: existingQR.id,
        qr_url: existingQR.storage_url,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate QR Code using external API (since we can't use canvas in Deno easily)
    const urlToEncode = link.short_url || link.final_url || link.destination_url;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(urlToEncode)}`;

    // Fetch QR code image
    const qrResponse = await fetch(qrApiUrl);
    if (!qrResponse.ok) {
      throw new Error('Failed to generate QR code');
    }

    const qrBlob = await qrResponse.blob();
    const qrBuffer = await qrBlob.arrayBuffer();

    // Upload to storage
    const fileName = `qr-${link_id}-${size}.png`;
    const { error: uploadError } = await supabase.storage
      .from('news-images')
      .upload(`qr-codes/${fileName}`, qrBuffer, {
        contentType: 'image/png',
        upsert: true,
      });

    if (uploadError) {
      console.error('[qr-generator] Upload error:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('news-images')
      .getPublicUrl(`qr-codes/${fileName}`);

    const storageUrl = publicUrlData.publicUrl;

    // Save QR record
    const { data: qrRecord, error: qrError } = await supabase
      .from('qr_codes')
      .insert({
        link_id,
        size,
        format: 'png',
        storage_url: storageUrl,
      })
      .select()
      .single();

    if (qrError) {
      console.error('[qr-generator] DB error:', qrError);
    }

    console.log('[qr-generator] QR generated successfully:', qrRecord?.id);

    return new Response(JSON.stringify({
      qr_id: qrRecord?.id,
      qr_url: storageUrl,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[qr-generator] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
