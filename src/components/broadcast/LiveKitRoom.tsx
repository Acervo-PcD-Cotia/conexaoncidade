import React, { useEffect, useRef, useState } from "react";
import { Track } from "livekit-client";
import { cn } from "@/lib/utils";
import { Mic, MicOff, Video, VideoOff, Volume2, VolumeX } from "lucide-react";
import { LiveKitParticipant } from "@/hooks/useLiveKit";

interface VideoTrackRendererProps {
  track: Track | undefined;
  className?: string;
  objectFit?: "contain" | "cover";
  muted?: boolean;
}

export function VideoTrackRenderer({
  track,
  className,
  objectFit = "cover",
  muted = true,
}: VideoTrackRendererProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!track || !videoRef.current) return;

    track.attach(videoRef.current);

    return () => {
      if (videoRef.current) {
        track.detach(videoRef.current);
      }
    };
  }, [track]);

  if (!track) {
    return (
      <div className={cn("bg-muted flex items-center justify-center", className)}>
        <VideoOff className="h-12 w-12 text-muted-foreground" />
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      className={cn("h-full w-full", className)}
      style={{ objectFit }}
      autoPlay
      playsInline
      muted={muted}
    />
  );
}

interface AudioTrackRendererProps {
  track: Track | undefined;
  volume?: number;
}

export function AudioTrackRenderer({ track, volume = 1 }: AudioTrackRendererProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!track || !audioRef.current) return;

    track.attach(audioRef.current);
    audioRef.current.volume = volume;

    return () => {
      if (audioRef.current) {
        track.detach(audioRef.current);
      }
    };
  }, [track, volume]);

  if (!track) return null;

  return <audio ref={audioRef} autoPlay />;
}

interface ParticipantViewProps {
  participant: LiveKitParticipant;
  showName?: boolean;
  showControls?: boolean;
  className?: string;
  volume?: number;
}

export function ParticipantView({
  participant,
  showName = true,
  showControls = true,
  className,
  volume = 1,
}: ParticipantViewProps) {
  const [isMuted, setIsMuted] = useState(false);

  return (
    <div className={cn("relative overflow-hidden rounded-lg bg-muted", className)}>
      {/* Video Track */}
      <VideoTrackRenderer
        track={participant.videoTrack || participant.screenTrack}
        className="absolute inset-0"
        muted
      />

      {/* Audio Track */}
      {!participant.isLocal && !isMuted && (
        <AudioTrackRenderer track={participant.audioTrack} volume={volume} />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent p-3">
        {/* Name and indicators */}
        <div className="flex items-center gap-2">
          {showName && (
            <span className="text-sm font-medium text-white truncate">
              {participant.name}
              {participant.isLocal && " (Você)"}
            </span>
          )}
          
          {/* Speaking indicator */}
          {participant.isSpeaking && (
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          )}
        </div>

        {/* Status indicators */}
        {showControls && (
          <div className="absolute top-2 right-2 flex gap-1">
            {!participant.isCameraEnabled && (
              <div className="rounded-full bg-black/50 p-1">
                <VideoOff className="h-3 w-3 text-white" />
              </div>
            )}
            {!participant.isMicrophoneEnabled && (
              <div className="rounded-full bg-black/50 p-1">
                <MicOff className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Role badge */}
      {participant.role !== "viewer" && (
        <div className="absolute top-2 left-2">
          <span className={cn(
            "rounded-full px-2 py-0.5 text-xs font-medium",
            participant.role === "host" 
              ? "bg-red-500 text-white" 
              : "bg-blue-500 text-white"
          )}>
            {participant.role === "host" ? "Apresentador" : "Convidado"}
          </span>
        </div>
      )}
    </div>
  );
}

interface GridLayoutProps {
  participants: LiveKitParticipant[];
  localParticipant?: LiveKitParticipant | null;
  className?: string;
}

export function GridLayout({ participants, localParticipant, className }: GridLayoutProps) {
  const allParticipants = localParticipant 
    ? [localParticipant, ...participants]
    : participants;

  const count = allParticipants.length;

  // Determine grid layout
  let gridCols = 1;
  if (count === 2) gridCols = 2;
  else if (count <= 4) gridCols = 2;
  else if (count <= 9) gridCols = 3;
  else gridCols = 4;

  return (
    <div
      className={cn(
        "grid gap-2 h-full w-full",
        className
      )}
      style={{
        gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
      }}
    >
      {allParticipants.map((participant) => (
        <ParticipantView
          key={participant.identity}
          participant={participant}
          className="aspect-video"
        />
      ))}
    </div>
  );
}

interface SpotlightLayoutProps {
  participants: LiveKitParticipant[];
  localParticipant?: LiveKitParticipant | null;
  spotlightIdentity?: string;
  className?: string;
}

export function SpotlightLayout({
  participants,
  localParticipant,
  spotlightIdentity,
  className,
}: SpotlightLayoutProps) {
  const allParticipants = localParticipant
    ? [localParticipant, ...participants]
    : participants;

  // Find spotlight participant (default to first host or first participant)
  const spotlight = allParticipants.find((p) => p.identity === spotlightIdentity)
    || allParticipants.find((p) => p.role === "host")
    || allParticipants[0];

  const others = allParticipants.filter((p) => p.identity !== spotlight?.identity);

  if (!spotlight) {
    return (
      <div className={cn("flex items-center justify-center h-full bg-muted", className)}>
        <p className="text-muted-foreground">Nenhum participante</p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2 h-full", className)}>
      {/* Main spotlight */}
      <div className="flex-1 min-h-0">
        <ParticipantView
          participant={spotlight}
          className="h-full w-full"
        />
      </div>

      {/* Thumbnails */}
      {others.length > 0 && (
        <div className="flex gap-2 overflow-x-auto py-1">
          {others.map((participant) => (
            <ParticipantView
              key={participant.identity}
              participant={participant}
              className="h-24 w-36 flex-shrink-0"
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface AudioOnlyLayoutProps {
  participants: LiveKitParticipant[];
  localParticipant?: LiveKitParticipant | null;
  coverImage?: string;
  className?: string;
}

export function AudioOnlyLayout({
  participants,
  localParticipant,
  coverImage,
  className,
}: AudioOnlyLayoutProps) {
  const allParticipants = localParticipant
    ? [localParticipant, ...participants]
    : participants;

  return (
    <div className={cn("relative h-full w-full", className)}>
      {/* Background image or gradient */}
      {coverImage ? (
        <img
          src={coverImage}
          alt="Cover"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
      )}

      {/* Audio visualizer / waveform placeholder */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-primary rounded-full animate-pulse"
              style={{
                height: `${Math.random() * 40 + 20}px`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
        
        <div className="text-center">
          <Volume2 className="h-12 w-12 text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            {allParticipants.length} participante(s) no ar
          </p>
        </div>
      </div>

      {/* Audio tracks (hidden) */}
      {allParticipants
        .filter((p) => !p.isLocal)
        .map((participant) => (
          <AudioTrackRenderer
            key={participant.identity}
            track={participant.audioTrack}
          />
        ))}
    </div>
  );
}

// Wrapper component for easy layout switching
interface LiveKitRoomProps {
  participants: LiveKitParticipant[];
  localParticipant?: LiveKitParticipant | null;
  layout?: "grid" | "spotlight" | "audio";
  spotlightIdentity?: string;
  coverImage?: string;
  className?: string;
}

export function LiveKitRoom({
  participants,
  localParticipant,
  layout = "grid",
  spotlightIdentity,
  coverImage,
  className,
}: LiveKitRoomProps) {
  if (layout === "spotlight") {
    return (
      <SpotlightLayout
        participants={participants}
        localParticipant={localParticipant}
        spotlightIdentity={spotlightIdentity}
        className={className}
      />
    );
  }

  if (layout === "audio") {
    return (
      <AudioOnlyLayout
        participants={participants}
        localParticipant={localParticipant}
        coverImage={coverImage}
        className={className}
      />
    );
  }

  return (
    <GridLayout
      participants={participants}
      localParticipant={localParticipant}
      className={className}
    />
  );
}
