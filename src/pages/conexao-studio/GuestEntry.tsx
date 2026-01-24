import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Camera, Mic, MicOff, Video, VideoOff, RefreshCw, AlertTriangle, Wifi, WifiOff, Check } from "lucide-react";
import { toast } from "sonner";
import { useDeviceSelector } from "@/hooks/useDeviceSelector";
import { useAudioLevel } from "@/hooks/useAudioLevel";
import { AudioLevelMeter } from "@/components/conexao-studio/studio/AudioLevelMeter";
import { GreenRoom } from "@/components/conexao-studio/studio/GreenRoom";
import { supabase } from "@/integrations/supabase/client";
import { useLiveKit } from "@/hooks/useLiveKit";

type EntryStep = "setup" | "waiting" | "approved" | "rejected";

export default function GuestEntry() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  // Form state
  const [displayName, setDisplayName] = useState("");
  const [step, setStep] = useState<EntryStep>("setup");
  const [studioName, setStudioName] = useState<string>();
  const [broadcastId, setBroadcastId] = useState<string>();
  const [rejectionMessage, setRejectionMessage] = useState<string>();
  
  // Media state
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [connectionQuality, setConnectionQuality] = useState<"good" | "fair" | "poor">("good");
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Hooks
  const deviceSelector = useDeviceSelector();
  const audioLevel = useAudioLevel({ deviceId: deviceSelector.selectedAudioInputDevice });

  // Validate invite token
  useEffect(() => {
    if (token) {
      validateToken();
    }
  }, [token]);

  const validateToken = async () => {
    try {
      // Parse token to get broadcast info
      // Token format: studioSlug-timestamp or UUID
      const { data: participant } = await supabase
        .from("broadcast_participants")
        .select(`
          *,
          broadcasts (
            id,
            title,
            status
          )
        `)
        .eq("invite_token", token)
        .maybeSingle();

      if (participant?.broadcasts) {
        setStudioName(participant.broadcasts.title);
        setBroadcastId(participant.broadcasts.id);
        if (participant.display_name) {
          setDisplayName(participant.display_name);
        }
      }
    } catch (error) {
      console.error("Error validating token:", error);
    }
  };

  // Start media preview
  const startPreview = useCallback(async () => {
    try {
      const constraints: MediaStreamConstraints = {
        video: isCameraEnabled && deviceSelector.selectedVideoDevice 
          ? { deviceId: { exact: deviceSelector.selectedVideoDevice } }
          : isCameraEnabled,
        audio: isMicEnabled && deviceSelector.selectedAudioInputDevice
          ? { deviceId: { exact: deviceSelector.selectedAudioInputDevice } }
          : isMicEnabled,
      };

      if (!isCameraEnabled && !isMicEnabled) {
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);

      if (videoRef.current && isCameraEnabled) {
        videoRef.current.srcObject = stream;
      }

      if (isMicEnabled) {
        audioLevel.startCapture();
      }
    } catch (err) {
      console.error("Error starting preview:", err);
      toast.error("Erro ao acessar câmera/microfone");
    }
  }, [isCameraEnabled, isMicEnabled, deviceSelector.selectedVideoDevice, deviceSelector.selectedAudioInputDevice]);

  // Stop preview
  const stopPreview = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    audioLevel.stopCapture();
  }, [localStream, audioLevel]);

  // Restart preview when devices change
  useEffect(() => {
    if (deviceSelector.hasPermissions) {
      stopPreview();
      startPreview();
    }
    return () => stopPreview();
  }, [
    deviceSelector.selectedVideoDevice, 
    deviceSelector.selectedAudioInputDevice,
    isCameraEnabled,
    isMicEnabled,
  ]);

  // Request permissions on mount
  useEffect(() => {
    if (!deviceSelector.hasPermissions && !deviceSelector.isLoading) {
      deviceSelector.requestPermissions();
    }
  }, [deviceSelector.hasPermissions, deviceSelector.isLoading]);

  // Check connection quality
  useEffect(() => {
    const checkConnection = () => {
      const connection = (navigator as any).connection;
      if (connection) {
        const effectiveType = connection.effectiveType;
        if (effectiveType === "4g") {
          setConnectionQuality("good");
        } else if (effectiveType === "3g") {
          setConnectionQuality("fair");
        } else {
          setConnectionQuality("poor");
        }
      }
    };

    checkConnection();
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener("change", checkConnection);
      return () => connection.removeEventListener("change", checkConnection);
    }
  }, []);

  // Participant ID for tracking this guest's record
  const [participantId, setParticipantId] = useState<string | null>(null);

  // Subscribe to participant status changes when waiting
  useEffect(() => {
    if (!participantId || step !== "waiting") return;

    const channel = supabase
      .channel(`guest-status-${participantId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "illumina_session_participants",
          filter: `id=eq.${participantId}`,
        },
        (payload) => {
          const newStatus = payload.new.status;
          console.log("[GuestEntry] Status changed to:", newStatus);

          if (newStatus === "approved") {
            setStep("approved");
            toast.success("Entrada aprovada! Entrando no estúdio...");
            // Navigate to studio or connect with publishing permissions
            if (broadcastId) {
              navigate(`/studio/live/${broadcastId}?guest=true`);
            }
          } else if (newStatus === "rejected") {
            setStep("rejected");
            setRejectionMessage(payload.new.lower_third_text || "Sua entrada foi recusada pelo host.");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [participantId, step, broadcastId, navigate]);

  const handleJoinStudio = async () => {
    if (!displayName.trim()) {
      toast.error("Digite seu nome");
      return;
    }

    try {
      // First, find or create the session
      let sessionId = broadcastId;

      // If we have a token but no broadcastId, try to find the session from illumina_studios
      if (!sessionId && token) {
        // Check if token matches a studio slug
        const studioSlug = token.split("-")[0];
        const { data: studio } = await supabase
          .from("illumina_studios")
          .select("id")
          .eq("slug", studioSlug)
          .maybeSingle();

        if (studio) {
          sessionId = studio.id;
        }
      }

      if (!sessionId) {
        toast.error("Sessão não encontrada");
        return;
      }

      // Insert as waiting participant
      const { data: participant, error } = await supabase
        .from("illumina_session_participants")
        .insert({
          session_id: sessionId,
          display_name: displayName.trim(),
          role: "guest",
          status: "waiting",
          is_camera_off: !isCameraEnabled,
          is_muted: !isMicEnabled,
          invite_token: token,
        })
        .select()
        .single();

      if (error) {
        console.error("[GuestEntry] Insert error:", error);
        toast.error("Erro ao solicitar entrada");
        return;
      }

      setParticipantId(participant.id);
      stopPreview();
      setStep("waiting");
      toast.info("Aguardando aprovação do host...");
    } catch (err) {
      console.error("[GuestEntry] Error joining:", err);
      toast.error("Erro ao entrar no estúdio");
    }
  };

  const handleLeave = async () => {
    // If we have a participant record, update it to left
    if (participantId) {
      await supabase
        .from("illumina_session_participants")
        .update({
          status: "rejected",
          left_at: new Date().toISOString(),
        })
        .eq("id", participantId);
    }
    stopPreview();
    navigate("/");
  };

  const toggleCamera = () => {
    setIsCameraEnabled(!isCameraEnabled);
  };

  const toggleMicrophone = () => {
    setIsMicEnabled(!isMicEnabled);
    if (isMicEnabled) {
      audioLevel.stopCapture();
    } else {
      audioLevel.startCapture();
    }
  };

  // Show Green Room if waiting
  if (step === "waiting" || step === "approved" || step === "rejected") {
    return (
      <GreenRoom
        displayName={displayName}
        studioName={studioName}
        videoTrack={null}
        audioTrack={null}
        isCameraEnabled={isCameraEnabled}
        isMicrophoneEnabled={isMicEnabled}
        audioLevel={audioLevel.level}
        onToggleCamera={toggleCamera}
        onToggleMicrophone={toggleMicrophone}
        onLeave={handleLeave}
        status={step}
        message={rejectionMessage}
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full bg-zinc-900 border-zinc-800 text-white">
        <CardHeader className="text-center">
          <CardTitle>Entrar no Estúdio</CardTitle>
          <CardDescription className="text-zinc-400">
            {studioName ? (
              <>
                Você foi convidado para <span className="text-white font-medium">{studioName}</span>
              </>
            ) : (
              "Configure sua câmera e microfone antes de entrar"
            )}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Connection Quality Warning */}
          {connectionQuality === "poor" && (
            <Alert variant="destructive" className="bg-red-950/50 border-red-800">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Sua conexão parece instável. Isso pode afetar a qualidade do vídeo.
              </AlertDescription>
            </Alert>
          )}

          {/* Video Preview */}
          <div className="relative aspect-video bg-zinc-800 rounded-lg overflow-hidden">
            {isCameraEnabled && localStream ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: "scaleX(-1)" }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-zinc-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Camera className="h-10 w-10 text-zinc-500" />
                  </div>
                  <p className="text-zinc-400 text-sm">
                    {!deviceSelector.hasPermissions 
                      ? "Permita acesso à câmera" 
                      : "Câmera desligada"}
                  </p>
                </div>
              </div>
            )}

            {/* Connection indicator */}
            <div className="absolute top-3 right-3">
              <Badge 
                variant="secondary" 
                className={`gap-1 ${
                  connectionQuality === "good" 
                    ? "bg-emerald-600" 
                    : connectionQuality === "fair" 
                    ? "bg-yellow-600" 
                    : "bg-red-600"
                }`}
              >
                {connectionQuality === "good" ? (
                  <Wifi className="h-3 w-3" />
                ) : (
                  <WifiOff className="h-3 w-3" />
                )}
                {connectionQuality === "good" ? "Boa" : connectionQuality === "fair" ? "Regular" : "Fraca"}
              </Badge>
            </div>

            {/* Audio Level */}
            {isMicEnabled && (
              <div className="absolute bottom-3 left-3 right-3">
                <div className="bg-black/60 backdrop-blur-sm rounded-lg p-2">
                  <div className="flex items-center gap-2">
                    <Mic className="h-4 w-4 text-emerald-500" />
                    <div className="flex-1 h-2">
                      <AudioLevelMeter 
                        level={audioLevel.level} 
                        peakLevel={audioLevel.peakLevel}
                        segments={30}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="displayName">Seu Nome</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Como você quer ser chamado?"
              className="bg-zinc-800 border-zinc-700"
            />
          </div>

          {/* Device Selection */}
          <div className="grid grid-cols-2 gap-4">
            {/* Camera Select */}
            <div className="space-y-2">
              <Label>Câmera</Label>
              <Select
                value={deviceSelector.selectedVideoDevice || ""}
                onValueChange={deviceSelector.setSelectedVideoDevice}
                disabled={!deviceSelector.hasPermissions}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {deviceSelector.videoDevices.map((device) => (
                    <SelectItem key={device.deviceId} value={device.deviceId}>
                      {device.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Microphone Select */}
            <div className="space-y-2">
              <Label>Microfone</Label>
              <Select
                value={deviceSelector.selectedAudioInputDevice || ""}
                onValueChange={deviceSelector.setSelectedAudioInputDevice}
                disabled={!deviceSelector.hasPermissions}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {deviceSelector.audioInputDevices.map((device) => (
                    <SelectItem key={device.deviceId} value={device.deviceId}>
                      {device.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Media Controls */}
          <div className="flex items-center justify-center gap-3">
            <Button
              variant={isMicEnabled ? "secondary" : "destructive"}
              size="lg"
              onClick={toggleMicrophone}
              className="gap-2"
            >
              {isMicEnabled ? (
                <>
                  <Mic className="h-5 w-5" />
                  Microfone Ligado
                </>
              ) : (
                <>
                  <MicOff className="h-5 w-5" />
                  Microfone Mudo
                </>
              )}
            </Button>

            <Button
              variant={isCameraEnabled ? "secondary" : "destructive"}
              size="lg"
              onClick={toggleCamera}
              className="gap-2"
            >
              {isCameraEnabled ? (
                <>
                  <Video className="h-5 w-5" />
                  Câmera Ligada
                </>
              ) : (
                <>
                  <VideoOff className="h-5 w-5" />
                  Câmera Desligada
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => deviceSelector.refreshDevices()}
              className="text-zinc-400"
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
          </div>

          {/* Permission Warning */}
          {!deviceSelector.hasPermissions && (
            <Alert className="bg-amber-950/50 border-amber-800">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <AlertDescription className="text-amber-200">
                Você precisa permitir acesso à câmera e microfone para continuar.
                <Button
                  variant="link"
                  className="text-amber-400 p-0 h-auto ml-2"
                  onClick={() => deviceSelector.requestPermissions()}
                >
                  Permitir acesso
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Join Button */}
          <Button
            size="lg"
            className="w-full gap-2"
            onClick={handleJoinStudio}
            disabled={!displayName.trim() || !deviceSelector.hasPermissions}
          >
            <Check className="h-5 w-5" />
            Entrar no Estúdio
          </Button>

          {/* Cancel */}
          <div className="text-center">
            <Button variant="ghost" onClick={handleLeave} className="text-zinc-400">
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
