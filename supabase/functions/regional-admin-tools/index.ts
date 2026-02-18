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
        if (!source_id) throw new Error('source_id is required');

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
        if (!source_id) throw new Error('source_id is required');

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

      case 'run_all': {
        console.log('[Regional Admin] Running ingestion for all active sources');
        
        const response = await fetch(`${supabaseUrl}/functions/v1/regional-ingest`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({}),
        });

        const result = await response.json();
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'pause_source': {
        if (!source_id) throw new Error('source_id is required');

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
        if (!source_id) throw new Error('source_id is required');

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
        if (!source_id || !selectors) throw new Error('source_id and selectors are required');

        const { error } = await supabase
          .from('regional_sources')
          .update({ selectors })
          .eq('id', source_id);

        if (error) throw error;

        return new Response(JSON.stringify({ success: true, message: 'Selectors updated' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'process_item': {
        if (!item_id) throw new Error('item_id is required');

        const response = await fetch(`${supabaseUrl}/functions/v1/regional-process-item`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({ item_id }),
        });

        const result = await response.json();
        return new Response(JSON.stringify(result), {
          status: response.ok ? 200 : 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'process_all_new': {
        // Increased limit from 10 to 50 for faster batch processing
        const { data: items, error: fetchError } = await supabase
          .from('regional_ingest_items')
          .select('id')
          .eq('status', 'new')
          .order('created_at', { ascending: true })
          .limit(50);

        if (fetchError) throw fetchError;

        if (!items || items.length === 0) {
          return new Response(JSON.stringify({ 
            success: true, 
            processed: 0, 
            message: 'No items to process' 
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Process in batches of 5 concurrently to avoid overload
        const batchSize = 5;
        let successful = 0;
        let failed = 0;

        for (let i = 0; i < items.length; i += batchSize) {
          const batch = items.slice(i, i + batchSize);
          const results = await Promise.allSettled(
            batch.map(async (item) => {
              const response = await fetch(`${supabaseUrl}/functions/v1/regional-process-item`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${supabaseKey}`,
                },
                body: JSON.stringify({ item_id: item.id }),
              });
              if (!response.ok) throw new Error(`HTTP ${response.status}`);
              return response.json();
            })
          );

          successful += results.filter(r => r.status === 'fulfilled').length;
          failed += results.filter(r => r.status === 'rejected').length;
        }

        return new Response(JSON.stringify({
          success: true,
          processed: successful,
          failed,
          total: items.length,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'publish_all_processed': {
        // Publish ALL processed items at once
        const { data: items, error: fetchError } = await supabase
          .from('regional_ingest_items')
          .select('id')
          .eq('status', 'processed')
          .order('created_at', { ascending: true })
          .limit(100);

        if (fetchError) throw fetchError;

        if (!items || items.length === 0) {
          return new Response(JSON.stringify({ 
            success: true, 
            published: 0, 
            message: 'No processed items to publish' 
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Publish in batches of 3 concurrently
        const pubBatchSize = 3;
        let pubSuccessful = 0;
        let pubFailed = 0;

        for (let i = 0; i < items.length; i += pubBatchSize) {
          const batch = items.slice(i, i + pubBatchSize);
          const results = await Promise.allSettled(
            batch.map(async (item) => {
              const response = await fetch(`${supabaseUrl}/functions/v1/regional-process-item`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${supabaseKey}`,
                },
                body: JSON.stringify({ item_id: item.id, auto_publish: true }),
              });
              if (!response.ok) throw new Error(`HTTP ${response.status}`);
              return response.json();
            })
          );

          pubSuccessful += results.filter(r => r.status === 'fulfilled').length;
          pubFailed += results.filter(r => r.status === 'rejected').length;
        }

        return new Response(JSON.stringify({
          success: true,
          published: pubSuccessful,
          failed: pubFailed,
          total: items.length,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'full_pipeline': {
        // FULL AUTOMATION: Ingest all → Process all new → Publish all processed
        console.log('[Regional Admin] Running FULL PIPELINE');
        
        // Step 1: Ingest from all sources
        let ingestResult: any = {};
        try {
          const ingestResponse = await fetch(`${supabaseUrl}/functions/v1/regional-ingest`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify({}),
          });
          ingestResult = await ingestResponse.json();
          console.log('[Pipeline] Ingest done:', JSON.stringify(ingestResult));
        } catch (e) {
          console.error('[Pipeline] Ingest error:', e);
        }

        // Step 2: Process all new items
        const { data: newItems } = await supabase
          .from('regional_ingest_items')
          .select('id')
          .eq('status', 'new')
          .order('created_at', { ascending: true })
          .limit(50);

        let processedCount = 0;
        let processFailedCount = 0;

        if (newItems && newItems.length > 0) {
          const bSize = 5;
          for (let i = 0; i < newItems.length; i += bSize) {
            const batch = newItems.slice(i, i + bSize);
            const results = await Promise.allSettled(
              batch.map(async (item) => {
                const response = await fetch(`${supabaseUrl}/functions/v1/regional-process-item`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${supabaseKey}`,
                  },
                  body: JSON.stringify({ item_id: item.id, auto_publish: true }),
                });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response.json();
              })
            );
            processedCount += results.filter(r => r.status === 'fulfilled').length;
            processFailedCount += results.filter(r => r.status === 'rejected').length;
          }
        }

        // Step 3: Also publish any previously processed items
        const { data: processedItems } = await supabase
          .from('regional_ingest_items')
          .select('id')
          .eq('status', 'processed')
          .order('created_at', { ascending: true })
          .limit(100);

        let publishedCount = 0;

        if (processedItems && processedItems.length > 0) {
          const pSize = 3;
          for (let i = 0; i < processedItems.length; i += pSize) {
            const batch = processedItems.slice(i, i + pSize);
            const results = await Promise.allSettled(
              batch.map(async (item) => {
                const response = await fetch(`${supabaseUrl}/functions/v1/regional-process-item`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${supabaseKey}`,
                  },
                  body: JSON.stringify({ item_id: item.id, auto_publish: true }),
                });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response.json();
              })
            );
            publishedCount += results.filter(r => r.status === 'fulfilled').length;
          }
        }

        const totalNew = ingestResult.results?.reduce((s: number, r: any) => s + (r.items_new || 0), 0) || 0;

        return new Response(JSON.stringify({
          success: true,
          pipeline: {
            ingested: totalNew,
            processed: processedCount,
            process_failed: processFailedCount,
            published: publishedCount,
            sources_checked: ingestResult.results?.length || 0,
          },
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'publish_item': {
        if (!item_id) throw new Error('item_id is required');

        const { data: item, error: itemError } = await supabase
          .from('regional_ingest_items')
          .select('status')
          .eq('id', item_id)
          .single();

        if (itemError || !item) throw new Error('Item not found');

        if (item.status !== 'processed') {
          throw new Error('Item must be processed before publishing');
        }

        const response = await fetch(`${supabaseUrl}/functions/v1/regional-process-item`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({ item_id, auto_publish: true }),
        });

        const result = await response.json();
        return new Response(JSON.stringify(result), {
          status: response.ok ? 200 : 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'test_selectors': {
        if (!source_id || !selectors) throw new Error('source_id and selectors are required');

        const { data: source, error: sourceError } = await supabase
          .from('regional_sources')
          .select('listing_url')
          .eq('id', source_id)
          .single();

        if (sourceError || !source) throw new Error('Source not found');
        if (!source.listing_url) throw new Error('Source has no listing_url configured');

        try {
          const response = await fetch(source.listing_url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ConexaoNCidade/1.0)' },
          });

          if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);

          const html = await response.text();
          const results: Record<string, number> = {};
          
          if (selectors.item_container) {
            const regex = new RegExp(selectors.item_container.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            results.item_container = (html.match(regex) || []).length;
          }
          
          if (selectors.item_link) {
            const regex = new RegExp(selectors.item_link.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            results.item_link = (html.match(regex) || []).length;
          }

          return new Response(JSON.stringify({ success: true, matches: results, html_length: html.length }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (fetchError) {
          return new Response(JSON.stringify({
            success: false,
            error: fetchError instanceof Error ? fetchError.message : 'Fetch failed',
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      case 'reprocess_item': {
        if (!item_id) throw new Error('item_id is required');

        const { error } = await supabase
          .from('regional_ingest_items')
          .update({ status: 'queued', processed_at: null, error_message: null })
          .eq('id', item_id);

        if (error) throw error;

        return new Response(JSON.stringify({ success: true, message: 'Item queued for reprocessing' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'skip_item': {
        if (!item_id) throw new Error('item_id is required');

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
