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
      
      {/* Credit overlay on image */}
      {imageCredit && (
        <span className="absolute bottom-0 right-0 bg-black/70 text-white text-xs px-3 py-1.5">
          {imageCredit}
        </span>
      )}
      
      {/* Caption below image */}
      {imageAlt && (
        <figcaption className="text-sm text-muted-foreground mt-3 italic">
          {imageAlt}
        </figcaption>
      )}
    </figure>
  );
}
