import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

export interface StudioBrandingAsset {
  id: string;
  name: string;
  type: "logo" | "overlay" | "background" | "lower_third";
  url: string;
  isActive: boolean;
}

export interface StudioColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface StudioBranding {
  id: string;
  team_id: string;
  name: string;
  is_default: boolean;
  logos: StudioBrandingAsset[];
  overlays: StudioBrandingAsset[];
  backgrounds: StudioBrandingAsset[];
  palette: StudioColorPalette;
}

const DEFAULT_PALETTE: StudioColorPalette = {
  primary: "#3b82f6",
  secondary: "#10b981",
  accent: "#f59e0b",
  background: "#1f2937",
  text: "#ffffff",
};

export function useStudioBranding(teamId?: string) {
  return useQuery({
    queryKey: ["studio-branding", teamId],
    queryFn: async () => {
      if (!teamId) return null;

      const { data, error } = await supabase
        .from("illumina_branding")
        .select("*")
        .eq("team_id", teamId)
        .eq("is_default", true)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching studio branding:", error);
        throw error;
      }

      if (!data) {
        return {
          id: "",
          team_id: teamId,
          name: "Default",
          is_default: true,
          logos: [],
          overlays: [],
          backgrounds: [],
          palette: DEFAULT_PALETTE,
        } as StudioBranding;
      }

      // Parse the JSONB columns with proper typing
      const branding: StudioBranding = {
        id: data.id,
        team_id: data.team_id,
        name: data.name,
        is_default: data.is_default,
        logos: (data.logos as unknown as StudioBrandingAsset[]) || [],
        overlays: (data.overlays as unknown as StudioBrandingAsset[]) || [],
        backgrounds: (data.backgrounds as unknown as StudioBrandingAsset[]) || [],
        palette: (data.palettes as unknown as StudioColorPalette) || DEFAULT_PALETTE,
      };

      return branding;
    },
    enabled: !!teamId,
  });
}

export function useUploadBrandingAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      type,
      teamId,
      name,
    }: {
      file: File;
      type: "logo" | "overlay" | "background" | "lower_third";
      teamId: string;
      name: string;
    }) => {
      // Upload file to storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${teamId}/${type}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("studio-branding")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("studio-branding")
        .getPublicUrl(fileName);

      const newAsset: StudioBrandingAsset = {
        id: crypto.randomUUID(),
        name,
        type,
        url: publicUrlData.publicUrl,
        isActive: true,
      };

      // Update branding record
      const { data: existingBranding } = await supabase
        .from("illumina_branding")
        .select("*")
        .eq("team_id", teamId)
        .eq("is_default", true)
        .single();

      if (existingBranding) {
        const columnName = type === "logo" ? "logos" : 
                          type === "overlay" ? "overlays" : 
                          type === "background" ? "backgrounds" : "overlays";
        
        const columnData = existingBranding[columnName as keyof typeof existingBranding];
        const currentAssets = (columnData as unknown as StudioBrandingAsset[]) || [];
        const newAssets = [...currentAssets, newAsset] as unknown as Json;
        
        const { error: updateError } = await supabase
          .from("illumina_branding")
          .update({
            [columnName]: newAssets,
          })
          .eq("id", existingBranding.id);

        if (updateError) throw updateError;
      }

      return newAsset;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["studio-branding", variables.teamId] });
      toast.success("Asset enviado com sucesso");
    },
    onError: (error) => {
      console.error("Error uploading branding asset:", error);
      toast.error("Erro ao enviar arquivo");
    },
  });
}

export function useDeleteBrandingAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      assetId,
      type,
      teamId,
    }: {
      assetId: string;
      type: "logo" | "overlay" | "background" | "lower_third";
      teamId: string;
    }) => {
      const { data: existingBranding } = await supabase
        .from("illumina_branding")
        .select("*")
        .eq("team_id", teamId)
        .eq("is_default", true)
        .single();

      if (!existingBranding) throw new Error("Branding not found");

      const columnName = type === "logo" ? "logos" : 
                        type === "overlay" ? "overlays" : 
                        type === "background" ? "backgrounds" : "overlays";
      
      const columnData = existingBranding[columnName as keyof typeof existingBranding];
      const currentAssets = (columnData as unknown as StudioBrandingAsset[]) || [];
      const updatedAssets = currentAssets.filter(a => a.id !== assetId) as unknown as Json;
      
      const { error: updateError } = await supabase
        .from("illumina_branding")
        .update({
          [columnName]: updatedAssets,
        })
        .eq("id", existingBranding.id);

      if (updateError) throw updateError;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["studio-branding", variables.teamId] });
      toast.success("Asset removido");
    },
    onError: (error) => {
      console.error("Error deleting branding asset:", error);
      toast.error("Erro ao remover asset");
    },
  });
}

export function useSaveBrandingPalette() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      teamId,
      palette,
    }: {
      teamId: string;
      palette: StudioColorPalette;
    }) => {
      const { data: existingBranding } = await supabase
        .from("illumina_branding")
        .select("id")
        .eq("team_id", teamId)
        .eq("is_default", true)
        .single();

      const paletteJson = palette as unknown as Json;

      if (existingBranding) {
        const { error: updateError } = await supabase
          .from("illumina_branding")
          .update({ palettes: paletteJson })
          .eq("id", existingBranding.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("illumina_branding")
          .insert([{
            team_id: teamId,
            name: "Default",
            is_default: true,
            palettes: paletteJson,
          }]);

        if (insertError) throw insertError;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["studio-branding", variables.teamId] });
      toast.success("Paleta de cores salva");
    },
    onError: (error) => {
      console.error("Error saving palette:", error);
      toast.error("Erro ao salvar paleta");
    },
  });
}
