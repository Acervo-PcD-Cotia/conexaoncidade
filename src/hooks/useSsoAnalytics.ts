import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";
import { subDays, startOfDay, endOfDay, format, parseISO } from "date-fns";

export interface SsoLog {
  id: string;
  action: string;
  created_at: string;
  entity_id: string | null;
  user_id: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
}

export interface SsoStats {
  totalGenerated: number;
  totalExchanged: number;
  totalFailed: number;
  successRate: string;
  avgExchangeTimeMs: number;
  failuresByReason: Record<string, number>;
}

export interface SsoChartData {
  date: string;
  success: number;
  failed: number;
}

export interface SsoSecurityAlert {
  id: string;
  level: "warning" | "critical";
  message: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

export function useSsoAnalytics(days: number = 7) {
  const dateRange = useMemo(() => {
    const end = endOfDay(new Date());
    const start = startOfDay(subDays(new Date(), days));
    return { start, end };
  }, [days]);

  const logsQuery = useQuery({
    queryKey: ["sso-logs", days],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .eq("entity_type", "sso")
        .gte("created_at", dateRange.start.toISOString())
        .lte("created_at", dateRange.end.toISOString())
        .order("created_at", { ascending: false })
        .limit(1000);

      if (error) throw error;
      return (data as SsoLog[]) || [];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const stats = useMemo<SsoStats>(() => {
    const logs = logsQuery.data || [];
    
    const generated = logs.filter(l => l.action === "sso_code_generated");
    const exchanged = logs.filter(l => l.action === "sso_code_exchanged");
    const failed = logs.filter(l => l.action === "sso_exchange_failed");
    
    // Calculate average exchange time
    let totalExchangeTime = 0;
    let exchangeCount = 0;
    
    exchanged.forEach(ex => {
      const newData = ex.new_data as Record<string, unknown> | null;
      if (newData?.exchange_time_ms) {
        totalExchangeTime += Number(newData.exchange_time_ms);
        exchangeCount++;
      }
    });
    
    // Group failures by reason
    const failuresByReason: Record<string, number> = {};
    failed.forEach(f => {
      const newData = f.new_data as Record<string, unknown> | null;
      const reason = (newData?.reason as string) || "unknown";
      failuresByReason[reason] = (failuresByReason[reason] || 0) + 1;
    });
    
    const successRate = generated.length > 0
      ? ((exchanged.length / generated.length) * 100).toFixed(1)
      : "0.0";
    
    return {
      totalGenerated: generated.length,
      totalExchanged: exchanged.length,
      totalFailed: failed.length,
      successRate,
      avgExchangeTimeMs: exchangeCount > 0 ? Math.round(totalExchangeTime / exchangeCount) : 0,
      failuresByReason,
    };
  }, [logsQuery.data]);

  const chartData = useMemo<SsoChartData[]>(() => {
    const logs = logsQuery.data || [];
    const dailyData: Record<string, { success: number; failed: number }> = {};
    
    // Initialize all days in range
    for (let i = 0; i <= days; i++) {
      const date = format(subDays(new Date(), i), "yyyy-MM-dd");
      dailyData[date] = { success: 0, failed: 0 };
    }
    
    logs.forEach(log => {
      const date = format(parseISO(log.created_at), "yyyy-MM-dd");
      if (!dailyData[date]) return;
      
      if (log.action === "sso_code_exchanged") {
        dailyData[date].success++;
      } else if (log.action === "sso_exchange_failed") {
        dailyData[date].failed++;
      }
    });
    
    return Object.entries(dailyData)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [logsQuery.data, days]);

  const securityAlerts = useMemo<SsoSecurityAlert[]>(() => {
    const logs = logsQuery.data || [];
    const alerts: SsoSecurityAlert[] = [];
    
    // Detect multiple failures from same IP within 5 minutes
    const failedByIp: Record<string, SsoLog[]> = {};
    const failedLogs = logs.filter(l => l.action === "sso_exchange_failed");
    
    failedLogs.forEach(log => {
      const newData = log.new_data as Record<string, unknown> | null;
      const ip = (newData?.ip as string) || "unknown";
      if (!failedByIp[ip]) failedByIp[ip] = [];
      failedByIp[ip].push(log);
    });
    
    Object.entries(failedByIp).forEach(([ip, ipLogs]) => {
      if (ipLogs.length >= 5) {
        alerts.push({
          id: `ip-${ip}-${Date.now()}`,
          level: ipLogs.length >= 10 ? "critical" : "warning",
          message: `IP ${ip.substring(0, 8)}... teve ${ipLogs.length} tentativas falhas`,
          timestamp: ipLogs[0].created_at,
          details: { ip, count: ipLogs.length },
        });
      }
    });
    
    // Detect rate limit hits
    const rateLimited = failedLogs.filter(l => {
      const newData = l.new_data as Record<string, unknown> | null;
      return newData?.reason === "rate_limited";
    });
    
    if (rateLimited.length > 0) {
      alerts.push({
        id: `rate-limit-${Date.now()}`,
        level: "warning",
        message: `${rateLimited.length} tentativas bloqueadas por rate limit`,
        timestamp: rateLimited[0].created_at,
        details: { count: rateLimited.length },
      });
    }
    
    // Detect expired code reuse
    const expiredReuse = failedLogs.filter(l => {
      const newData = l.new_data as Record<string, unknown> | null;
      return newData?.reason === "code_expired" || newData?.reason === "code_already_used";
    });
    
    if (expiredReuse.length >= 3) {
      alerts.push({
        id: `expired-reuse-${Date.now()}`,
        level: "warning",
        message: `${expiredReuse.length} tentativas de reutilizar códigos expirados/usados`,
        timestamp: expiredReuse[0].created_at,
        details: { count: expiredReuse.length },
      });
    }
    
    return alerts.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [logsQuery.data]);

  return {
    logs: logsQuery.data || [],
    stats,
    chartData,
    securityAlerts,
    isLoading: logsQuery.isLoading,
    isError: logsQuery.isError,
    refetch: logsQuery.refetch,
  };
}
