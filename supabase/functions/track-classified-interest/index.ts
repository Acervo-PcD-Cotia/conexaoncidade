import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TrackPayload {
  classifiedId: string;
  clickType: 'whatsapp' | 'phone' | 'email';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: TrackPayload = await req.json();
    const { classifiedId, clickType } = payload;

    console.log('Tracking interest click:', { classifiedId, clickType });

    if (!classifiedId || !clickType) {
      return new Response(
        JSON.stringify({ error: 'classifiedId and clickType are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user agent for analytics
    const userAgent = req.headers.get('user-agent') || null;

    // Register the click
    const { error: insertError } = await supabase
      .from('classified_interest_clicks')
      .insert({
        classified_id: classifiedId,
        click_type: clickType,
        user_agent: userAgent,
      });

    if (insertError) {
      console.error('Error inserting click:', insertError);
      throw insertError;
    }

    // Increment the click counter
    await supabase.rpc('increment_classified_interest', {
      p_classified_id: classifiedId,
      p_click_type: clickType,
    });

    // Check if we should send a push notification (rate limited to 1 per hour)
    const { data: shouldNotify } = await supabase.rpc('should_notify_classified_interest', {
      p_classified_id: classifiedId,
    });

    if (shouldNotify) {
      // Get the classified details and owner
      const { data: classified, error: classifiedError } = await supabase
        .from('classifieds')
        .select('title, user_id')
        .eq('id', classifiedId)
        .single();

      if (classifiedError || !classified) {
        console.error('Error fetching classified:', classifiedError);
      } else if (classified.user_id) {
        // Get owner's push subscription
        const { data: subscriptions } = await supabase
          .from('push_subscriptions')
          .select('*')
          .eq('user_id', classified.user_id)
          .eq('is_active', true);

        if (subscriptions && subscriptions.length > 0) {
          // Send push notification
          const clickTypeLabels: Record<string, string> = {
            whatsapp: 'WhatsApp',
            phone: 'telefone',
            email: 'e-mail',
          };

          const pushPayload = {
            title: '🎉 Interesse no seu anúncio!',
            body: `Alguém clicou em ${clickTypeLabels[clickType]} no anúncio "${classified.title.slice(0, 50)}"`,
            url: `/classificados/${classifiedId}`,
            tag: `classified-interest-${classifiedId}`,
            target_type: 'users',
            target_user_ids: [classified.user_id],
          };

          try {
            await supabase.functions.invoke('send-push', {
              body: pushPayload,
            });
            console.log('Push notification sent to owner');
          } catch (pushError) {
            console.error('Error sending push:', pushError);
          }
        }
      }
    } else {
      console.log('Skipping notification (rate limited)');
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in track-classified-interest:', error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
