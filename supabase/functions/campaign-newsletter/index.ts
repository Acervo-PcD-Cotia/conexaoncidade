import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface NewsletterPayload {
  campaign_id: string;
  cycle_id?: string;
  subject: string;
  preview_text: string;
  content_html?: string;
  template_id?: string;
  target_list: string;
  send_at?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify admin role
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check admin role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!roleData || !['super_admin', 'admin', 'commercial'].includes(roleData.role)) {
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin role required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload: NewsletterPayload = await req.json();
    console.log('Newsletter campaign payload:', payload);

    // Get newsletter subscribers from the specified list
    // This assumes you have a newsletter_subscribers table - adapt as needed
    const { data: campaign } = await supabase
      .from('campaigns_unified')
      .select('name, advertiser, cta_text, cta_url')
      .eq('id', payload.campaign_id)
      .single();

    // Record event for campaign
    const { error: eventError } = await supabase
      .from('campaign_events')
      .insert([{
        campaign_id: payload.campaign_id,
        event_type: 'newsletter_sent',
        channel_type: 'newsletter',
        metadata: {
          cycle_id: payload.cycle_id,
          subject: payload.subject,
          target_list: payload.target_list,
          scheduled_at: payload.send_at,
        }
      }]);

    if (eventError) {
      console.error('Error recording event:', eventError);
    }

    // If cycle_id provided, update cycle metrics
    if (payload.cycle_id) {
      const { data: cycle } = await supabase
        .from('campaign_cycles')
        .select('metrics_summary')
        .eq('id', payload.cycle_id)
        .single();

      const currentMetrics = (cycle?.metrics_summary || {}) as Record<string, number | string>;
      const updatedMetrics = {
        ...currentMetrics,
        newsletter_queued: true,
        newsletter_subject: payload.subject,
        newsletter_scheduled_at: payload.send_at || new Date().toISOString(),
      };

      await supabase
        .from('campaign_cycles')
        .update({ metrics_summary: updatedMetrics })
        .eq('id', payload.cycle_id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: payload.send_at 
          ? `Newsletter scheduled for ${payload.send_at}` 
          : 'Newsletter queued for immediate delivery',
        campaign: campaign?.name,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Campaign newsletter error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
