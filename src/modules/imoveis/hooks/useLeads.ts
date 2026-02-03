import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { LeadIntencao } from "../types";

interface CreateLeadData {
  imovel_id?: string;
  anunciante_id?: string;
  nome: string;
  telefone?: string;
  whatsapp?: string;
  email?: string;
  mensagem?: string;
  intencao?: LeadIntencao;
  prazo?: string;
  orcamento?: number;
  origem?: string;
  pagina_origem?: string;
}

export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateLeadData) => {
      // Get UTM params from URL
      const urlParams = new URLSearchParams(window.location.search);
      const utm_source = urlParams.get("utm_source") || undefined;
      const utm_medium = urlParams.get("utm_medium") || undefined;
      const utm_campaign = urlParams.get("utm_campaign") || undefined;

      const { data: lead, error } = await supabase
        .from("leads_imoveis")
        .insert({
          ...data,
          utm_source,
          utm_medium,
          utm_campaign,
          origem: data.origem || "site",
          pagina_origem: data.pagina_origem || window.location.pathname,
        })
        .select()
        .single();

      if (error) throw error;

      return lead;
    },
    onSuccess: () => {
      toast.success("Mensagem enviada com sucesso! Entraremos em contato em breve.");
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: (error) => {
      console.error("Error creating lead:", error);
      toast.error("Erro ao enviar mensagem. Tente novamente.");
    },
  });
}
