import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TransporterWithRelations } from "./useTransporters";

export interface SearchFilters {
  rede?: string;
  schoolId?: string;
  turno?: string;
  bairro?: string;
  acessibilidade?: string[];
}

export function useTransportSearch(filters: SearchFilters) {
  return useQuery({
    queryKey: ["transport-search", filters],
    queryFn: async () => {
      // Base query for transporters
      const { data, error } = await supabase
        .from("transporters")
        .select(`
          *,
          transporter_schools(
            school_id,
            schools:school_id(id, nome_oficial, rede, bairro, slug)
          ),
          transporter_areas(id, bairro, turno)
        `)
        .eq("status", "ativo")
        .order("nivel_verificacao", { ascending: false });

      if (error) throw error;

      let results = (data || []) as unknown as TransporterWithRelations[];

      // Filter by school if provided
      if (filters.schoolId) {
        results = results.filter(t =>
          t.transporter_schools?.some(ts => ts.school_id === filters.schoolId)
        );
      }

      // Filter by rede (network) if provided
      if (filters.rede && filters.rede !== 'nao_sei') {
        results = results.filter(t =>
          t.transporter_schools?.some(ts => 
            ts.schools?.rede === filters.rede
          )
        );
      }

      // Filter by turno (shift) if provided
      if (filters.turno) {
        results = results.filter(t =>
          t.transporter_areas?.some(ta => 
            ta.turno === filters.turno || ta.turno === 'integral'
          )
        );
      }

      // Filter by bairro (neighborhood) if provided
      if (filters.bairro) {
        results = results.filter(t =>
          t.transporter_areas?.some(ta => ta.bairro === filters.bairro)
        );
      }

      // Filter by accessibility if provided
      if (filters.acessibilidade && filters.acessibilidade.length > 0) {
        results = results.filter(t => {
          if (!t.atende_acessibilidade) return false;
          return filters.acessibilidade!.some(tipo =>
            t.acessibilidade_tipos.includes(tipo)
          );
        });
      }

      // Score and sort results
      const scoredResults = results.map(t => {
        let score = t.nivel_verificacao * 10;
        
        // Bonus for exact school match
        if (filters.schoolId && t.transporter_schools?.some(ts => ts.school_id === filters.schoolId)) {
          score += 50;
        }
        
        // Bonus for exact bairro match
        if (filters.bairro && t.transporter_areas?.some(ta => ta.bairro === filters.bairro)) {
          score += 20;
        }
        
        // Bonus for accessibility match
        if (filters.acessibilidade?.length && t.atende_acessibilidade) {
          score += 30;
        }
        
        // Penalty for no vacancies
        if (t.vagas_status === 'sem_vagas') {
          score -= 20;
        } else if (t.vagas_status === 'lista_espera') {
          score -= 10;
        }
        
        return { ...t, _score: score };
      });

      // Sort by score descending
      return scoredResults.sort((a, b) => b._score - a._score);
    },
    enabled: !!(filters.schoolId || filters.bairro || filters.turno),
  });
}

export function useTransportStats() {
  return useQuery({
    queryKey: ["transport-stats"],
    queryFn: async () => {
      const [
        { count: schoolsCount },
        { count: transportersCount },
        { count: transportersActiveCount },
      ] = await Promise.all([
        supabase.from("schools").select("*", { count: "exact", head: true }).eq("status", "ativo"),
        supabase.from("transporters").select("*", { count: "exact", head: true }),
        supabase.from("transporters").select("*", { count: "exact", head: true }).eq("status", "ativo"),
      ]);

      return {
        schools: schoolsCount || 0,
        transporters: transportersCount || 0,
        transportersActive: transportersActiveCount || 0,
      };
    },
  });
}
