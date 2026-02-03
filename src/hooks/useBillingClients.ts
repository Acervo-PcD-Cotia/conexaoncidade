import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type {
  BillingClient,
  BillingClientDefaults,
  BillingClientWithDefaults,
  CreateBillingClientInput,
  UpdateBillingClientInput,
  CreateBillingClientDefaultsInput,
  PREFEITURA_COTIA_DATA,
  PREFEITURA_COTIA_TEMPLATE,
  DEFAULT_SERVICE_CODE,
  DEFAULT_CNAE,
  DEFAULT_ISS_RATE,
  DEFAULT_SERVICE_DESCRIPTION,
} from "@/types/billing";

// Lista todos os clientes ativos
export function useBillingClients() {
  return useQuery({
    queryKey: ["billing-clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("billing_clients")
        .select("*")
        .eq("is_active", true)
        .order("is_default", { ascending: false })
        .order("legal_name");

      if (error) throw error;
      return data as BillingClient[];
    },
  });
}

// Busca um cliente específico
export function useBillingClient(id: string | undefined) {
  return useQuery({
    queryKey: ["billing-client", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("billing_clients")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as BillingClient;
    },
    enabled: !!id,
  });
}

// Busca cliente padrão
export function useDefaultBillingClient() {
  return useQuery({
    queryKey: ["billing-client-default"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("billing_clients")
        .select("*")
        .eq("is_default", true)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      return data as BillingClient | null;
    },
  });
}

// Busca defaults de um cliente
export function useBillingClientDefaults(clientId: string | undefined) {
  return useQuery({
    queryKey: ["billing-client-defaults", clientId],
    queryFn: async () => {
      if (!clientId) return null;
      const { data, error } = await supabase
        .from("billing_client_defaults")
        .select("*")
        .eq("client_id", clientId)
        .maybeSingle();

      if (error) throw error;
      return data as BillingClientDefaults | null;
    },
    enabled: !!clientId,
  });
}

// Busca cliente com defaults
export function useBillingClientWithDefaults(clientId: string | undefined) {
  return useQuery({
    queryKey: ["billing-client-with-defaults", clientId],
    queryFn: async () => {
      if (!clientId) return null;

      const { data: client, error: clientError } = await supabase
        .from("billing_clients")
        .select("*")
        .eq("id", clientId)
        .single();

      if (clientError) throw clientError;

      const { data: defaults, error: defaultsError } = await supabase
        .from("billing_client_defaults")
        .select("*")
        .eq("client_id", clientId)
        .maybeSingle();

      if (defaultsError) throw defaultsError;

      return { ...client, defaults } as BillingClientWithDefaults;
    },
    enabled: !!clientId,
  });
}

// Criar cliente
export function useCreateBillingClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateBillingClientInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("billing_clients")
        .insert({
          user_id: user.id,
          ...input,
        })
        .select()
        .single();

      if (error) throw error;
      return data as BillingClient;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing-clients"] });
      queryClient.invalidateQueries({ queryKey: ["billing-client-default"] });
      toast.success("Cliente criado com sucesso");
    },
    onError: (error) => {
      console.error("Erro ao criar cliente:", error);
      toast.error("Erro ao criar cliente");
    },
  });
}

// Atualizar cliente
export function useUpdateBillingClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateBillingClientInput) => {
      const { data, error } = await supabase
        .from("billing_clients")
        .update(input)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as BillingClient;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["billing-clients"] });
      queryClient.invalidateQueries({ queryKey: ["billing-client", data.id] });
      queryClient.invalidateQueries({ queryKey: ["billing-client-default"] });
      toast.success("Cliente atualizado");
    },
    onError: (error) => {
      console.error("Erro ao atualizar cliente:", error);
      toast.error("Erro ao atualizar cliente");
    },
  });
}

// Definir cliente como padrão
export function useSetDefaultBillingClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clientId: string) => {
      const { data, error } = await supabase
        .from("billing_clients")
        .update({ is_default: true })
        .eq("id", clientId)
        .select()
        .single();

      if (error) throw error;
      return data as BillingClient;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing-clients"] });
      queryClient.invalidateQueries({ queryKey: ["billing-client-default"] });
      toast.success("Cliente definido como padrão");
    },
    onError: (error) => {
      console.error("Erro ao definir cliente padrão:", error);
      toast.error("Erro ao definir cliente padrão");
    },
  });
}

// Criar ou atualizar defaults do cliente
export function useUpsertBillingClientDefaults() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateBillingClientDefaultsInput) => {
      const { data, error } = await supabase
        .from("billing_client_defaults")
        .upsert(input, { onConflict: "client_id" })
        .select()
        .single();

      if (error) throw error;
      return data as BillingClientDefaults;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["billing-client-defaults", data.client_id] });
      queryClient.invalidateQueries({ queryKey: ["billing-client-with-defaults", data.client_id] });
      toast.success("Configurações do cliente salvas");
    },
    onError: (error) => {
      console.error("Erro ao salvar configurações:", error);
      toast.error("Erro ao salvar configurações");
    },
  });
}

// Inicializar cliente padrão (Prefeitura de Cotia) se não existir
export function useEnsureDefaultClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Verificar se já existe cliente padrão
      const { data: existing } = await supabase
        .from("billing_clients")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_default", true)
        .maybeSingle();

      if (existing) return existing;

      // Criar Prefeitura de Cotia como padrão
      const { data: client, error: clientError } = await supabase
        .from("billing_clients")
        .insert({
          user_id: user.id,
          legal_name: 'Prefeitura do Município de Cotia',
          cnpj: '46.523.049/0001-20',
          im: '3000014',
          address_line: 'Avenida Professor Manoel José Pedroso, 1347 – Parque Bahia',
          city: 'Cotia',
          state: 'SP',
          email: 'contabilidade@cotia.sp.gov.br',
          is_default: true,
        })
        .select()
        .single();

      if (clientError) throw clientError;

      // Criar defaults
      const { error: defaultsError } = await supabase
        .from("billing_client_defaults")
        .insert({
          client_id: client.id,
          service_code: '107',
          cnae: '6209100',
          iss_rate: 2.00,
          service_description_short: 'SUPORTE TÉCNICO, MANUTENÇÃO E OUTROS SERVIÇOS EM TECNOLOGIA DA INFORMAÇÃO',
          invoice_text_template: `AOS CUIDADOS DA VERBO COMUNICAÇÃO LTDA. CONTRATO Nº 055/2024.
REFERENTE À VEICULAÇÃO DE ANÚNCIO INSTITUCIONAL NO PORTAL CONEXÃO NA CIDADE.
PEDIDO DE INSERÇÃO (PI): Nº {PI}.`,
        });

      if (defaultsError) throw defaultsError;

      return client;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing-clients"] });
      queryClient.invalidateQueries({ queryKey: ["billing-client-default"] });
    },
  });
}
