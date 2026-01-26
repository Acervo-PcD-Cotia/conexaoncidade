import { sanitizeEmbedCode } from "@/lib/sanitizeEmbed";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";

interface AcademyLessonPlayerProps {
  embedCode: string;
  className?: string;
}

export function AcademyLessonPlayer({ embedCode, className }: AcademyLessonPlayerProps) {
  const sanitizedEmbed = sanitizeEmbedCode(embedCode);

  if (!sanitizedEmbed) {
    return (
      <AspectRatio ratio={16 / 9} className={cn("bg-zinc-900 rounded-lg", className)}>
        <div className="w-full h-full flex items-center justify-center text-zinc-500">
          <p>Vídeo não disponível</p>
        </div>
      </AspectRatio>
    );
  }

  return (
    <AspectRatio ratio={16 / 9} className={cn("bg-zinc-950 rounded-lg overflow-hidden", className)}>
      <div
        className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-0"
        dangerouslySetInnerHTML={{ __html: sanitizedEmbed }}
      />
    </AspectRatio>
  );
}
