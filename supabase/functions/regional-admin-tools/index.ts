import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, source_id, item_id, selectors } = await req.json();

    console.log(`[Regional Admin] Action: ${action}, source_id: ${source_id}`);

    switch (action) {
      case 'test_source': {
        // Test a source without saving (dry run)
        if (!source_id) {
          throw new Error('source_id is required');
        }

        // Call regional-ingest with dry_run
        const response = await fetch(`${supabaseUrl}/functions/v1/regional-ingest`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({ source_id, dry_run: true }),
        });

        const result = await response.json();
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'run_now': {
        // Force run ingest for a source
        if (!source_id) {
          throw new Error('source_id is required');
        }

        const response = await fetch(`${supabaseUrl}/functions/v1/regional-ingest`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({ source_id }),
        });

        const result = await response.json();
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'pause_source': {
        if (!source_id) {
          throw new Error('source_id is required');
        }

        const { error } = await supabase
          .from('regional_sources')
          .update({ is_active: false })
          .eq('id', source_id);

        if (error) throw error;

        return new Response(JSON.stringify({ success: true, message: 'Source paused' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'resume_source': {
        if (!source_id) {
          throw new Error('source_id is required');
        }

        const { error } = await supabase
          .from('regional_sources')
          .update({ is_active: true, error_count: 0, last_error: null })
          .eq('id', source_id);

        if (error) throw error;

        return new Response(JSON.stringify({ success: true, message: 'Source resumed' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'update_selectors': {
        if (!source_id || !selectors) {
          throw new Error('source_id and selectors are required');
        }

        const { error } = await supabase
          .from('regional_sources')
          .update({ selectors })
          .eq('id', source_id);

        if (error) throw error;

        return new Response(JSON.stringify({ success: true, message: 'Selectors updated' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'reprocess_item': {
        if (!item_id) {
          throw new Error('item_id is required');
        }

        const { error } = await supabase
          .from('regional_ingest_items')
          .update({ status: 'queued', processed_at: null })
          .eq('id', item_id);

        if (error) throw error;

        return new Response(JSON.stringify({ success: true, message: 'Item queued for reprocessing' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'skip_item': {
        if (!item_id) {
          throw new Error('item_id is required');
        }

        const { error } = await supabase
          .from('regional_ingest_items')
          .update({ status: 'skipped' })
          .eq('id', item_id);

        if (error) throw error;

        return new Response(JSON.stringify({ success: true, message: 'Item skipped' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get_stats': {
        // Get dashboard stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
          { count: capturedToday },
          { count: publishedToday },
          { count: inQueue },
          { count: duplicates },
          { count: sourcesWithError },
        ] = await Promise.all([
          supabase
            .from('regional_ingest_items')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', today.toISOString()),
          supabase
            .from('regional_ingest_items')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'published')
            .gte('published_at_portal', today.toISOString()),
          supabase
            .from('regional_ingest_items')
            .select('*', { count: 'exact', head: true })
            .in('status', ['new', 'queued']),
          supabase
            .from('regional_ingest_items')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'skipped'),
          supabase
            .from('regional_sources')
            .select('*', { count: 'exact', head: true })
            .gt('error_count', 0),
        ]);

        return new Response(JSON.stringify({
          success: true,
          stats: {
            captured_today: capturedToday || 0,
            published_today: publishedToday || 0,
            in_queue: inQueue || 0,
            duplicates: duplicates || 0,
            sources_with_error: sourcesWithError || 0,
          },
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('[Regional Admin] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});