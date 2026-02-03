import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type {
  ProofInvoice,
  ProofInvoiceExpanded,
  ProofInvoiceFile,
  CreateProofInvoiceInput,
  MarkInvoiceIssuedInput,
  InvoiceFileType,
} from "@/types/billing";

// Lista todas as invoices (opcionalmente por comprovante)
export function useProofInvoices(proofId?: string) {
  return useQuery({
    queryKey: ["proof-invoices", proofId],
    queryFn: async () => {
      let query = supabase
        .from("campaign_proof_invoices")
        .select(`
          *,
          client:billing_clients(*)
        `)
        .order("created_at", { ascending: false });

      if (proofId) {
        query = query.eq("campaign_proof_id", proofId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ProofInvoiceExpanded[];
    },
  });
}

// Busca invoice específica
export function useProofInvoice(id: string | undefined) {
  return useQuery({
    queryKey: ["proof-invoice", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("campaign_proof_invoices")
        .select(`
          *,
          client:billing_clients(*)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as ProofInvoiceExpanded;
    },
    enabled: !!id,
  });
}

// Criar invoice (rascunho)
export function useCreateProofInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateProofInvoiceInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const insertData = {
        user_id: user.id,
        campaign_proof_id: input.campaign_proof_id,
        client_id: input.client_id,
        pi_number: input.pi_number,
        description_final: input.description_final,
        service_code: input.service_code,
        cnae: input.cnae,
        iss_rate: input.iss_rate,
        service_description_short: input.service_description_short,
        status: "draft" as const,
        client_snapshot: input.client_snapshot as unknown as null,
        provider_snapshot: input.provider_snapshot as unknown as null,
      };

      const { data, error } = await supabase
        .from("campaign_proof_invoices")
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      // Registrar auditoria
      await supabase.from("campaign_proof_invoice_audit").insert({
        invoice_id: data.id,
        user_id: user.id,
        action: "created",
        meta: { pi_number: input.pi_number },
      });

      return data as ProofInvoice;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["proof-invoices"] });
      queryClient.invalidateQueries({ queryKey: ["proof-invoices", data.campaign_proof_id] });
      toast.success("Rascunho da nota fiscal criado");
    },
    onError: (error) => {
      console.error("Erro ao criar invoice:", error);
      toast.error("Erro ao criar nota fiscal");
    },
  });
}

// Atualizar invoice
export function useUpdateProofInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<ProofInvoice> & { id: string }) => {
      // Remover campos que não devem ser atualizados diretamente
      const { user_id, created_at, updated_at, client_snapshot, provider_snapshot, ...updateData } = input;
      
      const { data, error } = await supabase
        .from("campaign_proof_invoices")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as ProofInvoice;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["proof-invoices"] });
      queryClient.invalidateQueries({ queryKey: ["proof-invoice", data.id] });
      toast.success("Nota fiscal atualizada");
    },
    onError: (error) => {
      console.error("Erro ao atualizar invoice:", error);
      toast.error("Erro ao atualizar nota fiscal");
    },
  });
}

// Marcar como emitida (pós-emissão no portal da Prefeitura)
export function useMarkInvoiceIssued() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: MarkInvoiceIssuedInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("campaign_proof_invoices")
        .update({
          status: "issued",
          nf_number: input.nf_number,
          nf_verification_code: input.nf_verification_code,
          nf_issue_datetime: input.nf_issue_datetime || new Date().toISOString(),
          nf_pdf_url: input.nf_pdf_url,
        })
        .eq("id", input.id)
        .select()
        .single();

      if (error) throw error;

      // Registrar auditoria
      await supabase.from("campaign_proof_invoice_audit").insert({
        invoice_id: data.id,
        user_id: user.id,
        action: "issued",
        meta: { nf_number: input.nf_number },
      });

      return data as ProofInvoice;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["proof-invoices"] });
      queryClient.invalidateQueries({ queryKey: ["proof-invoice", data.id] });
      toast.success("Nota fiscal marcada como emitida!");
    },
    onError: (error) => {
      console.error("Erro ao marcar como emitida:", error);
      toast.error("Erro ao atualizar status");
    },
  });
}

// Deletar invoice
export function useDeleteProofInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("campaign_proof_invoices")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proof-invoices"] });
      toast.success("Rascunho removido");
    },
    onError: (error) => {
      console.error("Erro ao deletar invoice:", error);
      toast.error("Erro ao remover nota fiscal");
    },
  });
}

// Arquivos da invoice
export function useProofInvoiceFiles(invoiceId: string | undefined) {
  return useQuery({
    queryKey: ["proof-invoice-files", invoiceId],
    queryFn: async () => {
      if (!invoiceId) return [];
      const { data, error } = await supabase
        .from("campaign_proof_invoice_files")
        .select("*")
        .eq("invoice_id", invoiceId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ProofInvoiceFile[];
    },
    enabled: !!invoiceId,
  });
}

// Upload de arquivo
export function useUploadInvoiceFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      invoiceId,
      file,
      fileType,
    }: {
      invoiceId: string;
      file: File;
      fileType: InvoiceFileType;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Upload para storage
      const filePath = `${user.id}/${invoiceId}/${fileType}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("campaign-invoices")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from("campaign-invoices")
        .getPublicUrl(filePath);

      // Registrar no banco
      const { data, error } = await supabase
        .from("campaign_proof_invoice_files")
        .insert({
          invoice_id: invoiceId,
          file_type: fileType,
          file_url: urlData.publicUrl,
          file_name: file.name,
        })
        .select()
        .single();

      if (error) throw error;

      // Se for PDF da NF, atualizar campo na invoice
      if (fileType === "nf_pdf") {
        await supabase
          .from("campaign_proof_invoices")
          .update({ nf_pdf_url: urlData.publicUrl })
          .eq("id", invoiceId);
      }

      // Registrar auditoria
      await supabase.from("campaign_proof_invoice_audit").insert({
        invoice_id: invoiceId,
        user_id: user.id,
        action: "file_uploaded",
        meta: { file_type: fileType, file_name: file.name },
      });

      return data as ProofInvoiceFile;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["proof-invoice-files", data.invoice_id] });
      queryClient.invalidateQueries({ queryKey: ["proof-invoice", data.invoice_id] });
      toast.success("Arquivo enviado com sucesso");
    },
    onError: (error) => {
      console.error("Erro ao enviar arquivo:", error);
      toast.error("Erro ao enviar arquivo");
    },
  });
}
