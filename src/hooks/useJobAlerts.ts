import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface JobAlertPreferences {
  id: string;
  user_id: string;
  categories: string[];
  job_types: string[];
  work_modes: string[];
  neighborhoods: string[];
  min_salary: number | null;
  keywords: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useJobAlertPreferences() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['job-alert-preferences', user?.id],
    queryFn: async (): Promise<JobAlertPreferences | null> => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('job_alert_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as JobAlertPreferences | null;
    },
    enabled: !!user,
  });
}

export function useSaveJobAlertPreferences() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preferences: Partial<Omit<JobAlertPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
      if (!user) throw new Error('User not authenticated');

      const { data: existing } = await supabase
        .from('job_alert_preferences')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('job_alert_preferences')
          .update({
            ...preferences,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('job_alert_preferences')
          .insert({
            user_id: user.id,
            ...preferences,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-alert-preferences'] });
      toast.success('Preferências salvas com sucesso!');
    },
    onError: (error) => {
      console.error('Error saving preferences:', error);
      toast.error('Erro ao salvar preferências');
    },
  });
}

export function useNotifyJobMatches() {
  return useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await supabase.functions.invoke('notify-job-matches', {
        body: { jobId },
      });

      if (error) {
        console.error('Error notifying job matches:', error);
        throw error;
      }
    },
  });
}
