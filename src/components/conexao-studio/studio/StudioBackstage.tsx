import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { UserPlus, ArrowUp, Mic, MicOff, Video, VideoOff } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface StudioBackstageProps {
  participants: Participant[];
  onMoveToStage: (participantId: string) => void;
  onInvite: () => void;
}

export function StudioBackstage({ participants, onMoveToStage, onInvite }: StudioBackstageProps) {
  return (
    <div className="p-3 bg-zinc-900/50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          Bastidores ({participants.length})
        </h3>
        <Button variant="ghost" size="sm" onClick={onInvite} className="h-7 text-xs gap-1">
          <UserPlus className="h-3 w-3" />
          Convidar
        </Button>
      </div>

      <ScrollArea className="w-full">
        <div className="flex gap-2 pb-2">
          {participants.length === 0 ? (
            <div className="flex items-center justify-center w-full py-4 text-zinc-500 text-sm">
              <p>Nenhum participante nos bastidores</p>
            </div>
          ) : (
            participants.map((participant) => (
              <Card 
                key={participant.id}
                className="shrink-0 w-32 p-2 bg-zinc-800/50 border-zinc-700 hover:border-zinc-600 transition-colors"
              >
                {/* Avatar / Video Preview */}
                <div className="relative aspect-video rounded bg-zinc-700 mb-2 flex items-center justify-center overflow-hidden">
                  {participant.isCameraOn ? (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-zinc-700">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-white/80">
                          {participant.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-lg font-bold text-zinc-500">
                      {participant.name.charAt(0).toUpperCase()}
                    </span>
                  )}

                  {/* Status indicators */}
                  <div className="absolute bottom-1 right-1 flex gap-0.5">
                    {!participant.isMicOn && (
                      <span className="p-0.5 rounded bg-red-600/80">
                        <MicOff className="h-2.5 w-2.5" />
                      </span>
                    )}
                    {!participant.isCameraOn && (
                      <span className="p-0.5 rounded bg-zinc-600/80">
                        <VideoOff className="h-2.5 w-2.5" />
                      </span>
                    )}
                  </div>
                </div>

                {/* Name and action */}
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-medium truncate flex-1">
                    {participant.name}
                  </span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-6 w-6 shrink-0"
                        onClick={() => onMoveToStage(participant.id)}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Mover para o palco</TooltipContent>
                  </Tooltip>
                </div>
              </Card>
            ))
          )}

          {/* Add participant placeholder */}
          <Card 
            className="shrink-0 w-32 p-2 bg-zinc-800/30 border-dashed border-zinc-700 hover:border-zinc-600 transition-colors cursor-pointer flex flex-col items-center justify-center"
            onClick={onInvite}
          >
            <UserPlus className="h-6 w-6 text-zinc-500 mb-1" />
            <span className="text-xs text-zinc-500">Convidar</span>
          </Card>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
