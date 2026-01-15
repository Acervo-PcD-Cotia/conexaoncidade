import { Check, X, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { SafeImage } from '@/components/ui/SafeImage';

interface ImageGalleryPickerProps {
  heroImage: string;
  galleryImages: string[];
  selectedImages: boolean[];
  onSelectionChange: (selected: boolean[]) => void;
  onHeroChange?: (newHeroUrl: string, oldHeroUrl: string) => void;
}

export function ImageGalleryPicker({
  heroImage,
  galleryImages,
  selectedImages,
  onSelectionChange,
  onHeroChange
}: ImageGalleryPickerProps) {
  const toggleImage = (index: number) => {
    const newSelection = [...selectedImages];
    newSelection[index] = !newSelection[index];
    onSelectionChange(newSelection);
  };

  const selectAll = () => onSelectionChange(galleryImages.map(() => true));
  const deselectAll = () => onSelectionChange(galleryImages.map(() => false));

  const selectedCount = selectedImages.filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Hero Image */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Imagem Principal</span>
          <Badge variant="default" className="bg-primary">Hero</Badge>
        </div>
        <div className="relative rounded-lg overflow-hidden border-2 border-primary">
          <SafeImage
            src={heroImage}
            alt="Imagem principal"
            className="w-full aspect-video object-cover"
          />
        </div>
      </div>

      {/* Gallery Images */}
      {galleryImages.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium flex items-center gap-2">
              <Image className="h-4 w-4" />
              Galeria ({selectedCount}/{galleryImages.length} selecionadas)
            </span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={selectAll} className="text-xs h-7">
                Todas
              </Button>
              <Button variant="ghost" size="sm" onClick={deselectAll} className="text-xs h-7">
                Nenhuma
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {galleryImages.map((url, idx) => (
              <div
                key={idx}
                className={cn(
                  "relative rounded-lg overflow-hidden border-2 transition-all group",
                  selectedImages[idx] 
                    ? "border-primary ring-2 ring-primary/30" 
                    : "border-muted opacity-60 hover:opacity-80"
                )}
              >
                <SafeImage
                  src={url}
                  alt={`Imagem ${idx + 2}`}
                  className="w-full aspect-video object-cover"
                />
                
                {/* Selection overlay */}
                <div 
                  onClick={() => toggleImage(idx)}
                  className={cn(
                    "absolute inset-0 flex items-center justify-center cursor-pointer transition-colors",
                    selectedImages[idx] ? "bg-primary/20" : "bg-black/40"
                  )}
                >
                  {selectedImages[idx] ? (
                    <div className="bg-primary text-primary-foreground rounded-full p-1">
                      <Check className="h-5 w-5" />
                    </div>
                  ) : (
                    <div className="bg-white/20 rounded-full p-1">
                      <X className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>
                
                {/* Use as Hero button */}
                {onHeroChange && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute bottom-1 right-1 text-xs h-6 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      onHeroChange(url, heroImage);
                    }}
                  >
                    Usar como Hero
                  </Button>
                )}

                {/* Index badge */}
                <div className="absolute top-1 left-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
                  {idx + 2}
                </div>
              </div>
            ))}
          </div>

          {selectedCount === 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">
              Nenhuma imagem selecionada para a galeria
            </p>
          )}
        </div>
      )}

      {galleryImages.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Image className="h-12 w-12 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Nenhuma imagem adicional encontrada</p>
        </div>
      )}
    </div>
  );
}
