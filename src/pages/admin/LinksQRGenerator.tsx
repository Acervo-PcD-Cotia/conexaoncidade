import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { QrCode, Download, Copy, Link2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface QRFormData {
  url: string;
  name: string;
  campaign: string;
  size: string;
  foreground: string;
  background: string;
}

export default function LinksQRGenerator() {
  const queryClient = useQueryClient();
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState<QRFormData>({
    url: '',
    name: '',
    campaign: '',
    size: '256',
    foreground: '000000',
    background: 'ffffff',
  });

  const generateMutation = useMutation({
    mutationFn: async (data: QRFormData) => {
      // Generate QR code using edge function
      const { data: result, error } = await supabase.functions.invoke('qr-generator', {
        body: {
          url: data.url,
          size: parseInt(data.size),
          foreground: data.foreground,
          background: data.background,
        },
      });

      if (error) throw error;
      return result;
    },
    onSuccess: (result) => {
      if (result?.qr_url) {
        setQrImageUrl(result.qr_url);
        toast.success('QR Code gerado!');
      }
    },
    onError: (error) => {
      toast.error(`Erro ao gerar QR: ${error.message}`);
    },
  });

  const handleGenerate = () => {
    if (!formData.url) {
      toast.error('Digite uma URL para gerar o QR Code');
      return;
    }
    generateMutation.mutate(formData);
  };

  const handleCopyUrl = () => {
    if (qrImageUrl) {
      navigator.clipboard.writeText(qrImageUrl);
      toast.success('URL do QR copiada!');
    }
  };

  const handleDownload = () => {
    if (qrImageUrl) {
      const link = document.createElement('a');
      link.href = qrImageUrl;
      link.download = `qr-${formData.name || 'code'}.png`;
      link.click();
    }
  };

  // Simple QR preview using a public API (fallback)
  const previewUrl = formData.url
    ? `https://api.qrserver.com/v1/create-qr-code/?size=${formData.size}x${formData.size}&data=${encodeURIComponent(formData.url)}&color=${formData.foreground}&bgcolor=${formData.background}`
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gerador de QR Code</h1>
          <p className="text-muted-foreground">
            Crie QR codes rastreáveis para suas campanhas
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/spah/painel/links">
            <Link2 className="mr-2 h-4 w-4" />
            Voltar para Links
          </Link>
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Configurações</CardTitle>
            <CardDescription>
              Configure o QR code com URL e personalização visual
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>URL de Destino *</Label>
              <Input
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://exemplo.com/pagina"
                type="url"
              />
            </div>

            <div className="space-y-2">
              <Label>Nome do QR (para referência)</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Campanha Janeiro"
              />
            </div>

            <div className="space-y-2">
              <Label>Campanha/UTM</Label>
              <Input
                value={formData.campaign}
                onChange={(e) => setFormData({ ...formData, campaign: e.target.value })}
                placeholder="Ex: outdoor-centro"
              />
              <p className="text-xs text-muted-foreground">
                Será adicionado como utm_campaign na URL
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Tamanho</Label>
                <Select
                  value={formData.size}
                  onValueChange={(v) => setFormData({ ...formData, size: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="128">128px</SelectItem>
                    <SelectItem value="256">256px</SelectItem>
                    <SelectItem value="512">512px</SelectItem>
                    <SelectItem value="1024">1024px</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Cor do QR</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={`#${formData.foreground}`}
                    onChange={(e) => setFormData({ ...formData, foreground: e.target.value.replace('#', '') })}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={formData.foreground}
                    onChange={(e) => setFormData({ ...formData, foreground: e.target.value })}
                    className="font-mono"
                    maxLength={6}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Fundo</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={`#${formData.background}`}
                    onChange={(e) => setFormData({ ...formData, background: e.target.value.replace('#', '') })}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={formData.background}
                    onChange={(e) => setFormData({ ...formData, background: e.target.value })}
                    className="font-mono"
                    maxLength={6}
                  />
                </div>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              className="w-full"
              disabled={!formData.url || generateMutation.isPending}
            >
              {generateMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <QrCode className="mr-2 h-4 w-4" />
              )}
              Gerar QR Code
            </Button>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              Visualize e baixe seu QR code
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            {previewUrl ? (
              <>
                <div className="p-4 bg-white rounded-lg shadow-inner border">
                  <img
                    src={qrImageUrl || previewUrl}
                    alt="QR Code Preview"
                    className="max-w-full"
                    style={{ width: `${Math.min(parseInt(formData.size), 300)}px` }}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleDownload} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Baixar PNG
                  </Button>
                  <Button onClick={handleCopyUrl} variant="outline">
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar URL
                  </Button>
                </div>

                {formData.campaign && (
                  <p className="text-sm text-muted-foreground text-center">
                    URL final com UTM:{' '}
                    <code className="bg-muted px-1 rounded text-xs">
                      {formData.url}?utm_campaign={formData.campaign}
                    </code>
                  </p>
                )}
              </>
            ) : (
              <div className="text-center text-muted-foreground">
                <QrCode className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p>Digite uma URL para visualizar o QR Code</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
