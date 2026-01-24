import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PlatformStatus {
  configured: boolean;
  connected: boolean;
  error?: string;
  lastCheck?: Date;
}

export interface ExternalChatStatus {
  youtube: PlatformStatus;
  facebook: PlatformStatus;
  isChecking: boolean;
}

export function useExternalChatStatus(sessionId?: string) {
  const [status, setStatus] = useState<ExternalChatStatus>({
    youtube: { configured: false, connected: false },
    facebook: { configured: false, connected: false },
    isChecking: true,
  });

  const checkYouTubeStatus = useCallback(async () => {
    if (!sessionId) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('conexao-chat-youtube', {
        body: { live_chat_id: sessionId, check_only: true },
      });
      
      if (error) {
        setStatus(prev => ({
          ...prev,
          youtube: {
            configured: false,
            connected: false,
            error: error.message,
            lastCheck: new Date(),
          },
        }));
        return;
      }
      
      setStatus(prev => ({
        ...prev,
        youtube: {
          configured: data.is_configured ?? false,
          connected: data.is_configured ?? false,
          lastCheck: new Date(),
        },
      }));
    } catch (err) {
      console.error('[useExternalChatStatus] YouTube check error:', err);
      setStatus(prev => ({
        ...prev,
        youtube: {
          configured: false,
          connected: false,
          error: 'Failed to check YouTube status',
          lastCheck: new Date(),
        },
      }));
    }
  }, [sessionId]);

  const checkFacebookStatus = useCallback(async () => {
    if (!sessionId) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('conexao-chat-facebook', {
        body: { video_id: sessionId, check_only: true },
      });
      
      if (error) {
        setStatus(prev => ({
          ...prev,
          facebook: {
            configured: false,
            connected: false,
            error: error.message,
            lastCheck: new Date(),
          },
        }));
        return;
      }
      
      setStatus(prev => ({
        ...prev,
        facebook: {
          configured: data.is_configured ?? false,
          connected: data.is_configured ?? false,
          lastCheck: new Date(),
        },
      }));
    } catch (err) {
      console.error('[useExternalChatStatus] Facebook check error:', err);
      setStatus(prev => ({
        ...prev,
        facebook: {
          configured: false,
          connected: false,
          error: 'Failed to check Facebook status',
          lastCheck: new Date(),
        },
      }));
    }
  }, [sessionId]);

  const checkAll = useCallback(async () => {
    setStatus(prev => ({ ...prev, isChecking: true }));
    await Promise.all([checkYouTubeStatus(), checkFacebookStatus()]);
    setStatus(prev => ({ ...prev, isChecking: false }));
  }, [checkYouTubeStatus, checkFacebookStatus]);

  useEffect(() => {
    if (sessionId) {
      checkAll();
    }
  }, [sessionId, checkAll]);

  return {
    ...status,
    refresh: checkAll,
  };
}
