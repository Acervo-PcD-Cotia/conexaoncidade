import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Solution {
  id: string;
  key: string;
  name: string;
  description: string | null;
  benefits: string[] | null;
  who_should_use: string | null;
  icon: string | null;
  price_monthly: number | null;
  price_yearly: number | null;
  is_active: boolean;
  requires_plan: string | null;
  sort_order: number;
}

export interface TenantSolution {
  id: string;
  tenant_id: string;
  solution_id: string;
  status: string;
  activated_at: string | null;
  expires_at: string | null;
  payment_status: string;
  billing_cycle: string;
  next_billing_date: string | null;
  settings: Record<string, unknown>;
  solution?: Solution;
}

// Fetch all available solutions
export function useSolutions() {
  return useQuery({
    queryKey: ["solutions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("solutions")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");

      if (error) throw error;
      return data as Solution[];
    },
  });
}

// Fetch tenant's contracted solutions
export function useTenantSolutions(tenantId: string | undefined) {
  return useQuery({
    queryKey: ["tenant-solutions", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      
      const { data, error } = await supabase
        .from("tenant_solutions")
        .select(`
          *,
          solution:solutions(*)
        `)
        .eq("tenant_id", tenantId);

      if (error) throw error;
      return data as TenantSolution[];
    },
    enabled: !!tenantId,
  });
}

// Check if tenant has a specific solution active
export function useTenantHasSolution(tenantId: string | undefined, solutionKey: string) {
  return useQuery({
    queryKey: ["tenant-has-solution", tenantId, solutionKey],
    queryFn: async () => {
      if (!tenantId) return false;
      
      const { data, error } = await supabase
        .rpc("tenant_has_solution", {
          _tenant_id: tenantId,
          _solution_key: solutionKey,
        });

      if (error) throw error;
      return data as boolean;
    },
    enabled: !!tenantId,
  });
}

// Activate a solution for tenant
export function useActivateSolution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tenantId,
      solutionId,
      billingCycle = "monthly",
    }: {
      tenantId: string;
      solutionId: string;
      billingCycle?: string;
    }) => {
      const { data, error } = await supabase
        .from("tenant_solutions")
        .upsert({
          tenant_id: tenantId,
          solution_id: solutionId,
          status: "active",
          activated_at: new Date().toISOString(),
          payment_status: "pending",
          billing_cycle: billingCycle,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-solutions"] });
      queryClient.invalidateQueries({ queryKey: ["tenant-has-solution"] });
      toast.success("Solução ativada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao ativar solução: " + error.message);
    },
  });
}

// Deactivate a solution for tenant
export function useDeactivateSolution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tenantSolutionId: string) => {
      const { error } = await supabase
        .from("tenant_solutions")
        .update({ status: "cancelled" })
        .eq("id", tenantSolutionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-solutions"] });
      queryClient.invalidateQueries({ queryKey: ["tenant-has-solution"] });
      toast.success("Solução desativada");
    },
    onError: (error) => {
      toast.error("Erro ao desativar: " + error.message);
    },
  });
}
