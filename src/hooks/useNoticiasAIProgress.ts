import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Milestone {
  id: string;
  name: string;
  points: number;
  category: 'explore' | 'learn' | 'generate' | 'import' | 'mastery' | 'advanced';
  description: string;
}

export const MILESTONES: Milestone[] = [
  { id: 'first_visit', name: 'Primeira Visita', points: 5, category: 'explore', description: 'Acessou o módulo Notícias AI' },
  { id: 'tour_completed', name: 'Tour Concluído', points: 15, category: 'learn', description: 'Completou o tour guiado' },
  { id: 'first_text', name: 'Primeira Notícia', points: 10, category: 'generate', description: 'Processou seu primeiro texto' },
  { id: 'first_link', name: 'Primeira URL', points: 15, category: 'generate', description: 'Extraiu conteúdo de uma URL' },
  { id: 'first_image', name: 'Upload de Imagem', points: 10, category: 'generate', description: 'Enviou uma imagem' },
  { id: 'first_json', name: 'Primeiro JSON', points: 15, category: 'generate', description: 'Gerou JSON para importação' },
  { id: 'first_exclusiva', name: 'Usou EXCLUSIVA', points: 20, category: 'generate', description: 'Usou o modo EXCLUSIVA' },
  { id: 'first_import', name: 'Primeira Importação', points: 25, category: 'import', description: 'Importou uma notícia' },
  { id: 'first_batch', name: 'Modo Lote', points: 30, category: 'import', description: 'Usou o modo lote' },
  { id: 'ten_imports', name: '10 Importações', points: 50, category: 'mastery', description: 'Importou 10 notícias' },
  { id: 'fifty_imports', name: '50 Importações', points: 100, category: 'mastery', description: 'Importou 50 notícias' },
  { id: 'viewed_history', name: 'Viu Histórico', points: 5, category: 'explore', description: 'Acessou a aba histórico' },
  { id: 'viewed_stats', name: 'Viu Estatísticas', points: 5, category: 'explore', description: 'Acessou a aba estatísticas' },
  { id: 'created_source', name: 'Criou Fonte', points: 25, category: 'advanced', description: 'Criou uma fonte customizada' },
  { id: 'created_schedule', name: 'Criou Agendamento', points: 30, category: 'advanced', description: 'Criou um agendamento' },
];

export const LEVELS = {
  beginner: { name: 'Iniciante', minPoints: 0, icon: '🌱' },
  intermediate: { name: 'Intermediário', minPoints: 50, icon: '⭐' },
  advanced: { name: 'Avançado', minPoints: 150, icon: '🚀' },
  expert: { name: 'Expert', minPoints: 350, icon: '👑' },
};

export type Level = keyof typeof LEVELS;

interface UserProgress {
  id: string;
  user_id: string;
  points: number;
  level: Level;
  completed_milestones: string[];
  tour_completed: boolean;
  imports_count: number;
}

export function useNoticiasAIProgress() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('noticias_ai_user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching progress:', error);
        return;
      }

      if (data) {
        setProgress(data as UserProgress);
      } else {
        // Create initial progress
        const { data: newProgress, error: createError } = await supabase
          .from('noticias_ai_user_progress')
          .insert({ user_id: user.id })
          .select()
          .single();

        if (createError) {
          console.error('Error creating progress:', createError);
        } else {
          setProgress(newProgress as UserProgress);
        }
      }
    } catch (error) {
      console.error('Error in fetchProgress:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const calculateLevel = (points: number): Level => {
    if (points >= LEVELS.expert.minPoints) return 'expert';
    if (points >= LEVELS.advanced.minPoints) return 'advanced';
    if (points >= LEVELS.intermediate.minPoints) return 'intermediate';
    return 'beginner';
  };

  const completeMilestone = useCallback(async (milestoneId: string) => {
    if (!progress || !user) return false;

    if (progress.completed_milestones.includes(milestoneId)) {
      return false;
    }

    const milestone = MILESTONES.find(m => m.id === milestoneId);
    if (!milestone) return false;

    const newPoints = progress.points + milestone.points;
    const newLevel = calculateLevel(newPoints);
    const newMilestones = [...progress.completed_milestones, milestoneId];

    try {
      const { error } = await supabase
        .from('noticias_ai_user_progress')
        .update({
          points: newPoints,
          level: newLevel,
          completed_milestones: newMilestones,
          tour_completed: milestoneId === 'tour_completed' ? true : progress.tour_completed,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setProgress(prev => prev ? {
        ...prev,
        points: newPoints,
        level: newLevel,
        completed_milestones: newMilestones,
        tour_completed: milestoneId === 'tour_completed' ? true : prev.tour_completed,
      } : null);

      // Show achievement toast
      toast({
        title: `🎉 Conquista Desbloqueada!`,
        description: `${milestone.name} (+${milestone.points} pontos)`,
      });

      // Check for level up
      if (newLevel !== progress.level) {
        setTimeout(() => {
          toast({
            title: `🚀 Novo Nível!`,
            description: `Você agora é ${LEVELS[newLevel].icon} ${LEVELS[newLevel].name}`,
          });
        }, 1500);
      }

      return true;
    } catch (error) {
      console.error('Error completing milestone:', error);
      return false;
    }
  }, [progress, user, toast]);

  const incrementImports = useCallback(async (count: number = 1) => {
    if (!progress || !user) return;

    const newCount = progress.imports_count + count;

    try {
      await supabase
        .from('noticias_ai_user_progress')
        .update({ imports_count: newCount })
        .eq('user_id', user.id);

      setProgress(prev => prev ? { ...prev, imports_count: newCount } : null);

      // Check for import milestones
      if (newCount >= 10 && !progress.completed_milestones.includes('ten_imports')) {
        await completeMilestone('ten_imports');
      }
      if (newCount >= 50 && !progress.completed_milestones.includes('fifty_imports')) {
        await completeMilestone('fifty_imports');
      }
    } catch (error) {
      console.error('Error incrementing imports:', error);
    }
  }, [progress, user, completeMilestone]);

  const getNextMilestones = useCallback(() => {
    if (!progress) return MILESTONES.slice(0, 3);

    return MILESTONES
      .filter(m => !progress.completed_milestones.includes(m.id))
      .slice(0, 3);
  }, [progress]);

  const getProgressPercentage = useCallback(() => {
    if (!progress) return 0;
    return Math.round((progress.completed_milestones.length / MILESTONES.length) * 100);
  }, [progress]);

  const canAccessFeature = useCallback((feature: 'batch' | 'sources' | 'schedules') => {
    if (!progress) return false;
    
    switch (feature) {
      case 'batch':
        return progress.level !== 'beginner';
      case 'sources':
      case 'schedules':
        return progress.level === 'advanced' || progress.level === 'expert';
      default:
        return true;
    }
  }, [progress]);

  return {
    progress,
    loading,
    completeMilestone,
    incrementImports,
    getNextMilestones,
    getProgressPercentage,
    canAccessFeature,
    LEVELS,
    MILESTONES,
  };
}
