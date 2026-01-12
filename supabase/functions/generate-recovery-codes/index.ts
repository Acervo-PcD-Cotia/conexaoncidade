import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple hash function for recovery codes
async function hashCode(code: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(code);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate a random recovery code in format XXXX-XXXX
function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude similar chars
  let code = '';
  for (let i = 0; i < 8; i++) {
    if (i === 4) code += '-';
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error('User error:', userError);
      return new Response(
        JSON.stringify({ error: 'Usuário não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating recovery codes for user: ${user.id}`);

    // Verify 2FA is enabled using factors list
    const { data: factorsData } = await supabase.auth.admin.mfa.listFactors({ userId: user.id });
    const factors = factorsData?.factors || [];
    const verifiedTotpFactor = factors.find((f: { factor_type: string; status: string }) => 
      f.factor_type === 'totp' && f.status === 'verified'
    );

    if (!verifiedTotpFactor) {
      return new Response(
        JSON.stringify({ error: '2FA não está ativado' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Delete existing recovery codes
    await supabase
      .from('mfa_recovery_codes')
      .delete()
      .eq('user_id', user.id);

    console.log('Deleted existing recovery codes');

    // Generate 10 new codes
    const codes: string[] = [];
    const codeRecords: { user_id: string; code_hash: string }[] = [];

    for (let i = 0; i < 10; i++) {
      const code = generateCode();
      const hash = await hashCode(code);
      codes.push(code);
      codeRecords.push({
        user_id: user.id,
        code_hash: hash
      });
    }

    // Insert new codes (hashed)
    const { error: insertError } = await supabase
      .from('mfa_recovery_codes')
      .insert(codeRecords);

    if (insertError) {
      console.error('Insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Erro ao salvar códigos' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generated ${codes.length} recovery codes`);

    // Return plain text codes (only shown once!)
    return new Response(
      JSON.stringify({ 
        success: true, 
        codes,
        message: 'Códigos gerados com sucesso. Guarde-os em local seguro!'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating recovery codes:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
