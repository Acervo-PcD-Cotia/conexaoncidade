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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Upload, 
  X, 
  Check, 
  AlertTriangle, 
  ArrowDown,
  RefreshCw 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  getImageDimensions, 
  findCompatibleSlots,
  findAllProportionMatches,
  autoAssignSlot,
  getMatchBadge,
  formatAspectRatio,
  type SlotMatchV2,
  type ImageDimensions 
} from '@/lib/imageCorrectionV2';
import { AD_SLOTS } from '@/lib/adSlots';
import { OFFICIAL_SLOTS, type ChannelType } from '@/types/campaigns-unified';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UploadedAsset {
  id: string;
  file: File;
  preview: string;
  dimensions: ImageDimensions;
  aspectRatio: string;
  autoSlot: SlotMatchV2 | null;
  selectedSlot: SlotMatchV2 | null;
  compatibleSlots: SlotMatchV2[];
  allProportionMatches: SlotMatchV2[];
  isUploading: boolean;
  uploadedUrl?: string;
  error?: string;
}

interface DuplicateConflict {
  asset: UploadedAsset;
  existingChannel: string;
  slotLabel: string;
}

interface BatchAssetUploaderProps {
  campaignId?: string;
  existingAssets?: Record<string, { url?: string; alt?: string }>;
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

/** Map format_key/channel to the existingAssets key */
function getExistingAssetKey(channel: string, formatKey: string): string | null {
  const map: Record<string, string> = {
    ads: 'ads',
    publidoor: 'publidoor',
    webstories: 'webstories',
    banner_intro: 'bannerIntro',
    floating_ad: 'floatingAd',
    exit_intent: 'exitIntentHero',
    login_panel: 'loginPanel',
    login: 'loginPanel',
    experience: 'bannerIntro',
  };
  return map[channel] || null;
}

export function BatchAssetUploader({ 
  campaignId, 
  existingAssets,
  onAssetsUploaded,
  className 
}: BatchAssetUploaderProps) {
  const [assets, setAssets] = useState<UploadedAsset[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [duplicateConflict, setDuplicateConflict] = useState<DuplicateConflict | null>(null);
  const [pendingUploadResults, setPendingUploadResults] = useState<Parameters<typeof onAssetsUploaded>[0]>([]);

  const processFile = useCallback(async (file: File): Promise<UploadedAsset> => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const preview = URL.createObjectURL(file);
    
    try {
      const dimensions = await getImageDimensions(file);
      const aspectRatio = formatAspectRatio(dimensions.width, dimensions.height);
      const compatibleSlots = findCompatibleSlots(dimensions);
      const allProportionMatches = findAllProportionMatches(dimensions);
      const autoSlotMatch = autoAssignSlot(dimensions);
      
      return {
        id, file, preview, dimensions, aspectRatio,
        autoSlot: autoSlotMatch,
        selectedSlot: autoSlotMatch,
        compatibleSlots, allProportionMatches,
        isUploading: false,
      };
    } catch {
      return {
        id, file, preview,
        dimensions: { width: 0, height: 0 },
        aspectRatio: '?',
        autoSlot: null, selectedSlot: null,
        compatibleSlots: [], allProportionMatches: [],
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
    const processedAssets = await Promise.all(imageFiles.map(file => processFile(file)));
    setAssets(prev => [...prev, ...processedAssets]);
  }, [processFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize: 30 * 1024 * 1024,
  });

  const removeAsset = (id: string) => {
    setAssets(prev => {
      const asset = prev.find(a => a.id === id);
      if (asset) URL.revokeObjectURL(asset.preview);
      return prev.filter(a => a.id !== id);
    });
  };

  const changeSlot = (assetId: string, slotKey: string) => {
    setAssets(prev => prev.map(asset => {
      if (asset.id === assetId) {
        const newSlot = asset.compatibleSlots.find(s => s.slotKey === slotKey)
          || asset.allProportionMatches.find(s => s.slotKey === slotKey);
        return { ...asset, selectedSlot: newSlot || null };
      }
      return asset;
    }));
  };

  /** Check for duplicates before uploading */
  const checkDuplicatesAndUpload = async (uploadedResults: Parameters<typeof onAssetsUploaded>[0]) => {
    if (!existingAssets || uploadedResults.length === 0) {
      onAssetsUploaded(uploadedResults);
      return;
    }

    // Find first conflict
    for (const result of uploadedResults) {
      const existingKey = getExistingAssetKey(result.channel_type, result.format_key);
      if (existingKey && existingAssets[existingKey]?.url) {
        const slotInfo = AD_SLOTS.find(s => s.channel === result.channel_type || s.key === result.format_key);
        setDuplicateConflict({
          asset: assets.find(a => a.uploadedUrl === result.file_url) || assets[0],
          existingChannel: result.channel_type,
          slotLabel: slotInfo?.label || result.format_key,
        });
        setPendingUploadResults(uploadedResults);
        return;
      }
    }

    onAssetsUploaded(uploadedResults);
  };

  const handleDuplicateReplace = () => {
    onAssetsUploaded(pendingUploadResults);
    setDuplicateConflict(null);
    setPendingUploadResults([]);
  };

  const handleDuplicateKeepBoth = () => {
    onAssetsUploaded(pendingUploadResults);
    setDuplicateConflict(null);
    setPendingUploadResults([]);
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
        setAssets(prev => prev.map(a => a.id === asset.id ? { ...a, isUploading: true } : a));

        const slot = asset.selectedSlot!;
        const ext = asset.file.name.split('.').pop() || 'jpg';
        const timestamp = Date.now();
        const folder = campaignId ? `${campaignId}/` : '';
        const path = `${folder}${slot.channel}/${slot.slotKey}/original/${timestamp}-${asset.id}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('campaign-assets')
          .upload(path, asset.file, { cacheControl: '31536000', upsert: false });

        if (uploadError) {
          let errorMessage = uploadError.message;
          if (uploadError.message?.includes('Bucket not found')) {
            errorMessage = 'Bucket não configurado. Contate o administrador.';
          } else if (uploadError.message?.includes('row-level security') || uploadError.message?.includes('permission')) {
            errorMessage = 'Sem permissão. Verifique se está logado.';
          }
          setAssets(prev => prev.map(a => a.id === asset.id ? { ...a, isUploading: false, error: errorMessage } : a));
          toast.error(`Erro ao enviar ${asset.file.name}: ${errorMessage}`);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage.from('campaign-assets').getPublicUrl(path);
        setAssets(prev => prev.map(a => a.id === asset.id ? { ...a, isUploading: false, uploadedUrl: publicUrl } : a));

        uploadedResults.push({
          file_url: publicUrl,
          width: slot.width,
          height: slot.height,
          channel_type: slot.channel as ChannelType,
          format_key: slot.slotKey,
          is_original: true,
          upscale_percent: slot.scalePercent > 100 ? slot.scalePercent : undefined,
          auto_corrected: slot.scalePercent > 100,
        });
      }

      if (uploadedResults.length > 0) {
        await checkDuplicatesAndUpload(uploadedResults);
        toast.success(`${uploadedResults.length} asset(s) enviado(s) com sucesso`);
      }
    } catch {
      toast.error('Erro ao enviar assets');
    } finally {
      setIsUploading(false);
    }
  };

  const allSlots = [
    ...OFFICIAL_SLOTS.ads.map(s => ({ ...s, channel: 'ads' as const })),
    ...OFFICIAL_SLOTS.publidoor.map(s => ({ ...s, channel: 'publidoor' as const })),
    ...OFFICIAL_SLOTS.webstories.map(s => ({ ...s, channel: 'webstories' as const })),
    ...(OFFICIAL_SLOTS.login ? OFFICIAL_SLOTS.login.map(s => ({ ...s, channel: 'login' as const })) : []),
    ...(OFFICIAL_SLOTS.experience ? OFFICIAL_SLOTS.experience.map(s => ({ ...s, channel: 'experience' as const })) : []),
  ];

  return (
    <div className={cn('space-y-4', className)}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
        )}
      >
        <input {...getInputProps()} />
        <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
        <p className="text-sm font-medium">
          {isDragActive ? 'Solte as imagens aqui...' : 'Arraste imagens ou clique para selecionar'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">JPG, PNG ou WebP • Máximo 30MB por arquivo</p>
      </div>

      {/* Asset list */}
      {assets.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">{assets.length} imagem(ns) selecionada(s)</h4>
            <Button size="sm" onClick={uploadAssets} disabled={isUploading || assets.every(a => !a.selectedSlot || a.error)}>
              {isUploading ? (
                <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Enviando...</>
              ) : (
                <><Upload className="h-4 w-4 mr-2" />Enviar todos</>
              )}
            </Button>
          </div>

          <div className="grid gap-3">
            {assets.map(asset => (
              <Card key={asset.id} className="p-3">
                <div className="flex gap-3">
                  <div className="w-20 h-20 rounded overflow-hidden bg-muted flex-shrink-0">
                    <img src={asset.preview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{asset.file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {asset.dimensions.width} × {asset.dimensions.height}px • Proporção: {asset.aspectRatio}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={() => removeAsset(asset.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {asset.error ? (
                      <Badge variant="destructive" className="text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />{asset.error}
                      </Badge>
                    ) : asset.compatibleSlots.length === 0 && asset.allProportionMatches.length === 0 ? (
                      <div className="space-y-2">
                        <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />Nenhum slot compatível
                        </Badge>
                        <Select
                          value={asset.selectedSlot?.slotKey ?? '__none__'}
                          onValueChange={(value) => { if (value !== '__none__') changeSlot(asset.id, value); }}
                        >
                          <SelectTrigger className="h-8 w-48 text-xs">
                            <SelectValue placeholder="Selecionar manualmente..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__" disabled className="text-xs text-muted-foreground">Selecione...</SelectItem>
                            {AD_SLOTS.map(slot => (
                              <SelectItem key={slot.key} value={slot.key} className="text-xs">
                                {slot.seq}. {slot.label} ({slot.channel}) - {slot.width}×{slot.height}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 flex-wrap">
                        <Select
                          value={asset.selectedSlot?.slotKey ?? '__none__'}
                          onValueChange={(value) => { if (value !== '__none__') changeSlot(asset.id, value); }}
                        >
                          <SelectTrigger className="h-8 w-48 text-xs">
                            <SelectValue placeholder="Selecionar slot" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__" disabled className="text-xs text-muted-foreground">Selecione...</SelectItem>
                            {asset.compatibleSlots.length > 0 && (
                              <>
                                <SelectItem disabled value="header-compatible" className="text-xs font-semibold text-muted-foreground">✓ Compatíveis (auto)</SelectItem>
                                {asset.compatibleSlots.map(slot => (
                                  <SelectItem key={slot.slotKey} value={slot.slotKey} className="text-xs">
                                    {slot.slotLabel} ({slot.channel}) - {slot.statusText}
                                  </SelectItem>
                                ))}
                              </>
                            )}
                            {asset.allProportionMatches.length > asset.compatibleSlots.length && (
                              <>
                                <SelectItem disabled value="header-manual" className="text-xs font-semibold text-muted-foreground">⚠️ Requer ajuste manual</SelectItem>
                                {asset.allProportionMatches
                                  .filter(m => !asset.compatibleSlots.some(c => c.slotKey === m.slotKey))
                                  .map(slot => (
                                    <SelectItem key={slot.slotKey} value={slot.slotKey} className="text-xs">
                                      {slot.slotLabel} ({slot.channel}) - {slot.statusText}
                                    </SelectItem>
                                  ))}
                              </>
                            )}
                          </SelectContent>
                        </Select>

                        {asset.selectedSlot && (
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-xs',
                              asset.selectedSlot.statusVariant === 'success' && 'border-green-500 text-green-700',
                              asset.selectedSlot.statusVariant === 'warning' && 'border-yellow-500 text-yellow-700',
                              asset.selectedSlot.statusVariant === 'error' && 'border-red-500 text-red-700',
                            )}
                          >
                            {asset.selectedSlot.matchType === 'downscale' && <ArrowDown className="h-3 w-3 mr-1" />}
                            {getMatchBadge(asset.selectedSlot).text}
                          </Badge>
                        )}

                        {asset.uploadedUrl && (
                          <Badge variant="default" className="text-xs bg-green-600">
                            <Check className="h-3 w-3 mr-1" />Enviado
                          </Badge>
                        )}

                        {asset.isUploading && (
                          <Badge variant="secondary" className="text-xs">
                            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />Enviando...
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

      {/* Slot reference - ordered 1-15 */}
      <details className="text-xs">
        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
          Ver dimensões oficiais (1–15)
        </summary>
        <div className="mt-2 overflow-x-auto rounded-lg border">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/60">
                <th className="border-b px-2 py-1.5 text-left font-semibold w-6">#</th>
                <th className="border-b px-2 py-1.5 text-left font-semibold">Nome</th>
                <th className="border-b px-2 py-1.5 text-left font-semibold">Dimensão</th>
                <th className="border-b px-2 py-1.5 text-left font-semibold">Canal</th>
              </tr>
            </thead>
            <tbody>
              {AD_SLOTS.map(slot => (
                <tr key={slot.id} className="border-b last:border-0">
                  <td className="px-2 py-1 font-mono text-muted-foreground">{slot.seq}</td>
                  <td className="px-2 py-1 font-medium">{slot.label}</td>
                  <td className="px-2 py-1 font-mono">{slot.width}×{slot.height}</td>
                  <td className="px-2 py-1 text-muted-foreground">{slot.channel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      {/* Duplicate Confirmation Dialog */}
      <AlertDialog open={!!duplicateConflict} onOpenChange={() => setDuplicateConflict(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Criativo já existe</AlertDialogTitle>
            <AlertDialogDescription>
              Já existe um criativo para <strong>{duplicateConflict?.slotLabel}</strong>.
              Deseja substituir o existente ou manter ambos?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setDuplicateConflict(null); setPendingUploadResults([]); }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDuplicateKeepBoth} className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
              Manter ambos
            </AlertDialogAction>
            <AlertDialogAction onClick={handleDuplicateReplace}>
              Substituir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
