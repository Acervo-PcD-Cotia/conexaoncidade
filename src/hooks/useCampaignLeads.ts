import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CampaignLead {
  id: string;
  tenant_id?: string;
  business_name: string;
  business_category: string;
  address: string;
  neighborhood?: string;
  city: string;
  state: string;
  zip_code?: string;
  whatsapp: string;
  email: string;
  contact_name?: string;
  has_google_maps?: 'yes' | 'no' | 'unknown';
  google_maps_link?: string;
  has_photos?: 'yes' | 'few' | 'no';
  responds_reviews?: 'always' | 'sometimes' | 'never';
  correct_hours?: 'yes' | 'no' | 'unknown';
  quiz_responses?: Record<string, any>;
  quiz_score?: number;
  authorized_review: boolean;
  authorized_photos: boolean;
  authorized_corrections: boolean;
  authorized_local_guide: boolean;
  business_description?: string;
  consent_google_maps: boolean;
  consent_portal: boolean;
  consent_community: boolean;
  wants_community?: 'yes' | 'yes_support' | 'only_free';
  goals?: string[];
  priority: 'high' | 'medium' | 'low';
  estimated_points: number;
  status: 'received' | 'in_progress' | 'completed' | 'rejected';
  created_at: string;
  updated_at: string;
  processed_at?: string;
  processed_by?: string;
  notes?: string;
}

export interface CampaignLeadPhoto {
  id: string;
  lead_id: string;
  photo_url: string;
  photo_type: 'facade' | 'interior' | 'products' | 'team' | 'other';
  file_name?: string;
  file_size?: number;
  uploaded_at: string;
}

export interface LeadFormData {
  business_name: string;
  business_category: string;
  address: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  whatsapp: string;
  email: string;
  contact_name?: string;
  has_google_maps?: 'yes' | 'no' | 'unknown';
  google_maps_link?: string;
  has_photos?: 'yes' | 'few' | 'no';
  responds_reviews?: 'always' | 'sometimes' | 'never';
  correct_hours?: 'yes' | 'no' | 'unknown';
  quiz_responses?: Record<string, any>;
  quiz_score?: number;
  authorized_review?: boolean;
  authorized_photos?: boolean;
  authorized_corrections?: boolean;
  authorized_local_guide?: boolean;
  business_description?: string;
  consent_google_maps?: boolean;
  consent_portal?: boolean;
  consent_community?: boolean;
  wants_community?: 'yes' | 'yes_support' | 'only_free';
  goals?: string[];
}

interface LeadsFilter {
  status?: string;
  priority?: string;
  category?: string;
  search?: string;
}

// Hook para buscar leads (admin)
export function useCampaignLeads(filters?: LeadsFilter) {
  return useQuery({
    queryKey: ['campaign-leads', filters],
    queryFn: async () => {
      let query = supabase
        .from('campaign_leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters?.category) {
        query = query.eq('business_category', filters.category);
      }
      if (filters?.search) {
        query = query.or(`business_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as CampaignLead[];
    },
  });
}

// Hook para buscar um lead específico
export function useCampaignLead(leadId: string) {
  return useQuery({
    queryKey: ['campaign-lead', leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaign_leads')
        .select('*')
        .eq('id', leadId)
        .single();

      if (error) throw error;
      return data as CampaignLead;
    },
    enabled: !!leadId,
  });
}

// Hook para buscar fotos de um lead
export function useLeadPhotos(leadId: string) {
  return useQuery({
    queryKey: ['lead-photos', leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaign_lead_photos')
        .select('*')
        .eq('lead_id', leadId)
        .order('uploaded_at', { ascending: true });

      if (error) throw error;
      return data as CampaignLeadPhoto[];
    },
    enabled: !!leadId,
  });
}

// Hook para criar lead (público)
export function useCreateCampaignLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: LeadFormData) => {
      const { data: lead, error } = await supabase
        .from('campaign_leads')
        .insert({
          ...data,
          authorized_review: data.authorized_review ?? false,
          authorized_photos: data.authorized_photos ?? false,
          authorized_corrections: data.authorized_corrections ?? false,
          authorized_local_guide: data.authorized_local_guide ?? false,
          consent_google_maps: data.consent_google_maps ?? false,
          consent_portal: data.consent_portal ?? false,
          consent_community: data.consent_community ?? false,
        })
        .select()
        .single();

      if (error) throw error;
      return lead as CampaignLead;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-leads'] });
    },
    onError: (error: Error) => {
      console.error('Error creating lead:', error);
      toast.error('Erro ao enviar cadastro. Tente novamente.');
    },
  });
}

// Hook para atualizar status do lead (admin)
export function useUpdateLeadStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      leadId, 
      status, 
      notes 
    }: { 
      leadId: string; 
      status: CampaignLead['status']; 
      notes?: string;
    }) => {
      const updateData: Record<string, any> = { status };
      
      if (status === 'completed' || status === 'rejected') {
        updateData.processed_at = new Date().toISOString();
      }
      
      if (notes !== undefined) {
        updateData.notes = notes;
      }

      const { data, error } = await supabase
        .from('campaign_leads')
        .update(updateData)
        .eq('id', leadId)
        .select()
        .single();

      if (error) throw error;
      return data as CampaignLead;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-leads'] });
      toast.success('Status atualizado com sucesso!');
    },
    onError: (error: Error) => {
      console.error('Error updating lead:', error);
      toast.error('Erro ao atualizar status.');
    },
  });
}

// Hook para upload de fotos
export function useUploadLeadPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      leadId, 
      file, 
      photoType 
    }: { 
      leadId: string; 
      file: File; 
      photoType: CampaignLeadPhoto['photo_type'];
    }) => {
      // Upload to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${leadId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('business-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('business-images')
        .getPublicUrl(fileName);

      // Save to database
      const { data, error } = await supabase
        .from('campaign_lead_photos')
        .insert({
          lead_id: leadId,
          photo_url: urlData.publicUrl,
          photo_type: photoType,
          file_name: file.name,
          file_size: file.size,
        })
        .select()
        .single();

      if (error) throw error;
      return data as CampaignLeadPhoto;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lead-photos', variables.leadId] });
    },
    onError: (error: Error) => {
      console.error('Error uploading photo:', error);
      toast.error('Erro ao enviar foto.');
    },
  });
}

// Hook para estatísticas da campanha
export function useCampaignStats() {
  return useQuery({
    queryKey: ['campaign-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaign_leads')
        .select('status, priority, estimated_points');

      if (error) throw error;

      const stats = {
        total: data.length,
        received: data.filter(l => l.status === 'received').length,
        in_progress: data.filter(l => l.status === 'in_progress').length,
        completed: data.filter(l => l.status === 'completed').length,
        rejected: data.filter(l => l.status === 'rejected').length,
        high_priority: data.filter(l => l.priority === 'high').length,
        total_points: data.reduce((sum, l) => sum + (l.estimated_points || 0), 0),
      };

      return stats;
    },
  });
}
