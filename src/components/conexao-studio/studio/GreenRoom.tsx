import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Clock, Mic, MicOff, Video, VideoOff, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Track } from "livekit-client";

interface GreenRoomProps {
  displayName: string;
  studioName?: string;
  videoTrack?: Track | null;
  audioTrack?: Track | null;
  isCameraEnabled: boolean;
  isMicrophoneEnabled: boolean;
  audioLevel?: number;
  onToggleCamera: () => void;
  onToggleMicrophone: () => void;
  onLeave: () => void;
  status: "waiting" | "approved" | "rejected";
  message?: string;
}

export function GreenRoom({
  displayName,
  studioName,
  videoTrack,
  audioTrack,
  isCameraEnabled,
  isMicrophoneEnabled,
  audioLevel = 0,
  onToggleCamera,
  onToggleMicrophone,
  onLeave,
  status,
  message,
}: GreenRoomProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [waitingTime, setWaitingTime] = useState(0);

  // Attach video track to video element
  useEffect(() => {
    if (videoRef.current && videoTrack) {
      videoTrack.attach(videoRef.current);
      return () => {
        videoTrack.detach(videoRef.current!);
      };
    }
  }, [videoTrack]);

  // Waiting timer
  useEffect(() => {
    if (status === "waiting") {
      const interval = setInterval(() => {
        setWaitingTime((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [status]);

  const formatWaitingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (status === "rejected") {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-zinc-900 border-zinc-800 text-white">
          <CardHeader className="text-center">
            <CardTitle className="text-red-500">Entrada Não Autorizada</CardTitle>
            <CardDescription className="text-zinc-400">
              {message || "O host não autorizou sua entrada no estúdio."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button variant="outline" onClick={onLeave}>
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full bg-zinc-900 border-zinc-800 text-white">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Badge variant="outline" className="border-amber-500 text-amber-500 gap-1">
              <Clock className="h-3 w-3" />
              Aguardando...
            </Badge>
            <span className="text-zinc-500 text-sm font-mono">
              {formatWaitingTime(waitingTime)}
            </span>
          </div>
          <CardTitle>Sala de Espera</CardTitle>
          <CardDescription className="text-zinc-400">
            {studioName ? (
              <>
                Você está entrando em <span className="text-white font-medium">{studioName}</span>
              </>
            ) : (
              "Aguarde o host aprovar sua entrada no estúdio"
            )}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Video Preview */}
          <div className="relative aspect-video bg-zinc-800 rounded-lg overflow-hidden">
            {isCameraEnabled && videoTrack ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror"
                style={{ transform: "scaleX(-1)" }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-zinc-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-3xl font-bold text-zinc-300">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <p className="text-zinc-400 text-sm">Câmera desligada</p>
                </div>
              </div>
            )}

            {/* Name overlay */}
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-3 py-1 rounded">
              <span className="text-sm font-medium">{displayName}</span>
            </div>

            {/* Audio level indicator */}
            {isMicrophoneEnabled && (
              <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded">
                <Volume2 className="h-3 w-3 text-emerald-500" />
                <div className="w-16 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-75"
                    style={{ width: `${audioLevel}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Media Controls */}
          <div className="flex items-center justify-center gap-3">
            <Button
              variant={isMicrophoneEnabled ? "secondary" : "destructive"}
              size="lg"
              onClick={onToggleMicrophone}
              className="gap-2"
            >
              {isMicrophoneEnabled ? (
                <>
                  <Mic className="h-5 w-5" />
                  Microfone
                </>
              ) : (
                <>
                  <MicOff className="h-5 w-5" />
                  Mudo
                </>
              )}
            </Button>

            <Button
              variant={isCameraEnabled ? "secondary" : "destructive"}
              size="lg"
              onClick={onToggleCamera}
              className="gap-2"
            >
              {isCameraEnabled ? (
                <>
                  <Video className="h-5 w-5" />
                  Câmera
                </>
              ) : (
                <>
                  <VideoOff className="h-5 w-5" />
                  Sem Câmera
                </>
              )}
            </Button>
          </div>

          {/* Status Message */}
          <div className="text-center p-4 bg-zinc-800/50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm font-medium">Conectado ao estúdio</span>
            </div>
            <p className="text-xs text-zinc-400">
              O host será notificado da sua presença. Mantenha esta página aberta.
            </p>
          </div>

          {/* Leave Button */}
          <div className="text-center">
            <Button variant="ghost" onClick={onLeave} className="text-zinc-400">
              Cancelar e Sair
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
