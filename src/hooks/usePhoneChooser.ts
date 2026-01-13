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
  // Accessibility fields
  accessibility_score?: number;
  accessibility_features?: string[];
  accessibility_badges?: string[];
  screen_size?: number;
  has_physical_buttons?: boolean;
  has_nfc?: boolean;
  weight_grams?: number;
  water_resistant?: boolean;
  drop_resistant?: boolean;
  has_emergency_sos?: boolean;
  speaker_quality?: string;
  vibration_strength?: string;
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

export interface QuizAnswersPCD {
  // Bloco 1 - Perfil Geral
  usage: 'communication' | 'work' | 'entertainment' | 'health' | 'basic';
  budget: 'under800' | '800to1500' | '1500to3000' | 'above3000';
  
  // Bloco 2 - Identificação de Acessibilidade
  isPCD: 'yes' | 'no' | 'prefer_not_say';
  disabilityTypes: ('visual' | 'auditory' | 'motor' | 'intellectual' | 
                    'psychosocial' | 'neurodivergent' | 'multiple' | 'prefer_not_say')[];
  
  // Bloco 3 - Necessidades Específicas
  accessibilityNeeds: ('large_screen' | 'high_contrast' | 'screen_reader' | 
                       'voice_control' | 'strong_vibration' | 'physical_buttons' | 
                       'simple_interface' | 'loud_audio')[];
  accessibilityTools: ('talkback' | 'voiceover' | 'libras' | 'dictation' | 
                       'magnification' | 'accessibility_keys' | 'none')[];
  
  // Bloco 4 - Conforto e Segurança
  physicalPreferences: ('lightweight' | 'ergonomic' | 'drop_resistant' | 
                        'water_resistant' | 'long_battery')[];
  securityNeeds: ('emergency_button' | 'location_sharing' | 'face_unlock' | 
                  'fingerprint' | 'none')[];
  
  // Bloco 5 - Preferências Finais
  purchasePreference: 'new' | 'refurbished' | 'any';
  wantsInstallments: boolean;
}

export interface PhoneRecommendation {
  id: string;
  user_id: string;
  answers: QuizAnswers | QuizAnswersPCD;
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

  // PCD Budget mapping
  const PCD_BUDGET_MAP: Record<string, string[]> = {
    under800: ['budget'],
    '800to1500': ['budget', 'mid'],
    '1500to3000': ['budget', 'mid', 'premium'],
    above3000: ['budget', 'mid', 'premium', 'flagship'],
  };

  // Calculate PCD recommendation based on accessibility answers
  const calculatePCDRecommendation = (answers: QuizAnswersPCD): { 
    main: Phone; 
    alternatives: Phone[]; 
    top10: Phone[];
  } | null => {
    if (phones.length === 0) return null;

    // Filter by budget
    const allowedRanges = PCD_BUDGET_MAP[answers.budget] || ['budget', 'mid'];
    let candidates = phones.filter((p) => allowedRanges.includes(p.price_range));

    if (candidates.length === 0) {
      candidates = phones;
    }

    // Score each phone for PCD needs
    const scored = candidates.map((phone) => {
      let score = 0;
      let accessibilityScore = phone.accessibility_score || 0;

      // Base accessibility score (0-100 points)
      score += accessibilityScore * 10;

      // Disability type scoring (+30 each if compatible)
      if (answers.disabilityTypes.includes('visual')) {
        // Visual: screen reader support, large screen, high contrast
        if (phone.accessibility_features?.includes('talkback') || 
            phone.accessibility_features?.includes('voiceover')) {
          score += 30;
        }
        if ((phone.screen_size || 0) >= 6.5) score += 15;
        if (phone.accessibility_features?.includes('high_contrast')) score += 10;
      }

      if (answers.disabilityTypes.includes('auditory')) {
        // Auditory: vibration, visual alerts, Libras support
        if (phone.vibration_strength === 'strong') score += 25;
        if (phone.accessibility_features?.includes('libras_support')) score += 30;
        if (phone.accessibility_features?.includes('subtitle_support')) score += 10;
      }

      if (answers.disabilityTypes.includes('motor')) {
        // Motor: voice control, physical buttons, lightweight
        if (phone.accessibility_features?.includes('voice_control')) score += 30;
        if (phone.has_physical_buttons) score += 15;
        if ((phone.weight_grams || 200) < 180) score += 15;
      }

      if (answers.disabilityTypes.includes('intellectual')) {
        // Intellectual: simple interface
        if (phone.accessibility_features?.includes('simplified_ui')) score += 30;
      }

      if (answers.disabilityTypes.includes('neurodivergent')) {
        // Neurodivergent: focus mode, reduced stimuli
        if (phone.accessibility_features?.includes('focus_mode')) score += 20;
        if (phone.accessibility_features?.includes('simplified_ui')) score += 15;
      }

      // Accessibility needs scoring
      if (answers.accessibilityNeeds.includes('large_screen') && (phone.screen_size || 0) >= 6.5) {
        score += 15;
      }
      if (answers.accessibilityNeeds.includes('screen_reader') && 
          (phone.accessibility_features?.includes('talkback') || 
           phone.accessibility_features?.includes('voiceover'))) {
        score += 20;
      }
      if (answers.accessibilityNeeds.includes('voice_control') && 
          phone.accessibility_features?.includes('voice_control')) {
        score += 20;
      }
      if (answers.accessibilityNeeds.includes('strong_vibration') && 
          phone.vibration_strength === 'strong') {
        score += 15;
      }
      if (answers.accessibilityNeeds.includes('physical_buttons') && phone.has_physical_buttons) {
        score += 15;
      }
      if (answers.accessibilityNeeds.includes('simple_interface') && 
          phone.accessibility_features?.includes('simplified_ui')) {
        score += 15;
      }
      if (answers.accessibilityNeeds.includes('loud_audio') && 
          phone.speaker_quality === 'excellent') {
        score += 15;
      }

      // Physical preferences
      if (answers.physicalPreferences.includes('lightweight') && (phone.weight_grams || 200) < 180) {
        score += 10;
      }
      if (answers.physicalPreferences.includes('drop_resistant') && phone.drop_resistant) {
        score += 10;
      }
      if (answers.physicalPreferences.includes('water_resistant') && phone.water_resistant) {
        score += 10;
      }
      if (answers.physicalPreferences.includes('long_battery') && phone.battery_score >= 4) {
        score += 15;
      }

      // Security needs
      if (answers.securityNeeds.includes('emergency_button') && phone.has_emergency_sos) {
        score += 15;
      }

      // Usage scoring
      switch (answers.usage) {
        case 'communication':
          score += phone.battery_score * 5;
          break;
        case 'entertainment':
          score += phone.camera_score * 3;
          score += phone.gaming_score * 3;
          break;
        case 'health':
          if (phone.has_nfc) score += 10;
          break;
      }

      // Penalize phones with low accessibility support
      if (accessibilityScore < 3) {
        score -= 30;
      }

      return { phone, score, accessibilityScore };
    });

    // Sort by score
    scored.sort((a, b) => b.score - a.score);

    if (scored.length === 0) return null;

    return {
      main: scored[0].phone,
      alternatives: scored.slice(1, 3).map((s) => s.phone),
      top10: scored.slice(0, 10).map((s) => s.phone),
    };
  };

  // Save recommendation
  const saveRecommendation = useMutation({
    mutationFn: async ({
      answers,
      mainPhoneId,
      alternativeIds,
    }: {
      answers: QuizAnswers | QuizAnswersPCD;
      mainPhoneId: string;
      alternativeIds: string[];
    }) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('phone_recommendations')
        .insert({
          user_id: user.id,
          answers: JSON.parse(JSON.stringify(answers)),
          recommended_phone_id: mainPhoneId,
          alternative_phones: alternativeIds,
        })
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
    calculatePCDRecommendation,
    saveRecommendation,
    createPhone,
    updatePhone,
    togglePhoneActive,
    deletePhone,
  };
}
