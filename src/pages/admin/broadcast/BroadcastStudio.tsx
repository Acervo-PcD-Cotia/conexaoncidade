import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBroadcastBySlug, useUpdateBroadcast } from "@/hooks/useBroadcast";
import { useLiveKit, LiveKitParticipant } from "@/hooks/useLiveKit";
import { useAudioTranscription } from "@/hooks/useAudioTranscription";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StudioPreview } from "@/components/broadcast/studio/StudioPreview";
import { ParticipantTile } from "@/components/broadcast/studio/ParticipantTile";
import { StudioControls, LayoutType } from "@/components/broadcast/studio/StudioControls";
import { LowerThird } from "@/components/broadcast/studio/LowerThird";
import { InviteGuestModal } from "@/components/broadcast/studio/InviteGuestModal";
import { GridLayout, SpotlightLayout } from "@/components/broadcast/LiveKitRoom";
import BroadcastChat from "@/components/broadcast/BroadcastChat";
import { ArrowLeft, Users, Settings, AlertCircle } from "lucide-react";

export default function BroadcastStudio() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: broadcast, isLoading } = useBroadcastBySlug(id);
  const updateBroadcast = useUpdateBroadcast();

  const [layout, setLayout] = useState<LayoutType>("grid");
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [chatEnabled, setChatEnabled] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [spotlightIdentity, setSpotlightIdentity] = useState<string | undefined>();
  const [lowerThirdVisible, setLowerThirdVisible] = useState(false);
  const [lowerThirdData, setLowerThirdData] = useState({ name: "", title: "" });
  const [duration, setDuration] = useState("00:00:00");

  const isLive = broadcast?.status === "live";

  const {
    connect,
    disconnect,
    isConnected,
    isConnecting,
    participants,
    localParticipant,
    toggleCamera,
    toggleMicrophone,
    toggleScreenShare,
    isCameraEnabled,
    isMicrophoneEnabled,
    isScreenShareEnabled,
    canPublish,
  } = useLiveKit({
    broadcastId: broadcast?.id || "",
    role: "host",
    displayName: "Apresentador",
    onConnected: () => toast.success("Conectado ao estúdio!"),
    onDisconnected: () => toast.info("Desconectado do estúdio"),
  });

  // Audio transcription for captions
  const {
    isTranscribing,
    error: transcriptionError,
    startTranscription,
    stopTranscription,
  } = useAudioTranscription({
    broadcastId: broadcast?.id || "",
    speakerName: "Apresentador",
    onTranscript: (text) => {
      console.log("Transcript:", text);
    },
  });

  // Handle captions toggle
  useEffect(() => {
    if (captionsEnabled && isLive && !isTranscribing) {
      startTranscription();
    } else if (!captionsEnabled && isTranscribing) {
      stopTranscription();
    }
  }, [captionsEnabled, isLive, isTranscribing, startTranscription, stopTranscription]);

  // Show transcription errors
  useEffect(() => {
    if (transcriptionError) {
      toast.error(transcriptionError);
      setCaptionsEnabled(false);
    }
  }, [transcriptionError]);

  // Duration timer
  useEffect(() => {
    if (!isLive || !broadcast?.actual_start) return;

    const startTime = new Date(broadcast.actual_start).getTime();
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const hours = Math.floor(elapsed / 3600000);
      const minutes = Math.floor((elapsed % 3600000) / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);
      setDuration(
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [isLive, broadcast?.actual_start]);

  const handleStartBroadcast = async () => {
    if (!broadcast) return;

    try {
      const { error } = await supabase.functions.invoke("broadcast-start", {
        body: { broadcastId: broadcast.id },
      });
      if (error) throw error;
      
      await connect();
      toast.success("Transmissão iniciada!");
    } catch (err) {
      console.error("Start broadcast error:", err);
      toast.error("Erro ao iniciar transmissão");
    }
  };

  const handleStopBroadcast = async () => {
    if (!broadcast) return;

    try {
      disconnect();
      
      const { error } = await supabase.functions.invoke("broadcast-end", {
        body: { broadcastId: broadcast.id },
      });
      if (error) throw error;
      
      toast.success("Transmissão encerrada!");
      navigate("/admin/broadcast");
    } catch (err) {
      console.error("Stop broadcast error:", err);
      toast.error("Erro ao encerrar transmissão");
    }
  };

  const handleSpotlight = (identity: string) => {
    setSpotlightIdentity(spotlightIdentity === identity ? undefined : identity);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  if (!broadcast) {
    return (
      <div className="p-6 flex flex-col items-center justify-center gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-lg">Transmissão não encontrada</p>
        <Button onClick={() => navigate("/admin/broadcast")}>Voltar</Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/broadcast")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">{broadcast.title}</h1>
            <p className="text-sm text-muted-foreground">
              {broadcast.channel?.name} • {broadcast.program?.name || "Sem programa"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isLive && (
            <span className="flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">
              <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
              AO VIVO
            </span>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video area */}
        <div className="flex-1 flex flex-col p-4 gap-4">
          {/* Main preview */}
          <div className="flex-1 relative rounded-lg overflow-hidden bg-muted">
            {isConnected ? (
              layout === "spotlight" ? (
                <SpotlightLayout
                  participants={participants}
                  localParticipant={localParticipant}
                  spotlightIdentity={spotlightIdentity}
                  className="h-full"
                />
              ) : (
                <GridLayout
                  participants={participants}
                  localParticipant={localParticipant}
                  className="h-full p-2"
                />
              )
            ) : (
              <StudioPreview className="h-full" />
            )}

            {/* Lower third overlay */}
            <LowerThird
              name={lowerThirdData.name}
              title={lowerThirdData.title}
              isVisible={lowerThirdVisible}
            />
          </div>

          {/* Controls */}
          <StudioControls
            isCameraEnabled={isCameraEnabled}
            isMicrophoneEnabled={isMicrophoneEnabled}
            isScreenShareEnabled={isScreenShareEnabled}
            onToggleCamera={toggleCamera}
            onToggleMicrophone={toggleMicrophone}
            onToggleScreenShare={toggleScreenShare}
            isLive={isLive}
            onStartBroadcast={handleStartBroadcast}
            onStopBroadcast={handleStopBroadcast}
            layout={layout}
            onLayoutChange={setLayout}
            captionsEnabled={captionsEnabled}
            onToggleCaptions={() => setCaptionsEnabled(!captionsEnabled)}
            isRecording={isRecording}
            onToggleRecording={() => setIsRecording(!isRecording)}
            chatEnabled={chatEnabled}
            onToggleChat={() => setChatEnabled(!chatEnabled)}
            onInviteGuest={() => setShowInviteModal(true)}
            duration={duration}
            viewerCount={broadcast.viewer_count}
            disabled={isConnecting}
          />
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l flex flex-col">
          {/* Participants */}
          <div className="p-4 border-b">
            <h3 className="font-medium flex items-center gap-2 mb-3">
              <Users className="h-4 w-4" />
              Participantes ({(localParticipant ? 1 : 0) + participants.length})
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {localParticipant && (
                <ParticipantTile
                  participant={localParticipant}
                  isSpotlight={spotlightIdentity === localParticipant.identity}
                  showControls={false}
                  className="h-20"
                />
              )}
              {participants.map((p) => (
                <ParticipantTile
                  key={p.identity}
                  participant={p}
                  isSpotlight={spotlightIdentity === p.identity}
                  onSpotlight={() => handleSpotlight(p.identity)}
                  className="h-20"
                />
              ))}
            </div>
          </div>

          {/* Chat */}
          {chatEnabled && (
            <div className="flex-1 overflow-hidden">
              <BroadcastChat
                broadcastId={broadcast.id}
                isLive={isLive}
                className="h-full"
              />
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <InviteGuestModal
        open={showInviteModal}
        onOpenChange={setShowInviteModal}
        broadcastId={broadcast.id}
        broadcastTitle={broadcast.title}
      />
    </div>
  );
}
