import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { 
  Mic, MicOff, Video, VideoOff, Monitor, MonitorOff,
  Circle, Square, Users, MessageSquare, Palette, Image, 
  Film, Settings, Radio, PhoneCall, UserPlus, LogOut,
  Layout, Maximize2, Clock, Wifi, WifiOff
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

type SessionStatus = 'preparing' | 'live' | 'recording' | 'ended';
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

export default function StudioSession() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  // Session state
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('preparing');
  const [isRecording, setIsRecording] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [streamDuration, setStreamDuration] = useState(0);
  
  // Media controls
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  // Layout
  const [layout, setLayout] = useState<LayoutType>('grid');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Active panel
  const [activePanel, setActivePanel] = useState<string>('chat');
  
  // Mock participants
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: '1',
      name: 'Você (Host)',
      role: 'host',
      isMicOn: true,
      isCameraOn: true,
      isScreenSharing: false,
      isOnStage: true
    }
  ]);
  
  const backstageParticipants = participants.filter(p => !p.isOnStage);
  const stageParticipants = participants.filter(p => p.isOnStage);

  // Fetch studio data
  const { data: studio, isLoading } = useQuery({
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

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Streaming timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStreaming) {
      interval = setInterval(() => {
        setStreamDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStreaming]);

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleGoLive = () => {
    setIsStreaming(true);
    setSessionStatus('live');
    toast.success("Você está ao vivo!");
  };

  const handleStopLive = () => {
    setIsStreaming(false);
    setSessionStatus('preparing');
    setStreamDuration(0);
    toast.info("Transmissão encerrada");
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    if (sessionStatus === 'preparing') {
      setSessionStatus('recording');
    }
    toast.success("Gravação iniciada");
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    if (!isStreaming) {
      setSessionStatus('preparing');
    }
    toast.info("Gravação finalizada");
  };

  const handleInviteGuest = () => {
    const inviteLink = `${window.location.origin}/join/${slug}-${Date.now()}`;
    navigator.clipboard.writeText(inviteLink);
    toast.success("Link de convite copiado!");
  };

  const handleLeaveSession = () => {
    if (isStreaming || isRecording) {
      const confirmed = window.confirm(
        "Você está ao vivo ou gravando. Tem certeza que deseja sair?"
      );
      if (!confirmed) return;
    }
    navigate('/admin/conexao-studio/studios');
  };

  const moveToStage = (participantId: string) => {
    setParticipants(prev => 
      prev.map(p => p.id === participantId ? { ...p, isOnStage: true } : p)
    );
  };

  const moveToBackstage = (participantId: string) => {
    setParticipants(prev => 
      prev.map(p => p.id === participantId ? { ...p, isOnStage: false } : p)
    );
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
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
                Preparando
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
            <span>{participants.length}</span>
          </div>
          
          <div className="flex items-center gap-1 text-sm">
            <Wifi className="h-4 w-4 text-emerald-500" />
            <span className="text-zinc-400">Conectado</span>
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
              participants={stageParticipants}
              layout={layout}
              onLayoutChange={setLayout}
              isStreaming={isStreaming}
            />
          </div>

          {/* Backstage */}
          <div className="shrink-0 border-t border-zinc-800">
            <StudioBackstage
              participants={backstageParticipants}
              onMoveToStage={moveToStage}
              onInvite={handleInviteGuest}
            />
          </div>

          {/* Control Bar */}
          <StudioControlBar
            isMicOn={isMicOn}
            isCameraOn={isCameraOn}
            isScreenSharing={isScreenSharing}
            isRecording={isRecording}
            isStreaming={isStreaming}
            onToggleMic={() => setIsMicOn(!isMicOn)}
            onToggleCamera={() => setIsCameraOn(!isCameraOn)}
            onToggleScreenShare={() => setIsScreenSharing(!isScreenSharing)}
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

            <TabsContent value="chat" className="flex-1 m-0 overflow-hidden">
              <UnifiedChatPanel />
            </TabsContent>
            
            <TabsContent value="branding" className="flex-1 m-0 overflow-hidden">
              <BrandingPanel />
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
