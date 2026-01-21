import React, { useEffect, useRef } from "react";
import { Track } from "livekit-client";
import { useLocalPreview } from "@/hooks/useLiveKit";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, Video, VideoOff, Volume2, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StudioPreviewProps {
  onReady?: (hasVideo: boolean, hasAudio: boolean) => void;
  className?: string;
}

export function StudioPreview({ onReady, className }: StudioPreviewProps) {
  const {
    videoTrack,
    audioTrack,
    startPreview,
    stopPreview,
    isLoading,
    error,
  } = useLocalPreview();

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioLevelRef = useRef<HTMLDivElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  // Attach video track
  useEffect(() => {
    if (videoTrack && videoRef.current) {
      videoTrack.attach(videoRef.current);
    }
    return () => {
      if (videoTrack && videoRef.current) {
        videoTrack.detach(videoRef.current);
      }
    };
  }, [videoTrack]);

  // Audio level visualization
  useEffect(() => {
    if (!audioTrack) return;

    const mediaStreamTrack = audioTrack.mediaStreamTrack;
    if (!mediaStreamTrack) return;

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    
    const source = audioContext.createMediaStreamSource(
      new MediaStream([mediaStreamTrack])
    );
    source.connect(analyser);
    analyserRef.current = analyser;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateLevel = () => {
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      const level = Math.min(100, (average / 128) * 100);

      if (audioLevelRef.current) {
        audioLevelRef.current.style.width = `${level}%`;
      }

      animationRef.current = requestAnimationFrame(updateLevel);
    };

    updateLevel();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      audioContext.close();
    };
  }, [audioTrack]);

  // Notify parent when ready
  useEffect(() => {
    onReady?.(!!videoTrack, !!audioTrack);
  }, [videoTrack, audioTrack, onReady]);

  const hasPreview = videoTrack || audioTrack;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Video className="h-4 w-4" />
          Preview Local
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Video Preview */}
        <div className="relative aspect-video rounded-lg bg-muted overflow-hidden">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <p className="text-sm text-destructive text-center">{error}</p>
            </div>
          ) : videoTrack ? (
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              autoPlay
              playsInline
              muted
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <VideoOff className="h-12 w-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Câmera desligada</p>
            </div>
          )}

          {/* Status badges */}
          {hasPreview && (
            <div className="absolute top-2 right-2 flex gap-1">
              {videoTrack ? (
                <span className="rounded-full bg-green-500 p-1">
                  <Video className="h-3 w-3 text-white" />
                </span>
              ) : (
                <span className="rounded-full bg-red-500 p-1">
                  <VideoOff className="h-3 w-3 text-white" />
                </span>
              )}
              {audioTrack ? (
                <span className="rounded-full bg-green-500 p-1">
                  <Mic className="h-3 w-3 text-white" />
                </span>
              ) : (
                <span className="rounded-full bg-red-500 p-1">
                  <MicOff className="h-3 w-3 text-white" />
                </span>
              )}
            </div>
          )}
        </div>

        {/* Audio Level Meter */}
        {audioTrack && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Volume2 className="h-3 w-3" />
              <span>Nível do áudio</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                ref={audioLevelRef}
                className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-75"
                style={{ width: "0%" }}
              />
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-2">
          {!hasPreview ? (
            <Button
              onClick={startPreview}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando...
                </>
              ) : (
                <>
                  <Video className="mr-2 h-4 w-4" />
                  Testar Câmera e Microfone
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={stopPreview}
              variant="outline"
              className="flex-1"
            >
              Parar Preview
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
