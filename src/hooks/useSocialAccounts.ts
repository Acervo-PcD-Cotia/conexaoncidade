import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type SocialPlatform = 'meta_facebook' | 'meta_instagram' | 'x' | 'linkedin' | 'telegram';

export interface SocialAccount {
  id: string;
  platform: SocialPlatform;
  enabled: boolean;
  credentials_encrypted: Record<string, unknown>;
  settings: {
    template?: string;
    hashtags?: string[];
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    mode?: 'auto' | 'review';
  };
  created_at: string;
  updated_at: string;
}

export const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  meta_facebook: 'Facebook',
  meta_instagram: 'Instagram',
  x: 'X (Twitter)',
  linkedin: 'LinkedIn',
  telegram: 'Telegram',
};

export const PLATFORM_ICONS: Record<SocialPlatform, string> = {
  meta_facebook: '📘',
  meta_instagram: '📷',
  x: '𝕏',
  linkedin: '💼',
  telegram: '✈️',
};

export function useSocialAccounts() {
  const queryClient = useQueryClient();

  const { data: accounts, isLoading } = useQuery({
    queryKey: ['social-accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('social_accounts')
        .select('*')
        .order('platform');
      
      if (error) throw error;
      return data as SocialAccount[];
    },
  });

  const upsertAccount = useMutation({
    mutationFn: async (account: Partial<SocialAccount> & { platform: SocialPlatform }) => {
      const { data, error } = await supabase
        .from('social_accounts')
        .upsert([{
          platform: account.platform,
          enabled: account.enabled ?? false,
          settings: (account.settings ?? {}) as Record<string, string | string[] | undefined>,
          credentials_encrypted: (account.credentials_encrypted ?? {}) as Record<string, string>,
        }], {
          onConflict: 'platform',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-accounts'] });
      toast.success('Configurações salvas com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao salvar configurações: ' + error.message);
    },
  });

  const toggleAccount = useMutation({
    mutationFn: async ({ platform, enabled }: { platform: SocialPlatform; enabled: boolean }) => {
      const { error } = await supabase
        .from('social_accounts')
        .upsert([{
          platform,
          enabled,
        }], {
          onConflict: 'platform',
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-accounts'] });
    },
  });

  const getAccount = (platform: SocialPlatform) => {
    return accounts?.find(a => a.platform === platform);
  };

  const enabledPlatforms = accounts?.filter(a => a.enabled).map(a => a.platform) ?? [];

  return {
    accounts,
    isLoading,
    upsertAccount,
    toggleAccount,
    getAccount,
    enabledPlatforms,
  };
}
