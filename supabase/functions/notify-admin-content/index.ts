import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationPayload {
  type: 'pending_news' | 'pending_factcheck' | 'community_report';
  news_id?: string;
  title?: string;
  factcheck_id?: string;
  claim?: string;
  report_id?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: NotificationPayload = await req.json();
    console.log("Received notification payload:", payload);

    // Build notification content based on type
    let title = "";
    let body = "";
    let url = "/admin";

    switch (payload.type) {
      case 'pending_news':
        title = "📰 Nova notícia pendente";
        body = payload.title 
          ? `"${payload.title.substring(0, 50)}..." aguarda revisão`
          : "Uma nova notícia aguarda revisão";
        url = "/admin/news";
        break;
      
      case 'pending_factcheck':
        title = "🔍 Nova verificação solicitada";
        body = payload.claim 
          ? `Alegação: "${payload.claim.substring(0, 50)}..."`
          : "Uma nova alegação foi submetida para verificação";
        url = "/admin/check-fake-news";
        break;
      
      case 'community_report':
        title = "⚠️ Nova denúncia na comunidade";
        body = "Um conteúdo foi denunciado e precisa de moderação";
        url = "/admin/community/moderation";
        break;
      
      default:
        console.log("Unknown notification type:", payload.type);
        return new Response(JSON.stringify({ error: "Unknown notification type" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    // Get admins with push notifications enabled for this type
    const preferenceField = `notify_${payload.type.replace('pending_', '')}`;
    
    // Get all admin user IDs
    const { data: adminRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id')
      .in('role', ['admin', 'super_admin', 'editor']);

    if (rolesError) {
      console.error("Error fetching admin roles:", rolesError);
      throw rolesError;
    }

    if (!adminRoles || adminRoles.length === 0) {
      console.log("No admins found");
      return new Response(JSON.stringify({ message: "No admins to notify" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminUserIds = adminRoles.map(r => r.user_id);
    console.log(`Found ${adminUserIds.length} admin users`);

    // Check notification preferences (admins without preferences default to enabled)
    const { data: preferences, error: prefError } = await supabase
      .from('admin_notification_preferences')
      .select('user_id')
      .in('user_id', adminUserIds)
      .eq(preferenceField === 'notify_community_report' ? 'notify_community_reports' : preferenceField.replace('_', '_pending_'), false);

    const disabledUserIds = preferences?.map(p => p.user_id) || [];
    const enabledAdminIds = adminUserIds.filter(id => !disabledUserIds.includes(id));

    if (enabledAdminIds.length === 0) {
      console.log("All admins have this notification type disabled");
      return new Response(JSON.stringify({ message: "All admins have notifications disabled" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Sending push to ${enabledAdminIds.length} admins`);

    // Call send-push function
    const { error: pushError } = await supabase.functions.invoke('send-push', {
      body: {
        title,
        body,
        url,
        target_type: 'users',
        target_user_ids: enabledAdminIds,
      }
    });

    if (pushError) {
      console.error("Error sending push notification:", pushError);
      throw pushError;
    }

    console.log("Push notification sent successfully");

    return new Response(JSON.stringify({ 
      success: true, 
      notified_count: enabledAdminIds.length 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in notify-admin-content:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
