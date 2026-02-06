import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { PortalTemplate } from "@/types/portal-templates";

export function usePortalTemplates() {
  return useQuery({
    queryKey: ["portal-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portal_templates" as any)
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return (data || []) as unknown as PortalTemplate[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes — templates rarely change
    gcTime: 15 * 60 * 1000,
  });
}

export function usePortalTemplate(templateId: string | null | undefined) {
  return useQuery({
    queryKey: ["portal-template", templateId],
    queryFn: async () => {
      if (!templateId) return null;
      
      const { data, error } = await supabase
        .from("portal_templates" as any)
        .select("*")
        .eq("id", templateId)
        .single();

      if (error) throw error;
      return data as unknown as PortalTemplate;
    },
    enabled: !!templateId,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

export function usePortalTemplateByKey(key: string | null | undefined) {
  return useQuery({
    queryKey: ["portal-template-key", key],
    queryFn: async () => {
      if (!key) return null;
      
      const { data, error } = await supabase
        .from("portal_templates" as any)
        .select("*")
        .eq("key", key)
        .single();

      if (error) throw error;
      return data as unknown as PortalTemplate;
    },
    enabled: !!key,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}
