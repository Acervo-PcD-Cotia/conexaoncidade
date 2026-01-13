import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useCheckWhatsAppUnique(whatsapp: string) {
  // Normaliza para apenas números (11 dígitos)
  const normalized = whatsapp.replace(/\D/g, "");
  
  return useQuery({
    queryKey: ["check-whatsapp-unique", normalized],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("transporters")
        .select("id", { count: "exact", head: true })
        .eq("whatsapp", normalized);
      
      if (error) throw error;
      return (count || 0) > 0;
    },
    enabled: normalized.length === 11,
    staleTime: 5000,
  });
}
