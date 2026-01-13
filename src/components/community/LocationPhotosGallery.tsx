import { useState, useRef } from "react";
import { Camera, Upload, Loader2, X, Clock, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useLocationPhotos } from "@/hooks/useLocationPhotos";
import { useAuth } from "@/contexts/AuthContext";

interface LocationPhotosGalleryProps {
  locationId: string;
  locationName: string;
}

export function LocationPhotosGallery({ locationId, locationName }: LocationPhotosGalleryProps) {
  const { user } = useAuth();
  const { approvedPhotos, userPendingPhotos, isLoading, uploadPhoto, deletePhoto } = useLocationPhotos(locationId);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await uploadPhoto.mutateAsync({ file, caption: caption || undefined });
      setCaption("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setIsUploading(false);
    }
  };

  const allPhotos = [...approvedPhotos, ...userPendingPhotos];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium flex items-center gap-2">
          <Camera className="h-4 w-4" />
          Fotos ({approvedPhotos.length})
        </h4>
        
        {user && (
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleUpload}
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
            />
            <Input
              placeholder="Legenda (opcional)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-32 h-8 text-xs"
              disabled={isUploading}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              <span className="ml-1 hidden sm:inline">Enviar</span>
            </Button>
          </div>
        )}
      </div>

      {/* Pending photos warning */}
      {userPendingPhotos.length > 0 && (
        <div className="text-xs text-muted-foreground flex items-center gap-1 bg-yellow-50 p-2 rounded-md">
          <Clock className="h-3 w-3" />
          Você tem {userPendingPhotos.length} foto(s) aguardando aprovação
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : allPhotos.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed rounded-lg">
          <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">
            Nenhuma foto ainda
          </p>
          {user && (
            <p className="text-xs text-muted-foreground">
              Seja o primeiro a enviar uma foto!
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {allPhotos.map((photo) => (
            <Dialog key={photo.id}>
              <DialogTrigger asChild>
                <button
                  className="relative aspect-square rounded-lg overflow-hidden bg-muted hover:opacity-90 transition-opacity group"
                  onClick={() => setSelectedPhoto(photo.photo_url)}
                >
                  <img
                    src={photo.photo_url}
                    alt={photo.caption || locationName}
                    className="w-full h-full object-cover"
                  />
                  {!photo.is_approved && (
                    <Badge 
                      variant="secondary" 
                      className="absolute top-1 left-1 text-[10px] px-1 py-0"
                    >
                      <Clock className="h-2 w-2 mr-0.5" />
                      Pendente
                    </Badge>
                  )}
                  {photo.user_id === user?.id && !photo.is_approved && (
                    <button
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePhoto.mutate(photo.id);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl p-0">
                <img
                  src={photo.photo_url}
                  alt={photo.caption || locationName}
                  className="w-full rounded-lg"
                />
                {photo.caption && (
                  <p className="p-4 text-sm text-muted-foreground">
                    {photo.caption}
                  </p>
                )}
                {photo.uploader?.full_name && (
                  <p className="px-4 pb-4 text-xs text-muted-foreground">
                    Enviado por {photo.uploader.full_name}
                  </p>
                )}
              </DialogContent>
            </Dialog>
          ))}
        </div>
      )}
    </div>
  );
}
