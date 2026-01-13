import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export type LocationCategory = "business" | "service" | "event" | "support_pcd";

export interface CommunityLocation {
  id: string;
  name: string;
  category: LocationCategory;
  address: string | null;
  neighborhood: string | null;
  lat: number | null;
  lng: number | null;
  is_accessible: boolean;
  accessibility_features: string[] | null;
  created_by: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  avg_rating?: number | null;
  review_count?: number | null;
}

export function useCommunityLocations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all locations
  const {
    data: locations,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["community-locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_locations" as any)
        .select("*")
        .order("name");

      if (error) throw error;
      return (data || []) as unknown as CommunityLocation[];
    },
  });

  // Create location
  const createLocation = useMutation({
    mutationFn: async (data: {
      name: string;
      category: LocationCategory;
      address?: string;
      neighborhood?: string;
      lat?: number;
      lng?: number;
      is_accessible?: boolean;
      accessibility_features?: string[];
    }) => {
      if (!user) throw new Error("Usuário não autenticado");

      const { data: result, error } = await supabase
        .from("community_locations" as any)
        .insert({
          name: data.name,
          category: data.category,
          address: data.address || null,
          neighborhood: data.neighborhood || null,
          lat: data.lat || null,
          lng: data.lng || null,
          is_accessible: data.is_accessible || false,
          accessibility_features: data.accessibility_features || null,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-locations"] });
      toast({
        title: "Local adicionado",
        description: "O local foi adicionado ao mapa da comunidade!",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao adicionar local",
        description: error.message,
      });
    },
  });

  // Filter locations by category
  const filterByCategory = (category: LocationCategory | "all") => {
    if (category === "all") return locations;
    return locations?.filter((loc) => loc.category === category);
  };

  // Filter locations by neighborhood
  const filterByNeighborhood = (neighborhood: string | "all") => {
    if (neighborhood === "all") return locations;
    return locations?.filter((loc) => loc.neighborhood === neighborhood);
  };

  // Get unique neighborhoods
  const neighborhoods = [
    ...new Set(
      locations
        ?.map((loc) => loc.neighborhood)
        .filter((n): n is string => n !== null)
    ),
  ].sort();

  // Get stats by category
  const stats = {
    business: locations?.filter((l) => l.category === "business").length || 0,
    service: locations?.filter((l) => l.category === "service").length || 0,
    event: locations?.filter((l) => l.category === "event").length || 0,
    support_pcd: locations?.filter((l) => l.category === "support_pcd").length || 0,
    accessible: locations?.filter((l) => l.is_accessible).length || 0,
    total: locations?.length || 0,
  };

  // Get top rated locations for ranking
  const topRatedLocations = [...(locations || [])]
    .filter((l) => (l.review_count || 0) > 0)
    .sort((a, b) => {
      // Sort by avg_rating desc, then review_count desc
      const ratingDiff = (Number(b.avg_rating) || 0) - (Number(a.avg_rating) || 0);
      if (ratingDiff !== 0) return ratingDiff;
      return (b.review_count || 0) - (a.review_count || 0);
    })
    .slice(0, 10);

  return {
    locations,
    isLoading,
    error,
    stats,
    neighborhoods,
    createLocation,
    filterByCategory,
    filterByNeighborhood,
    topRatedLocations,
  };
}
