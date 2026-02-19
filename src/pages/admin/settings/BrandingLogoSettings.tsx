import { useState, useCallback } from "react";
import { ImageIcon, Upload, Trash2, ZoomIn, ZoomOut, RotateCcw, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useBranding } from "@/hooks/useBranding";
import { useUpdateBranding } from "@/hooks/useSiteTemplateConfig";
import { useTenantContext } from "@/contexts/TenantContext";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";

const DEFAULT_LOGO_SIZE = 240;

export default function BrandingLogoSettings() {
  const branding = useBranding();
  const updateBranding = useUpdateBranding();
  const { currentTenantId } = useTenantContext();

  const currentLogoUrl = branding?.logo?.main || "/logo.png";
  const currentSize = branding?.logo_size ?? DEFAULT_LOGO_SIZE;

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [logoSize, setLogoSize] = useState(currentSize);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setPendingFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".svg", ".webp"] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  const handleSave = async () => {
    setUploading(true);
    try {
      let logoUrl = branding?.logo?.main;

      if (pendingFile) {
        const ext = pendingFile.name.split(".").pop();
        const filename = `logo-${currentTenantId || "site"}-${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("site-assets")
          .upload(filename, pendingFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: publicData } = supabase.storage
          .from("site-assets")
          .getPublicUrl(filename);

        logoUrl = publicData.publicUrl;
      }

      await updateBranding.mutateAsync({
        logo: {
          ...branding?.logo,
          main: logoUrl,
        },
        logo_size: logoSize,
      } as any);

      toast.success("Logo atualizado com sucesso!");
      setPendingFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao salvar: " + (err?.message || "tente novamente"));
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setLogoSize(DEFAULT_LOGO_SIZE);
    setPreviewUrl(null);
    setPendingFile(null);
  };

  const displayUrl = previewUrl || currentLogoUrl;
  const displayHeight = Math.round(logoSize * 0.58); // scale for preview (mobile factor)

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <ImageIcon className="h-6 w-6 text-primary" />
          Logo do Site
        </h1>
        <p className="text-muted-foreground mt-1">
          Faça upload do logo e ajuste o tamanho exibido no topo do site
        </p>
      </div>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Imagem do Logo</CardTitle>
          <CardDescription>PNG, SVG ou JPG — máx. 5 MB</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-muted/30"
            )}
          >
            <input {...getInputProps()} />
            <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
            {isDragActive ? (
              <p className="text-sm text-primary font-medium">Solte o arquivo aqui</p>
            ) : (
              <>
                <p className="text-sm font-medium">Arraste ou clique para fazer upload</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, SVG, JPG ou WEBP</p>
              </>
            )}
          </div>

          {pendingFile && (
            <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg text-sm">
              <span className="truncate text-muted-foreground">{pendingFile.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={() => { setPendingFile(null); setPreviewUrl(null); }}
              >
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Size Control */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tamanho do Logo</CardTitle>
          <CardDescription>
            Arraste para ajustar a altura do logo no header
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Altura</Label>
              <span className="text-sm font-mono text-primary font-semibold">{logoSize}px</span>
            </div>
            <div className="flex items-center gap-3">
              <ZoomOut className="h-4 w-4 text-muted-foreground shrink-0" />
              <Slider
                min={80}
                max={400}
                step={8}
                value={[logoSize]}
                onValueChange={([v]) => setLogoSize(v)}
                className="flex-1"
              />
              <ZoomIn className="h-4 w-4 text-muted-foreground shrink-0" />
            </div>
          </div>

          {/* Live Preview */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Pré-visualização</Label>
            <div className="border rounded-xl bg-background p-4 flex items-center justify-center min-h-[160px] overflow-hidden">
              <img
                src={displayUrl}
                alt="Preview do logo"
                style={{ height: `${displayHeight}px`, maxWidth: "100%", objectFit: "contain" }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Exibição aproximada — altura real: {logoSize}px (desktop)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleSave}
          disabled={uploading || updateBranding.isPending}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {uploading || updateBranding.isPending ? "Salvando..." : "Salvar Logo"}
        </Button>
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={uploading}
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Restaurar padrão
        </Button>
      </div>
    </div>
  );
}
