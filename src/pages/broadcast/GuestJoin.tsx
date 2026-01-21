import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Video, Mic, MicOff, VideoOff, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLiveKit, useLocalPreview } from "@/hooks/useLiveKit";
import { toast } from "sonner";

interface BroadcastParticipant {
  id: string;
  broadcast_id: string;
  display_name: string;
  title_label: string | null;
  invite_token: string;
  invite_expires_at: string;
  joined_at: string | null;
  broadcast: {
    id: string;
    title: string;
    slug: string;
  } | null;
}

export default function GuestJoin() {
  const { inviteToken } = useParams();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);

  const {
    startPreview,
    stopPreview,
    videoTrack,
    audioTrack,
    isLoading: previewLoading,
  } = useLocalPreview();

  // Validate invite token
  const { data: participant, isLoading, error } = useQuery({
    queryKey: ["broadcast-invite", inviteToken],
    queryFn: async () => {
      if (!inviteToken) return null;

      const { data, error } = await supabase
        .from("broadcast_participants")
        .select("*, broadcast:broadcasts(id, title, slug)")
        .eq("invite_token", inviteToken)
        .gt("invite_expires_at", new Date().toISOString())
        .is("joined_at", null)
        .single();

      if (error) throw error;
      return data as BroadcastParticipant;
    },
    enabled: !!inviteToken,
    retry: false,
  });

  const broadcastId = participant?.broadcast?.id || "";
  
  const { connect } = useLiveKit({
    broadcastId,
    role: "guest",
    displayName,
    inviteToken,
  });

  // Start camera preview on mount
  useEffect(() => {
    startPreview();
    return () => {
      stopPreview();
    };
  }, []);

  // Attach video to preview element
  useEffect(() => {
    const videoEl = document.getElementById("preview-video") as HTMLVideoElement;
    if (videoEl && videoTrack) {
      videoTrack.attach(videoEl);
    }
    return () => {
      if (videoEl && videoTrack) {
        videoTrack.detach(videoEl);
      }
    };
  }, [videoTrack]);

  const toggleCamera = () => {
    if (videoTrack) {
      if (isCameraOn) {
        videoTrack.stop();
      } else {
        startPreview();
      }
      setIsCameraOn(!isCameraOn);
    }
  };

  const toggleMic = () => {
    // Note: Local audio track toggle will be handled after connecting
    setIsMicOn(!isMicOn);
  };

  const handleJoin = async () => {
    if (!displayName.trim()) {
      toast.error("Digite seu nome para continuar");
      return;
    }

    if (!participant?.broadcast?.id) {
      toast.error("Convite inválido");
      return;
    }

    setIsJoining(true);

    try {
      // Update participant record
      await supabase
        .from("broadcast_participants")
        .update({
          display_name: displayName,
          joined_at: new Date().toISOString(),
          is_camera_on: isCameraOn,
          is_mic_on: isMicOn,
        })
        .eq("id", participant.id);

      // Stop preview before connecting
      stopPreview();

      // Connect to LiveKit
      await connect();

      // Navigate to the broadcast
      navigate(`/ao-vivo/${participant.broadcast.slug}`);
    } catch (error) {
      console.error("Error joining broadcast:", error);
      toast.error("Erro ao entrar na transmissão");
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error || !participant) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle>Convite Inválido</CardTitle>
            <CardDescription>
              Este convite não existe, expirou ou já foi utilizado.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate("/")}>Voltar ao Início</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Entrar na Transmissão</title>
      </Helmet>

      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <CardHeader className="text-center">
            <CardTitle>Entrar na Transmissão</CardTitle>
            <CardDescription>
              Você foi convidado para participar de:{" "}
              <strong>{participant.broadcast?.title}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Camera Preview */}
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              {isCameraOn ? (
                <video
                  id="preview-video"
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover mirror"
                  style={{ transform: "scaleX(-1)" }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <VideoOff className="w-12 h-12 text-muted-foreground" />
                </div>
              )}

              {/* Camera/Mic Controls */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                <Button
                  variant={isCameraOn ? "default" : "destructive"}
                  size="icon"
                  onClick={toggleCamera}
                  disabled={previewLoading}
                >
                  {isCameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </Button>
                <Button
                  variant={isMicOn ? "default" : "destructive"}
                  size="icon"
                  onClick={toggleMic}
                  disabled={previewLoading}
                >
                  {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Name Input */}
            <div className="space-y-2">
              <Label htmlFor="displayName">Seu Nome</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Como você quer ser identificado?"
                disabled={isJoining}
              />
            </div>

            {/* Title Label (if set by host) */}
            {participant.title_label && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Seu título na transmissão:</p>
                <p className="font-medium">{participant.title_label}</p>
              </div>
            )}

            {/* Join Button */}
            <Button
              className="w-full"
              size="lg"
              onClick={handleJoin}
              disabled={isJoining || !displayName.trim()}
            >
              {isJoining ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  Entrar na Transmissão
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
