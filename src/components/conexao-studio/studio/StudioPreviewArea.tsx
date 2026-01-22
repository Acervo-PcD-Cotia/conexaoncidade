import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { LayoutGrid, Rows, Square, PictureInPicture2, User } from "lucide-react";

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
}

interface StudioPreviewAreaProps {
  participants: Participant[];
  layout: LayoutType;
  onLayoutChange: (layout: LayoutType) => void;
  isStreaming: boolean;
}

export function StudioPreviewArea({ 
  participants, 
  layout, 
  onLayoutChange,
  isStreaming 
}: StudioPreviewAreaProps) {
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
      return 'grid-cols-1'; // Main video takes full space, PiP is overlaid
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

  return (
    <div className="relative h-full rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800">
      {/* Layout Selector */}
      <div className="absolute top-3 right-3 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="sm" className="gap-2 bg-zinc-800/80 backdrop-blur-sm">
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
        <div className="absolute top-3 left-3 z-10">
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
                layout === 'pip' && index > 0 && "absolute bottom-4 right-4 w-32 h-24 z-10 border-2 border-zinc-700"
              )}
            >
              {/* Video placeholder / Avatar */}
              {participant.isCameraOn ? (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-zinc-800">
                  {/* Real video would go here */}
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

              {/* Name label */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                <span className="px-2 py-1 rounded bg-black/60 text-xs font-medium truncate">
                  {participant.name}
                </span>
                
                {/* Mic indicator */}
                {!participant.isMicOn && (
                  <span className="p-1 rounded bg-red-600/80">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 11c0 1.19-.34 2.3-.9 3.28l-1.23-1.23c.27-.62.43-1.31.43-2.05H19zm-4 .16L9 5.18V5a3 3 0 0 1 6 0v6.16zm4.41 9.25-1.41 1.41L15.17 19H12v-2h2.17L9 11.83V11c0-.36.05-.71.12-1.05L1.39 2.22 2.8.81 21.41 19.41z"/>
                    </svg>
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
