import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AdSlotProps {
  slotType: string;
  className?: string;
}

export function AdSlot({ slotType, className = "" }: AdSlotProps) {
  const { data: ad } = useQuery({
    queryKey: ["ad", slotType],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("ads")
        .select("*")
        .eq("slot_type", slotType)
        .eq("is_active", true)
        .or(`starts_at.is.null,starts_at.lte.${now}`)
        .or(`ends_at.is.null,ends_at.gte.${now}`)
        .order("sort_order")
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    staleTime: 60000, // 1 minute
  });

  const handleClick = async () => {
    if (!ad) return;
    
    // Increment click count
    await supabase
      .from("ads")
      .update({ click_count: (ad.click_count || 0) + 1 })
      .eq("id", ad.id);
  };

  if (!ad) return null;

  const sizeStyles: Record<string, string> = {
    "728x90": "max-w-[728px] h-[90px]",
    "970x250": "max-w-[970px] h-[250px]",
    "300x250": "max-w-[300px] h-[250px]",
    "300x600": "max-w-[300px] h-[600px]",
    "580x400": "max-w-[580px] h-[400px]",
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <span className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground/60">
        Publicidade
      </span>
      <a
        href={ad.link_url || "#"}
        target={ad.link_target || "_blank"}
        rel="noopener noreferrer sponsored"
        onClick={handleClick}
        className={`block overflow-hidden ${sizeStyles[ad.size] || ""}`}
      >
        <img
          src={ad.image_url}
          alt={ad.alt_text || ad.name || "Anúncio"}
          className="h-full w-full object-contain"
          loading="lazy"
        />
      </a>
    </div>
  );
}
