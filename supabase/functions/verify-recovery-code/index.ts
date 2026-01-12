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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return new Response(
        JSON.stringify({ error: 'E-mail e código são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Verifying recovery code for email: ${email}`);

    // Find user by email
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('List users error:', listError);
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar usuário' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const user = users.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Usuário não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's recovery codes
    const { data: recoveryCodes, error: codesError } = await supabase
      .from('mfa_recovery_codes')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_used', false);

    if (codesError || !recoveryCodes || recoveryCodes.length === 0) {
      console.error('Recovery codes error:', codesError);
      return new Response(
        JSON.stringify({ error: 'Nenhum código de recuperação disponível' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Normalize and hash the provided code
    const normalizedCode = code.toUpperCase().replace(/[^A-Z0-9]/g, '');
    let formattedCode = normalizedCode;
    if (normalizedCode.length === 8) {
      formattedCode = normalizedCode.slice(0, 4) + '-' + normalizedCode.slice(4);
    }
    const codeHash = await hashCode(formattedCode);

    console.log(`Looking for hash: ${codeHash.substring(0, 10)}...`);

    // Find matching code
    const matchingCode = recoveryCodes.find(rc => rc.code_hash === codeHash);

    if (!matchingCode) {
      console.log('No matching recovery code found');
      return new Response(
        JSON.stringify({ error: 'Código de recuperação inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found matching recovery code: ${matchingCode.id}`);

    // Mark code as used
    const { error: updateError } = await supabase
      .from('mfa_recovery_codes')
      .update({ 
        is_used: true, 
        used_at: new Date().toISOString() 
      })
      .eq('id', matchingCode.id);

    if (updateError) {
      console.error('Update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Erro ao processar código' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Unenroll the TOTP factor to disable 2FA
    const { data: factorsData } = await supabase.auth.admin.mfa.listFactors({ userId: user.id });
    const factors = factorsData?.factors || [];
    const totpFactor = factors.find((f: { factor_type: string; status: string; id: string }) => 
      f.factor_type === 'totp' && f.status === 'verified'
    );

    if (totpFactor) {
      const { error: unenrollError } = await supabase.auth.admin.mfa.deleteFactor({
        userId: user.id,
        id: totpFactor.id
      });

      if (unenrollError) {
        console.error('Unenroll error:', unenrollError);
        // Continue anyway, user can manually disable later
      } else {
        console.log('2FA disabled successfully');
      }
    }

    // Count remaining codes
    const remainingCodes = recoveryCodes.length - 1;

    console.log(`Recovery code verified. Remaining codes: ${remainingCodes}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: '2FA desativado. Faça login novamente.',
        remainingCodes,
        mfaDisabled: true
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error verifying recovery code:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
