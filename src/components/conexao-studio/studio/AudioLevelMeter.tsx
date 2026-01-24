import { cn } from "@/lib/utils";

interface AudioLevelMeterProps {
  level: number;
  peakLevel?: number;
  orientation?: "horizontal" | "vertical";
  showPeak?: boolean;
  segments?: number;
  className?: string;
}

export function AudioLevelMeter({
  level,
  peakLevel,
  orientation = "horizontal",
  showPeak = true,
  segments = 20,
  className = "",
}: AudioLevelMeterProps) {
  const activeSegments = Math.round((level / 100) * segments);
  const peakSegment = showPeak && peakLevel ? Math.round((peakLevel / 100) * segments) : null;

  const isVertical = orientation === "vertical";

  return (
    <div
      className={cn(
        "flex gap-0.5",
        isVertical ? "flex-col-reverse h-full" : "flex-row w-full",
        className
      )}
    >
      {Array.from({ length: segments }).map((_, i) => {
        const isActive = i < activeSegments;
        const isPeak = showPeak && peakSegment !== null && i === peakSegment - 1;

        // Color gradient: green -> yellow -> red
        let color = "bg-emerald-500";
        if (i > segments * 0.7) color = "bg-red-500";
        else if (i > segments * 0.5) color = "bg-yellow-500";

        return (
          <div
            key={i}
            className={cn(
              isVertical ? "w-full h-1" : "h-full w-1",
              "rounded-sm transition-all duration-75",
              isActive ? color : "bg-zinc-700",
              isPeak && "ring-1 ring-white"
            )}
          />
        );
      })}
    </div>
  );
}
