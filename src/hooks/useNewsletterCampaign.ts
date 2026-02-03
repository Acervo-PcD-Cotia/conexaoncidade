import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { NewsletterChannelConfig } from '@/types/campaigns-unified';

interface SendNewsletterParams {
  campaignId: string;
  cycleId?: string;
  config: NewsletterChannelConfig;
  contentHtml?: string;
}

/**
 * Hook to send newsletter for a campaign
 */
export function useSendNewsletterCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ campaignId, cycleId, config, contentHtml }: SendNewsletterParams) => {
      const { data, error } = await supabase.functions.invoke('campaign-newsletter', {
        body: {
          campaign_id: campaignId,
          cycle_id: cycleId,
          subject: config.subject,
          preview_text: config.preview_text,
          content_html: contentHtml,
          template_id: config.template_id,
          target_list: config.target_list,
          send_at: config.send_at,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['campaign-cycles'] });
      queryClient.invalidateQueries({ queryKey: ['campaign-events'] });
      toast.success(data.message || 'Newsletter agendada!');
    },
    onError: (error) => {
      console.error('Error sending newsletter:', error);
      toast.error('Erro ao agendar newsletter');
    },
  });
}
