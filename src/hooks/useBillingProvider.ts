import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type {
  BillingProviderProfile,
  CreateProviderProfileInput,
  UpdateProviderProfileInput,
} from "@/types/billing";

// Busca perfil do prestador atual
export function useBillingProvider() {
  return useQuery({
    queryKey: ["billing-provider"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("billing_provider_profile")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as BillingProviderProfile | null;
    },
  });
}

// Criar perfil do prestador
export function useCreateBillingProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateProviderProfileInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("billing_provider_profile")
        .insert({
          user_id: user.id,
          ...input,
        })
        .select()
        .single();

      if (error) throw error;
      return data as BillingProviderProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing-provider"] });
      toast.success("Perfil do prestador criado");
    },
    onError: (error) => {
      console.error("Erro ao criar perfil:", error);
      toast.error("Erro ao criar perfil do prestador");
    },
  });
}

// Atualizar perfil do prestador
export function useUpdateBillingProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateProviderProfileInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("billing_provider_profile")
        .update(input)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data as BillingProviderProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing-provider"] });
      toast.success("Perfil do prestador atualizado");
    },
    onError: (error) => {
      console.error("Erro ao atualizar perfil:", error);
      toast.error("Erro ao atualizar perfil do prestador");
    },
  });
}

// Criar ou atualizar perfil do prestador
export function useUpsertBillingProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateProviderProfileInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("billing_provider_profile")
        .upsert({
          user_id: user.id,
          ...input,
        }, { onConflict: "user_id" })
        .select()
        .single();

      if (error) throw error;
      return data as BillingProviderProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing-provider"] });
      toast.success("Perfil do prestador salvo");
    },
    onError: (error) => {
      console.error("Erro ao salvar perfil:", error);
      toast.error("Erro ao salvar perfil do prestador");
    },
  });
}

// Inicializar perfil do prestador com dados padrão (Benilton)
export function useEnsureProviderProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Verificar se já existe
      const { data: existing } = await supabase
        .from("billing_provider_profile")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) return existing;

      // Criar com dados padrão
      const { data, error } = await supabase
        .from("billing_provider_profile")
        .insert({
          user_id: user.id,
          legal_name: 'Benilton Silva Freitas – Informática',
          trade_name: 'Conexão na Cidade',
          cnpj: '13.794.818/0001-75',
          im: '6023077',
          address_line: 'Rua da Fraternidade, 343 – Jardim Cotia – Cotia/SP',
          email: 'conexaonacidade@gmail.com',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing-provider"] });
    },
  });
}
