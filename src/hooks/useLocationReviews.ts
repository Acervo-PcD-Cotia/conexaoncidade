import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface LocationReview {
  id: string;
  location_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  accessibility_rating: number | null;
  created_at: string;
  updated_at: string;
  reviewer?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export function useLocationReviews(locationId: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch reviews for a location
  const {
    data: reviews,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["location-reviews", locationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_location_reviews" as any)
        .select(`*, reviewer:profiles!community_location_reviews_user_id_fkey(full_name, avatar_url)`)
        .eq("location_id", locationId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as LocationReview[];
    },
    enabled: !!locationId,
  });

  // Check if current user has already reviewed
  const userReview = reviews?.find((r) => r.user_id === user?.id);

  // Create or update review
  const submitReview = useMutation({
    mutationFn: async (data: {
      rating: number;
      comment?: string;
      accessibility_rating?: number;
    }) => {
      if (!user) throw new Error("Usuário não autenticado");

      const reviewData = {
        location_id: locationId,
        user_id: user.id,
        rating: data.rating,
        comment: data.comment || null,
        accessibility_rating: data.accessibility_rating || null,
        updated_at: new Date().toISOString(),
      };

      // Upsert - insert or update if exists
      const { data: result, error } = await supabase
        .from("community_location_reviews" as any)
        .upsert(reviewData, { onConflict: "location_id,user_id" })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["location-reviews", locationId] });
      queryClient.invalidateQueries({ queryKey: ["community-locations"] });
      toast({
        title: "Avaliação salva!",
        description: "Obrigado por sua contribuição.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao salvar avaliação",
        description: error.message,
      });
    },
  });

  // Delete review
  const deleteReview = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("community_location_reviews" as any)
        .delete()
        .eq("location_id", locationId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["location-reviews", locationId] });
      queryClient.invalidateQueries({ queryKey: ["community-locations"] });
      toast({
        title: "Avaliação removida",
        description: "Sua avaliação foi excluída.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao remover avaliação",
        description: error.message,
      });
    },
  });

  // Calculate stats
  const stats = {
    count: reviews?.length || 0,
    avgRating: reviews?.length
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0,
    avgAccessibilityRating: (() => {
      const accessibilityReviews = reviews?.filter((r) => r.accessibility_rating !== null) || [];
      return accessibilityReviews.length
        ? accessibilityReviews.reduce((acc, r) => acc + (r.accessibility_rating || 0), 0) /
            accessibilityReviews.length
        : 0;
    })(),
  };

  return {
    reviews,
    isLoading,
    error,
    stats,
    userReview,
    submitReview,
    deleteReview,
  };
}
