import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Imovel, ImovelFilters, ImagemImovel, Anunciante, ImovelStatus } from "../types";

interface UseImoveisOptions {
  filters?: ImovelFilters;
  limit?: number;
  page?: number;
}

interface CreateImovelData {
  titulo: string;
  slug: string;
  finalidade: "venda" | "aluguel" | "venda_aluguel";
  tipo: "casa" | "apartamento" | "terreno" | "comercial" | "chacara" | "cobertura" | "studio" | "kitnet" | "galpao" | "sala_comercial";
  cidade: string;
  bairro: string;
  endereco?: string;
  numero?: string;
  cep?: string;
  preco?: number;
  condominio_valor?: number;
  iptu_valor?: number;
  area_construida?: number;
  area_terreno?: number;
  quartos?: number;
  suites?: number;
  banheiros?: number;
  vagas?: number;
  descricao_html?: string;
  anunciante_id?: string;
  mostrar_endereco_exato?: boolean;
  destaque?: boolean;
  lancamento?: boolean;
  aceita_financiamento?: boolean;
  aceita_permuta?: boolean;
  is_condominio?: boolean;
  features?: string[];
  proximidades?: string[];
  status: ImovelStatus;
}

export function useImoveis({ filters, limit = 12, page = 1 }: UseImoveisOptions = {}) {
  return useQuery({
    queryKey: ["imoveis", filters, limit, page],
    queryFn: async () => {
      let query = supabase
        .from("imoveis")
        .select(`
          *,
          anunciante:anunciantes(*),
          imagens:imagens_imovel(*)
        `)
        .eq("status", "ativo")
        .order("destaque", { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      // Apply filters
      if (filters?.finalidade) {
        query = query.eq("finalidade", filters.finalidade);
      }
      if (filters?.tipo && filters.tipo.length > 0) {
        query = query.in("tipo", filters.tipo);
      }
      if (filters?.cidade) {
        query = query.eq("cidade", filters.cidade);
      }
      if (filters?.bairro && filters.bairro.length > 0) {
        query = query.in("bairro", filters.bairro);
      }
      if (filters?.preco_min) {
        query = query.gte("preco", filters.preco_min);
      }
      if (filters?.preco_max) {
        query = query.lte("preco", filters.preco_max);
      }
      if (filters?.quartos_min) {
        query = query.gte("quartos", filters.quartos_min);
      }
      if (filters?.banheiros_min) {
        query = query.gte("banheiros", filters.banheiros_min);
      }
      if (filters?.vagas_min) {
        query = query.gte("vagas", filters.vagas_min);
      }
      if (filters?.area_min) {
        query = query.gte("area_construida", filters.area_min);
      }
      if (filters?.area_max) {
        query = query.lte("area_construida", filters.area_max);
      }
      if (filters?.is_condominio !== undefined) {
        query = query.eq("is_condominio", filters.is_condominio);
      }
      if (filters?.aceita_financiamento) {
        query = query.eq("aceita_financiamento", true);
      }
      if (filters?.destaque) {
        query = query.eq("destaque", true);
      }
      if (filters?.lancamento) {
        query = query.eq("lancamento", true);
      }
      if (filters?.busca) {
        query = query.or(`titulo.ilike.%${filters.busca}%,descricao_html.ilike.%${filters.busca}%`);
      }

      // Apply ordering
      if (filters?.ordenar) {
        switch (filters.ordenar) {
          case "recentes":
            query = query.order("published_at", { ascending: false });
            break;
          case "menor_preco":
            query = query.order("preco", { ascending: true });
            break;
          case "maior_preco":
            query = query.order("preco", { ascending: false });
            break;
          case "maior_area":
            query = query.order("area_construida", { ascending: false });
            break;
          case "destaque":
            query = query.order("destaque", { ascending: false });
            break;
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map((item) => ({
        ...item,
        features: Array.isArray(item.features) ? item.features : [],
        proximidades: Array.isArray(item.proximidades) ? item.proximidades : [],
        imagens: ((item.imagens as ImagemImovel[]) || []).sort((a, b) => a.ordem - b.ordem),
        anunciante: item.anunciante as Anunciante | undefined,
      })) as Imovel[];
    },
  });
}

export function useImovel(slug: string) {
  return useQuery({
    queryKey: ["imovel", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("imoveis")
        .select(`
          *,
          anunciante:anunciantes(*),
          imagens:imagens_imovel(*)
        `)
        .eq("slug", slug)
        .eq("status", "ativo")
        .single();

      if (error) throw error;

      // Increment views
      supabase.rpc("increment_imovel_views", { p_id: data.id });

      return {
        ...data,
        features: Array.isArray(data.features) ? data.features : [],
        proximidades: Array.isArray(data.proximidades) ? data.proximidades : [],
        imagens: ((data.imagens as ImagemImovel[]) || []).sort((a, b) => a.ordem - b.ordem),
        anunciante: data.anunciante as Anunciante | undefined,
      } as Imovel;
    },
    enabled: !!slug,
  });
}

export function useImoveisDestaques(limit = 6) {
  return useQuery({
    queryKey: ["imoveis-destaques", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("imoveis")
        .select(`
          *,
          anunciante:anunciantes(nome, logo_url, slug),
          imagens:imagens_imovel(url, alt, is_capa)
        `)
        .eq("status", "ativo")
        .eq("destaque", true)
        .order("published_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map((item) => ({
        ...item,
        features: Array.isArray(item.features) ? item.features : [],
        proximidades: Array.isArray(item.proximidades) ? item.proximidades : [],
        imagens: ((item.imagens as ImagemImovel[]) || []).sort((a, b) => (b.is_capa ? 1 : 0) - (a.is_capa ? 1 : 0)),
      })) as Imovel[];
    },
  });
}

export function useImoveisSimilares(imovelId: string, tipo: string | null, cidade: string | null, limit = 4) {
  return useQuery({
    queryKey: ["imoveis-similares", imovelId, tipo, cidade],
    queryFn: async () => {
      let query = supabase
        .from("imoveis")
        .select(`
          *,
          imagens:imagens_imovel(url, alt, is_capa)
        `)
        .eq("status", "ativo")
        .neq("id", imovelId)
        .limit(limit);

      if (tipo) {
        query = query.eq("tipo", tipo as "casa" | "apartamento" | "terreno" | "comercial" | "chacara" | "cobertura" | "studio" | "kitnet" | "galpao" | "sala_comercial");
      }
      if (cidade) {
        query = query.eq("cidade", cidade);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map((item) => ({
        ...item,
        features: Array.isArray(item.features) ? item.features : [],
        proximidades: Array.isArray(item.proximidades) ? item.proximidades : [],
        imagens: (item.imagens as ImagemImovel[]) || [],
      })) as Imovel[];
    },
    enabled: !!imovelId,
  });
}

export function useCidadesDisponiveis() {
  return useQuery({
    queryKey: ["imoveis-cidades"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("imoveis")
        .select("cidade")
        .eq("status", "ativo");

      if (error) throw error;

      const cidades = [...new Set((data || []).map((d) => d.cidade))].sort();
      return cidades;
    },
  });
}

export function useBairrosDisponiveis(cidade?: string) {
  return useQuery({
    queryKey: ["imoveis-bairros", cidade],
    queryFn: async () => {
      let query = supabase
        .from("imoveis")
        .select("bairro")
        .eq("status", "ativo");

      if (cidade) {
        query = query.eq("cidade", cidade);
      }

      const { data, error } = await query;

      if (error) throw error;

      const bairros = [...new Set((data || []).map((d) => d.bairro))].sort();
      return bairros;
    },
    enabled: !cidade || !!cidade,
  });
}

export function useCreateImovel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateImovelData) => {
      const { data: result, error } = await supabase
        .from("imoveis")
        .insert({
          titulo: data.titulo,
          slug: data.slug,
          finalidade: data.finalidade,
          tipo: data.tipo,
          cidade: data.cidade,
          bairro: data.bairro,
          endereco: data.endereco,
          numero: data.numero,
          cep: data.cep,
          preco: data.preco,
          condominio_valor: data.condominio_valor,
          iptu_valor: data.iptu_valor,
          area_construida: data.area_construida,
          area_terreno: data.area_terreno,
          quartos: data.quartos || 0,
          suites: data.suites || 0,
          banheiros: data.banheiros || 0,
          vagas: data.vagas || 0,
          descricao_html: data.descricao_html,
          anunciante_id: data.anunciante_id,
          mostrar_endereco_exato: data.mostrar_endereco_exato || false,
          destaque: data.destaque || false,
          lancamento: data.lancamento || false,
          aceita_financiamento: data.aceita_financiamento || false,
          aceita_permuta: data.aceita_permuta || false,
          is_condominio: data.is_condominio || false,
          features: data.features || [],
          proximidades: data.proximidades || [],
          status: data.status,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["imoveis"] });
    },
  });
}
