import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { LayoutGrid, Rows, Square, PictureInPicture2, User, MicOff } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { OverlayRenderer } from "@/components/conexao-studio/overlays/OverlayRenderer";
import { useStudioOverlays } from "@/hooks/useStudioOverlays";
import type { VideoTrack, AudioTrack } from "livekit-client";

type LayoutType = 'grid' | 'spotlight' | 'pip' | 'side-by-side';

interface Participant {
  id: string;
  name: string;
  avatarUrl?: string;
  role: 'host' | 'guest' | 'viewer';
  isMicOn: boolean;
  isCameraOn: boolean;
  isScreenSharing: boolean;
  isOnStage: boolean;
  videoTrack?: VideoTrack;
  audioTrack?: AudioTrack;
}

interface StudioPreviewAreaProps {
  participants: Participant[];
  layout: LayoutType;
  onLayoutChange: (layout: LayoutType) => void;
  isStreaming: boolean;
  sessionId?: string;
}

// Component to render a video track
function VideoRenderer({ track, className }: { track: VideoTrack; className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && track) {
      track.attach(videoRef.current);
    }
    
    return () => {
      if (videoRef.current && track) {
        track.detach(videoRef.current);
      }
    };
  }, [track]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className={cn("w-full h-full object-cover", className)}
    />
  );
}

export function StudioPreviewArea({ 
  participants, 
  layout, 
  onLayoutChange,
  isStreaming,
  sessionId
}: StudioPreviewAreaProps) {
  const { overlays } = useStudioOverlays(sessionId || '');
  
  // Filter only visible overlays
  const visibleOverlays = overlays.filter(o => o.isVisible);

  const getLayoutIcon = () => {
    switch (layout) {
      case 'grid': return <LayoutGrid className="h-4 w-4" />;
      case 'spotlight': return <User className="h-4 w-4" />;
      case 'pip': return <PictureInPicture2 className="h-4 w-4" />;
      case 'side-by-side': return <Rows className="h-4 w-4" />;
    }
  };

  const getGridClass = () => {
    const count = participants.length;
    if (layout === 'spotlight') {
      return 'grid-cols-1';
    }
    if (layout === 'pip') {
      return 'grid-cols-1';
    }
    if (layout === 'side-by-side') {
      return count <= 2 ? 'grid-cols-2' : 'grid-cols-3';
    }
    // Grid layout
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    if (count <= 4) return 'grid-cols-2';
    if (count <= 6) return 'grid-cols-3';
    return 'grid-cols-4';
  };

  const getParticipantStyle = (index: number) => {
    if (layout === 'pip' && index > 0) {
      return "absolute bottom-4 right-4 w-32 h-24 z-10 border-2 border-zinc-700 shadow-xl";
    }
    if (layout === 'spotlight') {
      if (index === 0) {
        return "col-span-full row-span-full";
      }
      return "hidden";
    }
    return "";
  };

  return (
    <div className="relative h-full rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800">
      {/* Layout Selector */}
      <div className="absolute top-3 right-3 z-20">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="sm" className="gap-2 bg-zinc-800/80 backdrop-blur-sm hover:bg-zinc-700">
              {getLayoutIcon()}
              <span className="text-xs">Layout</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-700">
            <DropdownMenuItem onClick={() => onLayoutChange('grid')} className="gap-2">
              <LayoutGrid className="h-4 w-4" />
              Grade
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onLayoutChange('spotlight')} className="gap-2">
              <User className="h-4 w-4" />
              Destaque
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onLayoutChange('pip')} className="gap-2">
              <PictureInPicture2 className="h-4 w-4" />
              Picture-in-Picture
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onLayoutChange('side-by-side')} className="gap-2">
              <Rows className="h-4 w-4" />
              Lado a Lado
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Live indicator overlay */}
      {isStreaming && (
        <div className="absolute top-3 left-3 z-20">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600/90 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
            <span className="text-xs font-semibold text-white">AO VIVO</span>
          </div>
        </div>
      )}

      {/* Participants Grid */}
      <div className={cn(
        "h-full p-4 grid gap-3",
        getGridClass()
      )}>
        {participants.length === 0 ? (
          <div className="flex items-center justify-center text-zinc-500">
            <p>Nenhum participante no palco</p>
          </div>
        ) : (
          participants.map((participant, index) => (
            <div 
              key={participant.id}
              className={cn(
                "relative rounded-lg overflow-hidden bg-zinc-800 flex items-center justify-center",
                getParticipantStyle(index)
              )}
            >
              {/* Video or Avatar */}
              {participant.videoTrack && participant.isCameraOn ? (
                <VideoRenderer 
                  track={participant.videoTrack} 
                  className="absolute inset-0"
                />
              ) : participant.isCameraOn ? (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-zinc-800">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-20 w-20 rounded-full bg-primary/30 flex items-center justify-center text-3xl font-bold">
                      {participant.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-16 w-16 rounded-full bg-zinc-700 flex items-center justify-center text-2xl font-bold">
                  {participant.name.charAt(0).toUpperCase()}
                </div>
              )}

              {/* Screen share indicator */}
              {participant.isScreenSharing && (
                <div className="absolute top-2 left-2 px-2 py-1 rounded bg-blue-600/80 text-xs font-medium">
                  Tela Compartilhada
                </div>
              )}

              {/* Name label */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                <span className="px-2 py-1 rounded bg-black/60 text-xs font-medium truncate">
                  {participant.name}
                  {participant.role === 'host' && (
                    <span className="ml-1 text-primary">(Host)</span>
                  )}
                </span>
                
                {/* Mic indicator */}
                {!participant.isMicOn && (
                  <span className="p-1 rounded bg-red-600/80">
                    <MicOff className="h-3 w-3" />
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Overlays Layer */}
      <AnimatePresence>
        {visibleOverlays.length > 0 && (
          <OverlayRenderer overlays={visibleOverlays} />
        )}
      </AnimatePresence>
    </div>
  );
}
