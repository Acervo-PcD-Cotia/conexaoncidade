import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  newsId: string;
  sessionId: string;
  userId?: string;
  timeOnPageSeconds: number;
  scrollDepthPercent: number;
  scrollDepthMax: number;
  audioPlayed: boolean;
  audioPlayCount: number;
  audioTotalListenSeconds: number;
  podcastPlayed: boolean;
  podcastPlayCount: number;
  summaryExpanded: boolean;
  tocClicked: boolean;
  shared: boolean;
  sharePlatform?: string;
  referrer?: string;
  userAgent?: string;
  deviceType?: string;
  viewportWidth?: number;
  readCompleted: boolean;
}

const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('news_session_id');
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    sessionStorage.setItem('news_session_id', sessionId);
  }
  return sessionId;
};

const getDeviceType = (): string => {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

export function useNewsAnalytics(newsId: string) {
  // Validate newsId - must be a non-empty string (UUID)
  const isValidId = newsId && newsId.length > 0 && newsId !== '';

  const [analytics, setAnalytics] = useState<AnalyticsData>({
    newsId,
    sessionId: '',
    timeOnPageSeconds: 0,
    scrollDepthPercent: 0,
    scrollDepthMax: 0,
    audioPlayed: false,
    audioPlayCount: 0,
    audioTotalListenSeconds: 0,
    podcastPlayed: false,
    podcastPlayCount: 0,
    summaryExpanded: false,
    tocClicked: false,
    shared: false,
    readCompleted: false,
  });

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioStartTimeRef = useRef<number | null>(null);
  const isActiveRef = useRef(true);

  // Initialize session - only if newsId is valid
  useEffect(() => {
    if (!isValidId) return;

    const sessionId = getSessionId();
    
    supabase.auth.getUser().then(({ data }) => {
      setAnalytics(prev => ({
        ...prev,
        newsId,
        sessionId,
        userId: data.user?.id,
        referrer: document.referrer || undefined,
        userAgent: navigator.userAgent,
        deviceType: getDeviceType(),
        viewportWidth: window.innerWidth,
      }));
    });

    return () => {
      isActiveRef.current = false;
    };
  }, [newsId, isValidId]);

  // Time tracking
  useEffect(() => {
    if (!isValidId || !analytics.sessionId) return;

    const interval = setInterval(() => {
      if (isActiveRef.current && document.visibilityState === 'visible') {
        setAnalytics(prev => ({
          ...prev,
          timeOnPageSeconds: prev.timeOnPageSeconds + 1,
        }));
      }
    }, 1000);

    const handleVisibilityChange = () => {
      isActiveRef.current = document.visibilityState === 'visible';
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isValidId, analytics.sessionId]);

  // Scroll tracking
  useEffect(() => {
    if (!isValidId || !analytics.sessionId) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollTop = window.scrollY;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          
          if (docHeight > 0) {
            const scrollPercent = Math.min(100, Math.round((scrollTop / docHeight) * 100));
            
            setAnalytics(prev => ({
              ...prev,
              scrollDepthPercent: scrollPercent,
              scrollDepthMax: Math.max(prev.scrollDepthMax, scrollPercent),
              readCompleted: scrollPercent >= 85 || prev.readCompleted,
            }));
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isValidId, analytics.sessionId]);

  // Debounced save to database
  useEffect(() => {
    if (!isValidId || !analytics.sessionId || analytics.timeOnPageSeconds < 3) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveAnalytics(analytics);
    }, 5000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [isValidId, analytics]);

  // Save on page unload
  useEffect(() => {
    if (!isValidId) return;

    const handleBeforeUnload = () => {
      if (analytics.sessionId && analytics.timeOnPageSeconds >= 3) {
        saveAnalytics(analytics);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isValidId, analytics]);

  const saveAnalytics = async (data: AnalyticsData) => {
    try {
      await supabase.functions.invoke('track-reading-analytics', {
        body: {
          news_id: data.newsId,
          session_id: data.sessionId,
          user_id: data.userId,
          time_on_page_seconds: data.timeOnPageSeconds,
          scroll_depth_percent: data.scrollDepthPercent,
          scroll_depth_max: data.scrollDepthMax,
          audio_played: data.audioPlayed,
          audio_play_count: data.audioPlayCount,
          audio_total_listen_seconds: data.audioTotalListenSeconds,
          podcast_played: data.podcastPlayed,
          podcast_play_count: data.podcastPlayCount,
          summary_expanded: data.summaryExpanded,
          toc_clicked: data.tocClicked,
          shared: data.shared,
          share_platform: data.sharePlatform,
          referrer: data.referrer,
          user_agent: data.userAgent,
          device_type: data.deviceType,
          viewport_width: data.viewportWidth,
          read_completed: data.readCompleted,
        },
      });
    } catch (error) {
      console.error('[useNewsAnalytics] Error saving analytics:', error);
    }
  };

  // Callbacks for tracking interactions
  const trackAudioPlay = useCallback(() => {
    audioStartTimeRef.current = Date.now();
    setAnalytics(prev => ({
      ...prev,
      audioPlayed: true,
      audioPlayCount: prev.audioPlayCount + 1,
    }));
  }, []);

  const trackAudioStop = useCallback(() => {
    if (audioStartTimeRef.current) {
      const listenTime = Math.round((Date.now() - audioStartTimeRef.current) / 1000);
      audioStartTimeRef.current = null;
      setAnalytics(prev => ({
        ...prev,
        audioTotalListenSeconds: prev.audioTotalListenSeconds + listenTime,
      }));
    }
  }, []);

  const trackPodcastPlay = useCallback(() => {
    setAnalytics(prev => ({
      ...prev,
      podcastPlayed: true,
      podcastPlayCount: prev.podcastPlayCount + 1,
    }));
  }, []);

  const trackSummaryExpand = useCallback(() => {
    setAnalytics(prev => ({
      ...prev,
      summaryExpanded: true,
    }));
  }, []);

  const trackTocClick = useCallback(() => {
    setAnalytics(prev => ({
      ...prev,
      tocClicked: true,
    }));
  }, []);

  const trackShare = useCallback((platform?: string) => {
    setAnalytics(prev => ({
      ...prev,
      shared: true,
      sharePlatform: platform || prev.sharePlatform,
    }));
  }, []);

  return {
    analytics,
    trackAudioPlay,
    trackAudioStop,
    trackPodcastPlay,
    trackSummaryExpand,
    trackTocClick,
    trackShare,
  };
}
