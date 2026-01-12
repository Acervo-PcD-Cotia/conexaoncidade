import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface GeoLocation {
  country_code: string;
  country_name: string;
  region_code: string;
  region_name: string;
  city: string;
  lat?: number;
  lon?: number;
  is_default?: boolean;
  error?: string;
}

export function useGeoLocation() {
  return useQuery({
    queryKey: ["user-geo-location"],
    queryFn: async (): Promise<GeoLocation> => {
      const { data, error } = await supabase.functions.invoke("geolocate-ip");
      
      if (error) {
        console.error("Geolocation error:", error);
        // Return default location on error
        return {
          country_code: "BR",
          country_name: "Brasil",
          region_code: "SP",
          region_name: "São Paulo",
          city: "São Paulo",
          is_default: true,
          error: error.message,
        };
      }

      return data as GeoLocation;
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    gcTime: 1000 * 60 * 60 * 24, // Keep in cache for 24 hours
    retry: 1,
  });
}
