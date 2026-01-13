import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface PhoneOffer {
  id: string;
  phone_id: string;
  store: string;
  affiliate_url: string;
  price: number | null;
  priority: number;
  button_text: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PhoneOfferClick {
  id: string;
  offer_id: string;
  phone_id: string;
  store: string;
  user_id: string | null;
  clicked_at: string;
}

export interface PhoneAffiliateTemplate {
  id: string;
  store: string;
  url_template: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface OfferStats {
  totalClicks: number;
  clicksByPhone: { phone_id: string; phone_name: string; clicks: number }[];
  clicksByStore: { store: string; clicks: number }[];
  clicksByDate: { date: string; clicks: number }[];
  topOffers: { offer_id: string; phone_name: string; store: string; clicks: number }[];
}

export function usePhoneOffers(phoneId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch offers for a specific phone
  const { data: offers = [], isLoading: isLoadingOffers } = useQuery({
    queryKey: ['phone-offers', phoneId],
    queryFn: async () => {
      if (!phoneId) return [];
      
      const { data, error } = await supabase
        .from('phone_offers')
        .select('*')
        .eq('phone_id', phoneId)
        .order('priority', { ascending: true });

      if (error) throw error;
      return data as PhoneOffer[];
    },
    enabled: !!phoneId,
  });

  // Fetch active offers for display
  const { data: activeOffers = [], isLoading: isLoadingActiveOffers } = useQuery({
    queryKey: ['phone-offers-active', phoneId],
    queryFn: async () => {
      if (!phoneId) return [];
      
      const { data, error } = await supabase
        .from('phone_offers')
        .select('*')
        .eq('phone_id', phoneId)
        .eq('is_active', true)
        .order('priority', { ascending: true });

      if (error) throw error;
      return data as PhoneOffer[];
    },
    enabled: !!phoneId,
  });

  // Fetch all offers for admin (all phones)
  const { data: allOffers = [], isLoading: isLoadingAllOffers } = useQuery({
    queryKey: ['phone-offers-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('phone_offers')
        .select('*')
        .order('phone_id')
        .order('priority', { ascending: true });

      if (error) throw error;
      return data as PhoneOffer[];
    },
  });

  // Fetch affiliate templates
  const { data: templates = [], isLoading: isLoadingTemplates } = useQuery({
    queryKey: ['phone-affiliate-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('phone_affiliate_templates')
        .select('*')
        .order('store');

      if (error) throw error;
      return data as PhoneAffiliateTemplate[];
    },
  });

  // Track offer click
  const trackClick = useMutation({
    mutationFn: async ({ offerId, phoneId, store }: { offerId: string; phoneId: string; store: string }) => {
      const { error } = await supabase.from('phone_offer_clicks').insert({
        offer_id: offerId,
        phone_id: phoneId,
        store: store,
        user_id: user?.id || null,
      });

      if (error) throw error;
    },
    onError: (error) => {
      console.error('Error tracking click:', error);
    },
  });

  // Create offer
  const createOffer = useMutation({
    mutationFn: async (offer: Omit<PhoneOffer, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase.from('phone_offers').insert(offer).select().single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['phone-offers', variables.phone_id] });
      queryClient.invalidateQueries({ queryKey: ['phone-offers-active', variables.phone_id] });
      queryClient.invalidateQueries({ queryKey: ['phone-offers-all'] });
      toast.success('Oferta cadastrada com sucesso');
    },
    onError: () => {
      toast.error('Erro ao cadastrar oferta');
    },
  });

  // Update offer
  const updateOffer = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PhoneOffer> & { id: string }) => {
      const { data, error } = await supabase.from('phone_offers').update(updates).eq('id', id).select().single();

      if (error) throw error;
      return data as PhoneOffer;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['phone-offers', data.phone_id] });
      queryClient.invalidateQueries({ queryKey: ['phone-offers-active', data.phone_id] });
      queryClient.invalidateQueries({ queryKey: ['phone-offers-all'] });
      toast.success('Oferta atualizada com sucesso');
    },
    onError: () => {
      toast.error('Erro ao atualizar oferta');
    },
  });

  // Delete offer
  const deleteOffer = useMutation({
    mutationFn: async ({ id, phoneId }: { id: string; phoneId: string }) => {
      const { error } = await supabase.from('phone_offers').delete().eq('id', id);

      if (error) throw error;
      return phoneId;
    },
    onSuccess: (phoneId) => {
      queryClient.invalidateQueries({ queryKey: ['phone-offers', phoneId] });
      queryClient.invalidateQueries({ queryKey: ['phone-offers-active', phoneId] });
      queryClient.invalidateQueries({ queryKey: ['phone-offers-all'] });
      toast.success('Oferta removida com sucesso');
    },
    onError: () => {
      toast.error('Erro ao remover oferta');
    },
  });

  // Toggle offer active status
  const toggleOfferActive = useMutation({
    mutationFn: async ({ id, is_active, phoneId }: { id: string; is_active: boolean; phoneId: string }) => {
      const { data, error } = await supabase
        .from('phone_offers')
        .update({ is_active })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as PhoneOffer;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['phone-offers', variables.phoneId] });
      queryClient.invalidateQueries({ queryKey: ['phone-offers-active', variables.phoneId] });
      queryClient.invalidateQueries({ queryKey: ['phone-offers-all'] });
      toast.success(data.is_active ? 'Oferta ativada' : 'Oferta desativada');
    },
  });

  // Create template
  const createTemplate = useMutation({
    mutationFn: async (template: Omit<PhoneAffiliateTemplate, 'id' | 'created_at'>) => {
      const { data, error } = await supabase.from('phone_affiliate_templates').insert(template).select().single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phone-affiliate-templates'] });
      toast.success('Template cadastrado com sucesso');
    },
    onError: () => {
      toast.error('Erro ao cadastrar template');
    },
  });

  // Delete template
  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('phone_affiliate_templates').delete().eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phone-affiliate-templates'] });
      toast.success('Template removido com sucesso');
    },
    onError: () => {
      toast.error('Erro ao remover template');
    },
  });

  // Get best offer (lowest priority)
  const getBestOffer = () => {
    if (activeOffers.length === 0) return null;
    return activeOffers[0]; // Already sorted by priority ASC
  };

  // Get secondary offers (all except best)
  const getSecondaryOffers = () => {
    if (activeOffers.length <= 1) return [];
    return activeOffers.slice(1);
  };

  return {
    offers,
    activeOffers,
    allOffers,
    templates,
    isLoadingOffers,
    isLoadingActiveOffers,
    isLoadingAllOffers,
    isLoadingTemplates,
    trackClick,
    createOffer,
    updateOffer,
    deleteOffer,
    toggleOfferActive,
    createTemplate,
    deleteTemplate,
    getBestOffer,
    getSecondaryOffers,
  };
}

// Separate hook for admin statistics
export function usePhoneOfferStats(days: number = 30) {
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['phone-offer-stats', days],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get clicks with phone info
      const { data: clicks, error: clicksError } = await supabase
        .from('phone_offer_clicks')
        .select(`
          *,
          phone_offers (
            phone_id,
            store
          )
        `)
        .gte('clicked_at', startDate.toISOString());

      if (clicksError) throw clicksError;

      // Get phone names
      const { data: phones, error: phonesError } = await supabase
        .from('phone_catalog')
        .select('id, name');

      if (phonesError) throw phonesError;

      const phoneMap = new Map(phones.map((p) => [p.id, p.name]));

      // Calculate stats
      const totalClicks = clicks?.length || 0;

      // Clicks by phone
      const clicksByPhoneMap = new Map<string, number>();
      clicks?.forEach((click) => {
        const phoneId = click.phone_id;
        clicksByPhoneMap.set(phoneId, (clicksByPhoneMap.get(phoneId) || 0) + 1);
      });
      const clicksByPhone = Array.from(clicksByPhoneMap.entries())
        .map(([phone_id, clicks]) => ({
          phone_id,
          phone_name: phoneMap.get(phone_id) || 'Desconhecido',
          clicks,
        }))
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 10);

      // Clicks by store
      const clicksByStoreMap = new Map<string, number>();
      clicks?.forEach((click) => {
        const store = click.store;
        clicksByStoreMap.set(store, (clicksByStoreMap.get(store) || 0) + 1);
      });
      const clicksByStore = Array.from(clicksByStoreMap.entries())
        .map(([store, clicks]) => ({ store, clicks }))
        .sort((a, b) => b.clicks - a.clicks);

      // Clicks by date
      const clicksByDateMap = new Map<string, number>();
      clicks?.forEach((click) => {
        const date = new Date(click.clicked_at).toISOString().split('T')[0];
        clicksByDateMap.set(date, (clicksByDateMap.get(date) || 0) + 1);
      });
      const clicksByDate = Array.from(clicksByDateMap.entries())
        .map(([date, clicks]) => ({ date, clicks }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Top offers
      const offerClicksMap = new Map<string, { phone_id: string; store: string; clicks: number }>();
      clicks?.forEach((click) => {
        const offerId = click.offer_id;
        const existing = offerClicksMap.get(offerId);
        if (existing) {
          existing.clicks += 1;
        } else {
          offerClicksMap.set(offerId, {
            phone_id: click.phone_id,
            store: click.store,
            clicks: 1,
          });
        }
      });
      const topOffers = Array.from(offerClicksMap.entries())
        .map(([offer_id, data]) => ({
          offer_id,
          phone_name: phoneMap.get(data.phone_id) || 'Desconhecido',
          store: data.store,
          clicks: data.clicks,
        }))
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 10);

      return {
        totalClicks,
        clicksByPhone,
        clicksByStore,
        clicksByDate,
        topOffers,
      } as OfferStats;
    },
  });

  return { stats, isLoadingStats };
}
