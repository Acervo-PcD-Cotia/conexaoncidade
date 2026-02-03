import { useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { DeviceType } from '@/lib/adFormats';

interface AdMetricsOptions {
  adId: string;
  source: 'publidoor' | 'ads';
  sessionId?: string;
  device?: DeviceType;
}

/**
 * Hook for tracking ad metrics: impressions, clicks, and view time
 */
export function useAdMetrics({ adId, source, sessionId, device = 'desktop' }: AdMetricsOptions) {
  const viewStartTime = useRef<number | null>(null);
  const hasTrackedImpression = useRef(false);

  // Generate or get session ID
  const getSessionId = useCallback(() => {
    if (sessionId) return sessionId;
    if (typeof window === 'undefined') return '';
    
    const stored = sessionStorage.getItem('ad_session_id');
    if (stored) return stored;
    
    const newId = crypto.randomUUID();
    sessionStorage.setItem('ad_session_id', newId);
    return newId;
  }, [sessionId]);

  /**
   * Track an impression (view) for this ad
   */
  const trackImpression = useCallback(async () => {
    if (hasTrackedImpression.current || !adId) return;
    hasTrackedImpression.current = true;
    viewStartTime.current = Date.now();

    try {
      if (source === 'ads') {
        // For legacy ads table, just increment counter
        const { data: ad } = await supabase
          .from('ads')
          .select('impression_count')
          .eq('id', adId)
          .single();
        
        if (ad) {
          await supabase
            .from('ads')
            .update({ impression_count: (ad.impression_count || 0) + 1 })
            .eq('id', adId);
        }
      } else {
        // For publidoor, use the aggregated metrics table
        const today = new Date().toISOString().split('T')[0];
        
        // Try to update existing record or insert new one
        const { data: existing } = await supabase
          .from('publidoor_metrics')
          .select('id, impressions')
          .eq('publidoor_id', adId)
          .eq('date', today)
          .eq('device', device)
          .maybeSingle();
        
        if (existing) {
          await supabase
            .from('publidoor_metrics')
            .update({ impressions: (existing.impressions || 0) + 1 })
            .eq('id', existing.id);
        } else {
          await supabase.from('publidoor_metrics').insert({
            publidoor_id: adId,
            date: today,
            device,
            impressions: 1,
            clicks: 0,
          });
        }
      }
    } catch (error) {
      console.error('Failed to track impression:', error);
    }
  }, [adId, source, device]);

  /**
   * Track a click on this ad
   */
  const trackClick = useCallback(async (_x?: number, _y?: number) => {
    if (!adId) return;

    try {
      if (source === 'ads') {
        // For legacy ads table
        const { data: ad } = await supabase
          .from('ads')
          .select('click_count')
          .eq('id', adId)
          .single();
        
        if (ad) {
          await supabase
            .from('ads')
            .update({ click_count: (ad.click_count || 0) + 1 })
            .eq('id', adId);
        }
      } else {
        // For publidoor
        const today = new Date().toISOString().split('T')[0];
        
        const { data: existing } = await supabase
          .from('publidoor_metrics')
          .select('id, clicks')
          .eq('publidoor_id', adId)
          .eq('date', today)
          .eq('device', device)
          .maybeSingle();
        
        if (existing) {
          await supabase
            .from('publidoor_metrics')
            .update({ clicks: (existing.clicks || 0) + 1 })
            .eq('id', existing.id);
        } else {
          await supabase.from('publidoor_metrics').insert({
            publidoor_id: adId,
            date: today,
            device,
            impressions: 0,
            clicks: 1,
          });
        }
      }
    } catch (error) {
      console.error('Failed to track click:', error);
    }
  }, [adId, source, device]);

  /**
   * Track view time when component unmounts or ad changes
   */
  const trackViewTime = useCallback(async () => {
    if (!viewStartTime.current || !adId) return;

    const viewTimeMs = Date.now() - viewStartTime.current;
    viewStartTime.current = null;

    // Only track if viewed for more than 1 second
    if (viewTimeMs < 1000) return;

    try {
      if (source === 'publidoor') {
        const today = new Date().toISOString().split('T')[0];
        const viewTimeSeconds = Math.round(viewTimeMs / 1000);
        
        const { data: existing } = await supabase
          .from('publidoor_metrics')
          .select('id, avg_time_on_screen, impressions')
          .eq('publidoor_id', adId)
          .eq('date', today)
          .eq('device', device)
          .maybeSingle();
        
        if (existing) {
          // Calculate new average
          const currentImpressions = existing.impressions || 1;
          const currentAvg = existing.avg_time_on_screen || 0;
          const newAvg = Math.round(
            (currentAvg * (currentImpressions - 1) + viewTimeSeconds) / currentImpressions
          );
          
          await supabase
            .from('publidoor_metrics')
            .update({ avg_time_on_screen: newAvg })
            .eq('id', existing.id);
        }
      }
    } catch (error) {
      console.error('Failed to track view time:', error);
    }
  }, [adId, source, device]);

  // Track view time on unmount
  useEffect(() => {
    return () => {
      trackViewTime();
    };
  }, [trackViewTime]);

  return {
    trackImpression,
    trackClick,
    trackViewTime,
  };
}
