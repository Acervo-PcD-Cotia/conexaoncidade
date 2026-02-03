import { supabase } from '@/integrations/supabase/client';

// Match the DB enum for event_type
export type EventType = 
  | 'impression' 
  | 'click' 
  | 'cta_click' 
  | 'story_open'
  | 'slide_view'
  | 'story_complete'
  | 'push_sent'
  | 'push_delivered'
  | 'newsletter_sent'
  | 'newsletter_open';

// Match the DB enum for channel_type
export type ChannelType = 
  | 'ads'
  | 'publidoor' 
  | 'webstories' 
  | 'push' 
  | 'newsletter' 
  | 'exit_intent' 
  | 'login_panel';

export interface TrackEventParams {
  campaignId: string;
  cycleId?: string;
  channelType: ChannelType;
  eventType: EventType;
  metadata?: Record<string, unknown>;
}

/**
 * Generate or retrieve a unique session ID for tracking
 */
export function getSessionId(): string {
  if (typeof window === 'undefined') return 'ssr-session';
  
  let sessionId = sessionStorage.getItem('campaign_session_id');
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('campaign_session_id', sessionId);
  }
  return sessionId;
}

/**
 * Get device type from user agent
 */
export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  
  const ua = navigator.userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile/i.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

/**
 * Track a campaign event
 * Used by: InlineAdSlot, ExitIntentModal, LoginPanelAd, WebStoriesViewer, Ads, Super Banners
 */
export async function trackCampaignEvent({
  campaignId,
  cycleId,
  channelType,
  eventType,
  metadata = {},
}: TrackEventParams): Promise<void> {
  try {
    const sessionId = getSessionId();
    const deviceType = getDeviceType();
    
    // Capture URL and referrer
    const pageUrl = typeof window !== 'undefined' ? window.location.href : undefined;
    const referrer = typeof document !== 'undefined' ? document.referrer : undefined;

    await supabase.from('campaign_events').insert([{
      campaign_id: campaignId,
      cycle_id: cycleId,
      event_type: eventType,
      channel_type: channelType,
      session_id: sessionId,
      metadata: {
        ...metadata,
        device_type: deviceType,
        page_url: pageUrl,
        referrer: referrer,
        timestamp: new Date().toISOString(),
      },
    }]);
  } catch (error) {
    console.error('[trackCampaignEvent] Failed to track event:', error);
  }
}

/**
 * Hook wrapper for tracking impressions
 */
export function useTrackImpression() {
  return (campaignId: string, channelType: ChannelType, metadata?: Record<string, unknown>, cycleId?: string) => {
    trackCampaignEvent({
      campaignId,
      cycleId,
      channelType,
      eventType: 'impression',
      metadata,
    });
  };
}

/**
 * Hook wrapper for tracking clicks
 */
export function useTrackClick() {
  return (campaignId: string, channelType: ChannelType, metadata?: Record<string, unknown>, cycleId?: string) => {
    trackCampaignEvent({
      campaignId,
      cycleId,
      channelType,
      eventType: 'click',
      metadata,
    });
  };
}

/**
 * Hook wrapper for tracking CTA clicks
 */
export function useTrackCTAClick() {
  return (campaignId: string, channelType: ChannelType, metadata?: Record<string, unknown>, cycleId?: string) => {
    trackCampaignEvent({
      campaignId,
      cycleId,
      channelType,
      eventType: 'cta_click',
      metadata,
    });
  };
}
