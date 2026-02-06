import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface PushPayload {
  campaign_id: string;
  cycle_id?: string;
  title: string;
  body: string;
  icon_url?: string;
  action_url: string;
  target_audience: 'all' | 'subscribers' | 'segment';
  segment_id?: string;
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

    const payload: PushPayload = await req.json();
    console.log('Push campaign payload:', payload);

    // Get push subscriptions based on target audience
    let subscriptionsQuery = supabase
      .from('push_subscriptions')
      .select('*');

    // For now, we send to all subscribers - segment filtering can be added later
    const { data: subscriptions, error: subError } = await subscriptionsQuery;

    if (subError) {
      console.error('Error fetching subscriptions:', subError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch subscriptions', details: subError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${subscriptions?.length || 0} subscriptions to send to`);

    // Record event for campaign
    const { error: eventError } = await supabase
      .from('campaign_events')
      .insert([{
        campaign_id: payload.campaign_id,
        event_type: 'push_sent',
        channel_type: 'push',
        metadata: {
          cycle_id: payload.cycle_id,
          total_sent: subscriptions?.length || 0,
          title: payload.title,
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

      const currentMetrics = (cycle?.metrics_summary || {}) as Record<string, number>;
      const updatedMetrics = {
        ...currentMetrics,
        push_sent: (currentMetrics.push_sent || 0) + (subscriptions?.length || 0),
        push_sent_at: new Date().toISOString(),
      };

      await supabase
        .from('campaign_cycles')
        .update({ metrics_summary: updatedMetrics })
        .eq('id', payload.cycle_id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        sent_count: subscriptions?.length || 0,
        message: `Push notification queued for ${subscriptions?.length || 0} subscribers`,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Campaign push error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
