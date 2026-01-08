import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { ShareChannel } from '@/lib/linkUtils';

interface ShareResolveParams {
  entity_type: 'news' | 'story' | 'custom';
  entity_id?: string;
  canonical_url?: string;
  channel: ShareChannel;
  title?: string;
}

interface ShareResolveResult {
  share_url: string;
  short_url?: string;
  qr_url?: string;
  link_id: string;
}

export function useShareResolver() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const resolveShareUrl = useCallback(async (params: ShareResolveParams): Promise<ShareResolveResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const site_domain = window.location.host;

      const response = await supabase.functions.invoke('share-resolver', {
        body: {
          ...params,
          site_domain,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to resolve share URL');
      }

      return response.data as ShareResolveResult;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      
      // Fallback: return the canonical URL as-is
      return {
        share_url: params.canonical_url || window.location.href,
        link_id: '',
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const trackClick = useCallback(async (linkId: string, bioButtonId?: string) => {
    try {
      await supabase.functions.invoke('click-tracker', {
        body: {
          link_id: linkId,
          bio_button_id: bioButtonId,
          referer: document.referrer,
          user_agent: navigator.userAgent,
        },
      });
    } catch (err) {
      // Silent fail - tracking should not block user experience
      console.error('Click tracking failed:', err);
    }
  }, []);

  return {
    resolveShareUrl,
    trackClick,
    isLoading,
    error,
  };
}
