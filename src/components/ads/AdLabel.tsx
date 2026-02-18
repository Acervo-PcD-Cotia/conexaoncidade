import { cn } from "@/lib/utils";
import { AD_SLOTS } from "@/lib/adSlots";

export interface AdLabelProps {
  /** Tipo do anúncio (ex: "MEGA DESTAQUE", "DESTAQUE INTELIGENTE") */
  adType?: string;
  /** ID do anúncio ou do slot */
  adId?: string | number;
  /** Variante de canal (ADS, PUBLIDOOR, 360, WEBSTORY, EXPERIENCE) */
  variant?: string;
  /** Posição no layout (TOPO, MEIO, LATERAL, SAÍDA, etc.) */
  position?: string;
  /** Área/página (HOME, MATÉRIA, LOGIN, CATEGORIA) */
  area?: string;
  /** ID da campanha (se vinculada) */
  campaignId?: string | number;
  /** Nível de exibição — controlado pelo hook useAdDebugLevel */
  level?: "public" | "admin" | "superadmin";
  /** Estilo overlay (sobre imagem, fundo escuro) vs inline (acima do banner) */
  overlay?: boolean;
  className?: string;
}

/**
 * Finds the official slot definition matching a given adType label.
 * Returns seq number and dimensions string, e.g. { seq: 4, dims: "300×600" }
 */
function getSlotMeta(adType?: string): { seq: number; dims: string } | null {
  if (!adType) return null;
  const normalized = adType.trim().toUpperCase();
  const slot = AD_SLOTS.find(s => s.label.toUpperCase() === normalized);
  if (!slot) return null;
  return { seq: slot.seq, dims: `${slot.width}×${slot.height}` };
}

/**
 * AdLabel — etiqueta padronizada de identificação de anúncios.
 * 
 * - public:     "02 - Publicidade • Mega Destaque • 970×250"
 * - admin:      "02 - PUBLICIDADE • MEGA DESTAQUE • 970×250 • ID: {ID}"
 * - superadmin: "02 - PUBLICIDADE • {VARIANT} • {TIPO} • {DIMS} • ID: {ID} • {POSIÇÃO} • {ÁREA} • CAMP: {CAMPAIGN_ID}"
 */
export function AdLabel({
  adType,
  adId,
  variant,
  position,
  area,
  campaignId,
  level = "public",
  overlay = false,
  className,
}: AdLabelProps) {
  const type = adType?.trim() || "ANÚNCIO";
  const id = adId ? String(adId).slice(0, 8) : "—";
  const meta = getSlotMeta(type);
  const seqPrefix = meta ? `${String(meta.seq).padStart(2, "0")} - ` : "";
  const dimsSuffix = meta ? ` • ${meta.dims}` : "";

  if (level === "public") {
    const publicLabel = type !== "ANÚNCIO"
      ? `${seqPrefix}Publicidade • ${type}${dimsSuffix}`
      : "Publicidade";
    return (
      <span
        className={cn(
          "text-[10px] font-bold uppercase tracking-wider",
          overlay
            ? "rounded bg-black/40 px-1.5 py-0.5 text-white/80 backdrop-blur-sm"
            : "text-muted-foreground/60",
          className,
        )}
      >
        {publicLabel}
      </span>
    );
  }

  if (level === "admin") {
    return (
      <span
        className={cn(
          "text-[10px] font-bold uppercase tracking-wider",
          overlay
            ? "rounded bg-black/50 px-2 py-0.5 text-white/90 backdrop-blur-sm"
            : "rounded bg-muted px-2 py-0.5 text-muted-foreground",
          className,
        )}
      >
        {seqPrefix}PUBLICIDADE • {type.toUpperCase()}{dimsSuffix} • ID: {id}
      </span>
    );
  }

  // superadmin
  const parts = [
    `${seqPrefix}PUBLICIDADE`,
    variant?.toUpperCase(),
    type.toUpperCase(),
    meta ? meta.dims : null,
    `ID: ${id}`,
    position?.toUpperCase(),
    area?.toUpperCase(),
    campaignId ? `CAMP: ${String(campaignId).slice(0, 8)}` : null,
  ].filter(Boolean);

  return (
    <span
      className={cn(
        "inline-block rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-destructive",
        className,
      )}
    >
      {parts.join(" • ")}
    </span>
  );
}
