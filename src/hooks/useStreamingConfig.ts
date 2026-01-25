import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminTenant } from "@/hooks/useAdminTenant";
import { toast } from "sonner";

export interface ExternalStreamingConfig {
  id: string;
  tenant_id: string;
  kind: "radio" | "tv";
  is_active: boolean;
  api_json_url: string | null;
  api_xml_url: string | null;
  embed_mode: "iframe" | "html" | "url";
  embed_code: string | null;
  player_url: string | null;
  public_page_path: string;
  external_panel_url: string | null;
  notes: string | null;
  last_snapshot: Record<string, unknown> | null;
  last_fetched_at: string | null;
  error_count: number;
  last_error: string | null;
  created_at: string;
  updated_at: string;
}

export interface StreamingConfigInput {
  api_json_url?: string | null;
  api_xml_url?: string | null;
  embed_mode?: "iframe" | "html" | "url";
  embed_code?: string | null;
  player_url?: string | null;
  public_page_path?: string;
  external_panel_url?: string | null;
  notes?: string | null;
  is_active?: boolean;
}

export interface TestResultV2 {
  ok: boolean;
  kind: "radio" | "tv";
  isLive?: boolean;
  listenersNow?: number;
  viewersNow?: number;
  bitrateKbps?: number;
  nowPlaying?: string | null;
  stationName?: string;
  latencyMs?: number;
  checkedAt?: string;
  error?: { message: string; statusCode?: number };
}

export function useStreamingConfig(kind: "radio" | "tv") {
  const { tenantId, hasTenant, isLoading: tenantLoading, error: tenantError, availableSites } = useAdminTenant();
  const queryClient = useQueryClient();

  const queryKey = ["streaming-config", tenantId, kind];

  const { data: config, isLoading: configLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!tenantId) return null;

      const { data, error } = await supabase
        .from("external_streaming_configs")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("kind", kind)
        .maybeSingle();

      if (error) throw error;
      return data as ExternalStreamingConfig | null;
    },
    enabled: !!tenantId && !tenantLoading,
    staleTime: 30_000, // Cache for 30 seconds
  });

  const saveMutation = useMutation({
    mutationFn: async (input: StreamingConfigInput) => {
      if (!hasTenant || !tenantId) {
        throw new Error("Selecione um site para continuar");
      }

      if (config) {
        // Update existing
        const { data, error } = await supabase
          .from("external_streaming_configs")
          .update({
            ...input,
            updated_at: new Date().toISOString(),
          })
          .eq("id", config.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new
        const { data, error } = await supabase
          .from("external_streaming_configs")
          .insert({
            tenant_id: tenantId,
            kind,
            ...input,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Configuração salva com sucesso!");
    },
    onError: (error) => {
      console.error("Error saving streaming config:", error);
      const message = error instanceof Error ? error.message : "Erro ao salvar configuração";
      
      // Provide clearer error messages for common issues
      if (message.includes("violates row-level security")) {
        toast.error("Sem permissão para salvar. Verifique se você tem acesso a este site.");
      } else if (message.includes("duplicate key")) {
        toast.error("Configuração já existe para este site.");
      } else {
        toast.error(message);
      }
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: async (): Promise<TestResultV2> => {
      if (!hasTenant || !tenantId) {
        throw new Error("Selecione um site para continuar");
      }

      const startTime = Date.now();
      
      // Use fetch with GET and query params for better compatibility
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/streaming-gateway/${kind}/status?format=v2`,
        {
          method: "GET",
          headers: {
            "x-tenant-id": tenantId,
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        }
      );

      const latencyMs = Date.now() - startTime;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData?.code === "NOT_CONFIGURED") {
          return {
            ok: false,
            kind,
            latencyMs,
            error: { message: "Ainda não configurado. Salve a URL da API primeiro." },
          };
        }
        throw new Error(errorData?.message || `Erro ${response.status}`);
      }

      const data = await response.json();
      
      if (data?.code === "NOT_CONFIGURED") {
        return {
          ok: false,
          kind,
          latencyMs,
          error: { message: "Ainda não configurado. Salve a URL da API primeiro." },
        };
      }
      
      return {
        ...data,
        ok: !data?.error,
        latencyMs,
      } as TestResultV2;
    },
  });

  return {
    config,
    isLoading: tenantLoading || configLoading,
    error: tenantError || (error instanceof Error ? error.message : null),
    hasTenant,
    tenantId,
    availableSites,
    save: saveMutation.mutate,
    isSaving: saveMutation.isPending,
    testConnection: testConnectionMutation.mutateAsync,
    isTestingConnection: testConnectionMutation.isPending,
    testResult: testConnectionMutation.data,
    testError: testConnectionMutation.error,
  };
}
