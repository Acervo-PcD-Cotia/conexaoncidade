import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Web Push helpers using the web-push protocol manually via Web Crypto API
function base64UrlDecode(str: string): Uint8Array {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(base64 + padding);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function createVapidAuthHeader(
  audience: string,
  subject: string,
  publicKey: string,
  privateKey: string
): Promise<{ authorization: string; cryptoKey: string }> {
  // Create JWT for VAPID
  const header = { typ: 'JWT', alg: 'ES256' };
  const now = Math.floor(Date.now() / 1000);
  const payload = { aud: audience, exp: now + 12 * 3600, sub: subject };

  const headerB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Import private key
  const privateKeyBytes = base64UrlDecode(privateKey);
  const cryptoKey = await crypto.subtle.importKey(
    'jwk',
    {
      kty: 'EC',
      crv: 'P-256',
      x: publicKey.length > 43 ? base64UrlEncode(base64UrlDecode(publicKey).slice(1, 33)) : publicKey.slice(0, 43),
      y: publicKey.length > 43 ? base64UrlEncode(base64UrlDecode(publicKey).slice(33, 65)) : publicKey.slice(43),
      d: base64UrlEncode(privateKeyBytes),
    },
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    cryptoKey,
    new TextEncoder().encode(unsignedToken)
  );

  // Convert DER signature to raw r||s format if needed
  const sigBytes = new Uint8Array(signature);
  let rawSig: Uint8Array;
  if (sigBytes.length === 64) {
    rawSig = sigBytes;
  } else {
    // DER encoded - parse it
    rawSig = sigBytes;
  }

  const jwt = `${unsignedToken}.${base64UrlEncode(rawSig)}`;

  return {
    authorization: `vapid t=${jwt}, k=${publicKey}`,
    cryptoKey: publicKey,
  };
}

async function sendPushToEndpoint(
  endpoint: string,
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: string,
  vapidSubject: string
): Promise<{ success: boolean; statusCode?: number; error?: string }> {
  try {
    const url = new URL(endpoint);
    const audience = `${url.protocol}//${url.host}`;

    const vapid = await createVapidAuthHeader(audience, vapidSubject, vapidPublicKey, vapidPrivateKey);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'TTL': '86400',
        Authorization: vapid.authorization,
        'Content-Encoding': 'identity',
      },
      body: payload,
    });

    if (response.status === 201 || response.status === 200) {
      return { success: true, statusCode: response.status };
    }

    const errorText = await response.text().catch(() => '');
    return { success: false, statusCode: response.status, error: errorText };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Admin check
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!roleData || !['super_admin', 'admin'].includes(roleData.role)) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { title, body: messageBody, url, image_url, city, categories, test_mode } = body;

    if (!title || !messageBody) {
      return new Response(JSON.stringify({ error: 'title and body are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build subscription query with filters
    let query = supabase
      .from('push_subscriptions')
      .select('*')
      .eq('status', 'active')
      .eq('is_active', true);

    if (test_mode) {
      // Only send to admin's own subscription
      query = query.eq('user_id', user.id);
    } else {
      if (city) query = query.eq('city', city);
      if (categories && categories.length > 0) {
        query = query.overlaps('categories', categories);
      }
    }

    const { data: subscriptions, error: subError } = await query;
    if (subError) {
      console.error('Error fetching subscriptions:', subError);
      return new Response(JSON.stringify({ error: 'Failed to fetch subscriptions' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Save notification record
    const { data: notification } = await supabase
      .from('push_notifications')
      .insert({
        title,
        body: messageBody,
        url,
        image_url,
        target_type: test_mode ? 'test' : (city || categories?.length ? 'segment' : 'all'),
        created_by: user.id,
        sent_at: new Date().toISOString(),
        sent_count: 0,
        failed_count: 0,
      })
      .select('id')
      .single();

    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY') ?? '';
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY') ?? '';
    const vapidSubject = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:contato@conexaonacidade.com.br';

    let sentCount = 0;
    let failedCount = 0;

    const pushPayload = JSON.stringify({
      title,
      body: messageBody,
      url: url || '/',
      icon: '/favicon.png',
      image_url,
    });

    // Send to each subscription
    for (const sub of subscriptions || []) {
      const result = await sendPushToEndpoint(
        sub.endpoint,
        pushPayload,
        vapidPublicKey,
        vapidPrivateKey,
        vapidSubject
      );

      if (result.success) {
        sentCount++;
      } else {
        failedCount++;
        // Mark as blocked if endpoint is gone (410 or 404)
        if (result.statusCode === 410 || result.statusCode === 404) {
          await supabase
            .from('push_subscriptions')
            .update({ status: 'blocked', is_active: false })
            .eq('id', sub.id);
        }
      }

      // Log each send
      if (notification?.id) {
        await supabase.from('push_logs').insert({
          notification_id: notification.id,
          subscription_id: sub.id,
          title,
          body: messageBody,
          url,
          status: result.success ? 'sent' : 'failed',
          error: result.error || null,
        });
      }
    }

    // Update notification counts
    if (notification?.id) {
      await supabase
        .from('push_notifications')
        .update({ sent_count: sentCount, failed_count: failedCount })
        .eq('id', notification.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        sent_count: sentCount,
        failed_count: failedCount,
        total: subscriptions?.length || 0,
        message: `Push enviado para ${sentCount} assinantes`,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Push send error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error', details: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
