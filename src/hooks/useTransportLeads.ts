import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface TransportLead {
  id: string;
  rede: string;
  school_id?: string;
  school_texto?: string;
  bairro: string;
  turno: string;
  acessibilidade: string[];
  contato_whatsapp: string;
  consentimento: boolean;
  status: 'novo' | 'em_andamento' | 'concluido';
  created_at: string;
  school?: {
    nome_oficial: string;
    rede: string;
    bairro: string;
  };
}

export interface TransportReport {
  id: string;
  transporter_id?: string;
  school_id?: string;
  motivo: 'contato_invalido' | 'comportamento_inadequado' | 'golpe' | 'outros';
  descricao?: string;
  contato?: string;
  status: 'novo' | 'revisando' | 'resolvido';
  created_at: string;
  transporter?: {
    nome: string;
    whatsapp: string;
  };
}

export function useTransportLeads(filters?: { status?: string }) {
  return useQuery({
    queryKey: ["transport-leads", filters],
    queryFn: async () => {
      let query = supabase
        .from("transport_leads")
        .select(`
          *,
          school:school_id(nome_oficial, rede, bairro)
        `)
        .order("created_at", { ascending: false });

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as TransportLead[];
    },
  });
}

export function useCreateTransportLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lead: Omit<TransportLead, 'id' | 'status' | 'created_at' | 'school'>) => {
      const { data, error } = await supabase
        .from("transport_leads")
        .insert(lead)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transport-leads"] });
      toast.success("Solicitação enviada! Entraremos em contato em breve.");
    },
    onError: (error: Error) => {
      toast.error("Erro ao enviar solicitação: " + error.message);
    },
  });
}

export function useUpdateTransportLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TransportLead> & { id: string }) => {
      const { data, error } = await supabase
        .from("transport_leads")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transport-leads"] });
      toast.success("Lead atualizado!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao atualizar: " + error.message);
    },
  });
}

export function useTransportReports(filters?: { status?: string }) {
  return useQuery({
    queryKey: ["transport-reports", filters],
    queryFn: async () => {
      let query = supabase
        .from("transport_reports")
        .select(`
          *,
          transporter:transporter_id(nome, whatsapp)
        `)
        .order("created_at", { ascending: false });

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as TransportReport[];
    },
  });
}

export function useCreateTransportReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (report: Omit<TransportReport, 'id' | 'status' | 'created_at' | 'transporter'>) => {
      const { data, error } = await supabase
        .from("transport_reports")
        .insert(report)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transport-reports"] });
      toast.success("Denúncia enviada. Obrigado por ajudar a manter a comunidade segura.");
    },
    onError: (error: Error) => {
      toast.error("Erro ao enviar denúncia: " + error.message);
    },
  });
}

export function useUpdateTransportReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TransportReport> & { id: string }) => {
      const { data, error } = await supabase
        .from("transport_reports")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transport-reports"] });
      toast.success("Denúncia atualizada!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao atualizar: " + error.message);
    },
  });
}
