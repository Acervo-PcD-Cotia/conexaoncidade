import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotifyPayload {
  jobId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: NotifyPayload = await req.json();
    const { jobId } = payload;

    console.log('Notifying job matches for:', jobId);

    if (!jobId) {
      return new Response(
        JSON.stringify({ error: 'jobId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get job details
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      console.error('Error fetching job:', jobError);
      return new Response(
        JSON.stringify({ error: 'Job not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find users with matching preferences
    const { data: preferences, error: prefError } = await supabase
      .from('job_alert_preferences')
      .select('user_id, categories, job_types, work_modes, neighborhoods, min_salary, keywords')
      .eq('is_active', true);

    if (prefError) {
      console.error('Error fetching preferences:', prefError);
      throw prefError;
    }

    if (!preferences || preferences.length === 0) {
      console.log('No active job alert preferences found');
      return new Response(
        JSON.stringify({ notified: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Filter matching preferences
    const matchingUserIds: string[] = [];

    for (const pref of preferences) {
      let matches = true;

      // Check category match
      if (pref.categories && pref.categories.length > 0) {
        if (!pref.categories.includes(job.category)) {
          matches = false;
        }
      }

      // Check job type match
      if (matches && pref.job_types && pref.job_types.length > 0) {
        if (!pref.job_types.includes(job.job_type)) {
          matches = false;
        }
      }

      // Check work mode match
      if (matches && pref.work_modes && pref.work_modes.length > 0) {
        if (!pref.work_modes.includes(job.work_mode)) {
          matches = false;
        }
      }

      // Check neighborhood match
      if (matches && pref.neighborhoods && pref.neighborhoods.length > 0) {
        if (!pref.neighborhoods.includes(job.location)) {
          matches = false;
        }
      }

      // Check minimum salary
      if (matches && pref.min_salary) {
        const jobSalary = job.salary_max || job.salary_min || 0;
        if (jobSalary < pref.min_salary) {
          matches = false;
        }
      }

      // Check keywords
      if (matches && pref.keywords) {
        const keywords = pref.keywords.toLowerCase().split(',').map((k: string) => k.trim());
        const jobText = `${job.title} ${job.description || ''}`.toLowerCase();
        const hasKeyword = keywords.some((kw: string) => jobText.includes(kw));
        if (!hasKeyword) {
          matches = false;
        }
      }

      if (matches) {
        matchingUserIds.push(pref.user_id);
      }
    }

    if (matchingUserIds.length === 0) {
      console.log('No matching users found');
      return new Response(
        JSON.stringify({ notified: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${matchingUserIds.length} matching users`);

    // Format salary for notification
    let salaryText = '';
    if (job.salary_min || job.salary_max) {
      const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
      if (job.salary_min && job.salary_max) {
        salaryText = ` • ${formatter.format(job.salary_min)} - ${formatter.format(job.salary_max)}`;
      } else if (job.salary_min) {
        salaryText = ` • A partir de ${formatter.format(job.salary_min)}`;
      } else if (job.salary_max) {
        salaryText = ` • Até ${formatter.format(job.salary_max)}`;
      }
    }

    // Send push notification to matching users
    const pushPayload = {
      title: '💼 Nova vaga compatível!',
      body: `${job.title} - ${job.company_name || 'Empresa'}${salaryText}`,
      url: `/empregos/${jobId}`,
      tag: `job-match-${jobId}`,
      target_type: 'users',
      target_user_ids: matchingUserIds,
    };

    try {
      await supabase.functions.invoke('send-push', {
        body: pushPayload,
      });
      console.log(`Push notifications sent to ${matchingUserIds.length} users`);
    } catch (pushError) {
      console.error('Error sending push:', pushError);
    }

    return new Response(
      JSON.stringify({ notified: matchingUserIds.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in notify-job-matches:', error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
