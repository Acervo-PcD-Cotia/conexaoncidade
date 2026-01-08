import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ClickEvent {
  id: string;
  link_id: string | null;
  bio_button_id: string | null;
  clicked_at: string;
  referer: string | null;
  user_agent: string | null;
  device_type: 'desktop' | 'mobile' | 'tablet' | null;
  browser: string | null;
  ip_hash: string | null;
  country: string | null;
  city: string | null;
}

interface ClickEventFilters {
  link_id?: string;
  bio_button_id?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
}

export function useClickEvents(filters?: ClickEventFilters) {
  return useQuery({
    queryKey: ['click-events', filters],
    queryFn: async () => {
      let query = supabase
        .from('click_events')
        .select('*')
        .order('clicked_at', { ascending: false });
      
      if (filters?.link_id) {
        query = query.eq('link_id', filters.link_id);
      }
      if (filters?.bio_button_id) {
        query = query.eq('bio_button_id', filters.bio_button_id);
      }
      if (filters?.start_date) {
        query = query.gte('clicked_at', filters.start_date);
      }
      if (filters?.end_date) {
        query = query.lte('clicked_at', filters.end_date);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as ClickEvent[];
    },
  });
}

export function useClickEventsByDay(linkId?: string, days: number = 30) {
  return useQuery({
    queryKey: ['click-events-by-day', linkId, days],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      let query = supabase
        .from('click_events')
        .select('clicked_at')
        .gte('clicked_at', startDate.toISOString())
        .order('clicked_at', { ascending: true });
      
      if (linkId) {
        query = query.eq('link_id', linkId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      // Group by day
      const clicksByDay: Record<string, number> = {};
      
      data.forEach((event) => {
        const date = new Date(event.clicked_at).toISOString().split('T')[0];
        clicksByDay[date] = (clicksByDay[date] || 0) + 1;
      });
      
      // Fill in missing days
      const result: { date: string; clicks: number }[] = [];
      const currentDate = new Date(startDate);
      const today = new Date();
      
      while (currentDate <= today) {
        const dateStr = currentDate.toISOString().split('T')[0];
        result.push({
          date: dateStr,
          clicks: clicksByDay[dateStr] || 0,
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return result;
    },
  });
}

export function useClickEventsByDevice(linkId?: string) {
  return useQuery({
    queryKey: ['click-events-by-device', linkId],
    queryFn: async () => {
      let query = supabase
        .from('click_events')
        .select('device_type');
      
      if (linkId) {
        query = query.eq('link_id', linkId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      const counts = {
        desktop: 0,
        mobile: 0,
        tablet: 0,
        unknown: 0,
      };
      
      data.forEach((event) => {
        const type = event.device_type || 'unknown';
        counts[type as keyof typeof counts]++;
      });
      
      return [
        { name: 'Desktop', value: counts.desktop },
        { name: 'Mobile', value: counts.mobile },
        { name: 'Tablet', value: counts.tablet },
        { name: 'Outros', value: counts.unknown },
      ].filter(item => item.value > 0);
    },
  });
}
