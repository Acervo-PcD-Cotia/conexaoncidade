import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Transporter {
  id: string;
  nome: string;
  whatsapp: string;
  telefone?: string;
  descricao_curta?: string;
  nivel_verificacao: number;
  atende_acessibilidade: boolean;
  acessibilidade_tipos: string[];
  tipo_servico: 'porta_a_porta' | 'ponto_encontro' | 'ambos';
  veiculo_tipo: 'van' | 'kombi' | 'micro_onibus' | 'onibus' | 'carro';
  capacidade_aprox?: number;
  ar_condicionado: boolean;
  cinto_individual: boolean;
  vagas_status: 'tenho_vagas' | 'sem_vagas' | 'lista_espera';
  status: 'ativo' | 'pendente' | 'bloqueado';
  tenant_id?: string;
  created_at: string;
  updated_at: string;
}

export interface TransporterSchool {
  transporter_id?: string;
  school_id: string;
  schools?: {
    id: string;
    nome_oficial: string;
    rede: string;
    bairro: string;
    slug?: string;
  };
}

export interface TransporterArea {
  id: string;
  transporter_id: string;
  bairro: string;
  turno: 'manha' | 'tarde' | 'noite' | 'integral';
}

export interface TransporterWithRelations extends Transporter {
  transporter_schools?: TransporterSchool[];
  transporter_areas?: TransporterArea[];
}

export function useTransporters(filters?: {
  status?: string;
  schoolId?: string;
  bairro?: string;
  turno?: string;
  acessibilidade?: boolean;
}) {
  return useQuery({
    queryKey: ["transporters", filters],
    queryFn: async () => {
      let query = supabase
        .from("transporters")
        .select(`
          *,
          transporter_schools(
            school_id,
            schools:school_id(id, nome_oficial, rede, bairro)
          ),
          transporter_areas(id, bairro, turno)
        `)
        .order("nivel_verificacao", { ascending: false });

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.acessibilidade) {
        query = query.eq("atende_acessibilidade", true);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      let result = (data || []) as unknown as TransporterWithRelations[];
      
      // Filter by school
      if (filters?.schoolId) {
        result = result.filter(t => 
          t.transporter_schools?.some(ts => ts.school_id === filters.schoolId)
        );
      }
      
      // Filter by bairro
      if (filters?.bairro) {
        result = result.filter(t => 
          t.transporter_areas?.some(ta => ta.bairro === filters.bairro)
        );
      }
      
      // Filter by turno
      if (filters?.turno) {
        result = result.filter(t => 
          t.transporter_areas?.some(ta => ta.turno === filters.turno || ta.turno === 'integral')
        );
      }
      
      return result;
    },
  });
}

export function useTransporterById(id: string) {
  return useQuery({
    queryKey: ["transporter", id],
    queryFn: async () => {
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
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as unknown as TransporterWithRelations;
    },
    enabled: !!id,
  });
}

export function useCreateTransporter() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      transporter: {
        nome: string;
        whatsapp: string;
        telefone?: string;
        descricao_curta?: string;
        atende_acessibilidade?: boolean;
        acessibilidade_tipos?: string[];
        tipo_servico: string;
        veiculo_tipo: string;
        capacidade_aprox?: number;
        ar_condicionado?: boolean;
        cinto_individual?: boolean;
        vagas_status?: string;
      };
      schools: string[];
      areas: Array<{ bairro: string; turno: string }>;
    }) => {
      // Create transporter
      const { data: transporter, error: transporterError } = await supabase
        .from("transporters")
        .insert(data.transporter)
        .select()
        .single();
      
      if (transporterError) throw transporterError;
      
      // Add schools
      if (data.schools.length > 0) {
        const schoolLinks = data.schools.map(schoolId => ({
          transporter_id: transporter.id,
          school_id: schoolId,
        }));
        
        const { error: schoolsError } = await supabase
          .from("transporter_schools")
          .insert(schoolLinks);
        
        if (schoolsError) throw schoolsError;
      }
      
      // Add areas
      if (data.areas.length > 0) {
        const areaRecords = data.areas.map(area => ({
          transporter_id: transporter.id,
          bairro: area.bairro,
          turno: area.turno,
        }));
        
        const { error: areasError } = await supabase
          .from("transporter_areas")
          .insert(areaRecords);
        
        if (areasError) throw areasError;
      }
      
      return transporter;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transporters"] });
      toast.success("Cadastro enviado com sucesso! Aguarde a aprovação.");
    },
    onError: (error: Error) => {
      if (error.message.includes("duplicate key")) {
        toast.error("Este WhatsApp já está cadastrado.");
      } else {
        toast.error("Erro ao cadastrar: " + error.message);
      }
    },
  });
}

export function useUpdateTransporter() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Transporter> & { id: string }) => {
      const { data, error } = await supabase
        .from("transporters")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transporters"] });
      toast.success("Transportador atualizado!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao atualizar: " + error.message);
    },
  });
}

export function useTransportersBySchool(schoolId: string) {
  return useQuery({
    queryKey: ["transporters-by-school", schoolId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transporter_schools")
        .select(`
          transporters:transporter_id(
            *,
            transporter_areas(bairro, turno)
          )
        `)
        .eq("school_id", schoolId);
      
      if (error) throw error;
      
      return (data || [])
        .map(d => d.transporters as unknown as TransporterWithRelations)
        .filter((t): t is TransporterWithRelations => 
          t !== null && t.status === 'ativo'
        )
        .sort((a, b) => b.nivel_verificacao - a.nivel_verificacao);
    },
    enabled: !!schoolId,
  });
}
