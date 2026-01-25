import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenantContext } from "@/contexts/TenantContext";

// Legacy interfaces for backward compatibility
export interface RadioStatus {
  kind: "radio";
  isOnline: boolean;
  statusText: string;
  listeners: number;
  title: string;
  nowPlaying: {
    track: string;
    artist: string;
    song: string;
    coverUrl: string | null;
    genre: string | null;
  } | null;
  nextPlaying: { track: string } | null;
  endpoints: {
    shoutcast?: string;
    rtmp?: string;
    rtsp?: string;
  };
  fetchedAt: string;
  fromCache?: boolean;
  error?: string;
}

export interface TvStatus {
  kind: "tv";
  isOnline: boolean;
  statusText: string;
  viewers: number;
  plan: {
    viewersLimit: number;
    ftpLimit: string;
    bitrate: string;
  } | null;
  endpoints: {
    rtmp?: string;
    rtsp?: string;
  };
  fetchedAt: string;
  fromCache?: boolean;
  error?: string;
}

// V2 interfaces with enhanced data
export interface RadioStatusV2 {
  ok: boolean;
  kind: "radio";
  isLive: boolean;
  listenersNow: number;
  bitrateKbps: number;
  nowPlaying: string | null;
  nextUp: string | null;
  stationName: string;
  genre: string | null;
  artworkUrl: string | null;
  plan: { maxListeners: number; ftp: string } | null;
  endpoints: { shoutcast?: string; rtmp?: string; rtsp?: string };
  latencyMs?: number;
  checkedAt: string;
  fromCache?: boolean;
  error?: { message: string; statusCode?: number };
}

export interface TvStatusV2 {
  ok: boolean;
  kind: "tv";
  isLive: boolean;
  viewersNow: number;
  bitrateKbps: number;
  plan: { maxViewers: number; ftp: string } | null;
  serverIp: string | null;
  endpoints: { rtmp?: string; rtsp?: string };
  latencyMs?: number;
  checkedAt: string;
  fromCache?: boolean;
  error?: { message: string; statusCode?: number };
}

export interface StreamingConfig {
  id: string;
  kind: "radio" | "tv";
  is_active: boolean;
  embed_mode: "iframe" | "html" | "url";
  embed_code: string | null;
  player_url: string | null;
  external_panel_url: string | null;
  has_api: boolean;
}

interface UseStreamingStatusOptions {
  kind: "radio" | "tv";
  pollingInterval?: number; // in milliseconds, default 30000 (30s)
  enabled?: boolean;
}

interface UseStreamingStatusReturn<T> {
  status: T | null;
  config: StreamingConfig | null;
  isLoading: boolean;
  isConfigured: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
}

export function useStreamingStatus<T extends RadioStatus | TvStatus = RadioStatus | TvStatus>(
  options: UseStreamingStatusOptions
): UseStreamingStatusReturn<T> {
  const { kind, pollingInterval = 30000, enabled = true } = options;
  const { currentTenantId, isLoading: tenantLoading } = useTenantContext();
  
  const [status, setStatus] = useState<T | null>(null);
  const [config, setConfig] = useState<StreamingConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStatus = useCallback(async () => {
    // Don't fetch if tenant is still loading or not set
    if (tenantLoading || !currentTenantId || !enabled) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: invokeError } = await supabase.functions.invoke(
        `streaming-gateway/${kind}/status`,
        {
          headers: {
            "x-tenant-id": currentTenantId,
          },
        }
      );

      // Handle NOT_CONFIGURED response (can come as data or error)
      if (data?.code === "NOT_CONFIGURED") {
        setStatus(null);
        setConfig(null);
        setError(null);
        return;
      }

      if (invokeError) {
        // Try to parse error body as JSON to check for NOT_CONFIGURED
        try {
          const errorBody = typeof invokeError === 'object' && invokeError.context?.body 
            ? JSON.parse(invokeError.context.body) 
            : null;
          if (errorBody?.code === "NOT_CONFIGURED") {
            setStatus(null);
            setConfig(null);
            setError(null);
            return;
          }
        } catch {
          // Not JSON, continue with normal error handling
        }
        throw invokeError;
      }

      setStatus(data as T);
      setError(data?.error || null);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(`Error fetching ${kind} status:`, err);
      setError(err instanceof Error ? err.message : "Erro ao buscar status");
    } finally {
      setIsLoading(false);
    }
  }, [currentTenantId, kind, enabled, tenantLoading]);

  const fetchConfig = useCallback(async () => {
    if (tenantLoading || !currentTenantId || !enabled) {
      return;
    }

    try {
      const { data, error: invokeError } = await supabase.functions.invoke(
        `streaming-gateway/${kind}/config`,
        {
          headers: {
            "x-tenant-id": currentTenantId,
          },
        }
      );

      if (invokeError) {
        if (!invokeError.message?.includes("404")) {
          console.error(`Error fetching ${kind} config:`, invokeError);
        }
        setConfig(null);
      } else if (data?.code === "NOT_CONFIGURED") {
        setConfig(null);
      } else {
        setConfig(data as StreamingConfig);
      }
    } catch (err) {
      console.error(`Error fetching ${kind} config:`, err);
      setConfig(null);
    }
  }, [currentTenantId, kind, enabled, tenantLoading]);

  // Initial fetch when tenant is ready
  useEffect(() => {
    if (enabled && currentTenantId && !tenantLoading) {
      setIsLoading(true);
      Promise.all([fetchStatus(), fetchConfig()]).finally(() => {
        setIsLoading(false);
      });
    } else if (!tenantLoading && !currentTenantId) {
      // No tenant available, stop loading
      setIsLoading(false);
      setStatus(null);
      setConfig(null);
    }
  }, [fetchStatus, fetchConfig, enabled, currentTenantId, tenantLoading]);

  // Polling
  useEffect(() => {
    if (!enabled || !currentTenantId || pollingInterval <= 0 || tenantLoading) {
      return;
    }

    const interval = setInterval(() => {
      fetchStatus();
    }, pollingInterval);

    return () => clearInterval(interval);
  }, [fetchStatus, pollingInterval, enabled, currentTenantId, tenantLoading]);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchStatus(), fetchConfig()]);
    setIsLoading(false);
  }, [fetchStatus, fetchConfig]);

  return {
    status,
    config,
    isLoading: isLoading || tenantLoading,
    isConfigured: config !== null,
    error,
    lastUpdated,
    refetch,
  };
}

export function useRadioStatus(options?: Omit<UseStreamingStatusOptions, "kind">) {
  return useStreamingStatus<RadioStatus>({ kind: "radio", ...options });
}

export function useTvStatus(options?: Omit<UseStreamingStatusOptions, "kind">) {
  return useStreamingStatus<TvStatus>({ kind: "tv", ...options });
}
