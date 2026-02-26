import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================
// Platform-specific publishers
// ============================================

interface PublishResult {
  success: boolean;
  externalPostId?: string;
  externalPostUrl?: string;
  error?: string;
}

interface PublishPayload {
  caption: string;
  link?: string;
  imageUrl?: string;
  title?: string;
}

// --- Facebook (Meta Graph API) ---
async function publishToFacebook(payload: PublishPayload): Promise<PublishResult> {
  const pageAccessToken = Deno.env.get('META_PAGE_ACCESS_TOKEN');
  const pageId = Deno.env.get('META_PAGE_ID');
  
  if (!pageAccessToken || !pageId) {
    return { success: false, error: 'META_PAGE_ACCESS_TOKEN ou META_PAGE_ID não configurados. Configure em Configurações > Redes Sociais.' };
  }

  try {
    const body: Record<string, string> = {
      message: payload.caption,
      access_token: pageAccessToken,
    };
    if (payload.link) body.link = payload.link;

    const response = await fetch(`https://graph.facebook.com/v21.0/${pageId}/feed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: `Facebook API: ${data.error?.message || JSON.stringify(data)}` };
    }

    return {
      success: true,
      externalPostId: data.id,
      externalPostUrl: `https://facebook.com/${data.id}`,
    };
  } catch (err) {
    return { success: false, error: `Facebook: ${err instanceof Error ? err.message : 'Erro desconhecido'}` };
  }
}

// --- Instagram (Meta Graph API - Content Publishing) ---
async function publishToInstagram(payload: PublishPayload): Promise<PublishResult> {
  const accessToken = Deno.env.get('META_PAGE_ACCESS_TOKEN');
  const igUserId = Deno.env.get('INSTAGRAM_BUSINESS_ID');
  
  if (!accessToken || !igUserId) {
    return { success: false, error: 'META_PAGE_ACCESS_TOKEN ou INSTAGRAM_BUSINESS_ID não configurados.' };
  }

  if (!payload.imageUrl) {
    return { success: false, error: 'Instagram requer uma imagem para publicação.' };
  }

  try {
    // Step 1: Create media container
    const containerResponse = await fetch(`https://graph.facebook.com/v21.0/${igUserId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url: payload.imageUrl,
        caption: payload.caption,
        access_token: accessToken,
      }),
    });

    const containerData = await containerResponse.json();
    if (!containerResponse.ok) {
      return { success: false, error: `Instagram Container: ${containerData.error?.message || JSON.stringify(containerData)}` };
    }

    // Step 2: Publish the container
    const publishResponse = await fetch(`https://graph.facebook.com/v21.0/${igUserId}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: containerData.id,
        access_token: accessToken,
      }),
    });

    const publishData = await publishResponse.json();
    if (!publishResponse.ok) {
      return { success: false, error: `Instagram Publish: ${publishData.error?.message || JSON.stringify(publishData)}` };
    }

    return {
      success: true,
      externalPostId: publishData.id,
      externalPostUrl: `https://instagram.com/p/${publishData.id}`,
    };
  } catch (err) {
    return { success: false, error: `Instagram: ${err instanceof Error ? err.message : 'Erro desconhecido'}` };
  }
}

// --- X/Twitter (API v2 with OAuth 1.0a) ---
async function publishToX(payload: PublishPayload): Promise<PublishResult> {
  const consumerKey = Deno.env.get('TWITTER_CONSUMER_KEY');
  const consumerSecret = Deno.env.get('TWITTER_CONSUMER_SECRET');
  const accessToken = Deno.env.get('TWITTER_ACCESS_TOKEN');
  const accessTokenSecret = Deno.env.get('TWITTER_ACCESS_TOKEN_SECRET');
  
  if (!consumerKey || !consumerSecret || !accessToken || !accessTokenSecret) {
    return { success: false, error: 'Credenciais do X/Twitter não configuradas (TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_TOKEN_SECRET).' };
  }

  try {
    const tweetText = payload.caption.substring(0, 280);
    
    // Generate OAuth 1.0a signature
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = crypto.randomUUID().replace(/-/g, '');
    
    const params: Record<string, string> = {
      oauth_consumer_key: consumerKey,
      oauth_nonce: nonce,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: timestamp,
      oauth_token: accessToken,
      oauth_version: '1.0',
    };
    
    const baseUrl = 'https://api.x.com/2/tweets';
    const paramString = Object.keys(params).sort()
      .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
      .join('&');
    const baseString = `POST&${encodeURIComponent(baseUrl)}&${encodeURIComponent(paramString)}`;
    const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(accessTokenSecret)}`;
    
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw', encoder.encode(signingKey),
      { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']
    );
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(baseString));
    const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));
    
    const authHeader = `OAuth oauth_consumer_key="${encodeURIComponent(consumerKey)}", oauth_nonce="${encodeURIComponent(nonce)}", oauth_signature="${encodeURIComponent(signature)}", oauth_signature_method="HMAC-SHA1", oauth_timestamp="${timestamp}", oauth_token="${encodeURIComponent(accessToken)}", oauth_version="1.0"`;
    
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: tweetText }),
    });

    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: `X API: ${data.detail || data.title || JSON.stringify(data)}` };
    }

    return {
      success: true,
      externalPostId: data.data?.id,
      externalPostUrl: `https://x.com/i/status/${data.data?.id}`,
    };
  } catch (err) {
    return { success: false, error: `X: ${err instanceof Error ? err.message : 'Erro desconhecido'}` };
  }
}

// --- LinkedIn (Marketing API) ---
async function publishToLinkedIn(payload: PublishPayload): Promise<PublishResult> {
  const accessToken = Deno.env.get('LINKEDIN_ACCESS_TOKEN');
  const orgId = Deno.env.get('LINKEDIN_ORG_ID');
  
  if (!accessToken || !orgId) {
    return { success: false, error: 'LINKEDIN_ACCESS_TOKEN ou LINKEDIN_ORG_ID não configurados.' };
  }

  try {
    const postBody: any = {
      author: `urn:li:organization:${orgId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text: payload.caption },
          shareMediaCategory: payload.link ? 'ARTICLE' : 'NONE',
          ...(payload.link ? {
            media: [{
              status: 'READY',
              originalUrl: payload.link,
              title: { text: payload.title || '' },
            }],
          } : {}),
        },
      },
      visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
    };

    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(postBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: `LinkedIn API (${response.status}): ${errorText}` };
    }

    const postId = response.headers.get('x-restli-id') || '';
    return {
      success: true,
      externalPostId: postId,
      externalPostUrl: `https://linkedin.com/feed/update/${postId}`,
    };
  } catch (err) {
    return { success: false, error: `LinkedIn: ${err instanceof Error ? err.message : 'Erro desconhecido'}` };
  }
}

// --- WhatsApp Business (Cloud API) ---
async function publishToWhatsApp(payload: PublishPayload): Promise<PublishResult> {
  const token = Deno.env.get('WHATSAPP_TOKEN');
  const phoneId = Deno.env.get('WHATSAPP_PHONE_ID');
  const channelId = Deno.env.get('WHATSAPP_CHANNEL_ID');
  
  if (!token || !phoneId) {
    return { success: false, error: 'WHATSAPP_TOKEN ou WHATSAPP_PHONE_ID não configurados.' };
  }

  // WhatsApp Business API can send to channels/broadcast lists
  // For news distribution, we use the Channels API if available
  if (channelId) {
    try {
      const response = await fetch(`https://graph.facebook.com/v21.0/${channelId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          type: 'text',
          text: { body: `${payload.caption}\n\n${payload.link || ''}` },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: `WhatsApp API: ${data.error?.message || JSON.stringify(data)}` };
      }

      return {
        success: true,
        externalPostId: data.messages?.[0]?.id,
      };
    } catch (err) {
      return { success: false, error: `WhatsApp: ${err instanceof Error ? err.message : 'Erro desconhecido'}` };
    }
  }

  return { success: false, error: 'WHATSAPP_CHANNEL_ID não configurado para distribuição em canal.' };
}

// Platform router
const PUBLISHERS: Record<string, (payload: PublishPayload) => Promise<PublishResult>> = {
  facebook: publishToFacebook,
  instagram: publishToInstagram,
  x: publishToX,
  linkedin: publishToLinkedIn,
  whatsapp: publishToWhatsApp,
};

// ============================================
// Template engine
// ============================================

function applyTemplate(template: string, data: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }
  return result;
}

// ============================================
// Main handler
// ============================================

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const body = await req.json().catch(() => null);
    
    // Support single target publishing (called from frontend)
    if (body?.targetId) {
      return await publishSingleTarget(supabase, body.targetId);
    }

    // Batch mode: process all queued targets
    console.log('[social-publisher] Starting batch processing...');

    const { data: targets, error: fetchError } = await supabase
      .from('social_post_targets')
      .select(`
        *,
        social_account:social_accounts(*),
        post:social_posts(*)
      `)
      .in('status', ['queued', 'scheduled'])
      .limit(20);

    if (fetchError) throw fetchError;

    // Filter scheduled targets that are ready
    const readyTargets = (targets ?? []).filter((t: any) => {
      if (t.status === 'queued') return true;
      if (t.status === 'scheduled' && t.scheduled_at) {
        return new Date(t.scheduled_at) <= new Date();
      }
      return false;
    });

    console.log(`[social-publisher] Found ${readyTargets.length} targets to process`);

    const results = [];

    for (const target of readyTargets) {
      try {
        // Mark as processing
        await supabase
          .from('social_post_targets')
          .update({ status: 'processing' })
          .eq('id', target.id);

        const platform = target.social_account?.platform;
        const publisher = platform ? PUBLISHERS[platform] : null;

        if (!publisher) {
          throw new Error(`Plataforma não suportada: ${platform}`);
        }

        // Build caption from template or base caption
        const template = target.caption_override || target.post?.base_caption || '{titulo}\n\n{link}';
        const caption = applyTemplate(template, {
          titulo: target.post?.title || '',
          link: target.post?.link_url || '',
          hashtags: (target.post?.hashtags || []).map((h: string) => `#${h}`).join(' '),
          data: new Date().toLocaleDateString('pt-BR'),
        });

        // Log attempt
        await supabase.from('social_post_logs').insert({
          target_id: target.id,
          event: 'publish_attempt',
          level: 'info',
          message: `Tentando publicar em ${platform}`,
          payload_json: { caption: caption.substring(0, 100) },
        });

        // Publish
        const result = await publisher({
          caption,
          link: target.post?.link_url,
          imageUrl: target.post?.media_json?.[0]?.url,
          title: target.post?.title,
        });

        if (result.success) {
          await supabase
            .from('social_post_targets')
            .update({
              status: 'done',
              posted_at: new Date().toISOString(),
              provider_post_id: result.externalPostId || null,
              provider_post_url: result.externalPostUrl || null,
            })
            .eq('id', target.id);

          await supabase.from('social_post_logs').insert({
            target_id: target.id,
            event: 'published',
            level: 'info',
            message: `Publicado com sucesso em ${platform}`,
            payload_json: { external_id: result.externalPostId, url: result.externalPostUrl },
          });

          results.push({ id: target.id, platform, status: 'done' });
        } else {
          throw new Error(result.error || 'Falha na publicação');
        }

      } catch (postError) {
        const errorMessage = postError instanceof Error ? postError.message : 'Erro desconhecido';
        console.error(`[social-publisher] Error on target ${target.id}:`, errorMessage);

        // Check if it's a credentials error (don't retry)
        const isCredentialError = errorMessage.includes('não configurad');
        
        await supabase
          .from('social_post_targets')
          .update({
            status: isCredentialError ? 'assisted' : 'failed',
            error_message: errorMessage,
          })
          .eq('id', target.id);

        await supabase.from('social_post_logs').insert({
          target_id: target.id,
          event: 'publish_error',
          level: 'error',
          message: errorMessage,
        });

        results.push({ id: target.id, platform: target.social_account?.platform, status: 'failed', error: errorMessage });
      }
    }

    console.log('[social-publisher] Batch complete:', results.length, 'targets processed');

    return new Response(JSON.stringify({ success: true, processed: results.length, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[social-publisher] Fatal error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Publish a single target by ID (for manual/on-demand publishing)
async function publishSingleTarget(supabase: any, targetId: string) {
  const { data: target, error } = await supabase
    .from('social_post_targets')
    .select(`
      *,
      social_account:social_accounts(*),
      post:social_posts(*)
    `)
    .eq('id', targetId)
    .single();

  if (error || !target) {
    return new Response(JSON.stringify({ error: 'Target não encontrado' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const platform = target.social_account?.platform;
  const publisher = platform ? PUBLISHERS[platform] : null;

  if (!publisher) {
    return new Response(JSON.stringify({ error: `Plataforma não suportada: ${platform}` }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const caption = target.caption_override || target.post?.base_caption || target.post?.title || '';

  const result = await publisher({
    caption,
    link: target.post?.link_url,
    imageUrl: target.post?.media_json?.[0]?.url,
    title: target.post?.title,
  });

  if (result.success) {
    await supabase
      .from('social_post_targets')
      .update({
        status: 'done',
        posted_at: new Date().toISOString(),
        provider_post_id: result.externalPostId || null,
        provider_post_url: result.externalPostUrl || null,
      })
      .eq('id', targetId);
  }

  return new Response(JSON.stringify(result), {
    status: result.success ? 200 : 400,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
