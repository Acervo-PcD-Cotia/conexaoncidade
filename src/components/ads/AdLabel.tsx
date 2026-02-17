import { cn } from "@/lib/utils";

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
 * AdLabel — etiqueta padronizada de identificação de anúncios.
 * 
 * - public:     "PUBLICIDADE"
 * - admin:      "PUBLICIDADE • {TIPO} • ID: {ID}"
 * - superadmin: "PUBLICIDADE • {VARIANT} • {TIPO} • ID: {ID} • {POSIÇÃO} • {ÁREA} • CAMP: {CAMPAIGN_ID}"
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

  if (level === "public") {
    // Show format name when available (e.g. "Publicidade • Mega Destaque")
    const publicLabel = type !== "ANÚNCIO" ? `Publicidade • ${type}` : "Publicidade";
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
        PUBLICIDADE • {type.toUpperCase()} • ID: {id}
      </span>
    );
  }

  // superadmin
  const parts = [
    "PUBLICIDADE",
    variant?.toUpperCase(),
    type.toUpperCase(),
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
