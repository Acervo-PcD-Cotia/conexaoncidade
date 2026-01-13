import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { CommunityLocation } from "./useCommunityLocations";

interface LocationFavorite {
  id: string;
  user_id: string;
  location_id: string;
  created_at: string;
  location?: CommunityLocation;
}

export function useLocationFavorites() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's favorites
  const { data: favorites, isLoading } = useQuery({
    queryKey: ["location-favorites", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("community_location_favorites" as any)
        .select(`
          id,
          user_id,
          location_id,
          created_at,
          location:community_locations(*)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as LocationFavorite[];
    },
    enabled: !!user,
  });

  // Check if a location is favorited
  const isFavorite = (locationId: string) => {
    return favorites?.some((f) => f.location_id === locationId) || false;
  };

  // Toggle favorite
  const toggleFavorite = useMutation({
    mutationFn: async (locationId: string) => {
      if (!user) throw new Error("Usuário não autenticado");

      const isCurrentlyFavorite = isFavorite(locationId);

      if (isCurrentlyFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from("community_location_favorites" as any)
          .delete()
          .eq("user_id", user.id)
          .eq("location_id", locationId);
        if (error) throw error;
        return { action: "removed" };
      } else {
        // Add to favorites
        const { error } = await supabase
          .from("community_location_favorites" as any)
          .insert({ user_id: user.id, location_id: locationId });
        if (error) throw error;
        return { action: "added" };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["location-favorites"] });
      toast({
        title: result.action === "added" ? "Adicionado aos favoritos!" : "Removido dos favoritos",
        description: result.action === "added" 
          ? "O local foi salvo na sua lista de favoritos." 
          : "O local foi removido da sua lista.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message,
      });
    },
  });

  // Get favorite locations with full data
  const favoriteLocations = favorites
    ?.map((f) => f.location)
    .filter((l): l is CommunityLocation => l !== undefined) || [];

  return {
    favorites,
    favoriteLocations,
    isLoading,
    isFavorite,
    toggleFavorite,
    count: favorites?.length || 0,
  };
}
