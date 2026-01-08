import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface StyleProfile {
  id: string;
  site_id: string;
  user_id: string | null;
  profile_type: 'journalist' | 'site_default';
  name: string;
  is_active: boolean;
  max_refs: number;
  max_total_size_mb: number;
  created_at: string;
  updated_at: string;
}

export interface StyleRef {
  id: string;
  style_profile_id: string;
  kind: 'link' | 'txt' | 'pdf';
  title: string;
  url: string | null;
  storage_path: string | null;
  file_name: string | null;
  file_size_bytes: number | null;
  mime_type: string | null;
  extracted_text: string | null;
  status: 'uploaded' | 'ingested' | 'failed';
  error_message: string | null;
  created_at: string;
}

export interface StyleVersion {
  id: string;
  style_profile_id: string;
  version_number: number;
  style_guide_text: string;
  generated_from_refs: boolean;
  generated_at: string | null;
  created_by: string | null;
  is_current: boolean;
  created_at: string;
}

// Fetch style profiles for a site
export function useStyleProfiles(siteId: string | undefined) {
  return useQuery({
    queryKey: ['style-profiles', siteId],
    queryFn: async () => {
      if (!siteId) return [];
      
      const { data, error } = await supabase
        .from('journalist_style_profiles')
        .select('*')
        .eq('site_id', siteId)
        .order('profile_type', { ascending: false })
        .order('name');
      
      if (error) throw error;
      return data as StyleProfile[];
    },
    enabled: !!siteId,
  });
}

// Fetch site default profile
export function useSiteDefaultProfile(siteId: string | undefined) {
  return useQuery({
    queryKey: ['style-profiles', siteId, 'site_default'],
    queryFn: async () => {
      if (!siteId) return null;
      
      const { data, error } = await supabase
        .from('journalist_style_profiles')
        .select('*')
        .eq('site_id', siteId)
        .eq('profile_type', 'site_default')
        .eq('is_active', true)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as StyleProfile | null;
    },
    enabled: !!siteId,
  });
}

// Fetch current user's journalist profile
export function useMyStyleProfile(siteId: string | undefined) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['style-profiles', siteId, 'my-profile', user?.id],
    queryFn: async () => {
      if (!siteId || !user?.id) return null;
      
      const { data, error } = await supabase
        .from('journalist_style_profiles')
        .select('*')
        .eq('site_id', siteId)
        .eq('user_id', user.id)
        .eq('profile_type', 'journalist')
        .eq('is_active', true)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as StyleProfile | null;
    },
    enabled: !!siteId && !!user?.id,
  });
}

// Fetch style refs for a profile
export function useStyleRefs(profileId: string | undefined) {
  return useQuery({
    queryKey: ['style-refs', profileId],
    queryFn: async () => {
      if (!profileId) return [];
      
      const { data, error } = await supabase
        .from('journalist_style_refs')
        .select('*')
        .eq('style_profile_id', profileId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as StyleRef[];
    },
    enabled: !!profileId,
  });
}

// Fetch style versions for a profile
export function useStyleVersions(profileId: string | undefined) {
  return useQuery({
    queryKey: ['style-versions', profileId],
    queryFn: async () => {
      if (!profileId) return [];
      
      const { data, error } = await supabase
        .from('journalist_style_versions')
        .select('*')
        .eq('style_profile_id', profileId)
        .order('version_number', { ascending: false });
      
      if (error) throw error;
      return data as StyleVersion[];
    },
    enabled: !!profileId,
  });
}

// Get current style version
export function useCurrentStyleVersion(profileId: string | undefined) {
  return useQuery({
    queryKey: ['style-versions', profileId, 'current'],
    queryFn: async () => {
      if (!profileId) return null;
      
      const { data, error } = await supabase
        .from('journalist_style_versions')
        .select('*')
        .eq('style_profile_id', profileId)
        .eq('is_current', true)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as StyleVersion | null;
    },
    enabled: !!profileId,
  });
}

// Create journalist profile
export function useCreateStyleProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ 
      siteId, 
      name 
    }: { 
      siteId: string; 
      name: string;
    }) => {
      const { data, error } = await supabase
        .from('journalist_style_profiles')
        .insert({
          site_id: siteId,
          user_id: user?.id,
          profile_type: 'journalist',
          name,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['style-profiles'] });
      toast({ title: 'Perfil de estilo criado!' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar perfil',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Add style ref (link)
export function useAddStyleRefLink() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ 
      profileId, 
      title, 
      url 
    }: { 
      profileId: string; 
      title: string; 
      url: string;
    }) => {
      const { data, error } = await supabase
        .from('journalist_style_refs')
        .insert({
          style_profile_id: profileId,
          kind: 'link',
          title,
          url,
          status: 'uploaded',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['style-refs', data.style_profile_id] });
      toast({ title: 'Referência adicionada!' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao adicionar referência',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Delete style ref
export function useDeleteStyleRef() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ refId, profileId }: { refId: string; profileId: string }) => {
      const { error } = await supabase
        .from('journalist_style_refs')
        .delete()
        .eq('id', refId);
      
      if (error) throw error;
      return profileId;
    },
    onSuccess: (profileId) => {
      queryClient.invalidateQueries({ queryKey: ['style-refs', profileId] });
      toast({ title: 'Referência removida!' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao remover referência',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Save style version
export function useSaveStyleVersion() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ 
      profileId, 
      styleGuideText,
      generatedFromRefs = false,
    }: { 
      profileId: string; 
      styleGuideText: string;
      generatedFromRefs?: boolean;
    }) => {
      // Get latest version number
      const { data: versions } = await supabase
        .from('journalist_style_versions')
        .select('version_number')
        .eq('style_profile_id', profileId)
        .order('version_number', { ascending: false })
        .limit(1);
      
      const nextVersion = (versions?.[0]?.version_number || 0) + 1;
      
      const { data, error } = await supabase
        .from('journalist_style_versions')
        .insert({
          style_profile_id: profileId,
          version_number: nextVersion,
          style_guide_text: styleGuideText,
          generated_from_refs: generatedFromRefs,
          generated_at: generatedFromRefs ? new Date().toISOString() : null,
          created_by: user?.id,
          is_current: true,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['style-versions', data.style_profile_id] });
      toast({ title: 'Versão do guia de estilo salva!' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao salvar versão',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
