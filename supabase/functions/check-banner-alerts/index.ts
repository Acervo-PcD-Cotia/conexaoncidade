import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting banner alerts check...");

    // Fetch active alert configs
    const { data: configs, error: configError } = await supabase
      .from("banner_alerts_config")
      .select("*")
      .eq("is_active", true);

    if (configError) throw configError;
    console.log(`Found ${configs?.length || 0} active alert configurations`);

    // Fetch all active banners
    const { data: banners, error: bannersError } = await supabase
      .from("super_banners")
      .select("*")
      .eq("is_active", true);

    if (bannersError) throw bannersError;

    const now = new Date();
    const alertsToCreate: { banner_id: string; alert_type: string; message: string }[] = [];

    // Process expiring alerts
    const expiringConfigs = configs?.filter((c) => c.alert_type === "expiring") || [];
    for (const config of expiringConfigs) {
      const bannersToCheck = config.banner_id
        ? banners?.filter((b) => b.id === config.banner_id)
        : banners;

      for (const banner of bannersToCheck || []) {
        if (!banner.ends_at) continue;

        const endsAt = new Date(banner.ends_at);
        const daysUntilExpiry = Math.ceil((endsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiry <= config.threshold_days && daysUntilExpiry > 0) {
          // Check if we already sent an alert recently (within 24h)
          const { data: recentAlerts } = await supabase
            .from("banner_alerts_log")
            .select("id")
            .eq("banner_id", banner.id)
            .eq("alert_type", "expiring")
            .gte("created_at", new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString())
            .limit(1);

          if (!recentAlerts?.length) {
            alertsToCreate.push({
              banner_id: banner.id,
              alert_type: "expiring",
              message: `Banner "${banner.title}" expira em ${daysUntilExpiry} dia(s) (${new Date(banner.ends_at).toLocaleDateString("pt-BR")})`,
            });
          }
        }
      }
    }

    // Process low CTR alerts
    const lowCtrConfigs = configs?.filter((c) => c.alert_type === "low_ctr") || [];
    for (const config of lowCtrConfigs) {
      const bannersToCheck = config.banner_id
        ? banners?.filter((b) => b.id === config.banner_id)
        : banners;

      for (const banner of bannersToCheck || []) {
        // Get clicks and impressions from last 7 days
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

        const { count: clickCount } = await supabase
          .from("banner_clicks")
          .select("*", { count: "exact", head: true })
          .eq("banner_id", banner.id)
          .gte("clicked_at", sevenDaysAgo);

        const { count: impressionCount } = await supabase
          .from("banner_impressions")
          .select("*", { count: "exact", head: true })
          .eq("banner_id", banner.id)
          .gte("viewed_at", sevenDaysAgo);

        const ctr = impressionCount && impressionCount > 0 
          ? ((clickCount || 0) / impressionCount) * 100 
          : 0;

        // Only alert if we have enough data (at least 100 impressions)
        if (impressionCount && impressionCount >= 100 && ctr < config.threshold_ctr) {
          // Check if we already sent an alert recently (within 24h)
          const { data: recentAlerts } = await supabase
            .from("banner_alerts_log")
            .select("id")
            .eq("banner_id", banner.id)
            .eq("alert_type", "low_ctr")
            .gte("created_at", new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString())
            .limit(1);

          if (!recentAlerts?.length) {
            alertsToCreate.push({
              banner_id: banner.id,
              alert_type: "low_ctr",
              message: `Banner "${banner.title}" com CTR baixo: ${ctr.toFixed(2)}% (mínimo: ${config.threshold_ctr}%) nos últimos 7 dias`,
            });
          }
        }
      }
    }

    // Insert alerts
    if (alertsToCreate.length > 0) {
      const { error: insertError } = await supabase
        .from("banner_alerts_log")
        .insert(alertsToCreate);

      if (insertError) throw insertError;
      console.log(`Created ${alertsToCreate.length} alerts`);
    } else {
      console.log("No new alerts to create");
    }

    // Update last_triggered_at for configs that generated alerts
    const configsTriggered = new Set(
      alertsToCreate
        .map((a) => configs?.find((c) => c.alert_type === a.alert_type)?.id)
        .filter(Boolean)
    );

    for (const configId of configsTriggered) {
      await supabase
        .from("banner_alerts_config")
        .update({ last_triggered_at: now.toISOString() })
        .eq("id", configId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        alertsCreated: alertsToCreate.length,
        alerts: alertsToCreate,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error checking banner alerts:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
