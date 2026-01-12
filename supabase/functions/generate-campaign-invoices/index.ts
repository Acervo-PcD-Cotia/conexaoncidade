import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body for optional parameters
    let campaignId: string | null = null;
    let periodStart: string | null = null;
    let periodEnd: string | null = null;

    if (req.method === 'POST') {
      try {
        const body = await req.json();
        campaignId = body.campaign_id || null;
        periodStart = body.period_start || null;
        periodEnd = body.period_end || null;
      } catch {
        // No body, generate for all active campaigns
      }
    }

    // Default period: last 7 days
    const endDate = periodEnd ? new Date(periodEnd) : new Date();
    const startDate = periodStart 
      ? new Date(periodStart) 
      : new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

    console.log(`Generating invoices for period: ${startDate.toISOString()} to ${endDate.toISOString()}`);

    // Fetch campaigns (all active or specific one)
    let campaignsQuery = supabase
      .from('banner_campaigns')
      .select('*')
      .eq('status', 'active');

    if (campaignId) {
      campaignsQuery = supabase
        .from('banner_campaigns')
        .select('*')
        .eq('id', campaignId);
    }

    const { data: campaigns, error: campaignsError } = await campaignsQuery;

    if (campaignsError) {
      throw new Error(`Failed to fetch campaigns: ${campaignsError.message}`);
    }

    if (!campaigns || campaigns.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No campaigns found', invoices_created: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const invoicesCreated: any[] = [];

    for (const campaign of campaigns) {
      console.log(`Processing campaign: ${campaign.name} (${campaign.id})`);

      // Check if invoice already exists for this period
      const { data: existingInvoice } = await supabase
        .from('banner_campaign_invoices')
        .select('id')
        .eq('campaign_id', campaign.id)
        .eq('invoice_period_start', startDate.toISOString().split('T')[0])
        .eq('invoice_period_end', endDate.toISOString().split('T')[0])
        .single();

      if (existingInvoice) {
        console.log(`Invoice already exists for campaign ${campaign.id} in this period`);
        continue;
      }

      // Count impressions for this campaign's banner in the period
      const { count: impressionsCount } = await supabase
        .from('banner_impressions')
        .select('*', { count: 'exact', head: true })
        .eq('banner_id', campaign.banner_id)
        .gte('viewed_at', startDate.toISOString())
        .lte('viewed_at', endDate.toISOString());

      // Count clicks for this campaign's banner in the period
      const { count: clicksCount } = await supabase
        .from('banner_clicks')
        .select('*', { count: 'exact', head: true })
        .eq('banner_id', campaign.banner_id)
        .gte('clicked_at', startDate.toISOString())
        .lte('clicked_at', endDate.toISOString());

      const impressions = impressionsCount || 0;
      const clicks = clicksCount || 0;

      // Calculate amounts based on billing type
      let amountImpressions = 0;
      let amountClicks = 0;

      if (campaign.billing_type === 'cpm' && campaign.cost_per_impression) {
        // CPM = Cost Per Mille (1000 impressions)
        amountImpressions = (impressions / 1000) * campaign.cost_per_impression;
      }

      if (campaign.billing_type === 'cpc' && campaign.cost_per_click) {
        // CPC = Cost Per Click
        amountClicks = clicks * campaign.cost_per_click;
      }

      const totalAmount = amountImpressions + amountClicks;

      // Only create invoice if there's something to bill
      if (totalAmount <= 0 && impressions === 0 && clicks === 0) {
        console.log(`No activity for campaign ${campaign.id}, skipping invoice`);
        continue;
      }

      // Calculate due date (15 days from now)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 15);

      // Create the invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('banner_campaign_invoices')
        .insert({
          campaign_id: campaign.id,
          invoice_period_start: startDate.toISOString().split('T')[0],
          invoice_period_end: endDate.toISOString().split('T')[0],
          impressions_count: impressions,
          clicks_count: clicks,
          amount_impressions: amountImpressions,
          amount_clicks: amountClicks,
          total_amount: totalAmount,
          status: 'draft',
          due_date: dueDate.toISOString().split('T')[0]
        })
        .select()
        .single();

      if (invoiceError) {
        console.error(`Failed to create invoice for campaign ${campaign.id}:`, invoiceError);
        continue;
      }

      console.log(`Created invoice ${invoice.id} for campaign ${campaign.id}: R$ ${totalAmount.toFixed(2)}`);
      
      invoicesCreated.push({
        invoice_id: invoice.id,
        campaign_id: campaign.id,
        campaign_name: campaign.name,
        impressions,
        clicks,
        total_amount: totalAmount
      });

      // Update campaign's budget_spent
      await supabase
        .from('banner_campaigns')
        .update({
          budget_spent: (campaign.budget_spent || 0) + totalAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', campaign.id);
    }

    console.log(`Invoice generation complete. Created ${invoicesCreated.length} invoices.`);

    return new Response(
      JSON.stringify({
        message: `Generated ${invoicesCreated.length} invoices`,
        invoices_created: invoicesCreated.length,
        invoices: invoicesCreated,
        period: {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0]
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: unknown) {
    console.error('Generate invoices error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
