import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const DEFAULT_NEUTRAL_STYLE_GUIDE = `GUIA DE ESTILO NEUTRO - PADRÃO JORNALÍSTICO

LINGUAGEM:
- Use linguagem clara, direta e objetiva
- Evite jargões, siglas sem explicação e termos técnicos desnecessários
- Prefira voz ativa sobre voz passiva
- Use verbos no presente quando possível

ESTRUTURA:
- Primeiro parágrafo (lide): responda O QUÊ, QUEM, QUANDO, ONDE
- Parágrafos curtos (2-4 frases)
- Use subtítulos (h2) para dividir seções longas
- Ordem decrescente de importância (pirâmide invertida)

FORMATAÇÃO:
- Lide sempre em negrito (<strong>)
- Aspas para citações diretas
- Números por extenso de zero a dez
- Datas no formato "DD de mês de AAAA"

EVITAR:
- Adjetivação excessiva
- Opiniões pessoais (exceto em colunas)
- Sensacionalismo
- Repetição de informações

CRÉDITOS:
- Sempre manter fonte original
- Citar autor quando disponível
- Preservar links de referência
`;

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
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { target_site_id, target_user_id, override_style_profile_id } = await req.json();

    if (!target_site_id) {
      return new Response(
        JSON.stringify({ error: "target_site_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let styleProfileId: string | null = null;
    let styleVersionId: string | null = null;
    let styleGuideText: string = DEFAULT_NEUTRAL_STYLE_GUIDE;
    let source: "override" | "journalist" | "site_default" | "neutral" = "neutral";

    // 1. Check override first
    if (override_style_profile_id) {
      const { data: version } = await supabase
        .from("journalist_style_versions")
        .select("*")
        .eq("style_profile_id", override_style_profile_id)
        .eq("is_current", true)
        .single();

      if (version) {
        styleProfileId = override_style_profile_id;
        styleVersionId = version.id;
        styleGuideText = version.style_guide_text;
        source = "override";
      }
    }

    // 2. Try journalist profile
    if (source === "neutral" && target_user_id) {
      const { data: journalistProfile } = await supabase
        .from("journalist_style_profiles")
        .select("id")
        .eq("site_id", target_site_id)
        .eq("user_id", target_user_id)
        .eq("profile_type", "journalist")
        .eq("is_active", true)
        .single();

      if (journalistProfile) {
        const { data: version } = await supabase
          .from("journalist_style_versions")
          .select("*")
          .eq("style_profile_id", journalistProfile.id)
          .eq("is_current", true)
          .single();

        if (version) {
          styleProfileId = journalistProfile.id;
          styleVersionId = version.id;
          styleGuideText = version.style_guide_text;
          source = "journalist";
        }
      }
    }

    // 3. Try site_default
    if (source === "neutral") {
      const { data: siteDefaultProfile } = await supabase
        .from("journalist_style_profiles")
        .select("id")
        .eq("site_id", target_site_id)
        .eq("profile_type", "site_default")
        .eq("is_active", true)
        .single();

      if (siteDefaultProfile) {
        const { data: version } = await supabase
          .from("journalist_style_versions")
          .select("*")
          .eq("style_profile_id", siteDefaultProfile.id)
          .eq("is_current", true)
          .single();

        if (version) {
          styleProfileId = siteDefaultProfile.id;
          styleVersionId = version.id;
          styleGuideText = version.style_guide_text;
          source = "site_default";
        }
      }
    }

    // 4. Fallback is already set to neutral

    return new Response(
      JSON.stringify({
        style_profile_id: styleProfileId,
        style_version_id: styleVersionId,
        style_guide_text: styleGuideText,
        source,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error resolving style:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
