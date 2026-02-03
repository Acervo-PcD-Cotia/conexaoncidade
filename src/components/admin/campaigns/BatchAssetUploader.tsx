import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Upload, 
  X, 
  Check, 
  AlertTriangle, 
  Image as ImageIcon,
  RefreshCw 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  getImageDimensions, 
  findMatchingSlots, 
  autoAssignSlot,
  getCorrectionBadge,
  type SlotMatch,
  type ImageDimensions 
} from '@/lib/imageCorrection';
import { OFFICIAL_SLOTS, type ChannelType } from '@/types/campaigns-unified';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UploadedAsset {
  id: string;
  file: File;
  preview: string;
  dimensions: ImageDimensions;
  autoSlot: SlotMatch | null;
  selectedSlot: SlotMatch | null;
  possibleSlots: SlotMatch[];
  isUploading: boolean;
  uploadedUrl?: string;
  error?: string;
}

interface BatchAssetUploaderProps {
  campaignId?: string;
  onAssetsUploaded: (assets: {
    file_url: string;
    width: number;
    height: number;
    channel_type: ChannelType;
    format_key: string;
    is_original: boolean;
    upscale_percent?: number;
    auto_corrected: boolean;
  }[]) => void;
  className?: string;
}

export function BatchAssetUploader({ 
  campaignId, 
  onAssetsUploaded,
  className 
}: BatchAssetUploaderProps) {
  const [assets, setAssets] = useState<UploadedAsset[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const processFile = useCallback(async (file: File): Promise<UploadedAsset> => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const preview = URL.createObjectURL(file);
    
    try {
      const dimensions = await getImageDimensions(file);
      const possibleSlots = findMatchingSlots(dimensions);
      const autoSlot = autoAssignSlot(dimensions);
      
      return {
        id,
        file,
        preview,
        dimensions,
        autoSlot,
        selectedSlot: autoSlot,
        possibleSlots,
        isUploading: false,
      };
    } catch {
      return {
        id,
        file,
        preview,
        dimensions: { width: 0, height: 0 },
        autoSlot: null,
        selectedSlot: null,
        possibleSlots: [],
        isUploading: false,
        error: 'Não foi possível processar a imagem',
      };
    }
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const imageFiles = acceptedFiles.filter(f => f.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      toast.error('Selecione apenas arquivos de imagem');
      return;
    }

    const processedAssets = await Promise.all(
      imageFiles.map(file => processFile(file))
    );

    setAssets(prev => [...prev, ...processedAssets]);
  }, [processFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize: 2 * 1024 * 1024, // 2MB
  });

  const removeAsset = (id: string) => {
    setAssets(prev => {
      const asset = prev.find(a => a.id === id);
      if (asset) {
        URL.revokeObjectURL(asset.preview);
      }
      return prev.filter(a => a.id !== id);
    });
  };

  const changeSlot = (assetId: string, slotKey: string) => {
    setAssets(prev => prev.map(asset => {
      if (asset.id === assetId) {
        const newSlot = asset.possibleSlots.find(s => s.slotKey === slotKey);
        return { ...asset, selectedSlot: newSlot || null };
      }
      return asset;
    }));
  };

  const uploadAssets = async () => {
    const validAssets = assets.filter(a => a.selectedSlot && !a.error);
    
    if (validAssets.length === 0) {
      toast.error('Nenhum asset válido para enviar');
      return;
    }

    setIsUploading(true);
    const uploadedResults: Parameters<typeof onAssetsUploaded>[0] = [];

    try {
      for (const asset of validAssets) {
        setAssets(prev => prev.map(a => 
          a.id === asset.id ? { ...a, isUploading: true } : a
        ));

        const slot = asset.selectedSlot!;
        const ext = asset.file.name.split('.').pop() || 'jpg';
        const timestamp = Date.now();
        const folder = campaignId ? `${campaignId}/` : '';
        const path = `${folder}${slot.channel}/${slot.slotKey}/original/${timestamp}-${asset.id}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('campaign-assets')
          .upload(path, asset.file, {
            cacheControl: '31536000',
            upsert: false,
          });

        if (uploadError) {
          setAssets(prev => prev.map(a => 
            a.id === asset.id ? { ...a, isUploading: false, error: uploadError.message } : a
          ));
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('campaign-assets')
          .getPublicUrl(path);

        setAssets(prev => prev.map(a => 
          a.id === asset.id ? { ...a, isUploading: false, uploadedUrl: publicUrl } : a
        ));

        uploadedResults.push({
          file_url: publicUrl,
          width: slot.width,
          height: slot.height,
          channel_type: slot.channel as ChannelType,
          format_key: slot.slotKey,
          is_original: true,
          upscale_percent: slot.correctionResult.upscalePercent > 100 
            ? slot.correctionResult.upscalePercent 
            : undefined,
          auto_corrected: slot.correctionResult.upscalePercent > 100,
        });
      }

      if (uploadedResults.length > 0) {
        onAssetsUploaded(uploadedResults);
        toast.success(`${uploadedResults.length} asset(s) enviado(s) com sucesso`);
      }
    } catch (err) {
      toast.error('Erro ao enviar assets');
    } finally {
      setIsUploading(false);
    }
  };

  const allSlots = [
    ...OFFICIAL_SLOTS.ads.map(s => ({ ...s, channel: 'ads' as const })),
    ...OFFICIAL_SLOTS.publidoor.map(s => ({ ...s, channel: 'publidoor' as const })),
    ...OFFICIAL_SLOTS.webstories.map(s => ({ ...s, channel: 'webstories' as const })),
  ];

  return (
    <div className={cn('space-y-4', className)}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-primary/50'
        )}
      >
        <input {...getInputProps()} />
        <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
        <p className="text-sm font-medium">
          {isDragActive 
            ? 'Solte as imagens aqui...' 
            : 'Arraste imagens ou clique para selecionar'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          JPG, PNG ou WebP • Máximo 2MB por arquivo
        </p>
      </div>

      {/* Asset list */}
      {assets.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">
              {assets.length} imagem(ns) selecionada(s)
            </h4>
            <Button
              size="sm"
              onClick={uploadAssets}
              disabled={isUploading || assets.every(a => !a.selectedSlot || a.error)}
            >
              {isUploading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Enviar todos
                </>
              )}
            </Button>
          </div>

          <div className="grid gap-3">
            {assets.map(asset => (
              <Card key={asset.id} className="p-3">
                <div className="flex gap-3">
                  {/* Preview */}
                  <div className="w-20 h-20 rounded overflow-hidden bg-muted flex-shrink-0">
                    <img 
                      src={asset.preview} 
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {asset.file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {asset.dimensions.width} × {asset.dimensions.height}px
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 flex-shrink-0"
                        onClick={() => removeAsset(asset.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Slot selection */}
                    {asset.error ? (
                      <Badge variant="destructive" className="text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {asset.error}
                      </Badge>
                    ) : asset.possibleSlots.length === 0 ? (
                      <Badge variant="destructive" className="text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Nenhum slot compatível
                      </Badge>
                    ) : (
                      <div className="flex items-center gap-2 flex-wrap">
                        <Select
                          value={asset.selectedSlot?.slotKey || ''}
                          onValueChange={(value) => changeSlot(asset.id, value)}
                        >
                          <SelectTrigger className="h-8 w-48 text-xs">
                            <SelectValue placeholder="Selecionar slot" />
                          </SelectTrigger>
                          <SelectContent>
                            {asset.possibleSlots.map(slot => (
                              <SelectItem 
                                key={slot.slotKey} 
                                value={slot.slotKey}
                                className="text-xs"
                              >
                                {slot.slotLabel} ({slot.channel})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {asset.selectedSlot && (
                          <Badge 
                            variant="outline"
                            className={cn(
                              'text-xs',
                              getCorrectionBadge(asset.selectedSlot.correctionResult).variant === 'success' && 'border-green-500 text-green-700',
                              getCorrectionBadge(asset.selectedSlot.correctionResult).variant === 'warning' && 'border-yellow-500 text-yellow-700',
                              getCorrectionBadge(asset.selectedSlot.correctionResult).variant === 'error' && 'border-red-500 text-red-700',
                            )}
                          >
                            {getCorrectionBadge(asset.selectedSlot.correctionResult).text}
                          </Badge>
                        )}

                        {asset.uploadedUrl && (
                          <Badge variant="default" className="text-xs bg-green-600">
                            <Check className="h-3 w-3 mr-1" />
                            Enviado
                          </Badge>
                        )}

                        {asset.isUploading && (
                          <Badge variant="secondary" className="text-xs">
                            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                            Enviando...
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Slot reference */}
      <details className="text-xs">
        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
          Ver dimensões oficiais
        </summary>
        <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
          {allSlots.map(slot => (
            <div 
              key={`${slot.channel}-${slot.key}`}
              className="p-2 border rounded text-xs"
            >
              <span className="font-medium">{slot.label}</span>
              <br />
              <span className="text-muted-foreground">
                {slot.width}×{slot.height} ({slot.channel})
              </span>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
