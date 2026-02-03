import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { BairroGuia } from "../types";

export function useBairrosGuia(cidade?: string) {
  return useQuery({
    queryKey: ["bairros-guia", cidade],
    queryFn: async () => {
      let query = supabase
        .from("bairros_guia")
        .select("*")
        .eq("is_active", true)
        .order("nome");

      if (cidade) {
        query = query.eq("cidade", cidade);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []) as BairroGuia[];
    },
  });
}

export function useBairroGuia(cidade: string, slug: string) {
  return useQuery({
    queryKey: ["bairro-guia", cidade, slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bairros_guia")
        .select("*")
        .eq("cidade", cidade)
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (error) throw error;

      return data as BairroGuia;
    },
    enabled: !!cidade && !!slug,
  });
}
