import { useState } from "react";
import { Smartphone, Tablet, Monitor, AlertTriangle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BannerPreviewProps {
  imageUrl: string | null;
  title?: string;
}

type DeviceType = "mobile" | "tablet" | "desktop";

interface DeviceConfig {
  label: string;
  icon: React.ReactNode;
  width: number;
  aspectRatio: string;
  recommended: string;
}

const DEVICE_CONFIGS: Record<DeviceType, DeviceConfig> = {
  mobile: {
    label: "Mobile",
    icon: <Smartphone className="h-4 w-4" />,
    width: 375,
    aspectRatio: "16/9",
    recommended: "1920x1080px",
  },
  tablet: {
    label: "Tablet",
    icon: <Tablet className="h-4 w-4" />,
    width: 768,
    aspectRatio: "21/9",
    recommended: "2100x900px",
  },
  desktop: {
    label: "Desktop",
    icon: <Monitor className="h-4 w-4" />,
    width: 1200,
    aspectRatio: "21/9",
    recommended: "2520x1080px",
  },
};

export function BannerPreview({ imageUrl, title }: BannerPreviewProps) {
  const [device, setDevice] = useState<DeviceType>("desktop");
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const config = DEVICE_CONFIGS[device];

  // Check image quality for each device
  const getQualityWarnings = () => {
    if (!imageDimensions) return [];

    const warnings: string[] = [];
    const { width, height } = imageDimensions;

    // Minimum recommended widths
    const minWidths: Record<DeviceType, number> = {
      mobile: 750,
      tablet: 1500,
      desktop: 1920,
    };

    if (width < minWidths.mobile) {
      warnings.push("Resolução muito baixa para dispositivos móveis");
    }
    if (width < minWidths.tablet && device === "tablet") {
      warnings.push("Resolução pode aparecer pixelada em tablets");
    }
    if (width < minWidths.desktop && device === "desktop") {
      warnings.push("Resolução recomendada: mínimo 1920px de largura");
    }

    // Check aspect ratio
    const aspectRatio = width / height;
    const expectedRatios: Record<DeviceType, { min: number; max: number }> = {
      mobile: { min: 1.5, max: 2.0 }, // 16:9 ≈ 1.78
      tablet: { min: 2.0, max: 2.5 }, // 21:9 ≈ 2.33
      desktop: { min: 2.0, max: 2.5 },
    };

    const expected = expectedRatios[device];
    if (aspectRatio < expected.min || aspectRatio > expected.max) {
      warnings.push(
        `Proporção da imagem pode causar cortes (atual: ${aspectRatio.toFixed(2)})`
      );
    }

    return warnings;
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight,
    });
    setImageLoaded(true);
  };

  const warnings = getQualityWarnings();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Preview do Banner</h4>
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {(Object.keys(DEVICE_CONFIGS) as DeviceType[]).map((deviceType) => {
            const deviceConfig = DEVICE_CONFIGS[deviceType];
            return (
              <Button
                key={deviceType}
                variant={device === deviceType ? "default" : "ghost"}
                size="sm"
                onClick={() => setDevice(deviceType)}
                className="gap-2"
              >
                {deviceConfig.icon}
                <span className="hidden sm:inline">{deviceConfig.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Preview Container */}
      <Card className="overflow-hidden">
        <CardContent className="p-4 bg-muted/50">
          <div
            className={cn(
              "mx-auto border-2 border-dashed border-border rounded-lg overflow-hidden bg-background transition-all duration-300",
              device === "mobile" && "max-w-[375px]",
              device === "tablet" && "max-w-[768px]",
              device === "desktop" && "max-w-full"
            )}
          >
            <div
              className="relative w-full"
              style={{
                aspectRatio: config.aspectRatio,
              }}
            >
              {imageUrl ? (
                <>
                  <img
                    src={imageUrl}
                    alt={title || "Banner preview"}
                    className="w-full h-full object-cover"
                    onLoad={handleImageLoad}
                  />
                  {/* Overlay with title preview */}
                  {title && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                      <span
                        className={cn(
                          "text-white font-bold truncate",
                          device === "mobile" && "text-sm",
                          device === "tablet" && "text-base",
                          device === "desktop" && "text-xl"
                        )}
                      >
                        {title}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Monitor className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Selecione uma imagem para preview</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Device Info */}
      <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
        <span>
          Largura: <strong>{config.width}px</strong>
        </span>
        <span>
          Proporção: <strong>{config.aspectRatio.replace("/", ":")}</strong>
        </span>
        <span>
          Recomendado: <strong>{config.recommended}</strong>
        </span>
      </div>

      {/* Image Dimensions */}
      {imageDimensions && (
        <div className="flex items-center justify-center gap-2">
          <Badge variant="outline">
            Imagem atual: {imageDimensions.width} x {imageDimensions.height}px
          </Badge>
          <Badge variant="outline">
            {(
              (imageDimensions.width * imageDimensions.height) /
              1000000
            ).toFixed(1)}{" "}
            MP
          </Badge>
        </div>
      )}

      {/* Quality Warnings */}
      {warnings.length > 0 ? (
        <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 rounded-lg p-3 space-y-1">
          {warnings.map((warning, index) => (
            <div key={index} className="flex items-start gap-2 text-sm text-yellow-800 dark:text-yellow-200">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{warning}</span>
            </div>
          ))}
        </div>
      ) : imageLoaded ? (
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg p-3">
          <div className="flex items-center gap-2 text-sm text-green-800 dark:text-green-200">
            <Check className="h-4 w-4" />
            <span>Imagem atende aos requisitos de qualidade para {config.label}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
