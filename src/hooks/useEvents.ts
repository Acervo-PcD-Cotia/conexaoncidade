import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Event {
  id: string;
  tenant_id: string | null;
  title: string;
  slug: string;
  description: string | null;
  content_html: string | null;
  location: string | null;
  location_type: string | null;
  online_url: string | null;
  start_date: string;
  end_date: string | null;
  hero_image_url: string | null;
  is_public: boolean | null;
  is_free: boolean | null;
  max_attendees: number | null;
  status: string | null;
  seo_title: string | null;
  seo_description: string | null;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface EventTicket {
  id: string;
  event_id: string;
  name: string;
  description: string | null;
  price: number | null;
  quantity: number;
  sold_count: number | null;
  sales_start: string | null;
  sales_end: string | null;
  is_active: boolean | null;
  sort_order: number | null;
}

export interface EventAttendee {
  id: string;
  event_id: string;
  ticket_id: string | null;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  document: string | null;
  ticket_code: string | null;
  qr_code_url: string | null;
  status: string | null;
  payment_status: string | null;
  payment_method: string | null;
  payment_amount: number | null;
  checked_in: boolean | null;
  checked_in_at: string | null;
  notes: string | null;
  created_at: string | null;
}

export interface EventCoupon {
  id: string;
  event_id: string;
  code: string;
  discount_type: string | null;
  discount_value: number;
  max_uses: number | null;
  used_count: number | null;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean | null;
}

// Events hooks
export function useEvents(status?: string) {
  return useQuery({
    queryKey: ['events', status],
    queryFn: async () => {
      let query = supabase
        .from('events')
        .select('*')
        .order('start_date', { ascending: false });
      
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Event[];
    },
  });
}

export function useEvent(id: string | undefined) {
  return useQuery({
    queryKey: ['events', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Event;
    },
    enabled: !!id,
  });
}

export function useEventBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['events', 'slug', slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();
      if (error) throw error;
      return data as Event;
    },
    enabled: !!slug,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (event: Omit<Event, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('events')
        .insert(event as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Event> & { id: string }) => {
      const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', variables.id] });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

// Tickets hooks
export function useEventTickets(eventId: string | undefined) {
  return useQuery({
    queryKey: ['event_tickets', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      const { data, error } = await supabase
        .from('event_tickets')
        .select('*')
        .eq('event_id', eventId)
        .order('sort_order');
      if (error) throw error;
      return data as EventTicket[];
    },
    enabled: !!eventId,
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (ticket: Omit<EventTicket, 'id'>) => {
      const { data, error } = await supabase
        .from('event_tickets')
        .insert(ticket as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['event_tickets', variables.event_id] });
    },
  });
}

export function useUpdateTicket() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EventTicket> & { id: string }) => {
      const { data, error } = await supabase
        .from('event_tickets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['event_tickets', data.event_id] });
    },
  });
}

export function useDeleteTicket() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, eventId }: { id: string; eventId: string }) => {
      const { error } = await supabase.from('event_tickets').delete().eq('id', id);
      if (error) throw error;
      return eventId;
    },
    onSuccess: (eventId) => {
      queryClient.invalidateQueries({ queryKey: ['event_tickets', eventId] });
    },
  });
}

// Attendees hooks
export function useEventAttendees(eventId: string | undefined) {
  return useQuery({
    queryKey: ['event_attendees', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      const { data, error } = await supabase
        .from('event_attendees')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as EventAttendee[];
    },
    enabled: !!eventId,
  });
}

export function useCreateAttendee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (attendee: Omit<EventAttendee, 'id' | 'ticket_code' | 'created_at' | 'updated_at'>) => {
      const ticketCode = `TKT-${Date.now().toString(36).toUpperCase()}`;
      const { data, error } = await supabase
        .from('event_attendees')
        .insert({ ...attendee, ticket_code: ticketCode } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['event_attendees', variables.event_id] });
    },
  });
}

export function useUpdateAttendee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EventAttendee> & { id: string }) => {
      const { data, error } = await supabase
        .from('event_attendees')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['event_attendees', data.event_id] });
    },
  });
}

// Checkin
export function useCheckinAttendee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ attendeeId, eventId }: { attendeeId: string; eventId: string }) => {
      // Update attendee
      const { error: updateError } = await supabase
        .from('event_attendees')
        .update({ checked_in: true, checked_in_at: new Date().toISOString() })
        .eq('id', attendeeId);
      if (updateError) throw updateError;
      
      // Create checkin record
      const { data, error } = await supabase
        .from('event_checkins')
        .insert({ attendee_id: attendeeId, event_id: eventId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['event_attendees', variables.eventId] });
    },
  });
}

// Coupons hooks
export function useEventCoupons(eventId: string | undefined) {
  return useQuery({
    queryKey: ['event_coupons', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      const { data, error } = await supabase
        .from('event_coupons')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as EventCoupon[];
    },
    enabled: !!eventId,
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (coupon: Omit<EventCoupon, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('event_coupons')
        .insert(coupon as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['event_coupons', variables.event_id] });
    },
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, eventId }: { id: string; eventId: string }) => {
      const { error } = await supabase.from('event_coupons').delete().eq('id', id);
      if (error) throw error;
      return eventId;
    },
    onSuccess: (eventId) => {
      queryClient.invalidateQueries({ queryKey: ['event_coupons', eventId] });
    },
  });
}
