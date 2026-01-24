import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting simples em memória (por IP)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);
  
  if (!limit || now > limit.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60000 }); // 1 min window
    return true;
  }
  
  if (limit.count >= 10) { // Max 10 tentativas por minuto
    return false;
  }
  
  limit.count++;
  return true;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function logAttempt(
  supabase: any, 
  userId: string | null, 
  reason: string, 
  ip: string
) {
  try {
    await supabase.from("audit_logs").insert({
      entity_type: "sso",
      entity_id: userId || "00000000-0000-0000-0000-000000000000",
      action: "sso_exchange_failed",
      new_data: { reason, from_ip: ip },
      user_id: userId,
    });
  } catch (e) {
    console.error("Failed to log attempt:", e);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const clientIp = req.headers.get("x-forwarded-for") || 
                   req.headers.get("cf-connecting-ip") || 
                   "unknown";

  try {
    // Rate limit check
    if (!checkRateLimit(clientIp)) {
      return new Response(
        JSON.stringify({ error: "Muitas tentativas. Aguarde 1 minuto." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { code } = await req.json();

    if (!code || typeof code !== "string" || code.length < 20) {
      await logAttempt(supabase, null, "invalid_format", clientIp);
      return new Response(
        JSON.stringify({ error: "Código inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Buscar código
    const { data: ssoCode, error: fetchError } = await supabase
      .from("sso_codes")
      .select("*")
      .eq("code", code)
      .single();

    if (fetchError || !ssoCode) {
      await logAttempt(supabase, null, "code_not_found", clientIp);
      return new Response(
        JSON.stringify({ error: "Código não encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verificar expiração
    if (new Date(ssoCode.expires_at) < new Date()) {
      await logAttempt(supabase, ssoCode.user_id, "code_expired", clientIp);
      return new Response(
        JSON.stringify({ error: "Código expirado" }),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verificar uso anterior
    if (ssoCode.used_at) {
      await logAttempt(supabase, ssoCode.user_id, "code_already_used", clientIp);
      return new Response(
        JSON.stringify({ error: "Código já utilizado" }),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Marcar como usado ANTES de retornar dados (previne race condition)
    const { error: updateError, data: updateData } = await supabase
      .from("sso_codes")
      .update({ used_at: new Date().toISOString() })
      .eq("id", ssoCode.id)
      .is("used_at", null)
      .select()
      .single();

    if (updateError || !updateData) {
      // Possível race condition - outro request usou primeiro
      await logAttempt(supabase, ssoCode.user_id, "race_condition", clientIp);
      return new Response(
        JSON.stringify({ error: "Código já processado" }),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Buscar dados do usuário
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .eq("id", ssoCode.user_id)
      .single();

    // Buscar email do auth.users
    const { data: { user: authUser } } = await supabase.auth.admin.getUserById(ssoCode.user_id);

    // Buscar roles
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", ssoCode.user_id);

    // Log de sucesso
    await supabase.from("audit_logs").insert({
      entity_type: "sso",
      entity_id: ssoCode.user_id,
      action: "sso_code_exchanged",
      new_data: { 
        target_app: ssoCode.target_app,
        from_ip: clientIp 
      },
      user_id: ssoCode.user_id,
    });

    console.log(`SSO exchange successful for user ${authUser?.email}`);

    return new Response(
      JSON.stringify({
        user: {
          id: ssoCode.user_id,
          email: authUser?.email,
          name: profile?.full_name || authUser?.user_metadata?.full_name,
          avatar_url: profile?.avatar_url,
        },
        tenant_id: ssoCode.tenant_id,
        roles: roles?.map((r: { role: string }) => r.role) || [],
        exchanged_at: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Erro em sso-exchange:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
