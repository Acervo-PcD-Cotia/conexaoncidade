import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type ClickType = 'whatsapp' | 'phone' | 'email';

export function useTrackClassifiedInterest() {
  return useMutation({
    mutationFn: async ({ classifiedId, clickType }: { classifiedId: string; clickType: ClickType }) => {
      const { error } = await supabase.functions.invoke('track-classified-interest', {
        body: { classifiedId, clickType },
      });

      if (error) {
        console.error('Error tracking interest:', error);
        throw error;
      }
    },
  });
}
