import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Job {
  id: string;
  user_id: string | null;
  company_name: string;
  company_logo: string | null;
  company_website: string | null;
  title: string;
  description: string;
  requirements: string | null;
  benefits: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_type: string;
  job_type: string;
  work_mode: string;
  location: string | null;
  neighborhood: string | null;
  category: string;
  contact_email: string | null;
  contact_phone: string | null;
  application_link: string | null;
  status: string;
  is_featured: boolean;
  views_count: number;
  applications_count: number;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface JobApplication {
  id: string;
  job_id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  resume_url: string | null;
  cover_letter: string | null;
  linkedin_url: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const JOB_TYPES = [
  { value: 'clt', label: 'CLT' },
  { value: 'pj', label: 'PJ' },
  { value: 'estagio', label: 'Estágio' },
  { value: 'temporario', label: 'Temporário' },
  { value: 'freelancer', label: 'Freelancer' },
  { value: 'jovem_aprendiz', label: 'Jovem Aprendiz' },
];

export const WORK_MODES = [
  { value: 'presencial', label: 'Presencial' },
  { value: 'hibrido', label: 'Híbrido' },
  { value: 'remoto', label: 'Remoto' },
];

export const SALARY_TYPES = [
  { value: 'mensal', label: 'Mensal' },
  { value: 'hora', label: 'Por hora' },
  { value: 'projeto', label: 'Por projeto' },
  { value: 'a_combinar', label: 'A combinar' },
];

export const JOB_CATEGORIES = [
  { value: 'administracao', label: 'Administração' },
  { value: 'atendimento', label: 'Atendimento' },
  { value: 'comercial', label: 'Comercial/Vendas' },
  { value: 'comunicacao', label: 'Comunicação' },
  { value: 'construcao', label: 'Construção' },
  { value: 'educacao', label: 'Educação' },
  { value: 'engenharia', label: 'Engenharia' },
  { value: 'financas', label: 'Finanças' },
  { value: 'gastronomia', label: 'Gastronomia' },
  { value: 'industria', label: 'Indústria' },
  { value: 'logistica', label: 'Logística' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'saude', label: 'Saúde' },
  { value: 'servicos', label: 'Serviços Gerais' },
  { value: 'tecnologia', label: 'Tecnologia' },
  { value: 'outros', label: 'Outros' },
];

interface JobFilters {
  category?: string;
  job_type?: string;
  work_mode?: string;
  neighborhood?: string;
  search?: string;
}

export function useJobs(filters?: JobFilters) {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: async () => {
      let query = supabase
        .from('jobs')
        .select('*')
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.job_type) {
        query = query.eq('job_type', filters.job_type);
      }
      if (filters?.work_mode) {
        query = query.eq('work_mode', filters.work_mode);
      }
      if (filters?.neighborhood) {
        query = query.eq('neighborhood', filters.neighborhood);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,company_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Job[];
    },
  });
}

export function useJobById(id: string | undefined) {
  return useQuery({
    queryKey: ['job', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      // Increment view count
      await supabase.rpc('increment_job_views', { p_id: id });
      
      return data as Job;
    },
    enabled: !!id,
  });
}

export function useMyJobs() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['my-jobs', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Job[];
    },
    enabled: !!user,
  });
}

export function useAdminJobs(statusFilter?: string) {
  return useQuery({
    queryKey: ['admin-jobs', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Job[];
    },
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: Partial<Job>) => {
      if (!user) throw new Error('Você precisa estar logado');

      const { data: result, error } = await supabase
        .from('jobs')
        .insert([{
          title: data.title!,
          description: data.description!,
          company_name: data.company_name!,
          category: data.category!,
          job_type: data.job_type!,
          work_mode: data.work_mode,
          salary_min: data.salary_min,
          salary_max: data.salary_max,
          salary_type: data.salary_type,
          requirements: data.requirements,
          benefits: data.benefits,
          location: data.location,
          contact_email: data.contact_email,
          application_link: data.application_link,
          user_id: user.id,
          status: 'active',
        }])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['my-jobs'] });
      toast.success('Vaga publicada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Job> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('jobs')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['my-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
      toast.success('Vaga atualizada!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['my-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
      toast.success('Vaga removida!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useApplyToJob() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: Partial<JobApplication> & { job_id: string }) => {
      if (!user) throw new Error('Você precisa estar logado');

      const { data: result, error } = await supabase
        .from('job_applications')
        .insert([{
          job_id: data.job_id,
          full_name: data.full_name!,
          email: data.email!,
          phone: data.phone,
          resume_url: data.resume_url,
          cover_letter: data.cover_letter,
          linkedin_url: data.linkedin_url,
          user_id: user.id,
          status: 'received',
        }])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('Você já se candidatou a esta vaga');
        }
        throw error;
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      toast.success('Candidatura enviada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useJobApplications(jobId: string | undefined) {
  return useQuery({
    queryKey: ['job-applications', jobId],
    queryFn: async () => {
      if (!jobId) return [];
      
      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as JobApplication[];
    },
    enabled: !!jobId,
  });
}

export function useMyApplications() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['my-applications', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('job_applications')
        .select('*, jobs(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}
