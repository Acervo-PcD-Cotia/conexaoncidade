import { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Building2, Store, Package, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export type PhotoType = 'facade' | 'interior' | 'products' | 'team' | 'other';

interface PhotoFile {
  file: File;
  preview: string;
  type: PhotoType;
}

interface BusinessPhotoUploaderProps {
  photos: PhotoFile[];
  onChange: (photos: PhotoFile[]) => void;
  maxPhotos?: number;
}

const photoTypeLabels: Record<PhotoType, { label: string; icon: React.ElementType; description: string }> = {
  facade: { label: 'Fachada', icon: Building2, description: 'Foto externa do estabelecimento' },
  interior: { label: 'Interior', icon: Store, description: 'Foto do ambiente interno' },
  products: { label: 'Produtos/Serviços', icon: Package, description: 'Fotos dos seus produtos' },
  team: { label: 'Equipe', icon: Users, description: 'Foto da sua equipe' },
  other: { label: 'Outras', icon: ImageIcon, description: 'Outras fotos relevantes' },
};

export function BusinessPhotoUploader({ 
  photos, 
  onChange, 
  maxPhotos = 10 
}: BusinessPhotoUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedType, setSelectedType] = useState<PhotoType>('facade');

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files).filter(f => 
      f.type.startsWith('image/')
    );
    addFiles(files);
  }, [photos, selectedType]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      addFiles(files);
    }
  };

  const addFiles = (files: File[]) => {
    const remainingSlots = maxPhotos - photos.length;
    const filesToAdd = files.slice(0, remainingSlots);

    const newPhotos = filesToAdd.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      type: selectedType,
    }));

    onChange([...photos, ...newPhotos]);
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...photos];
    URL.revokeObjectURL(newPhotos[index].preview);
    newPhotos.splice(index, 1);
    onChange(newPhotos);
  };

  const updatePhotoType = (index: number, type: PhotoType) => {
    const newPhotos = [...photos];
    newPhotos[index].type = type;
    onChange(newPhotos);
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium mb-3 block">
          Envie fotos do seu negócio
        </Label>
        <p className="text-sm text-muted-foreground mb-4">
          Recomendamos fotos da fachada, interior, produtos e equipe. Máximo de {maxPhotos} fotos.
        </p>
      </div>

      {/* Photo type selector */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {(Object.keys(photoTypeLabels) as PhotoType[]).map((type) => {
          const { label, icon: Icon } = photoTypeLabels[type];
          return (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedType(type)}
              className={cn(
                'flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all',
                selectedType === type 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-muted-foreground/50'
              )}
            >
              <Icon className={cn(
                'h-5 w-5',
                selectedType === type ? 'text-primary' : 'text-muted-foreground'
              )} />
              <span className={cn(
                'text-xs font-medium',
                selectedType === type ? 'text-primary' : 'text-muted-foreground'
              )}>
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Drop zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
          dragActive ? 'border-primary bg-primary/5' : 'border-border',
          photos.length >= maxPhotos && 'opacity-50 pointer-events-none'
        )}
      >
        <input
          type="file"
          id="photo-upload"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={photos.length >= maxPhotos}
        />
        <label 
          htmlFor="photo-upload" 
          className="cursor-pointer flex flex-col items-center"
        >
          <Upload className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="font-medium mb-1">
            Arraste fotos aqui ou clique para selecionar
          </p>
          <p className="text-sm text-muted-foreground">
            Tipo selecionado: <span className="font-medium">{photoTypeLabels[selectedType].label}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {photos.length} de {maxPhotos} fotos adicionadas
          </p>
        </label>
      </div>

      {/* Photo previews */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {photos.map((photo, index) => {
            const TypeIcon = photoTypeLabels[photo.type].icon;
            return (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden border">
                  <img
                    src={photo.preview}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Type badge */}
                <div className="absolute bottom-2 left-2 bg-background/90 backdrop-blur-sm rounded-md px-2 py-1 flex items-center gap-1">
                  <TypeIcon className="h-3 w-3" />
                  <span className="text-xs font-medium">
                    {photoTypeLabels[photo.type].label}
                  </span>
                </div>

                {/* Remove button */}
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removePhoto(index)}
                  type="button"
                >
                  <X className="h-4 w-4" />
                </Button>

                {/* Type selector dropdown */}
                <select
                  value={photo.type}
                  onChange={(e) => updatePhotoType(index, e.target.value as PhotoType)}
                  className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-background border rounded px-1 py-0.5"
                >
                  {(Object.keys(photoTypeLabels) as PhotoType[]).map((type) => (
                    <option key={type} value={type}>
                      {photoTypeLabels[type].label}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
