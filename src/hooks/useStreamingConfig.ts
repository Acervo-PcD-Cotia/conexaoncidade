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
  const { tenantId, hasTenant, isLoading: tenantLoading, error: tenantError } = useAdminTenant();
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
      toast.error(error instanceof Error ? error.message : "Erro ao salvar configuração");
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: async (): Promise<TestResultV2> => {
      if (!hasTenant || !tenantId) {
        throw new Error("Selecione um site para continuar");
      }

      const { data, error } = await supabase.functions.invoke(
        `streaming-gateway/${kind}/status`,
        {
          headers: {
            "x-tenant-id": tenantId,
          },
          body: { format: "v2" },
        }
      );

      if (error) throw error;
      if (data?.code === "NOT_CONFIGURED") {
        return {
          ok: false,
          kind,
          error: { message: "Configuração não encontrada" },
        };
      }
      
      // Add latencyMs from response or calculate approximate
      return {
        ...data,
        ok: !data?.error,
      } as TestResultV2;
    },
  });

  return {
    config,
    isLoading: tenantLoading || configLoading,
    error: tenantError || (error instanceof Error ? error.message : null),
    hasTenant,
    tenantId,
    save: saveMutation.mutate,
    isSaving: saveMutation.isPending,
    testConnection: testConnectionMutation.mutateAsync,
    isTestingConnection: testConnectionMutation.isPending,
    testResult: testConnectionMutation.data,
    testError: testConnectionMutation.error,
  };
}
