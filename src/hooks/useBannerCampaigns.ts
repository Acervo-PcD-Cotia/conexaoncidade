import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface BannerCampaign {
  id: string;
  name: string;
  banner_id: string | null;
  budget_total: number;
  budget_spent: number;
  cost_per_click: number | null;
  cost_per_impression: number | null;
  billing_type: "cpc" | "cpm" | "fixed";
  starts_at: string | null;
  ends_at: string | null;
  status: "draft" | "active" | "paused" | "completed" | "depleted";
  advertiser_name: string | null;
  advertiser_email: string | null;
  targeting_categories: string[];
  targeting_locations: string[];
  targeting_devices: string[];
  max_daily_spend: number | null;
  daily_spent: number;
  daily_reset_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CampaignFormData {
  id?: string;
  name: string;
  banner_id: string;
  budget_total: number;
  cost_per_click: number;
  cost_per_impression: number;
  billing_type: "cpc" | "cpm" | "fixed";
  starts_at: string;
  ends_at: string;
  advertiser_name: string;
  advertiser_email: string;
  targeting_categories: string[];
  targeting_locations: string[];
  targeting_devices: string[];
  max_daily_spend: number | null;
}

export function useBannerCampaigns() {
  const queryClient = useQueryClient();

  const campaignsQuery = useQuery({
    queryKey: ["banner-campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banner_campaigns")
        .select("*, super_banners(id, title, image_url)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const spendLogsQuery = useQuery({
    queryKey: ["campaign-spend-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banner_campaign_spend_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CampaignFormData) => {
      const { error } = await supabase.from("banner_campaigns").insert({
        name: data.name,
        banner_id: data.banner_id || null,
        budget_total: data.budget_total,
        cost_per_click: data.billing_type === "cpc" ? data.cost_per_click : null,
        cost_per_impression: data.billing_type === "cpm" ? data.cost_per_impression : null,
        billing_type: data.billing_type,
        starts_at: data.starts_at || null,
        ends_at: data.ends_at || null,
        status: "draft",
        advertiser_name: data.advertiser_name || null,
        advertiser_email: data.advertiser_email || null,
        targeting_categories: data.targeting_categories,
        targeting_locations: data.targeting_locations,
        targeting_devices: data.targeting_devices,
        max_daily_spend: data.max_daily_spend,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banner-campaigns"] });
      toast.success("Campanha criada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar campanha: " + (error as Error).message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: CampaignFormData) => {
      if (!data.id) throw new Error("ID da campanha é obrigatório");
      const { error } = await supabase
        .from("banner_campaigns")
        .update({
          name: data.name,
          banner_id: data.banner_id || null,
          budget_total: data.budget_total,
          cost_per_click: data.billing_type === "cpc" ? data.cost_per_click : null,
          cost_per_impression: data.billing_type === "cpm" ? data.cost_per_impression : null,
          billing_type: data.billing_type,
          starts_at: data.starts_at || null,
          ends_at: data.ends_at || null,
          advertiser_name: data.advertiser_name || null,
          advertiser_email: data.advertiser_email || null,
          targeting_categories: data.targeting_categories,
          targeting_locations: data.targeting_locations,
          targeting_devices: data.targeting_devices,
          max_daily_spend: data.max_daily_spend,
        })
        .eq("id", data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banner-campaigns"] });
      toast.success("Campanha atualizada!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar: " + (error as Error).message);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("banner_campaigns")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banner-campaigns"] });
      toast.success("Status atualizado!");
    },
    onError: (error) => {
      toast.error("Erro: " + (error as Error).message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("banner_campaigns").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banner-campaigns"] });
      toast.success("Campanha excluída!");
    },
    onError: (error) => {
      toast.error("Erro ao excluir: " + (error as Error).message);
    },
  });

  return {
    campaigns: campaignsQuery.data || [],
    spendLogs: spendLogsQuery.data || [],
    isLoading: campaignsQuery.isLoading,
    createCampaign: createMutation.mutate,
    updateCampaign: updateMutation.mutate,
    updateStatus: updateStatusMutation.mutate,
    deleteCampaign: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}
