import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Upload, X, Image as ImageIcon, Loader2, Link } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  onAltChange?: (alt: string) => void;
  onCreditChange?: (credit: string) => void;
  alt?: string;
  credit?: string;
  label?: string;
  bucket?: string;
  path?: string;
}

export function ImageUploader({
  value,
  onChange,
  onAltChange,
  onCreditChange,
  alt = '',
  credit = '',
  label = 'Imagem Principal',
  bucket = 'news-images',
  path = 'news',
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const handleUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Apenas imagens são permitidas');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem muito grande (máx 5MB)');
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${path}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onChange(publicUrl);
      toast.success('Imagem enviada!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erro ao enviar imagem');
    } finally {
      setUploading(false);
    }
  }, [onChange]);

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
      setUrlInput('');
      toast.success('URL definida!');
    }
  };

  const handleRemove = () => {
    onChange('');
    onAltChange?.('');
    onCreditChange?.('');
  };

  return (
    <div className="space-y-3">
      <Label>{label}</Label>

      {value ? (
        <Card className="relative overflow-hidden">
          <img
            src={value}
            alt={alt || 'Preview'}
            className="w-full h-48 object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 z-10"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleRemove();
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </Card>
      ) : (
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="url">URL</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload">
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
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
                  <p className="text-xs text-muted-foreground">PNG, JPG até 5MB</p>
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileSelect}
                  />
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="url">
            <div className="flex gap-2">
              <Input
                placeholder="https://exemplo.com/imagem.jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
              />
              <Button type="button" onClick={handleUrlSubmit} disabled={!urlInput.trim()}>
                <Link className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {value && (
        <div className="space-y-3">
          <div>
            <Label htmlFor="image-alt" className="text-xs flex items-center gap-1">
              <span className="text-primary">♿</span>
              Texto Alternativo (Alt) *
            </Label>
            <Input
              id="image-alt"
              value={alt}
              onChange={(e) => onAltChange?.(e.target.value)}
              placeholder="Descreva a imagem para pessoas com deficiência visual"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              💡 Dica: Descreva O QUE aparece na imagem (pessoas, objetos, ações) de forma clara e objetiva para leitores de tela. Ex: "Prefeito João Silva discursa em cerimônia no pátio da Prefeitura."
            </p>
          </div>
          <div>
            <Label htmlFor="image-credit" className="text-xs">Crédito</Label>
            <Input
              id="image-credit"
              value={credit}
              onChange={(e) => onCreditChange?.(e.target.value)}
              placeholder="Fotógrafo / Agência"
              className="mt-1"
            />
          </div>
        </div>
      )}
    </div>
  );
}
