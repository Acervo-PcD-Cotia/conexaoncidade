import React from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  MonitorUp, 
  Users,
  LayoutGrid,
  Focus,
  Columns,
  Captions,
  Circle,
  Square,
  Settings,
  MessageSquare,
  PhoneOff,
  Play,
  Pause,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type LayoutType = "grid" | "spotlight" | "side-by-side";

interface StudioControlsProps {
  // Media controls
  isCameraEnabled: boolean;
  isMicrophoneEnabled: boolean;
  isScreenShareEnabled: boolean;
  onToggleCamera: () => void;
  onToggleMicrophone: () => void;
  onToggleScreenShare: () => void;
  
  // Broadcast controls
  isLive: boolean;
  isPaused?: boolean;
  onStartBroadcast: () => void;
  onStopBroadcast: () => void;
  onPauseBroadcast?: () => void;
  
  // Layout
  layout: LayoutType;
  onLayoutChange: (layout: LayoutType) => void;
  
  // Features
  captionsEnabled: boolean;
  onToggleCaptions: () => void;
  isRecording?: boolean;
  onToggleRecording?: () => void;
  chatEnabled?: boolean;
  onToggleChat?: () => void;
  
  // Actions
  onOpenSettings?: () => void;
  onInviteGuest?: () => void;
  onLowerThird?: () => void;
  
  // State
  duration?: string;
  viewerCount?: number;
  disabled?: boolean;
}

export function StudioControls({
  isCameraEnabled,
  isMicrophoneEnabled,
  isScreenShareEnabled,
  onToggleCamera,
  onToggleMicrophone,
  onToggleScreenShare,
  isLive,
  isPaused,
  onStartBroadcast,
  onStopBroadcast,
  onPauseBroadcast,
  layout,
  onLayoutChange,
  captionsEnabled,
  onToggleCaptions,
  isRecording,
  onToggleRecording,
  chatEnabled,
  onToggleChat,
  onOpenSettings,
  onInviteGuest,
  onLowerThird,
  duration,
  viewerCount = 0,
  disabled,
}: StudioControlsProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center justify-between bg-card border rounded-lg p-2 gap-2">
        {/* Left: Media controls */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                pressed={isMicrophoneEnabled}
                onPressedChange={onToggleMicrophone}
                disabled={disabled}
                className={cn(
                  "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
                  !isMicrophoneEnabled && "bg-destructive/20 text-destructive"
                )}
              >
                {isMicrophoneEnabled ? (
                  <Mic className="h-4 w-4" />
                ) : (
                  <MicOff className="h-4 w-4" />
                )}
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>
              {isMicrophoneEnabled ? "Desligar microfone" : "Ligar microfone"}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                pressed={isCameraEnabled}
                onPressedChange={onToggleCamera}
                disabled={disabled}
                className={cn(
                  "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
                  !isCameraEnabled && "bg-destructive/20 text-destructive"
                )}
              >
                {isCameraEnabled ? (
                  <Video className="h-4 w-4" />
                ) : (
                  <VideoOff className="h-4 w-4" />
                )}
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>
              {isCameraEnabled ? "Desligar câmera" : "Ligar câmera"}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                pressed={isScreenShareEnabled}
                onPressedChange={onToggleScreenShare}
                disabled={disabled}
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                <MonitorUp className="h-4 w-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>
              {isScreenShareEnabled ? "Parar compartilhamento" : "Compartilhar tela"}
            </TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Layout selector */}
          <Select value={layout} onValueChange={(v) => onLayoutChange(v as LayoutType)}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="grid">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  Grade
                </div>
              </SelectItem>
              <SelectItem value="spotlight">
                <div className="flex items-center gap-2">
                  <Focus className="h-4 w-4" />
                  Spotlight
                </div>
              </SelectItem>
              <SelectItem value="side-by-side">
                <div className="flex items-center gap-2">
                  <Columns className="h-4 w-4" />
                  Lado a lado
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Center: Live controls and status */}
        <div className="flex items-center gap-2">
          {isLive && (
            <>
              {/* Recording indicator */}
              {isRecording && (
                <div className="flex items-center gap-1 text-red-500">
                  <Circle className="h-3 w-3 fill-current animate-pulse" />
                  <span className="text-xs font-medium">REC</span>
                </div>
              )}

              {/* Duration */}
              {duration && (
                <span className="text-sm font-mono font-medium px-2">
                  {duration}
                </span>
              )}

              {/* Viewer count */}
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span className="text-sm">{viewerCount}</span>
              </div>

              <Separator orientation="vertical" className="h-6" />

              {/* Pause button */}
              {onPauseBroadcast && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onPauseBroadcast}
                    >
                      {isPaused ? (
                        <Play className="h-4 w-4" />
                      ) : (
                        <Pause className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isPaused ? "Retomar" : "Pausar"}
                  </TooltipContent>
                </Tooltip>
              )}
            </>
          )}

          {/* Main broadcast button */}
          {isLive ? (
            <Button
              variant="destructive"
              onClick={onStopBroadcast}
              className="gap-2"
            >
              <Square className="h-4 w-4 fill-current" />
              Encerrar
            </Button>
          ) : (
            <Button
              onClick={onStartBroadcast}
              disabled={disabled}
              className="gap-2 bg-red-600 hover:bg-red-700"
            >
              <Circle className="h-4 w-4 fill-current" />
              Iniciar Transmissão
            </Button>
          )}
        </div>

        {/* Right: Feature toggles and actions */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                pressed={captionsEnabled}
                onPressedChange={onToggleCaptions}
                disabled={disabled}
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                <Captions className="h-4 w-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>
              {captionsEnabled ? "Desativar legendas" : "Ativar legendas"}
            </TooltipContent>
          </Tooltip>

          {onToggleChat && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  pressed={chatEnabled}
                  onPressedChange={onToggleChat}
                  className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >
                  <MessageSquare className="h-4 w-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>
                {chatEnabled ? "Desativar chat" : "Ativar chat"}
              </TooltipContent>
            </Tooltip>
          )}

          {onToggleRecording && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  pressed={isRecording}
                  onPressedChange={onToggleRecording}
                  className={cn(
                    "data-[state=on]:bg-red-500 data-[state=on]:text-white"
                  )}
                >
                  <Circle className="h-4 w-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>
                {isRecording ? "Parar gravação" : "Iniciar gravação"}
              </TooltipContent>
            </Tooltip>
          )}

          <Separator orientation="vertical" className="h-6 mx-1" />

          {onInviteGuest && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={onInviteGuest}>
                  <Users className="h-4 w-4 mr-1" />
                  Convidar
                </Button>
              </TooltipTrigger>
              <TooltipContent>Convidar participante</TooltipContent>
            </Tooltip>
          )}

          {onOpenSettings && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={onOpenSettings}>
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Configurações</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
