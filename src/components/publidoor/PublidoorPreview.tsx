import { cn } from "@/lib/utils";
import { PublidoorItemFormData, PublidoorTemplate, PUBLIDOOR_TYPE_LABELS } from "@/types/publidoor";

interface PublidoorPreviewProps {
  data: PublidoorItemFormData;
  device: "desktop" | "mobile";
  template?: PublidoorTemplate | null;
}

export function PublidoorPreview({ data, device, template }: PublidoorPreviewProps) {
  const colors = template?.color_palette || {
    primary: "#1a1a1a",
    secondary: "#ffffff",
    accent: "#3b82f6",
  };

  const fontFamily = template?.font_family || "Inter, sans-serif";

  return (
    <div
      className={cn(
        "rounded-lg overflow-hidden transition-all duration-300",
        device === "desktop" ? "w-full" : "w-[280px] mx-auto"
      )}
    >
      <div
        className="relative p-6 min-h-[200px]"
        style={{
          backgroundColor: colors.primary,
          color: colors.secondary,
          fontFamily,
        }}
      >
        {/* Type Badge */}
        <div className="absolute top-2 left-2">
          <span
            className="text-xs px-2 py-1 rounded-full opacity-70"
            style={{ backgroundColor: colors.accent, color: colors.secondary }}
          >
            {PUBLIDOOR_TYPE_LABELS[data.type]}
          </span>
        </div>

        {/* Media */}
        {data.media_url && (
          <div className="mb-4 -mx-6 -mt-6">
            {data.media_type === "video" ? (
              <video
                src={data.media_url}
                className="w-full h-32 object-cover"
                muted
                autoPlay
                loop
              />
            ) : (
              <img
                src={data.media_url}
                alt="Preview"
                className="w-full h-32 object-cover"
              />
            )}
          </div>
        )}

        {/* Logo */}
        {data.logo_url && (
          <div className="flex justify-center mb-4">
            <img
              src={data.logo_url}
              alt="Logo"
              className="h-10 w-auto object-contain"
            />
          </div>
        )}

        {/* Content */}
        <div className={cn("space-y-2", data.media_url ? "pt-6" : "pt-8")}>
          {data.phrase_1 && (
            <p className="text-xl font-bold leading-tight">{data.phrase_1}</p>
          )}
          {data.phrase_2 && (
            <p className="text-lg opacity-90">{data.phrase_2}</p>
          )}
          {data.phrase_3 && (
            <p className="text-sm opacity-75">{data.phrase_3}</p>
          )}
        </div>

        {/* CTA */}
        {data.cta_text && (
          <div className="mt-6">
            <button
              className="px-4 py-2 rounded-lg text-sm font-medium transition-transform hover:scale-105"
              style={{
                backgroundColor: colors.accent,
                color: colors.secondary,
              }}
            >
              {data.cta_text}
            </button>
          </div>
        )}

        {/* Brand Badge */}
        <div className="absolute bottom-2 right-2">
          <span
            className="text-[10px] opacity-50"
            style={{ color: colors.secondary }}
          >
            Conteúdo de Marca
          </span>
        </div>
      </div>
    </div>
  );
}
