import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, nome, negocio } = await req.json();

    if (!phone || !nome) {
      return new Response(JSON.stringify({ error: "phone and nome are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const accessToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
    const phoneId = Deno.env.get("WHATSAPP_PHONE_ID");

    if (!accessToken || !phoneId) {
      console.warn("WhatsApp credentials not configured yet");
      return new Response(JSON.stringify({ warning: "WhatsApp not configured" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Format phone: ensure country code
    let formattedPhone = phone.replace(/\D/g, "");
    if (formattedPhone.startsWith("0")) formattedPhone = formattedPhone.slice(1);
    if (!formattedPhone.startsWith("55")) formattedPhone = "55" + formattedPhone;

    // Send WhatsApp message via Cloud API
    const waResponse = await fetch(
      `https://graph.facebook.com/v21.0/${phoneId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: formattedPhone,
          type: "text",
          text: {
            body: `🎉 *Vaga Reservada com Sucesso!*\n\nOlá ${nome}!\n\nSua vaga como *Parceiro Fundador* da Fórmula Conexão para o negócio *${negocio || ""}* foi reservada.\n\n⏳ Você tem *36 horas* para garantir o valor exclusivo de fundador.\n\n🔗 Acesse sua oferta exclusiva:\nhttps://conexaonacidade.com.br/formula-conexao\n\n_Conexão na Cidade — Seu negócio no topo de Cotia._`,
          },
        }),
      }
    );

    const waData = await waResponse.json();

    return new Response(JSON.stringify({ success: true, data: waData }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("WhatsApp send error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
