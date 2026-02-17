import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Upload, X, Loader2, Link } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';



// Constantes de dimensões por formato
const FORMAT_DIMENSIONS = {
  'leaderboard': { width: 728, height: 90, ratio: '728/90', label: 'Destaque Horizontal' },
  'home-topo': { width: 970, height: 250, ratio: '21/9', label: 'Mega Destaque' },
  'retangulo-medio': { width: 300, height: 250, ratio: '6/5', label: 'Destaque Inteligente' },
  'arranha-ceu': { width: 300, height: 600, ratio: '1/2', label: 'Painel Vertical' },
  'popup': { width: 580, height: 400, ratio: '29/20', label: 'Alerta Comercial' },
  'banner-intro': { width: 970, height: 250, ratio: '97/25', label: 'Banner Intro' },
  'flutuante': { width: 300, height: 600, ratio: '1/2', label: 'Destaque Flutuante' },
  'alerta-saida': { width: 1280, height: 720, ratio: '16/9', label: 'Alerta Full Saída' },
} as const;

export type AdFormat = keyof typeof FORMAT_DIMENSIONS;

interface AdImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  onAltChange?: (alt: string) => void;
  alt?: string;
  format: AdFormat;
  label?: string;
  required?: boolean;
}

export function AdImageUploader({
  value,
  onChange,
  onAltChange,
  alt = '',
  format,
  label = 'Imagem do Anúncio',
  required = false,
}: AdImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlOption, setShowUrlOption] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileSize, setUploadedFileSize] = useState<number | null>(null);
  const [uploadedDimensions, setUploadedDimensions] = useState<{ w: number; h: number } | null>(null);

  const formatConfig = FORMAT_DIMENSIONS[format];

  const handleUpload = useCallback(async (file: File) => {
    // Validar tipo
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Formato inválido. Use JPG, PNG ou WebP.');
      return;
    }

    // Validar tamanho (30MB)
    if (file.size > 30 * 1024 * 1024) {
      toast.error('Imagem muito grande (máximo 30MB)');
      return;
    }

    setUploading(true);

    try {
      // Read dimensions before upload
      const imgDims = await new Promise<{ w: number; h: number }>((resolve) => {
        const img = new Image();
        img.onload = () => {
          resolve({ w: img.naturalWidth, h: img.naturalHeight });
          URL.revokeObjectURL(img.src);
        };
        img.onerror = () => {
          resolve({ w: 0, h: 0 });
          URL.revokeObjectURL(img.src);
        };
        img.src = URL.createObjectURL(file);
      });

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${format}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('ads')
        .upload(filePath, file);

      if (uploadError) {
        if (uploadError.message?.includes('Bucket not found')) {
          toast.error('Bucket de armazenamento não configurado. Contate o administrador.');
        } else if (uploadError.message?.includes('row-level security') || uploadError.message?.includes('permission')) {
          toast.error('Sem permissão para upload. Verifique se está logado.');
        } else {
          toast.error(`Erro no upload: ${uploadError.message}`);
        }
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('ads')
        .getPublicUrl(filePath);

      onChange(publicUrl);
      setUploadedFileName(file.name);
      setUploadedFileSize(file.size);
      setUploadedDimensions(imgDims.w > 0 ? imgDims : null);
      // Auto-generate alt text from label/format context
      if (onAltChange && !alt) {
        const autoAlt = `${label} - ${formatConfig.label} (${formatConfig.width}x${formatConfig.height}px)`;
        onAltChange(autoAlt);
      }
      toast.success('Imagem enviada!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erro inesperado ao enviar imagem');
    } finally {
      setUploading(false);
    }
  }, [onChange, format]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    if (e.dataTransfer.files?.[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  }, [handleUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleUpload(e.target.files[0]);
    }
  }, [handleUpload]);

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      // Auto-generate alt text for URL too
      if (onAltChange && !alt) {
        const autoAlt = `${label} - ${formatConfig.label} (${formatConfig.width}x${formatConfig.height}px)`;
        onAltChange(autoAlt);
      }
      setUrlInput('');
      setShowUrlOption(false);
      toast.success('URL definida!');
    }
  };

  const handleRemove = () => {
    onChange('');
    onAltChange?.('');
    setUploadedFileName(null);
    setUploadedFileSize(null);
    setUploadedDimensions(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-3">
      <Label>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      <p className="text-xs text-muted-foreground">
        Formato: {formatConfig.label} ({formatConfig.width}x{formatConfig.height}px) • Máx: 30MB • JPG, PNG, WebP
      </p>

      {value ? (
        <Card className="relative overflow-hidden">
          {/* Preview com aspect-ratio correto */}
          <div 
            className="relative w-full bg-muted"
            style={{ aspectRatio: formatConfig.ratio }}
          >
            <img
              src={value}
              alt={alt || 'Preview do anúncio'}
              className="w-full h-full object-cover object-center"
            />
            
            {/* Safe Area Overlay (80% central) */}
            <div 
              className="absolute pointer-events-none border-2 border-dashed border-white/50"
              style={{ 
                top: '10%', 
                left: '10%', 
                right: '10%', 
                bottom: '10%' 
              }}
            >
              <span className="absolute top-1 left-1 text-[10px] text-white/70 bg-black/30 px-1 rounded">
                Área segura
              </span>
            </div>
          </div>
          
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
          {uploadedFileName && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-3 py-2">
              <p className="text-xs text-white truncate font-medium" title={uploadedFileName}>
                📄 {uploadedFileName}
              </p>
              <p className="text-[10px] text-white/70">
                {uploadedDimensions ? `${uploadedDimensions.w}×${uploadedDimensions.h}px` : ''}
                {uploadedDimensions && uploadedFileSize ? ' • ' : ''}
                {uploadedFileSize ? formatFileSize(uploadedFileSize) : ''}
              </p>
            </div>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors relative ${
              dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
            } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Enviando...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Arraste uma imagem ou clique para selecionar
                </p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, WebP até 30MB
                </p>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleFileSelect}
                />
              </div>
            )}
          </div>

          {/* URL Externa */}
          <Button 
            variant="ghost" 
            size="sm" 
            type="button"
            className="text-xs text-muted-foreground"
            onClick={() => setShowUrlOption(!showUrlOption)}
          >
            <Link className="h-3 w-3 mr-1" />
            {showUrlOption ? 'Ocultar opção de URL' : 'Usar URL externa (avançado)'}
          </Button>
          {showUrlOption && (
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="https://exemplo.com/imagem.jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="text-sm"
              />
              <Button 
                type="button" 
                onClick={handleUrlSubmit} 
                disabled={!urlInput.trim()}
                size="sm"
              >
                Aplicar
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Alt text */}
      {value && onAltChange && (
        <div className="space-y-1">
          <Label htmlFor="ad-image-alt" className="text-xs flex items-center gap-1">
            <span className="text-primary">♿</span>
            Texto Alternativo (Alt)
          </Label>
          <Input
            id="ad-image-alt"
            value={alt}
            onChange={(e) => onAltChange(e.target.value)}
            placeholder="Descreva a imagem do anúncio"
            className="text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Importante para acessibilidade e SEO
          </p>
        </div>
      )}
    </div>
  );
}

// Mapeamento de slots para formatos
export const SLOT_TO_FORMAT: Record<string, AdFormat> = {
  leaderboard: 'leaderboard',
  home_top: 'leaderboard',
  home_banner: 'home-topo',
  super_banner: 'home-topo',
  rectangle: 'retangulo-medio',
  rectangle_medium: 'retangulo-medio',
  skyscraper: 'arranha-ceu',
  popup: 'popup',
  sidebar: 'retangulo-medio',
  news_between: 'retangulo-medio',
  article_bottom: 'retangulo-medio',
};

export function getFormatFromSlot(slotType: string): AdFormat {
  return SLOT_TO_FORMAT[slotType] || 'retangulo-medio';
}
