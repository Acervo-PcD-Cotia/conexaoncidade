interface ArticleHeroProps {
  imageUrl: string | null | undefined;
  imageAlt?: string | null;
  imageCredit?: string | null;
}

export function ArticleHero({
  imageUrl,
  imageAlt,
  imageCredit,
}: ArticleHeroProps) {
  if (!imageUrl) return null;

  return (
    <figure className="mb-8 relative">
      <img
        src={imageUrl}
        alt={imageAlt || 'Imagem da notícia'}
        className="w-full object-cover aspect-video"
        loading="eager"
        fetchPriority="high"
      />
      
      {/* Credit overlay on bottom of image - Agência Brasil style */}
      {imageCredit && (
        <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white/90 text-[11px] px-3 py-1.5 tracking-wide uppercase">
          © {imageCredit}
        </span>
      )}
      
      {/* Caption below image */}
      {imageAlt && (
        <figcaption className="text-xs text-muted-foreground mt-2 uppercase tracking-wide">
          {imageAlt}
        </figcaption>
      )}
    </figure>
  );
}
