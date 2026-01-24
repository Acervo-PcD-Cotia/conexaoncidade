import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Gera código alfanumérico seguro de 32 caracteres
function generateSecureCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => chars[b % chars.length]).join('');
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Verificar autenticação
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Validar token do usuário
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Sessão inválida" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { targetApp = "gcotia" } = await req.json().catch(() => ({}));

    // Gerar código único
    const code = generateSecureCode();
    const expiresAt = new Date(Date.now() + 60 * 1000); // 60 segundos

    // Buscar tenant do usuário
    const { data: siteUser } = await supabase
      .from("site_users")
      .select("site_id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    // Inserir código
    const { error: insertError } = await supabase
      .from("sso_codes")
      .insert({
        code,
        user_id: user.id,
        tenant_id: siteUser?.site_id || null,
        target_app: targetApp,
        expires_at: expiresAt.toISOString(),
        ip_address: req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip"),
        user_agent: req.headers.get("user-agent"),
      });

    if (insertError) {
      console.error("Erro ao criar código SSO:", insertError);
      return new Response(
        JSON.stringify({ error: "Erro interno ao gerar código" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log de auditoria
    await supabase.from("audit_logs").insert({
      entity_type: "sso",
      entity_id: user.id,
      action: "sso_code_generated",
      new_data: { target_app: targetApp, code_prefix: code.substring(0, 8) },
      user_id: user.id,
    });

    console.log(`SSO code generated for user ${user.email} -> ${targetApp}`);

    // Determinar URL de redirect baseado no app de destino
    const redirectUrls: Record<string, string> = {
      gcotia: `https://gcotia.lovable.app/sso/callback?code=${code}`,
    };

    const redirectUrl = redirectUrls[targetApp] || redirectUrls.gcotia;

    return new Response(
      JSON.stringify({ 
        code,
        expires_in: 60,
        redirect_url: redirectUrl
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Erro em sso-start:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
