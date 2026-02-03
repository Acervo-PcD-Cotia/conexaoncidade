import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { SocialPlatform, SocialAccountType } from "@/types/postsocial";
import type { Json } from "@/integrations/supabase/types";

// Re-export types for backward compatibility
export type { SocialPlatform, SocialAccountType };

export interface SocialAccount {
  id: string;
  platform: SocialPlatform;
  display_name: string;
  username: string | null;
  account_type: SocialAccountType;
  provider_account_id: string | null;
  token_ref: string | null;
  token_expires_at: string | null;
  is_active: boolean;
  default_enabled: boolean;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  x: 'X (Twitter)',
  linkedin: 'LinkedIn',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  pinterest: 'Pinterest',
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
};

export const PLATFORM_ICONS: Record<SocialPlatform, string> = {
  instagram: '📷',
  facebook: '📘',
  x: '𝕏',
  linkedin: '💼',
  tiktok: '🎵',
  youtube: '▶️',
  pinterest: '📌',
  whatsapp: '💬',
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
      
      // Map database rows to interface
      return (data ?? []).map(row => ({
        id: row.id,
        platform: row.platform,
        display_name: row.display_name,
        username: row.username,
        account_type: row.account_type,
        provider_account_id: row.provider_account_id,
        token_ref: row.token_ref,
        token_expires_at: row.token_expires_at,
        is_active: row.is_active,
        default_enabled: row.default_enabled,
        settings: (row.settings as Record<string, unknown>) ?? {},
        created_at: row.created_at,
        updated_at: row.updated_at,
      })) as SocialAccount[];
    },
  });

  const upsertAccount = useMutation({
    mutationFn: async (account: Partial<SocialAccount> & { platform: SocialPlatform }) => {
      const settings = (account.settings ?? {}) as Json;
      
      const { data, error } = await supabase
        .from('social_accounts')
        .upsert([{
          platform: account.platform,
          display_name: account.display_name ?? account.platform,
          username: account.username ?? '',
          account_type: account.account_type ?? 'business',
          is_active: account.is_active ?? false,
          default_enabled: account.default_enabled ?? false,
          settings,
        }], {
          onConflict: 'platform,user_id',
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
        .update({ is_active: enabled })
        .eq('platform', platform);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-accounts'] });
    },
  });

  const getAccount = (platform: SocialPlatform) => {
    return accounts?.find(a => a.platform === platform);
  };

  const enabledPlatforms = accounts?.filter(a => a.is_active).map(a => a.platform) ?? [];

  return {
    accounts,
    isLoading,
    upsertAccount,
    toggleAccount,
    getAccount,
    enabledPlatforms,
  };
}
