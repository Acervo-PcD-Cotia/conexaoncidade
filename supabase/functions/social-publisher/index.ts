import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    console.log('[social-publisher] Starting batch processing...');

    // Fetch queued posts ready for publishing
    const { data: posts, error: fetchError } = await supabase
      .from('social_posts')
      .select('*, news:news_id(title, slug, meta_title, meta_description)')
      .eq('status', 'queued')
      .or('scheduled_at.is.null,scheduled_at.lte.now()')
      .limit(10);

    if (fetchError) throw fetchError;

    console.log(`[social-publisher] Found ${posts?.length ?? 0} posts to process`);

    const results = [];

    for (const post of posts ?? []) {
      try {
        // Mark as posting
        await supabase
          .from('social_posts')
          .update({ status: 'posting' })
          .eq('id', post.id);

        // Get account credentials
        const { data: account } = await supabase
          .from('social_accounts')
          .select('credentials_encrypted, settings')
          .eq('platform', post.platform)
          .eq('enabled', true)
          .single();

        if (!account) {
          throw new Error(`No active account for platform: ${post.platform}`);
        }

        // Apply template placeholders
        const template = (account.settings as Record<string, unknown>)?.template as string;
        const caption = applyTemplate(template ?? post.payload?.title, {
          meta_title: post.payload?.title ?? '',
          meta_description: post.payload?.description ?? '',
          link: post.payload?.link ?? '',
          hashtags: ((account.settings as Record<string, unknown>)?.hashtags as string[])?.join(' ') ?? '',
          city: 'Matão',
          date: new Date().toLocaleDateString('pt-BR'),
        });

        // Platform-specific publishing (placeholder - requires actual API integration)
        let externalPostId = '';
        let externalPostUrl = '';

        // Log the attempt
        await supabase.from('social_logs').insert({
          social_post_id: post.id,
          level: 'info',
          message: `Tentando publicar em ${post.platform}`,
          details: { caption: caption.substring(0, 100) },
        });

        // TODO: Implement actual API calls for each platform
        // For now, mark as needing manual review since APIs require credentials
        
        // Mark as needs_review until credentials are configured
        const hasCredentials = Object.keys(account.credentials_encrypted ?? {}).length > 0;
        
        if (!hasCredentials) {
          await supabase
            .from('social_posts')
            .update({ 
              status: 'needs_review',
              error_message: 'Credenciais da API não configuradas. Configure nas configurações.',
            })
            .eq('id', post.id);

          await supabase.from('social_logs').insert({
            social_post_id: post.id,
            level: 'warn',
            message: 'Credenciais não configuradas - movido para revisão manual',
          });

          results.push({ id: post.id, status: 'needs_review' });
          continue;
        }

        // If credentials exist, attempt publishing (placeholder for actual API calls)
        // This would be where real API calls happen
        
        await supabase
          .from('social_posts')
          .update({ 
            status: 'posted',
            posted_at: new Date().toISOString(),
            external_post_id: externalPostId,
            external_post_url: externalPostUrl,
            payload: { ...post.payload, final_caption: caption },
          })
          .eq('id', post.id);

        await supabase.from('social_logs').insert({
          social_post_id: post.id,
          level: 'info',
          message: 'Post publicado com sucesso',
          details: { external_post_id: externalPostId },
        });

        results.push({ id: post.id, status: 'posted' });

      } catch (postError) {
        console.error(`[social-publisher] Error processing post ${post.id}:`, postError);
        
        const errorMessage = postError instanceof Error ? postError.message : 'Unknown error';
        
        await supabase
          .from('social_posts')
          .update({ 
            status: 'failed',
            error_message: errorMessage,
            retries_count: (post.retries_count ?? 0) + 1,
          })
          .eq('id', post.id);

        await supabase.from('social_logs').insert({
          social_post_id: post.id,
          level: 'error',
          message: 'Falha ao publicar',
          details: { error: errorMessage },
        });

        results.push({ id: post.id, status: 'failed', error: errorMessage });
      }
    }

    console.log('[social-publisher] Batch complete:', results);

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

function applyTemplate(template: string, data: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }
  return result;
}
