import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { news_id, category_id } = body;

    if (!news_id) {
      return new Response(
        JSON.stringify({ error: "news_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[notify-new-news] Processing news_id=${news_id}, category_id=${category_id}`);

    // Get news details
    const { data: news, error: newsError } = await supabase
      .from("news")
      .select("id, title, slug, excerpt, category_id, featured_image_url")
      .eq("id", news_id)
      .single();

    if (newsError || !news) {
      console.error("[notify-new-news] News not found:", newsError);
      return new Response(
        JSON.stringify({ error: "News not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const targetCategoryId = category_id || news.category_id;

    if (!targetCategoryId) {
      console.log("[notify-new-news] No category_id, skipping notification");
      return new Response(
        JSON.stringify({ message: "No category to notify" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get category name
    const { data: category } = await supabase
      .from("categories")
      .select("name")
      .eq("id", targetCategoryId)
      .single();

    // Get users who want notifications for this category
    const { data: preferences, error: prefError } = await supabase
      .from("user_push_preferences")
      .select("user_id")
      .eq("category_id", targetCategoryId)
      .eq("is_enabled", true);

    if (prefError) {
      console.error("[notify-new-news] Error fetching preferences:", prefError);
      return new Response(
        JSON.stringify({ error: prefError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!preferences || preferences.length === 0) {
      console.log("[notify-new-news] No users subscribed to this category");
      return new Response(
        JSON.stringify({ message: "No subscribers for this category", count: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userIds = preferences.map(p => p.user_id);
    console.log(`[notify-new-news] Found ${userIds.length} subscribers for category ${category?.name}`);

    // Get push subscriptions for these users
    const { data: subscriptions, error: subError } = await supabase
      .from("push_subscriptions")
      .select("*")
      .in("user_id", userIds);

    if (subError) {
      console.error("[notify-new-news] Error fetching subscriptions:", subError);
      return new Response(
        JSON.stringify({ error: subError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log("[notify-new-news] No push subscriptions found for subscribers");
      return new Response(
        JSON.stringify({ message: "No push subscriptions", count: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send push notification via send-push function
    const notificationPayload = {
      title: `📰 ${category?.name || 'Nova Notícia'}`,
      body: news.title.substring(0, 100),
      url: `/noticia/${news.slug}`,
      icon: news.featured_image_url || undefined,
    };

    let sentCount = 0;
    const errors: string[] = [];

    for (const subscription of subscriptions) {
      try {
        const { error: pushError } = await supabase.functions.invoke("send-push", {
          body: {
            subscription: {
              endpoint: subscription.endpoint,
              keys: subscription.keys,
            },
            payload: notificationPayload,
          },
        });

        if (pushError) {
          errors.push(`User ${subscription.user_id}: ${pushError.message}`);
        } else {
          sentCount++;
        }
      } catch (e: unknown) {
        const errMsg = e instanceof Error ? e.message : String(e);
        errors.push(`User ${subscription.user_id}: ${errMsg}`);
      }
    }

    console.log(`[notify-new-news] Sent ${sentCount}/${subscriptions.length} notifications`);

    return new Response(
      JSON.stringify({
        success: true,
        sent: sentCount,
        total: subscriptions.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("[notify-new-news] Error:", error);
    const errMsg = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: errMsg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
