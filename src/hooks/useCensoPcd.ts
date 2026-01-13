import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CensoPcdResponse {
  id: string;
  respondente_tipo: 'pcd' | 'responsavel' | 'cuidador';
  nome_completo: string;
  data_nascimento: string;
  sexo: 'masculino' | 'feminino' | 'nao_informar';
  bairro: string;
  tipos_deficiencia: string[];
  possui_laudo: 'sim' | 'nao' | 'em_processo';
  nivel_suporte_tea?: string | null;
  recebe_acompanhamento_medico: boolean;
  atendimentos_necessarios?: string[] | null;
  local_atendimento?: string | null;
  em_fila_espera?: boolean | null;
  matriculado_escola?: string | null;
  apoio_educacional?: string | null;
  necessidades_educacionais?: string[] | null;
  beneficio_recebido?: string[] | null;
  renda_suficiente?: boolean | null;
  maior_necessidade: string;
  autoriza_contato: boolean;
  telefone_whatsapp?: string | null;
  email?: string | null;
  consentimento_lgpd: boolean;
  ebook_downloaded?: boolean;
  ebook_sent_whatsapp?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CensoPcdFormData {
  respondente_tipo: string;
  nome_completo: string;
  data_nascimento: string;
  sexo: string;
  bairro: string;
  tipos_deficiencia: string[];
  possui_laudo: string;
  nivel_suporte_tea?: string;
  recebe_acompanhamento_medico: boolean;
  atendimentos_necessarios?: string[];
  local_atendimento?: string;
  em_fila_espera?: boolean;
  matriculado_escola?: string;
  apoio_educacional?: string;
  necessidades_educacionais?: string[];
  beneficio_recebido?: string[];
  renda_suficiente?: boolean;
  maior_necessidade: string;
  autoriza_contato: boolean;
  telefone_whatsapp?: string;
  email?: string;
  consentimento_lgpd: boolean;
}

export interface CensoPcdStats {
  total: number;
  hoje: number;
  semana: number;
  bairros: { bairro: string; count: number }[];
  deficiencias: { tipo: string; count: number }[];
  necessidades: { necessidade: string; count: number }[];
  atendimentos: { tipo: string; count: number }[];
  educacao: { status: string; count: number }[];
  beneficios: { tipo: string; count: number }[];
  prioridades: { prioridade: string; count: number }[];
  tea_count: number;
  downloads: number;
}

export const BAIRROS_COTIA = [
  "Centro",
  "Granja Viana",
  "Parque São George",
  "Jardim Atalaia",
  "Jardim da Glória",
  "Caucaia do Alto",
  "Portão",
  "Jardim Coimbra",
  "Jardim Passárgada",
  "Chácaras do Espraiado",
  "Parque Rincão",
  "Jardim Pioneiro",
  "Jardim São Miguel",
  "Vila São João",
  "Residencial Euroville",
  "Jardim Nomura",
  "Jardim Ísis",
  "Parque Jandaia",
  "Jardim Japão",
  "Recanto Suave",
  "Jardim Sandra",
  "Outro"
];

export const TIPOS_DEFICIENCIA = [
  { value: "fisica", label: "Deficiência Física" },
  { value: "visual", label: "Deficiência Visual" },
  { value: "auditiva", label: "Deficiência Auditiva" },
  { value: "intelectual", label: "Deficiência Intelectual" },
  { value: "tea", label: "TEA – Transtorno do Espectro Autista" },
  { value: "multipla", label: "Deficiências Múltiplas" }
];

export const ATENDIMENTOS = [
  { value: "neurologia", label: "Neurologia" },
  { value: "psiquiatria", label: "Psiquiatria" },
  { value: "psicologia", label: "Psicologia" },
  { value: "fonoaudiologia", label: "Fonoaudiologia" },
  { value: "fisioterapia", label: "Fisioterapia" },
  { value: "terapia_ocupacional", label: "Terapia Ocupacional" },
  { value: "outro", label: "Outro" }
];

export const NECESSIDADES_EDUCACIONAIS = [
  { value: "professor_apoio", label: "Professor de apoio" },
  { value: "acompanhante", label: "Acompanhante especializado" },
  { value: "adaptacao_curricular", label: "Adaptação curricular" },
  { value: "tecnologia_assistiva", label: "Tecnologia assistiva" }
];

export const BENEFICIOS = [
  { value: "bpc_loas", label: "BPC/LOAS" },
  { value: "municipal", label: "Benefício municipal" },
  { value: "nenhum", label: "Nenhum" }
];

export const PRIORIDADES = [
  { value: "atendimento_medico", label: "Atendimento médico" },
  { value: "terapias", label: "Terapias" },
  { value: "vaga_escolar", label: "Vaga escolar" },
  { value: "beneficio_social", label: "Benefício social" },
  { value: "transporte", label: "Transporte" },
  { value: "equipamentos", label: "Equipamentos (cadeira, órtese, prótese etc.)" }
];

export function useCensoPcd() {
  const queryClient = useQueryClient();

  // Buscar todas as respostas (admin)
  const { data: responses, isLoading: isLoadingResponses } = useQuery({
    queryKey: ["censo-pcd-responses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("censo_pcd_responses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CensoPcdResponse[];
    }
  });

  // Estatísticas agregadas (admin)
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["censo-pcd-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("censo_pcd_responses")
        .select("*");

      if (error) throw error;

      const responses = data as CensoPcdResponse[];
      const today = new Date().toISOString().split("T")[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // Contagens por bairro
      const bairroCount: Record<string, number> = {};
      responses.forEach(r => {
        bairroCount[r.bairro] = (bairroCount[r.bairro] || 0) + 1;
      });

      // Contagens por tipo de deficiência
      const deficienciaCount: Record<string, number> = {};
      responses.forEach(r => {
        r.tipos_deficiencia?.forEach(t => {
          deficienciaCount[t] = (deficienciaCount[t] || 0) + 1;
        });
      });

      // Contagens por atendimento necessário
      const atendimentoCount: Record<string, number> = {};
      responses.forEach(r => {
        r.atendimentos_necessarios?.forEach(a => {
          atendimentoCount[a] = (atendimentoCount[a] || 0) + 1;
        });
      });

      // Contagens por prioridade
      const prioridadeCount: Record<string, number> = {};
      responses.forEach(r => {
        prioridadeCount[r.maior_necessidade] = (prioridadeCount[r.maior_necessidade] || 0) + 1;
      });

      // Contagens por educação
      const educacaoCount: Record<string, number> = {};
      responses.forEach(r => {
        if (r.matriculado_escola) {
          educacaoCount[r.matriculado_escola] = (educacaoCount[r.matriculado_escola] || 0) + 1;
        }
      });

      // Contagens por benefício
      const beneficioCount: Record<string, number> = {};
      responses.forEach(r => {
        r.beneficio_recebido?.forEach(b => {
          beneficioCount[b] = (beneficioCount[b] || 0) + 1;
        });
      });

      // TEA count
      const teaCount = responses.filter(r => r.tipos_deficiencia?.includes("tea")).length;

      // Downloads
      const downloads = responses.filter(r => r.ebook_downloaded).length;

      const stats: CensoPcdStats = {
        total: responses.length,
        hoje: responses.filter(r => r.created_at.startsWith(today)).length,
        semana: responses.filter(r => r.created_at >= weekAgo).length,
        bairros: Object.entries(bairroCount)
          .map(([bairro, count]) => ({ bairro, count }))
          .sort((a, b) => b.count - a.count),
        deficiencias: Object.entries(deficienciaCount)
          .map(([tipo, count]) => ({ tipo, count }))
          .sort((a, b) => b.count - a.count),
        atendimentos: Object.entries(atendimentoCount)
          .map(([tipo, count]) => ({ tipo, count }))
          .sort((a, b) => b.count - a.count),
        prioridades: Object.entries(prioridadeCount)
          .map(([prioridade, count]) => ({ prioridade, count }))
          .sort((a, b) => b.count - a.count),
        educacao: Object.entries(educacaoCount)
          .map(([status, count]) => ({ status, count }))
          .sort((a, b) => b.count - a.count),
        beneficios: Object.entries(beneficioCount)
          .map(([tipo, count]) => ({ tipo, count }))
          .sort((a, b) => b.count - a.count),
        necessidades: Object.entries(prioridadeCount)
          .map(([necessidade, count]) => ({ necessidade, count }))
          .sort((a, b) => b.count - a.count),
        tea_count: teaCount,
        downloads
      };

      return stats;
    }
  });

  // Contagem pública (para landing page)
  const { data: publicStats } = useQuery({
    queryKey: ["censo-pcd-public-stats"],
    queryFn: async () => {
      // Esta query não funciona sem autenticação devido ao RLS
      // Retornamos valores placeholder para a landing page
      return {
        total: 0,
        bairros: 0
      };
    }
  });

  // Submeter resposta (público)
  const submitResponse = useMutation({
    mutationFn: async (formData: CensoPcdFormData) => {
      const { data, error } = await supabase
        .from("censo_pcd_responses")
        .insert([formData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["censo-pcd-responses"] });
      queryClient.invalidateQueries({ queryKey: ["censo-pcd-stats"] });
    },
    onError: (error) => {
      console.error("Erro ao submeter censo:", error);
      toast.error("Erro ao enviar resposta. Tente novamente.");
    }
  });

  // Marcar eBook como baixado
  const markEbookDownloaded = useMutation({
    mutationFn: async (responseId: string) => {
      const { error } = await supabase
        .from("censo_pcd_responses")
        .update({ ebook_downloaded: true })
        .eq("id", responseId);

      if (error) throw error;
    }
  });

  // Marcar eBook enviado por WhatsApp
  const markEbookWhatsApp = useMutation({
    mutationFn: async (responseId: string) => {
      const { error } = await supabase
        .from("censo_pcd_responses")
        .update({ ebook_sent_whatsapp: true })
        .eq("id", responseId);

      if (error) throw error;
    }
  });

  return {
    responses,
    stats,
    publicStats,
    isLoadingResponses,
    isLoadingStats,
    submitResponse,
    markEbookDownloaded,
    markEbookWhatsApp
  };
}
