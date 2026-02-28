/**
 * Guia Comercial - React Query Hooks
 * Complete data fetching and mutations for business directory
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";
import type {
  Business,
  BusinessCategory,
  BusinessReview,
  BusinessLead,
  BusinessService,
  BusinessFaq,
  BusinessPromotion,
  BusinessPlanFeature,
  GuiaSeoPage,
  BusinessFilters,
  BusinessStats,
  CreateBusinessInput,
  UpdateBusinessInput,
  CreateLeadInput,
  CreateReviewInput,
  BusinessPlan,
  LeadStatus,
  OpeningHours,
} from "@/types/guia-comercial";

// ========================
// BUSINESSES
// ========================

export function useBusinesses(filters: BusinessFilters = {}) {
  const {
    category,
    city,
    neighborhood,
    plan,
    verified_only,
    featured_only,
    search,
    min_rating,
    sort = 'relevance',
    limit = 20,
    offset = 0,
  } = filters;

  return useQuery({
    queryKey: ['businesses', filters],
    queryFn: async () => {
      let query = supabase
        .from('businesses')
        .select('*')
        .eq('is_active', true);

      if (category) {
        query = query.eq('category_main', category);
      }
      if (city) {
        query = query.eq('city', city);
      }
      if (neighborhood) {
        query = query.contains('neighborhoods', [neighborhood]);
      }
      if (plan) {
        query = query.eq('plan', plan);
      }
      if (verified_only) {
        query = query.eq('verification_status', 'verified');
      }
      if (featured_only) {
        query = query.eq('is_featured', true);
      }
      if (search) {
        query = query.or(`name.ilike.%${search}%,description_short.ilike.%${search}%,tags.cs.{${search}}`);
      }
      if (min_rating) {
        query = query.gte('avg_rating', min_rating);
      }

      // Sorting - premium/featured first, then by criteria
      switch (sort) {
        case 'rating':
          query = query.order('plan', { ascending: false }).order('avg_rating', { ascending: false });
          break;
        case 'reviews':
          query = query.order('plan', { ascending: false }).order('review_count', { ascending: false });
          break;
        case 'newest':
          query = query.order('plan', { ascending: false }).order('created_at', { ascending: false });
          break;
        case 'name':
          query = query.order('plan', { ascending: false }).order('name');
          break;
        default:
          // Relevance: featured first, then by plan, then by rating
          query = query
            .order('is_featured', { ascending: false })
            .order('plan', { ascending: false })
            .order('avg_rating', { ascending: false });
      }

      query = query.range(offset, offset + limit - 1);

      const { data, error } = await query;
      if (error) throw error;

      return (data ?? []).map(mapBusinessFromDb) as Business[];
    },
  });
}

export function useBusiness(slug: string) {
  return useQuery({
    queryKey: ['business', slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          *,
          services:business_services(*),
          promotions:business_promotions(*),
          faqs:business_faqs(*)
        `)
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return mapBusinessFromDb(data) as Business;
    },
  });
}

export function useMyBusinesses() {
  return useQuery({
    queryKey: ['my-businesses'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data ?? []).map(mapBusinessFromDb) as Business[];
    },
  });
}

export function useCreateBusiness() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateBusinessInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const slug = generateSlug(input.name);

      const { data, error } = await supabase
        .from('businesses')
        .insert({
          user_id: user.id,
          name: input.name,
          slug,
          category_main: input.category_main,
          city: input.city,
          description_short: input.description_short,
          description_full: input.description_full,
          neighborhoods: input.neighborhoods ?? [],
          whatsapp: input.whatsapp,
          phone: input.phone,
          email: input.email,
          website: input.website,
          instagram: input.instagram,
          address: input.address,
          opening_hours: (input.opening_hours ?? {}) as unknown as Json,
          payment_methods: input.payment_methods ?? [],
          tags: input.tags ?? [],
        })
        .select()
        .single();

      if (error) throw error;
      return mapBusinessFromDb(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-businesses'] });
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      toast.success('Empresa cadastrada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao cadastrar empresa: ' + error.message);
    },
  });
}

export function useUpdateBusiness() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateBusinessInput) => {
      const { id, ...updates } = input;

      const { data, error } = await supabase
        .from('businesses')
        .update({
          ...updates,
          opening_hours: updates.opening_hours as unknown as Json,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return mapBusinessFromDb(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['my-businesses'] });
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      queryClient.invalidateQueries({ queryKey: ['business', data.slug] });
      toast.success('Empresa atualizada!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar: ' + error.message);
    },
  });
}

export function useIncrementBusinessViews() {
  return useMutation({
    mutationFn: async (businessId: string) => {
      const { error } = await supabase.rpc('increment_business_views', { p_id: businessId });
      if (error) throw error;
    },
  });
}

export function useLogBusinessClick() {
  return useMutation({
    mutationFn: async ({ businessId, clickType, sourcePage }: {
      businessId: string;
      clickType: 'whatsapp' | 'phone' | 'website' | 'directions' | 'instagram';
      sourcePage?: string;
    }) => {
      const { error } = await supabase.rpc('log_business_click', {
        p_business_id: businessId,
        p_click_type: clickType,
        p_source_page: sourcePage,
      });
      if (error) throw error;
    },
  });
}

// ========================
// CATEGORIES
// ========================

export function useBusinessCategories() {
  return useQuery({
    queryKey: ['business-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')
        .order('name');

      if (error) throw error;
      return data as BusinessCategory[];
    },
  });
}

export function useBusinessCategory(slug: string) {
  return useQuery({
    queryKey: ['business-category', slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_categories')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data as BusinessCategory;
    },
  });
}

// ========================
// REVIEWS
// ========================

export function useBusinessReviews(businessId: string) {
  return useQuery({
    queryKey: ['business-reviews', businessId],
    enabled: !!businessId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_reviews')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BusinessReview[];
    },
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateReviewInput) => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('business_reviews')
        .insert({
          business_id: input.business_id,
          user_id: user?.id ?? null,
          rating: input.rating,
          author_name: input.author_name,
          author_email: input.author_email,
          title: input.title,
          content: input.content,
          pros: input.pros ?? [],
          cons: input.cons ?? [],
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['business-reviews', variables.business_id] });
      toast.success('Avaliação enviada! Será publicada após moderação.');
    },
    onError: (error) => {
      toast.error('Erro ao enviar avaliação: ' + error.message);
    },
  });
}

// ========================
// LEADS
// ========================

export function useBusinessLeads(businessId?: string) {
  return useQuery({
    queryKey: ['business-leads', businessId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let query = supabase
        .from('business_leads')
        .select(`
          *,
          business:business_id (id, name, slug, logo_url)
        `)
        .order('created_at', { ascending: false });

      if (businessId) {
        query = query.eq('business_id', businessId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data as BusinessLead[];
    },
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateLeadInput) => {
      const { data, error } = await supabase
        .from('business_leads')
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-leads'] });
      toast.success('Solicitação enviada! A empresa entrará em contato.');
    },
    onError: (error) => {
      toast.error('Erro ao enviar solicitação: ' + error.message);
    },
  });
}

export function useUpdateLeadStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: LeadStatus; notes?: string }) => {
      const updates: Record<string, unknown> = { status };
      
      if (status === 'contacted') {
        updates.contacted_at = new Date().toISOString();
      }
      if (status === 'converted') {
        updates.converted_at = new Date().toISOString();
      }
      if (notes !== undefined) {
        updates.notes = notes;
      }

      const { error } = await supabase
        .from('business_leads')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-leads'] });
      toast.success('Lead atualizado!');
    },
  });
}

// ========================
// SERVICES
// ========================

export function useBusinessServices(businessId: string) {
  return useQuery({
    queryKey: ['business-services', businessId],
    enabled: !!businessId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_services')
        .select('*')
        .eq('business_id', businessId)
        .order('sort_order')
        .order('name');

      if (error) throw error;
      return data as BusinessService[];
    },
  });
}

export function useManageBusinessServices() {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: async (input: Omit<BusinessService, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('business_services')
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['business-services', variables.business_id] });
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BusinessService> & { id: string }) => {
      const { error } = await supabase
        .from('business_services')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-services'] });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('business_services')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-services'] });
    },
  });

  return { create, update, remove };
}

// ========================
// PLAN FEATURES
// ========================

export function useBusinessPlanFeatures() {
  return useQuery({
    queryKey: ['business-plan-features'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_plan_features')
        .select('*')
        .order('plan')
        .order('feature_key');

      if (error) throw error;
      return data as BusinessPlanFeature[];
    },
  });
}

export function usePlanFeatures(plan: BusinessPlan) {
  const { data: allFeatures } = useBusinessPlanFeatures();
  return allFeatures?.filter(f => f.plan === plan) ?? [];
}

// ========================
// STATS
// ========================

export function useBusinessStats(businessId: string, days = 30) {
  return useQuery({
    queryKey: ['business-stats', businessId, days],
    enabled: !!businessId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_business_stats', {
        p_business_id: businessId,
        p_days: days,
      });

      if (error) throw error;
      return data?.[0] as BusinessStats;
    },
  });
}

// ========================
// CLICK HISTORY (for charts)
// ========================

export function useBusinessClickHistory(businessIds: string[], days = 30) {
  return useQuery({
    queryKey: ['business-click-history', businessIds, days],
    enabled: businessIds.length > 0,
    queryFn: async () => {
      const since = new Date();
      since.setDate(since.getDate() - days);

      const { data, error } = await supabase
        .from('business_clicks')
        .select('click_type, created_at')
        .in('business_id', businessIds)
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by date
      const byDate: Record<string, { date: string; views: number; whatsapp: number; phone: number; website: number }> = {};
      
      for (const click of data ?? []) {
        const date = new Date(click.created_at).toISOString().split('T')[0];
        if (!byDate[date]) {
          byDate[date] = { date, views: 0, whatsapp: 0, phone: 0, website: 0 };
        }
        const type = click.click_type as string;
        if (type === 'view') byDate[date].views++;
        else if (type === 'whatsapp') byDate[date].whatsapp++;
        else if (type === 'phone') byDate[date].phone++;
        else if (type === 'website') byDate[date].website++;
      }

      // Fill missing dates
      const result = [];
      const current = new Date(since);
      const today = new Date();
      while (current <= today) {
        const dateStr = current.toISOString().split('T')[0];
        result.push(byDate[dateStr] ?? { date: dateStr, views: 0, whatsapp: 0, phone: 0, website: 0 });
        current.setDate(current.getDate() + 1);
      }

      return result;
    },
  });
}

// ========================
// SEO PAGES
// ========================

export function useGuiaSeoPage(slug: string) {
  return useQuery({
    queryKey: ['guia-seo-page', slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guia_seo_pages')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data as GuiaSeoPage;
    },
  });
}

// ========================
// HELPERS
// ========================

function generateSlug(name: string): string {
  const baseSlug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  // Add random suffix for uniqueness
  const suffix = Math.random().toString(36).substring(2, 6);
  return `${baseSlug}-${suffix}`;
}

function mapBusinessFromDb(row: Record<string, unknown>): Business {
  return {
    ...row,
    opening_hours: (row.opening_hours as OpeningHours) ?? {},
    neighborhoods: (row.neighborhoods as string[]) ?? [],
    categories_secondary: (row.categories_secondary as string[]) ?? [],
    payment_methods: (row.payment_methods as string[]) ?? [],
    amenities: (row.amenities as string[]) ?? [],
    tags: (row.tags as string[]) ?? [],
    gallery_urls: (row.gallery_urls as string[]) ?? [],
    seo_keywords: (row.seo_keywords as string[]) ?? [],
  } as Business;
}
