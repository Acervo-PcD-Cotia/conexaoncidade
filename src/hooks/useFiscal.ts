import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export interface FiscalProfile {
  id: string;
  tenant_id: string | null;
  user_id: string | null;
  document_type: string;
  document_number: string;
  legal_name: string;
  trade_name: string | null;
  email: string | null;
  phone: string | null;
  address_json: Json | null;
  bank_info_json: Json | null;
  is_verified: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Receivable {
  id: string;
  tenant_id: string | null;
  fiscal_profile_id: string | null;
  source_type: string;
  source_id: string | null;
  description: string | null;
  gross_amount: number;
  net_amount: number | null;
  platform_fee: number | null;
  tax_amount: number | null;
  status: string | null;
  due_date: string | null;
  paid_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  fiscal_profile?: FiscalProfile;
}

export interface Invoice {
  id: string;
  tenant_id: string | null;
  receivable_id: string | null;
  invoice_number: string | null;
  invoice_type: string | null;
  issued_at: string | null;
  pdf_url: string | null;
  provider_response: Json | null;
  status: string | null;
  error_message: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// Fiscal Profiles hooks
export function useFiscalProfiles() {
  return useQuery({
    queryKey: ['fiscal_profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fiscal_profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as FiscalProfile[];
    },
  });
}

export function useFiscalProfile(id: string | undefined) {
  return useQuery({
    queryKey: ['fiscal_profiles', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('fiscal_profiles')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as FiscalProfile;
    },
    enabled: !!id,
  });
}

export function useCreateFiscalProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (profile: Omit<FiscalProfile, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('fiscal_profiles')
        .insert(profile as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fiscal_profiles'] });
    },
  });
}

export function useUpdateFiscalProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FiscalProfile> & { id: string }) => {
      const { data, error } = await supabase
        .from('fiscal_profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['fiscal_profiles'] });
      queryClient.invalidateQueries({ queryKey: ['fiscal_profiles', variables.id] });
    },
  });
}

// Receivables hooks
export function useReceivables(status?: string) {
  return useQuery({
    queryKey: ['receivables', status],
    queryFn: async () => {
      let query = supabase
        .from('receivables')
        .select(`
          *,
          fiscal_profile:fiscal_profile_id (*)
        `)
        .order('created_at', { ascending: false });
      
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Receivable[];
    },
  });
}

export function useReceivable(id: string | undefined) {
  return useQuery({
    queryKey: ['receivables', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('receivables')
        .select(`
          *,
          fiscal_profile:fiscal_profile_id (*)
        `)
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Receivable;
    },
    enabled: !!id,
  });
}

export function useCreateReceivable() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (receivable: Omit<Receivable, 'id' | 'created_at' | 'updated_at' | 'fiscal_profile'>) => {
      const { data, error } = await supabase
        .from('receivables')
        .insert(receivable as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receivables'] });
    },
  });
}

export function useUpdateReceivable() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Receivable> & { id: string }) => {
      const { data, error } = await supabase
        .from('receivables')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['receivables'] });
      queryClient.invalidateQueries({ queryKey: ['receivables', variables.id] });
    },
  });
}

// Invoices hooks
export function useInvoices(status?: string) {
  return useQuery({
    queryKey: ['invoices', status],
    queryFn: async () => {
      let query = supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Invoice[];
    },
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (invoice: Partial<Invoice>) => {
      const { data, error } = await supabase
        .from('invoices')
        .insert(invoice)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Invoice> & { id: string }) => {
      const { data, error } = await supabase
        .from('invoices')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', variables.id] });
    },
  });
}

// Financial summary
export function useFinancialSummary() {
  return useQuery({
    queryKey: ['financial_summary'],
    queryFn: async () => {
      const { data: receivables, error } = await supabase
        .from('receivables')
        .select('status, gross_amount, net_amount');
      
      if (error) throw error;
      
      const summary = {
        total_gross: 0,
        total_net: 0,
        pending: 0,
        approved: 0,
        paid: 0,
        cancelled: 0,
      };
      
      receivables?.forEach((r) => {
        summary.total_gross += Number(r.gross_amount) || 0;
        summary.total_net += Number(r.net_amount) || 0;
        
        switch (r.status) {
          case 'pending':
            summary.pending += Number(r.gross_amount) || 0;
            break;
          case 'approved':
            summary.approved += Number(r.gross_amount) || 0;
            break;
          case 'paid':
            summary.paid += Number(r.gross_amount) || 0;
            break;
          case 'cancelled':
            summary.cancelled += Number(r.gross_amount) || 0;
            break;
        }
      });
      
      return summary;
    },
  });
}
