import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Phone {
  id: string;
  name: string;
  brand: string;
  price_min: number;
  price_max: number;
  price_range: 'budget' | 'mid' | 'premium' | 'flagship';
  image_url: string | null;
  ideal_for: string;
  strengths: string[];
  considerations: string[];
  use_cases: string[];
  gaming_score: number;
  camera_score: number;
  battery_score: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuizAnswers {
  usage: 'social' | 'photography' | 'games' | 'work' | 'all';
  budget: 'budget' | 'mid' | 'premium' | 'flagship';
  brand: string | null;
  priority: 'battery' | 'camera' | 'gaming' | 'storage' | 'price';
  gaming: 'none' | 'casual' | 'heavy';
  work: boolean;
  social: 'heavy' | 'moderate' | 'light';
}

export interface PhoneRecommendation {
  id: string;
  user_id: string;
  answers: QuizAnswers;
  recommended_phone_id: string | null;
  alternative_phones: string[];
  created_at: string;
  recommended_phone?: Phone;
  alternatives?: Phone[];
}

const BUDGET_MAP: Record<string, string[]> = {
  budget: ['budget'],
  mid: ['budget', 'mid'],
  premium: ['budget', 'mid', 'premium'],
  flagship: ['budget', 'mid', 'premium', 'flagship'],
};

export function usePhoneChooser() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all active phones
  const { data: phones = [], isLoading: isLoadingPhones } = useQuery({
    queryKey: ['phone-catalog'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('phone_catalog')
        .select('*')
        .eq('is_active', true)
        .order('price_min', { ascending: true });

      if (error) throw error;
      return data as Phone[];
    },
  });

  // Fetch all phones for admin
  const { data: allPhones = [], isLoading: isLoadingAllPhones } = useQuery({
    queryKey: ['phone-catalog-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('phone_catalog')
        .select('*')
        .order('brand', { ascending: true })
        .order('price_min', { ascending: true });

      if (error) throw error;
      return data as Phone[];
    },
    enabled: !!user,
  });

  // Fetch user's recommendation history
  const { data: history = [], isLoading: isLoadingHistory } = useQuery({
    queryKey: ['phone-recommendations', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('phone_recommendations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Enrich with phone data
      const enriched = (data || []).map((rec) => {
        const recommendedPhone = phones.find((p) => p.id === rec.recommended_phone_id);
        const alternatives = phones.filter((p) => (rec.alternative_phones || []).includes(p.id));
        return { 
          ...rec, 
          answers: rec.answers as unknown as QuizAnswers,
          recommended_phone: recommendedPhone, 
          alternatives 
        } as PhoneRecommendation;
      });

      return enriched;
    },
    enabled: !!user?.id && phones.length > 0,
  });

  // Calculate recommendation based on answers
  const calculateRecommendation = (answers: QuizAnswers): { main: Phone; alternatives: Phone[] } | null => {
    if (phones.length === 0) return null;

    // Filter by budget
    const allowedRanges = BUDGET_MAP[answers.budget] || ['budget'];
    let candidates = phones.filter((p) => allowedRanges.includes(p.price_range));

    // Filter by brand if specified
    if (answers.brand && answers.brand !== 'any') {
      const brandFiltered = candidates.filter((p) => p.brand.toLowerCase() === answers.brand?.toLowerCase());
      if (brandFiltered.length > 0) {
        candidates = brandFiltered;
      }
    }

    if (candidates.length === 0) {
      candidates = phones.filter((p) => allowedRanges.includes(p.price_range));
    }

    // Score each phone
    const scored = candidates.map((phone) => {
      let score = 0;

      // Usage match
      const usageMap: Record<string, string[]> = {
        social: ['social', 'messaging', 'streaming'],
        photography: ['photography', 'video'],
        games: ['games'],
        work: ['work', 'productivity'],
        all: ['social', 'photography', 'games', 'work'],
      };

      const targetUseCases = usageMap[answers.usage] || [];
      const useCaseMatches = phone.use_cases.filter((uc) => targetUseCases.includes(uc)).length;
      score += useCaseMatches * 20;

      // Priority scoring
      switch (answers.priority) {
        case 'battery':
          score += phone.battery_score * 15;
          break;
        case 'camera':
          score += phone.camera_score * 15;
          break;
        case 'gaming':
          score += phone.gaming_score * 15;
          break;
        case 'storage':
          score += 10; // All phones have similar storage
          break;
        case 'price':
          score += (6 - phone.gaming_score) * 5; // Prefer cheaper options
          break;
      }

      // Gaming preference
      if (answers.gaming === 'heavy') {
        score += phone.gaming_score * 10;
      } else if (answers.gaming === 'casual') {
        score += phone.gaming_score * 5;
      }

      // Social media usage
      if (answers.social === 'heavy') {
        score += phone.camera_score * 5;
        score += phone.battery_score * 5;
      }

      // Work usage
      if (answers.work) {
        score += phone.battery_score * 5;
      }

      return { phone, score };
    });

    // Sort by score
    scored.sort((a, b) => b.score - a.score);

    if (scored.length === 0) return null;

    return {
      main: scored[0].phone,
      alternatives: scored.slice(1, 3).map((s) => s.phone),
    };
  };

  // Save recommendation
  const saveRecommendation = useMutation({
    mutationFn: async ({
      answers,
      mainPhoneId,
      alternativeIds,
    }: {
      answers: QuizAnswers;
      mainPhoneId: string;
      alternativeIds: string[];
    }) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('phone_recommendations')
        .insert([{
          user_id: user.id,
          answers: answers as unknown as Record<string, unknown>,
          recommended_phone_id: mainPhoneId,
          alternative_phones: alternativeIds,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phone-recommendations'] });
    },
  });

  // Admin: Create phone
  const createPhone = useMutation({
    mutationFn: async (phone: Omit<Phone, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase.from('phone_catalog').insert(phone).select().single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phone-catalog'] });
      queryClient.invalidateQueries({ queryKey: ['phone-catalog-admin'] });
      toast.success('Celular cadastrado com sucesso');
    },
    onError: () => {
      toast.error('Erro ao cadastrar celular');
    },
  });

  // Admin: Update phone
  const updatePhone = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Phone> & { id: string }) => {
      const { data, error } = await supabase.from('phone_catalog').update(updates).eq('id', id).select().single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phone-catalog'] });
      queryClient.invalidateQueries({ queryKey: ['phone-catalog-admin'] });
      toast.success('Celular atualizado com sucesso');
    },
    onError: () => {
      toast.error('Erro ao atualizar celular');
    },
  });

  // Admin: Toggle active status
  const togglePhoneActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase.from('phone_catalog').update({ is_active }).eq('id', id).select().single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['phone-catalog'] });
      queryClient.invalidateQueries({ queryKey: ['phone-catalog-admin'] });
      toast.success(variables.is_active ? 'Celular ativado' : 'Celular desativado');
    },
  });

  // Admin: Delete phone
  const deletePhone = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('phone_catalog').delete().eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phone-catalog'] });
      queryClient.invalidateQueries({ queryKey: ['phone-catalog-admin'] });
      toast.success('Celular removido com sucesso');
    },
    onError: () => {
      toast.error('Erro ao remover celular');
    },
  });

  return {
    phones,
    allPhones,
    isLoadingPhones,
    isLoadingAllPhones,
    history,
    isLoadingHistory,
    calculateRecommendation,
    saveRecommendation,
    createPhone,
    updatePhone,
    togglePhoneActive,
    deletePhone,
  };
}
