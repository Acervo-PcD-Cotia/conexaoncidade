import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface TrainingModule {
  id: string;
  key: string;
  title: string;
  description: string | null;
  icon: string | null;
  target_roles: string[] | null;
  category: string | null;
  sort_order: number | null;
  is_published: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface TrainingStep {
  id: string;
  module_id: string;
  title: string;
  content_html: string | null;
  video_url: string | null;
  action_url: string | null;
  action_label: string | null;
  sort_order: number | null;
  created_at: string | null;
}

export interface TrainingProgress {
  id: string;
  user_id: string;
  step_id: string;
  completed_at: string | null;
}

// Modules hooks
export function useTrainingModules(category?: string) {
  return useQuery({
    queryKey: ['training_modules', category],
    queryFn: async () => {
      let query = supabase
        .from('training_modules')
        .select('*')
        .eq('is_published', true)
        .order('sort_order');
      
      if (category) {
        query = query.eq('category', category);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as TrainingModule[];
    },
  });
}

export function useTrainingModule(key: string | undefined) {
  return useQuery({
    queryKey: ['training_modules', key],
    queryFn: async () => {
      if (!key) return null;
      const { data, error } = await supabase
        .from('training_modules')
        .select('*')
        .eq('key', key)
        .single();
      if (error) throw error;
      return data as TrainingModule;
    },
    enabled: !!key,
  });
}

// Steps hooks
export function useTrainingSteps(moduleId: string | undefined) {
  return useQuery({
    queryKey: ['training_steps', moduleId],
    queryFn: async () => {
      if (!moduleId) return [];
      const { data, error } = await supabase
        .from('training_steps')
        .select('*')
        .eq('module_id', moduleId)
        .order('sort_order');
      if (error) throw error;
      return data as TrainingStep[];
    },
    enabled: !!moduleId,
  });
}

// Progress hooks
export function useUserTrainingProgress() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['training_progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('training_progress')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data as TrainingProgress[];
    },
    enabled: !!user?.id,
  });
}

export function useMarkStepComplete() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (stepId: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('training_progress')
        .insert({ user_id: user.id, step_id: stepId })
        .select()
        .single();
      
      // Ignore conflict (already completed)
      if (error && error.code !== '23505') throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training_progress', user?.id] });
    },
  });
}

// Combined hook for module with progress
export function useModuleWithProgress(moduleId: string | undefined) {
  const { data: steps = [] } = useTrainingSteps(moduleId);
  const { data: progress = [] } = useUserTrainingProgress();
  
  const completedStepIds = new Set(progress.map(p => p.step_id));
  
  const stepsWithProgress = steps.map(step => ({
    ...step,
    isCompleted: completedStepIds.has(step.id),
  }));
  
  const completedCount = stepsWithProgress.filter(s => s.isCompleted).length;
  const totalCount = stepsWithProgress.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  
  return {
    steps: stepsWithProgress,
    completedCount,
    totalCount,
    progressPercent,
  };
}

// Categories summary
export function useTrainingCategoriesSummary() {
  const { data: modules = [] } = useTrainingModules();
  
  const categories = [
    { key: 'getting_started', label: 'Começar Agora', icon: 'Rocket' },
    { key: 'by_module', label: 'Por Módulo', icon: 'Layers' },
    { key: 'by_profile', label: 'Por Perfil', icon: 'Users' },
  ];
  
  return categories.map(cat => ({
    ...cat,
    modules: modules.filter(m => m.category === cat.key),
    count: modules.filter(m => m.category === cat.key).length,
  }));
}
