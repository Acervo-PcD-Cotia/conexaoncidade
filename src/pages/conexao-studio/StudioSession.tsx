import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { 
  Circle, Users, MessageSquare, Palette, Image, 
  Settings, Radio, UserPlus, LogOut,
  Maximize2, Clock, Wifi, WifiOff, Loader2, UserCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

// Components
import { StudioPreviewArea } from "@/components/conexao-studio/studio/StudioPreviewArea";
import { StudioBackstage } from "@/components/conexao-studio/studio/StudioBackstage";
import { StudioControlBar } from "@/components/conexao-studio/studio/StudioControlBar";
import { UnifiedChatPanel } from "@/components/conexao-studio/panels/UnifiedChatPanel";
import { BrandingPanel } from "@/components/conexao-studio/panels/BrandingPanel";
import { MediaPanel } from "@/components/conexao-studio/panels/MediaPanel";
import { DestinationsPanel } from "@/components/conexao-studio/panels/DestinationsPanel";
import { SettingsPanel } from "@/components/conexao-studio/panels/SettingsPanel";
import { WaitingGuestsPanel } from "@/components/conexao-studio/panels/WaitingGuestsPanel";

// Hooks
import { useConexaoSession, ConexaoParticipant, SessionLayout } from "@/hooks/useConexaoSession";
import { useLocalRecording } from "@/hooks/useLocalRecording";
import { useWaitingGuests } from "@/hooks/useWaitingGuests";

type LayoutType = 'grid' | 'spotlight' | 'pip' | 'side-by-side';

// Map between our layout types and session layout types
const layoutMap: Record<LayoutType, SessionLayout> = {
  'grid': 'grid',
  'spotlight': 'spotlight',
  'pip': 'pip',
  'side-by-side': 'grid',
};

export default function StudioSession() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  // UI state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activePanel, setActivePanel] = useState<string>('chat');
  const [layout, setLayout] = useState<LayoutType>('grid');
  
  // Recording/streaming state (local UI state)
  const [isStreaming, setIsStreaming] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [streamDuration, setStreamDuration] = useState(0);

  // Fetch studio data
  const { data: studio, isLoading: isLoadingStudio } = useQuery({
    queryKey: ['studio-session', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('illumina_studios')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!slug
  });

  // Get session ID - use studio id
  const sessionId = studio?.id;

  // Conexao Session Hook - real LiveKit integration
  const {
    session,
    participants,
    stageParticipants,
    backstageParticipants,
    isConnected,
    isConnecting,
    connectionError,
    toggleCamera,
    toggleMicrophone,
    toggleScreenShare,
    isCameraEnabled,
    isMicrophoneEnabled,
    isScreenShareEnabled,
    moveToStage,
    moveToBackstage,
    connect,
    disconnect,
    startSession,
    endSession,
    isStarting,
    isEnding,
  } = useConexaoSession({
    sessionId: sessionId || '',
    displayName: 'Host', // Could come from user profile
    onSessionStart: () => {
      console.log('[StudioSession] Session started');
    },
    onSessionEnd: () => {
      console.log('[StudioSession] Session ended');
    },
  });

  // Local recording hook
  const localRecording = useLocalRecording();

  // Convert participants for preview area
  const previewParticipants = useMemo(() => {
    // If we have real participants from LiveKit, use those
    if (stageParticipants.length > 0) {
      return stageParticipants.map(p => ({
        id: p.identity,
        name: p.name || p.identity,
        avatarUrl: undefined,
        role: p.role === 'host' ? 'host' as const : 'guest' as const,
        isMicOn: p.isMicrophoneEnabled,
        isCameraOn: p.isCameraEnabled,
        isScreenSharing: p.isScreenShareEnabled,
        isOnStage: p.isOnStage,
        videoTrack: p.videoTrack,
        audioTrack: p.audioTrack,
      }));
    }
    
    // Fallback to local participant placeholder
    return [{
      id: 'local',
      name: 'Você (Host)',
      role: 'host' as const,
      isMicOn: isMicrophoneEnabled,
      isCameraOn: isCameraEnabled,
      isScreenSharing: isScreenShareEnabled,
      isOnStage: true,
    }];
  }, [stageParticipants, isMicrophoneEnabled, isCameraEnabled, isScreenShareEnabled]);

  const backstagePreviewParticipants = useMemo(() => {
    return backstageParticipants.map(p => ({
      id: p.identity,
      name: p.name || p.identity,
      avatarUrl: undefined,
      role: p.role === 'host' ? 'host' as const : 'guest' as const,
      isMicOn: p.isMicrophoneEnabled,
      isCameraOn: p.isCameraEnabled,
      isScreenSharing: p.isScreenShareEnabled,
      isOnStage: p.isOnStage,
    }));
  }, [backstageParticipants]);

  // Recording timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Streaming timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isStreaming) {
      interval = setInterval(() => {
        setStreamDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStreaming]);

  // Auto-connect when session is ready
  useEffect(() => {
    if (sessionId && !isConnected && !isConnecting && !connectionError) {
      connect().catch(console.error);
    }
  }, [sessionId, isConnected, isConnecting, connectionError, connect]);

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleGoLive = async () => {
    try {
      // Call edge function to start streaming
      const { data, error } = await supabase.functions.invoke('conexao-stream-start', {
        body: { 
          session_id: sessionId,
          destination_ids: ['default'], // Could be real destination IDs
        },
      });
      
      if (error) throw error;
      
      setIsStreaming(true);
      toast.success("Você está ao vivo!");
    } catch (error) {
      console.error('[StudioSession] Go live error:', error);
      toast.error("Erro ao iniciar transmissão");
    }
  };

  const handleStopLive = async () => {
    try {
      await supabase.functions.invoke('conexao-stream-stop', {
        body: { session_id: sessionId },
      });
      
      setIsStreaming(false);
      setStreamDuration(0);
      toast.info("Transmissão encerrada");
    } catch (error) {
      console.error('[StudioSession] Stop live error:', error);
      setIsStreaming(false);
      setStreamDuration(0);
    }
  };

  const handleStartRecording = async () => {
    try {
      // Cloud recording via edge function
      const { data, error } = await supabase.functions.invoke('conexao-recording-start', {
        body: { 
          session_id: sessionId,
          type: 'cloud',
        },
      });
      
      if (error) throw error;
      
      setIsRecording(true);
      toast.success("Gravação iniciada");
    } catch (error) {
      console.error('[StudioSession] Start recording error:', error);
      toast.error("Erro ao iniciar gravação");
    }
  };

  const handleStopRecording = async () => {
    try {
      await supabase.functions.invoke('conexao-recording-stop', {
        body: { session_id: sessionId },
      });
      
      setIsRecording(false);
      setRecordingDuration(0);
      toast.info("Gravação finalizada");
    } catch (error) {
      console.error('[StudioSession] Stop recording error:', error);
      setIsRecording(false);
      setRecordingDuration(0);
    }
  };

  const handleInviteGuest = () => {
    const inviteLink = `${window.location.origin}/studio/join/${slug}-${Date.now()}`;
    navigator.clipboard.writeText(inviteLink);
    toast.success("Link de convite copiado!");
  };

  const handleLeaveSession = async () => {
    if (isStreaming || isRecording) {
      const confirmed = window.confirm(
        "Você está ao vivo ou gravando. Tem certeza que deseja sair?"
      );
      if (!confirmed) return;
    }
    
    await disconnect();
    navigate('/spah/painel/conexao-studio/studios');
  };

  const handleMoveToStage = (participantId: string) => {
    moveToStage(participantId);
  };

  const handleMoveToBackstage = (participantId: string) => {
    moveToBackstage(participantId);
  };

  const handleLayoutChange = (newLayout: LayoutType) => {
    setLayout(newLayout);
  };

  if (isLoadingStudio) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Carregando estúdio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-white overflow-hidden">
      {/* Header */}
      <header className="h-14 shrink-0 flex items-center justify-between px-4 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          {/* Status Badges */}
          <div className="flex items-center gap-2">
            {isStreaming && (
              <Badge className="bg-red-600 text-white animate-pulse gap-1">
                <Circle className="h-2 w-2 fill-current" />
                AO VIVO
              </Badge>
            )}
            {isRecording && (
              <Badge variant="outline" className="border-red-500 text-red-500 gap-1">
                <Circle className="h-2 w-2 fill-red-500" />
                REC {formatDuration(recordingDuration)}
              </Badge>
            )}
            {!isStreaming && !isRecording && (
              <Badge variant="outline" className="border-zinc-600 text-zinc-400">
                {isConnected ? 'Pronto' : isConnecting ? 'Conectando...' : 'Preparando'}
              </Badge>
            )}
          </div>
          
          {/* Studio Name */}
          <h1 className="text-lg font-semibold truncate max-w-[200px]">
            {studio?.name || 'Estúdio'}
          </h1>
        </div>

        {/* Center - Timer and Stats */}
        <div className="flex items-center gap-6">
          {isStreaming && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-red-500" />
              <span className="font-mono">{formatDuration(streamDuration)}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Users className="h-4 w-4" />
            <span>{participants.length || 1}</span>
          </div>
          
          <div className="flex items-center gap-1 text-sm">
            {isConnected ? (
              <>
                <Wifi className="h-4 w-4 text-emerald-500" />
                <span className="text-zinc-400">Conectado</span>
              </>
            ) : isConnecting ? (
              <>
                <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />
                <span className="text-zinc-400">Conectando</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-zinc-500" />
                <span className="text-zinc-400">Desconectado</span>
              </>
            )}
          </div>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleInviteGuest}
                className="text-zinc-400 hover:text-white"
              >
                <UserPlus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Convidar participante</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="text-zinc-400 hover:text-white"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Tela cheia</TooltipContent>
          </Tooltip>

          <Button 
            variant="destructive" 
            size="sm"
            onClick={handleLeaveSession}
            className="gap-1"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Stage + Backstage Area */}
        <div className="flex-1 flex flex-col">
          {/* Preview/Stage Area */}
          <div className="flex-1 p-4">
            <StudioPreviewArea
              participants={previewParticipants}
              layout={layout}
              onLayoutChange={handleLayoutChange}
              isStreaming={isStreaming}
              sessionId={sessionId}
            />
          </div>

          {/* Backstage */}
          <div className="shrink-0 border-t border-zinc-800">
            <StudioBackstage
              participants={backstagePreviewParticipants}
              onMoveToStage={handleMoveToStage}
              onInvite={handleInviteGuest}
              sessionId={sessionId}
            />
          </div>

          {/* Control Bar */}
          <StudioControlBar
            isMicOn={isMicrophoneEnabled}
            isCameraOn={isCameraEnabled}
            isScreenSharing={isScreenShareEnabled}
            isRecording={isRecording}
            isStreaming={isStreaming}
            onToggleMic={toggleMicrophone}
            onToggleCamera={toggleCamera}
            onToggleScreenShare={toggleScreenShare}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
            onGoLive={handleGoLive}
            onStopLive={handleStopLive}
          />
        </div>

        {/* Side Panel */}
        <aside className="w-80 shrink-0 border-l border-zinc-800 bg-zinc-900/50 flex flex-col">
          {/* Panel Tabs */}
          <Tabs value={activePanel} onValueChange={setActivePanel} className="flex-1 flex flex-col">
            <TabsList className="shrink-0 w-full justify-start rounded-none border-b border-zinc-800 bg-transparent p-0 h-auto">
              <TabsTrigger 
                value="waiting" 
                className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:bg-transparent px-4 py-3"
              >
                <UserCheck className="h-4 w-4" />
                <WaitingGuestsPanel sessionId={sessionId || ''} compact />
              </TabsTrigger>
              <TabsTrigger 
                value="chat" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
              >
                <MessageSquare className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger 
                value="branding"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
              >
                <Palette className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger 
                value="media"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
              >
                <Image className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger 
                value="destinations"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
              >
                <Radio className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger 
                value="settings"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
              >
                <Settings className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>

            <TabsContent value="waiting" className="flex-1 m-0 overflow-hidden">
              <WaitingGuestsPanel 
                sessionId={sessionId || ''} 
                onGuestApproved={(guest) => {
                  console.log('[StudioSession] Guest approved:', guest);
                  // Guest will be added to participants via LiveKit connection
                }}
              />
            </TabsContent>

            <TabsContent value="chat" className="flex-1 m-0 overflow-hidden">
              <UnifiedChatPanel sessionId={sessionId} />
            </TabsContent>
            
            <TabsContent value="branding" className="flex-1 m-0 overflow-hidden">
              <BrandingPanel sessionId={sessionId} />
            </TabsContent>
            
            <TabsContent value="media" className="flex-1 m-0 overflow-hidden">
              <MediaPanel />
            </TabsContent>
            
            <TabsContent value="destinations" className="flex-1 m-0 overflow-hidden">
              <DestinationsPanel isStreaming={isStreaming} />
            </TabsContent>
            
            <TabsContent value="settings" className="flex-1 m-0 overflow-hidden">
              <SettingsPanel />
            </TabsContent>
          </Tabs>
        </aside>
      </div>
    </div>
  );
}
