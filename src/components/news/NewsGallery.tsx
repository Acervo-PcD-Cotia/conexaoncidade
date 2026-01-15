import { useState, useMemo } from 'react';
import { ZoomIn, Image } from 'lucide-react';
import { ImageLightbox } from '@/components/ui/image-lightbox';
import { cn } from '@/lib/utils';

interface NewsGalleryProps {
  heroImage?: string | null;
  galleryUrls?: string[] | null;
  imageAlt?: string | null;
  className?: string;
}

export function NewsGallery({ heroImage, galleryUrls, imageAlt, className }: NewsGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Combine hero + gallery for lightbox navigation
  const allImages = useMemo(() => {
    const images: string[] = [];
    if (heroImage) images.push(heroImage);
    if (galleryUrls) images.push(...galleryUrls.filter(Boolean));
    return images;
  }, [heroImage, galleryUrls]);

  const handleImageClick = (galleryIndex: number) => {
    // galleryIndex is 0-based for gallery images
    // In allImages, hero is at index 0, gallery starts at index 1
    setLightboxIndex(galleryIndex + 1);
    setLightboxOpen(true);
  };

  if (!galleryUrls || galleryUrls.length === 0) {
    return null;
  }

  return (
    <>
      <div className={cn("mb-8", className)}>
        {/* Gallery header */}
        <div className="flex items-center gap-2 mb-3">
          <Image className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">
            Mais imagens ({galleryUrls.length})
          </span>
        </div>

        {/* Gallery grid */}
        <div className="grid grid-cols-2 gap-3">
          {galleryUrls.map((imgUrl, idx) => (
            <figure
              key={idx}
              className="relative cursor-pointer group rounded-lg overflow-hidden"
              onClick={() => handleImageClick(idx)}
            >
              <img
                src={imgUrl}
                alt={`Imagem ${idx + 2} da notícia`}
                className="w-full object-cover aspect-video transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                <div className="bg-white/90 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-90 group-hover:scale-100">
                  <ZoomIn className="h-5 w-5 text-foreground" />
                </div>
              </div>
              {/* Image number badge */}
              <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                {idx + 2}
              </div>
            </figure>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <ImageLightbox
        images={allImages}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        alt={imageAlt || undefined}
      />
    </>
  );
}
