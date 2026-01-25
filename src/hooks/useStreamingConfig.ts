import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenantContext } from "@/contexts/TenantContext";
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

export function useStreamingConfig(kind: "radio" | "tv") {
  const { currentTenantId } = useTenantContext();
  const queryClient = useQueryClient();

  const queryKey = ["streaming-config", currentTenantId, kind];

  const { data: config, isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!currentTenantId) return null;

      const { data, error } = await supabase
        .from("external_streaming_configs")
        .select("*")
        .eq("tenant_id", currentTenantId)
        .eq("kind", kind)
        .maybeSingle();

      if (error) throw error;
      return data as ExternalStreamingConfig | null;
    },
    enabled: !!currentTenantId,
  });

  const saveMutation = useMutation({
    mutationFn: async (input: StreamingConfigInput) => {
      if (!currentTenantId) throw new Error("Tenant não selecionado");

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
            tenant_id: currentTenantId,
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
      toast.error("Erro ao salvar configuração");
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      if (!currentTenantId) throw new Error("Tenant não selecionado");

      const { data, error } = await supabase.functions.invoke(
        `streaming-gateway/${kind}/status`,
        {
          headers: {
            "x-tenant-id": currentTenantId,
          },
        }
      );

      if (error) throw error;
      if (data?.code === "NOT_CONFIGURED") {
        throw new Error("Configuração não encontrada");
      }
      return data;
    },
  });

  return {
    config,
    isLoading,
    error,
    save: saveMutation.mutate,
    isSaving: saveMutation.isPending,
    testConnection: testConnectionMutation.mutateAsync,
    isTestingConnection: testConnectionMutation.isPending,
    testResult: testConnectionMutation.data,
    testError: testConnectionMutation.error,
  };
}
