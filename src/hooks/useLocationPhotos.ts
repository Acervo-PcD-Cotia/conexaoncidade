import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface LocationPhoto {
  id: string;
  location_id: string;
  user_id: string;
  photo_url: string;
  caption: string | null;
  is_approved: boolean;
  created_at: string;
  uploader?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export function useLocationPhotos(locationId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch photos for a location
  const {
    data: photos,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["location-photos", locationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_location_photos" as any)
        .select(`*, uploader:profiles!community_location_photos_user_id_fkey(full_name, avatar_url)`)
        .eq("location_id", locationId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as LocationPhoto[];
    },
    enabled: !!locationId,
  });

  // Upload photo
  const uploadPhoto = useMutation({
    mutationFn: async ({ file, caption }: { file: File; caption?: string }) => {
      if (!user) throw new Error("Usuário não autenticado");
      if (!locationId) throw new Error("Local não especificado");

      // Validate file
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        throw new Error("Formato inválido. Use JPG, PNG ou WebP");
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Imagem muito grande. Máximo 5MB");
      }

      // Upload to storage
      const fileName = `${locationId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("location-photos")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("location-photos")
        .getPublicUrl(uploadData.path);

      // Save to database
      const { error: dbError } = await supabase
        .from("community_location_photos" as any)
        .insert({
          location_id: locationId,
          user_id: user.id,
          photo_url: urlData.publicUrl,
          caption: caption || null,
          is_approved: false,
        });

      if (dbError) throw dbError;

      return urlData.publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["location-photos", locationId] });
      toast({
        title: "Foto enviada!",
        description: "A foto será exibida após aprovação.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao enviar foto",
        description: error.message,
      });
    },
  });

  // Delete photo
  const deletePhoto = useMutation({
    mutationFn: async (photoId: string) => {
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("community_location_photos" as any)
        .delete()
        .eq("id", photoId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["location-photos", locationId] });
      toast({
        title: "Foto removida",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao remover foto",
        description: error.message,
      });
    },
  });

  // Approved photos for display
  const approvedPhotos = photos?.filter((p) => p.is_approved) || [];
  const pendingPhotos = photos?.filter((p) => !p.is_approved) || [];
  const userPendingPhotos = pendingPhotos.filter((p) => p.user_id === user?.id);

  return {
    photos,
    approvedPhotos,
    pendingPhotos,
    userPendingPhotos,
    isLoading,
    error,
    uploadPhoto,
    deletePhoto,
  };
}

// Admin hook for moderating photos
export function useLocationPhotoModeration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all pending photos
  const { data: pendingPhotos, isLoading } = useQuery({
    queryKey: ["pending-location-photos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_location_photos" as any)
        .select(`
          *,
          location:community_locations(name, neighborhood),
          uploader:profiles!community_location_photos_user_id_fkey(full_name)
        `)
        .eq("is_approved", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as any[];
    },
  });

  // Approve photo
  const approvePhoto = useMutation({
    mutationFn: async (photoId: string) => {
      const { error } = await supabase
        .from("community_location_photos" as any)
        .update({ is_approved: true })
        .eq("id", photoId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-location-photos"] });
      queryClient.invalidateQueries({ queryKey: ["location-photos"] });
      toast({ title: "Foto aprovada" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Erro ao aprovar foto" });
    },
  });

  // Reject photo (delete)
  const rejectPhoto = useMutation({
    mutationFn: async (photoId: string) => {
      const { error } = await supabase
        .from("community_location_photos" as any)
        .delete()
        .eq("id", photoId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-location-photos"] });
      toast({ title: "Foto rejeitada" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Erro ao rejeitar foto" });
    },
  });

  return {
    pendingPhotos,
    isLoading,
    approvePhoto,
    rejectPhoto,
    pendingCount: pendingPhotos?.length || 0,
  };
}
