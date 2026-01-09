import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("AutoPost Scheduler running...");

    const results = {
      sources_checked: 0,
      sources_ingested: 0,
      items_rewritten: 0,
      posts_published: 0,
      errors: [] as string[],
    };

    // 1. Find sources due for ingestion
    const { data: dueSources, error: sourcesError } = await supabase
      .from("autopost_sources")
      .select("id, name, next_run_at")
      .eq("status", "active")
      .lte("next_run_at", new Date().toISOString())
      .order("next_run_at")
      .limit(10);

    if (sourcesError) {
      console.error("Error fetching sources:", sourcesError);
      results.errors.push(`Sources fetch error: ${sourcesError.message}`);
    } else {
      results.sources_checked = dueSources?.length || 0;
      console.log(`Found ${results.sources_checked} sources due for ingestion`);

      // Trigger ingestion for each due source
      for (const source of dueSources || []) {
        try {
          console.log(`Triggering ingest for: ${source.name}`);
          
          const { error: invokeError } = await supabase.functions.invoke("autopost-ingest", {
            body: { source_id: source.id, trigger_type: "scheduled" },
          });

          if (invokeError) {
            console.error(`Ingest error for ${source.name}:`, invokeError);
            results.errors.push(`Ingest ${source.name}: ${invokeError.message}`);
          } else {
            results.sources_ingested++;
          }
        } catch (err: any) {
          console.error(`Failed to ingest ${source.name}:`, err);
          results.errors.push(`Ingest ${source.name}: ${err.message}`);
        }
      }
    }

    // 2. Process captured items that need rewriting
    const { data: capturedItems, error: capturedError } = await supabase
      .from("autopost_ingest_items")
      .select("id, original_title")
      .eq("status", "captured")
      .order("created_at")
      .limit(5);

    if (capturedError) {
      console.error("Error fetching captured items:", capturedError);
      results.errors.push(`Captured items fetch error: ${capturedError.message}`);
    } else {
      console.log(`Found ${capturedItems?.length || 0} items to rewrite`);

      for (const item of capturedItems || []) {
        try {
          console.log(`Rewriting: ${item.original_title}`);
          
          const { error: rewriteError } = await supabase.functions.invoke("autopost-rewrite", {
            body: { item_id: item.id },
          });

          if (rewriteError) {
            console.error(`Rewrite error for ${item.id}:`, rewriteError);
            results.errors.push(`Rewrite ${item.id}: ${rewriteError.message}`);
          } else {
            results.items_rewritten++;
          }
        } catch (err: any) {
          console.error(`Failed to rewrite ${item.id}:`, err);
          results.errors.push(`Rewrite ${item.id}: ${err.message}`);
        }
      }
    }

    // 3. Auto-publish approved posts (if configured)
    const { data: approvedPosts, error: approvedError } = await supabase
      .from("autopost_rewritten_posts")
      .select(`
        id, final_title,
        ingest_item:autopost_ingest_items(
          source:autopost_sources(require_review)
        )
      `)
      .eq("publish_status", "approved")
      .is("published_at", null)
      .order("created_at")
      .limit(5);

    if (approvedError) {
      console.error("Error fetching approved posts:", approvedError);
      results.errors.push(`Approved posts fetch error: ${approvedError.message}`);
    } else {
      console.log(`Found ${approvedPosts?.length || 0} approved posts to publish`);

      for (const post of approvedPosts || []) {
        try {
          console.log(`Publishing: ${post.final_title}`);
          
          const { error: publishError } = await supabase.functions.invoke("autopost-publish", {
            body: { post_id: post.id },
          });

          if (publishError) {
            console.error(`Publish error for ${post.id}:`, publishError);
            results.errors.push(`Publish ${post.id}: ${publishError.message}`);
          } else {
            results.posts_published++;
          }
        } catch (err: any) {
          console.error(`Failed to publish ${post.id}:`, err);
          results.errors.push(`Publish ${post.id}: ${err.message}`);
        }
      }
    }

    // 4. Process scheduled publishes
    const { data: scheduledPosts, error: scheduledError } = await supabase
      .from("autopost_scheduled_publishes")
      .select("id, rewritten_post_id")
      .eq("status", "pending")
      .lte("scheduled_for", new Date().toISOString())
      .order("scheduled_for")
      .limit(5);

    if (scheduledError) {
      console.error("Error fetching scheduled posts:", scheduledError);
    } else {
      for (const scheduled of scheduledPosts || []) {
        try {
          const { error: publishError } = await supabase.functions.invoke("autopost-publish", {
            body: { post_id: scheduled.rewritten_post_id },
          });

          if (publishError) {
            await supabase
              .from("autopost_scheduled_publishes")
              .update({ status: "failed", error_message: publishError.message, executed_at: new Date().toISOString() })
              .eq("id", scheduled.id);
          } else {
            await supabase
              .from("autopost_scheduled_publishes")
              .update({ status: "completed", executed_at: new Date().toISOString() })
              .eq("id", scheduled.id);
            results.posts_published++;
          }
        } catch (err: any) {
          await supabase
            .from("autopost_scheduled_publishes")
            .update({ status: "failed", error_message: err.message, executed_at: new Date().toISOString() })
            .eq("id", scheduled.id);
        }
      }
    }

    console.log("Scheduler completed:", results);

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        ...results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Scheduler error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
