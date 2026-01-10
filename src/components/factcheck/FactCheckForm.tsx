import { useState } from 'react';
import { Link2, Type, FileText, Image, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { FactCheckInputType } from '@/hooks/useFactCheck';

interface FactCheckFormProps {
  onSubmit: (data: {
    input_type: FactCheckInputType;
    content: string;
    image_url?: string;
    opt_in_editorial?: boolean;
  }) => Promise<void>;
  isLoading?: boolean;
  defaultContent?: string;
  defaultType?: FactCheckInputType;
  className?: string;
}

export function FactCheckForm({
  onSubmit,
  isLoading = false,
  defaultContent = '',
  defaultType = 'text',
  className
}: FactCheckFormProps) {
  const [inputType, setInputType] = useState<FactCheckInputType>(defaultType);
  const [content, setContent] = useState(defaultContent);
  const [optInEditorial, setOptInEditorial] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    await onSubmit({
      input_type: inputType,
      content: content.trim(),
      image_url: imagePreview || undefined,
      opt_in_editorial: optInEditorial
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getPlaceholder = () => {
    switch (inputType) {
      case 'link':
        return 'https://exemplo.com/noticia-para-verificar';
      case 'text':
        return 'Cole aqui o texto completo que deseja verificar...';
      case 'title':
        return 'Digite o título ou manchete que deseja verificar...';
      case 'image':
        return 'Descreva brevemente o conteúdo da imagem...';
      default:
        return '';
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      {/* Input Type Selector */}
      <Tabs value={inputType} onValueChange={(v) => setInputType(v as FactCheckInputType)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="link" className="gap-2">
            <Link2 className="h-4 w-4" />
            <span className="hidden sm:inline">Link</span>
          </TabsTrigger>
          <TabsTrigger value="text" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Texto</span>
          </TabsTrigger>
          <TabsTrigger value="title" className="gap-2">
            <Type className="h-4 w-4" />
            <span className="hidden sm:inline">Título</span>
          </TabsTrigger>
          <TabsTrigger value="image" className="gap-2">
            <Image className="h-4 w-4" />
            <span className="hidden sm:inline">Imagem</span>
          </TabsTrigger>
        </TabsList>

        {/* Link Input */}
        <TabsContent value="link" className="mt-4">
          <div className="space-y-2">
            <Label htmlFor="link-input">URL para verificar</Label>
            <Input
              id="link-input"
              type="url"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={getPlaceholder()}
              disabled={isLoading}
            />
          </div>
        </TabsContent>

        {/* Text Input */}
        <TabsContent value="text" className="mt-4">
          <div className="space-y-2">
            <Label htmlFor="text-input">Texto para verificar</Label>
            <Textarea
              id="text-input"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={getPlaceholder()}
              rows={6}
              disabled={isLoading}
            />
          </div>
        </TabsContent>

        {/* Title Input */}
        <TabsContent value="title" className="mt-4">
          <div className="space-y-2">
            <Label htmlFor="title-input">Título ou manchete</Label>
            <Input
              id="title-input"
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={getPlaceholder()}
              disabled={isLoading}
            />
          </div>
        </TabsContent>

        {/* Image Input */}
        <TabsContent value="image" className="mt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image-input">Upload de imagem (print ou foto)</Label>
              <Input
                id="image-input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                disabled={isLoading}
              />
            </div>

            {imagePreview && (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-48 rounded-lg object-contain"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => setImagePreview(null)}
                >
                  Remover
                </Button>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="image-description">Descrição da imagem</Label>
              <Textarea
                id="image-description"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={getPlaceholder()}
                rows={3}
                disabled={isLoading}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Editorial Opt-in */}
      <div className="flex items-start space-x-3">
        <Checkbox
          id="opt-in"
          checked={optInEditorial}
          onCheckedChange={(checked) => setOptInEditorial(checked === true)}
          disabled={isLoading}
        />
        <div className="space-y-1">
          <Label htmlFor="opt-in" className="text-sm font-medium leading-none cursor-pointer">
            Permitir que a redação use minha verificação para apuração
          </Label>
          <p className="text-xs text-muted-foreground">
            Sua verificação pode ajudar jornalistas a investigar desinformação
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isLoading || !content.trim()}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verificando...
          </>
        ) : (
          'Verificar agora'
        )}
      </Button>
    </form>
  );
}
