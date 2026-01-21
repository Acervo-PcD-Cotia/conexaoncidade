import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Caption {
  id: string;
  text: string;
  speaker_name: string | null;
  is_final: boolean;
  timestamp_ms: number;
}

interface BroadcastCaptionsProps {
  broadcastId: string;
  className?: string;
}

export default function BroadcastCaptions({ broadcastId, className }: BroadcastCaptionsProps) {
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    // Subscribe to realtime transcripts
    const channel = supabase
      .channel(`transcripts-${broadcastId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "broadcast_transcripts",
          filter: `broadcast_id=eq.${broadcastId}`,
        },
        (payload) => {
          const newCaption = payload.new as Caption;
          setCaptions((prev) => {
            // Keep only last 3 captions for display
            const updated = [...prev, newCaption].slice(-3);
            return updated;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [broadcastId]);

  // Auto-remove old captions
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setCaptions((prev) =>
        prev.filter((caption) => {
          // Keep captions for 8 seconds
          const captionTime = new Date(caption.timestamp_ms).getTime();
          return now - captionTime < 8000;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!isEnabled || captions.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "absolute bottom-16 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl",
        className
      )}
    >
      <div className="flex flex-col gap-1">
        {captions.map((caption, index) => (
          <div
            key={caption.id}
            className={cn(
              "bg-black/80 text-white px-4 py-2 rounded-lg text-center transition-opacity duration-300",
              index < captions.length - 1 && "opacity-60"
            )}
          >
            {caption.speaker_name && (
              <span className="text-primary font-medium mr-2">
                {caption.speaker_name}:
              </span>
            )}
            <span className={cn(!caption.is_final && "opacity-80 italic")}>
              {caption.text}
            </span>
          </div>
        ))}
      </div>

      {/* Toggle button */}
      <button
        onClick={() => setIsEnabled(false)}
        className="absolute -top-8 right-0 text-xs text-white/60 hover:text-white transition-colors"
      >
        Ocultar legendas
      </button>
    </div>
  );
}
