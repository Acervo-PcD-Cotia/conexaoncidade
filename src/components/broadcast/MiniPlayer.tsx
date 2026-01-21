import { useState } from "react";
import { X, Radio, Tv, Volume2, VolumeX, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Broadcast } from "@/hooks/useBroadcast";
import { useNavigate } from "react-router-dom";

interface MiniPlayerProps {
  broadcast: Broadcast;
  onClose: () => void;
  onExpand: () => void;
  className?: string;
}

export default function MiniPlayer({ broadcast, onClose, onExpand, className }: MiniPlayerProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const isRadio = broadcast.channel?.type === "radio";
  const isLive = broadcast.status === "live";

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    setIsMuted(value[0] === 0);
  };

  const handleExpand = () => {
    navigate(`/ao-vivo/${broadcast.slug}`);
    onExpand();
  };

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 bg-card border rounded-lg shadow-2xl overflow-hidden transition-all duration-300",
        isRadio ? "w-80" : "w-80",
        isHovered && !isRadio && "w-96",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header with close button */}
      <div className="absolute top-2 right-2 z-10 flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="w-6 h-6 bg-black/50 hover:bg-black/70 text-white"
          onClick={handleExpand}
        >
          <Maximize2 className="w-3 h-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-6 h-6 bg-black/50 hover:bg-black/70 text-white"
          onClick={onClose}
        >
          <X className="w-3 h-3" />
        </Button>
      </div>

      {/* Content */}
      <div className="relative">
        {isRadio ? (
          // Radio mini player
          <div className="p-4 bg-gradient-to-br from-primary/20 to-primary/5">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Radio className="w-6 h-6 text-primary" />
                </div>
                {isLive && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{broadcast.title}</h4>
                <p className="text-xs text-muted-foreground truncate">
                  {broadcast.channel?.name}
                </p>
              </div>
            </div>

            {/* Audio waveform */}
            <div className="flex items-end gap-0.5 h-6 mt-3 justify-center">
              {[...Array(16)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-primary/60 rounded-full animate-pulse"
                  style={{
                    height: `${20 + Math.random() * 80}%`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          // TV mini player
          <div className="aspect-video bg-black flex items-center justify-center">
            <div className="text-center text-white">
              <Tv className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs opacity-70">Ao vivo</p>
            </div>
            {isLive && (
              <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                LIVE
              </span>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-3 flex items-center gap-3 bg-card border-t">
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8"
          onClick={() => setIsMuted(!isMuted)}
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </Button>
        <Slider
          value={[isMuted ? 0 : volume]}
          max={100}
          step={1}
          onValueChange={handleVolumeChange}
          className="flex-1"
        />
        <Button
          variant="link"
          size="sm"
          className="text-xs"
          onClick={handleExpand}
        >
          Abrir
        </Button>
      </div>
    </div>
  );
}
