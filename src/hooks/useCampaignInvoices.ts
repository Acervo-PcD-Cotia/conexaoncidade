import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CampaignInvoice {
  id: string;
  campaign_id: string;
  receivable_id: string | null;
  invoice_period_start: string;
  invoice_period_end: string;
  impressions_count: number;
  clicks_count: number;
  amount_impressions: number;
  amount_clicks: number;
  total_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  due_date: string | null;
  sent_at: string | null;
  paid_at: string | null;
  created_at: string;
}

export function useCampaignInvoices(campaignId?: string) {
  const queryClient = useQueryClient();

  // Fetch invoices for a specific campaign or all
  const invoicesQuery = useQuery({
    queryKey: ["campaign-invoices", campaignId],
    queryFn: async () => {
      let query = supabase
        .from("banner_campaign_invoices")
        .select("*")
        .order("created_at", { ascending: false });

      if (campaignId) {
        query = query.eq("campaign_id", campaignId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CampaignInvoice[];
    },
  });

  // Generate invoice manually
  const generateMutation = useMutation({
    mutationFn: async (params: {
      campaign_id: string;
      period_start: string;
      period_end: string;
    }) => {
      const { data, error } = await supabase.functions.invoke(
        "generate-campaign-invoices",
        { body: params }
      );
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["campaign-invoices"] });
      queryClient.invalidateQueries({ queryKey: ["banner-campaigns"] });
      toast.success(`${data.invoices_created} fatura(s) gerada(s) com sucesso`);
    },
    onError: (error: Error) => {
      toast.error("Erro ao gerar fatura: " + error.message);
    },
  });

  // Update invoice status
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: CampaignInvoice["status"];
    }) => {
      const updateData: any = { status };

      if (status === "sent") {
        updateData.sent_at = new Date().toISOString();
      } else if (status === "paid") {
        updateData.paid_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("banner_campaign_invoices")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign-invoices"] });
      toast.success("Status da fatura atualizado");
    },
    onError: (error: Error) => {
      toast.error("Erro ao atualizar fatura: " + error.message);
    },
  });

  // Delete invoice
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("banner_campaign_invoices")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign-invoices"] });
      toast.success("Fatura excluída");
    },
    onError: (error: Error) => {
      toast.error("Erro ao excluir fatura: " + error.message);
    },
  });

  return {
    invoices: invoicesQuery.data || [],
    isLoading: invoicesQuery.isLoading,
    generateInvoice: generateMutation.mutate,
    isGenerating: generateMutation.isPending,
    updateStatus: updateStatusMutation.mutate,
    deleteInvoice: deleteMutation.mutate,
  };
}
