import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Anunciante } from "../types";

export function useAnunciantes(cidade?: string) {
  return useQuery({
    queryKey: ["anunciantes", cidade],
    queryFn: async () => {
      let query = supabase
        .from("anunciantes")
        .select("*")
        .eq("is_active", true)
        .order("total_imoveis", { ascending: false });

      if (cidade) {
        query = query.eq("cidade_base", cidade);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []) as Anunciante[];
    },
  });
}

export function useAnunciante(slug: string) {
  return useQuery({
    queryKey: ["anunciante", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("anunciantes")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (error) throw error;

      return data as Anunciante;
    },
    enabled: !!slug,
  });
}

export function useAnuncianteImoveis(anuncianteId: string) {
  return useQuery({
    queryKey: ["anunciante-imoveis", anuncianteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("imoveis")
        .select(`
          *,
          imagens:imagens_imovel(url, alt, is_capa)
        `)
        .eq("anunciante_id", anuncianteId)
        .eq("status", "ativo")
        .order("destaque", { ascending: false })
        .order("published_at", { ascending: false });

      if (error) throw error;

      return data || [];
    },
    enabled: !!anuncianteId,
  });
}
