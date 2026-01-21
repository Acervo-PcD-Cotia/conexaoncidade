import { useState, useCallback, useEffect, useRef } from "react";
import {
  Room,
  RoomEvent,
  ConnectionState,
  Track,
  Participant,
  LocalParticipant,
  RemoteParticipant,
  LocalTrackPublication,
  RemoteTrackPublication,
  createLocalTracks,
  VideoPresets,
} from "livekit-client";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type ParticipantRole = "host" | "guest" | "viewer";

export interface LiveKitParticipant {
  identity: string;
  name: string;
  role: ParticipantRole;
  isSpeaking: boolean;
  isCameraEnabled: boolean;
  isMicrophoneEnabled: boolean;
  isScreenShareEnabled: boolean;
  isLocal: boolean;
  videoTrack?: Track;
  audioTrack?: Track;
  screenTrack?: Track;
  participant: Participant;
}

export interface UseLiveKitOptions {
  broadcastId: string;
  role?: ParticipantRole;
  displayName?: string;
  inviteToken?: string;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onParticipantJoined?: (participant: LiveKitParticipant) => void;
  onParticipantLeft?: (participant: LiveKitParticipant) => void;
}

export interface UseLiveKitReturn {
  // Connection
  connect: () => Promise<void>;
  disconnect: () => void;
  connectionState: ConnectionState;
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;

  // Room info
  room: Room | null;
  roomName: string | null;
  
  // Participants
  participants: LiveKitParticipant[];
  localParticipant: LiveKitParticipant | null;
  
  // Local controls
  toggleCamera: () => Promise<void>;
  toggleMicrophone: () => Promise<void>;
  toggleScreenShare: () => Promise<void>;
  isCameraEnabled: boolean;
  isMicrophoneEnabled: boolean;
  isScreenShareEnabled: boolean;
  
  // Permissions
  canPublish: boolean;
  canSubscribe: boolean;
}

function participantToLiveKitParticipant(
  participant: Participant,
  isLocal: boolean
): LiveKitParticipant {
  const videoTrack = participant.getTrackPublication(Track.Source.Camera)?.track;
  const audioTrack = participant.getTrackPublication(Track.Source.Microphone)?.track;
  const screenTrack = participant.getTrackPublication(Track.Source.ScreenShare)?.track;
  
  // Parse role from metadata
  let role: ParticipantRole = "viewer";
  try {
    const metadata = JSON.parse(participant.metadata || "{}");
    role = metadata.role || "viewer";
  } catch {}

  return {
    identity: participant.identity,
    name: participant.name || participant.identity,
    role,
    isSpeaking: participant.isSpeaking,
    isCameraEnabled: participant.isCameraEnabled,
    isMicrophoneEnabled: participant.isMicrophoneEnabled,
    isScreenShareEnabled: participant.isScreenShareEnabled,
    isLocal,
    videoTrack,
    audioTrack,
    screenTrack,
    participant,
  };
}

export function useLiveKit(options: UseLiveKitOptions): UseLiveKitReturn {
  const {
    broadcastId,
    role = "viewer",
    displayName,
    inviteToken,
    onConnected,
    onDisconnected,
    onParticipantJoined,
    onParticipantLeft,
  } = options;

  const [room, setRoom] = useState<Room | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.Disconnected);
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<LiveKitParticipant[]>([]);
  const [localParticipant, setLocalParticipant] = useState<LiveKitParticipant | null>(null);
  const [roomName, setRoomName] = useState<string | null>(null);
  const [canPublish, setCanPublish] = useState(false);
  const [canSubscribe, setCanSubscribe] = useState(true);
  const [isCameraEnabled, setIsCameraEnabled] = useState(false);
  const [isMicrophoneEnabled, setIsMicrophoneEnabled] = useState(false);
  const [isScreenShareEnabled, setIsScreenShareEnabled] = useState(false);
  
  const roomRef = useRef<Room | null>(null);

  // Update participants list
  const updateParticipants = useCallback(() => {
    if (!roomRef.current) return;
    
    const remoteParticipants = Array.from(roomRef.current.remoteParticipants.values());
    const mapped = remoteParticipants.map((p) =>
      participantToLiveKitParticipant(p, false)
    );
    setParticipants(mapped);

    if (roomRef.current.localParticipant) {
      const local = participantToLiveKitParticipant(
        roomRef.current.localParticipant,
        true
      );
      setLocalParticipant(local);
      setIsCameraEnabled(roomRef.current.localParticipant.isCameraEnabled);
      setIsMicrophoneEnabled(roomRef.current.localParticipant.isMicrophoneEnabled);
      setIsScreenShareEnabled(roomRef.current.localParticipant.isScreenShareEnabled);
    }
  }, []);

  // Connect to room
  const connect = useCallback(async () => {
    if (roomRef.current?.state === ConnectionState.Connected) {
      return;
    }

    setError(null);
    setConnectionState(ConnectionState.Connecting);

    try {
      // Get token from edge function
      const { data: session } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke("livekit-token", {
        body: {
          broadcastId,
          role,
          displayName,
          inviteToken,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to get LiveKit token");
      }

      const { token, wsUrl, roomName: fetchedRoomName, permissions } = response.data;

      if (!token || !wsUrl) {
        throw new Error("Invalid response from token endpoint");
      }

      setRoomName(fetchedRoomName);
      setCanPublish(permissions?.canPublish || false);
      setCanSubscribe(permissions?.canSubscribe ?? true);

      // Create and connect room
      const newRoom = new Room({
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: {
          resolution: VideoPresets.h720.resolution,
        },
      });

      // Set up event listeners
      newRoom.on(RoomEvent.ConnectionStateChanged, (state) => {
        setConnectionState(state);
        if (state === ConnectionState.Connected) {
          onConnected?.();
        } else if (state === ConnectionState.Disconnected) {
          onDisconnected?.();
        }
      });

      newRoom.on(RoomEvent.ParticipantConnected, (participant) => {
        updateParticipants();
        const mapped = participantToLiveKitParticipant(participant, false);
        onParticipantJoined?.(mapped);
      });

      newRoom.on(RoomEvent.ParticipantDisconnected, (participant) => {
        updateParticipants();
        const mapped = participantToLiveKitParticipant(participant, false);
        onParticipantLeft?.(mapped);
      });

      newRoom.on(RoomEvent.TrackSubscribed, updateParticipants);
      newRoom.on(RoomEvent.TrackUnsubscribed, updateParticipants);
      newRoom.on(RoomEvent.TrackMuted, updateParticipants);
      newRoom.on(RoomEvent.TrackUnmuted, updateParticipants);
      newRoom.on(RoomEvent.ActiveSpeakersChanged, updateParticipants);
      newRoom.on(RoomEvent.LocalTrackPublished, updateParticipants);
      newRoom.on(RoomEvent.LocalTrackUnpublished, updateParticipants);

      newRoom.on(RoomEvent.Disconnected, (reason) => {
        console.log("Disconnected from room:", reason);
        setConnectionState(ConnectionState.Disconnected);
        onDisconnected?.();
      });

      roomRef.current = newRoom;
      setRoom(newRoom);

      // Connect to room
      await newRoom.connect(wsUrl, token);
      
      updateParticipants();
    } catch (err) {
      console.error("LiveKit connection error:", err);
      const message = err instanceof Error ? err.message : "Connection failed";
      setError(message);
      setConnectionState(ConnectionState.Disconnected);
      toast.error(`Erro ao conectar: ${message}`);
    }
  }, [broadcastId, role, displayName, inviteToken, onConnected, onDisconnected, onParticipantJoined, onParticipantLeft, updateParticipants]);

  // Disconnect from room
  const disconnect = useCallback(() => {
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
      setRoom(null);
      setParticipants([]);
      setLocalParticipant(null);
      setConnectionState(ConnectionState.Disconnected);
    }
  }, []);

  // Toggle camera
  const toggleCamera = useCallback(async () => {
    if (!roomRef.current?.localParticipant) return;
    
    try {
      await roomRef.current.localParticipant.setCameraEnabled(!isCameraEnabled);
      setIsCameraEnabled(!isCameraEnabled);
    } catch (err) {
      console.error("Error toggling camera:", err);
      toast.error("Erro ao alternar câmera");
    }
  }, [isCameraEnabled]);

  // Toggle microphone
  const toggleMicrophone = useCallback(async () => {
    if (!roomRef.current?.localParticipant) return;
    
    try {
      await roomRef.current.localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
      setIsMicrophoneEnabled(!isMicrophoneEnabled);
    } catch (err) {
      console.error("Error toggling microphone:", err);
      toast.error("Erro ao alternar microfone");
    }
  }, [isMicrophoneEnabled]);

  // Toggle screen share
  const toggleScreenShare = useCallback(async () => {
    if (!roomRef.current?.localParticipant) return;
    
    try {
      await roomRef.current.localParticipant.setScreenShareEnabled(!isScreenShareEnabled);
      setIsScreenShareEnabled(!isScreenShareEnabled);
    } catch (err) {
      console.error("Error toggling screen share:", err);
      toast.error("Erro ao compartilhar tela");
    }
  }, [isScreenShareEnabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
      }
    };
  }, []);

  return {
    connect,
    disconnect,
    connectionState,
    isConnecting: connectionState === ConnectionState.Connecting,
    isConnected: connectionState === ConnectionState.Connected,
    error,
    room,
    roomName,
    participants,
    localParticipant,
    toggleCamera,
    toggleMicrophone,
    toggleScreenShare,
    isCameraEnabled,
    isMicrophoneEnabled,
    isScreenShareEnabled,
    canPublish,
    canSubscribe,
  };
}

// Hook for local preview (before connecting)
export function useLocalPreview() {
  const [videoTrack, setVideoTrack] = useState<Track | null>(null);
  const [audioTrack, setAudioTrack] = useState<Track | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startPreview = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const tracks = await createLocalTracks({
        audio: true,
        video: {
          resolution: VideoPresets.h720.resolution,
        },
      });

      for (const track of tracks) {
        if (track.kind === Track.Kind.Video) {
          setVideoTrack(track);
        } else if (track.kind === Track.Kind.Audio) {
          setAudioTrack(track);
        }
      }
    } catch (err) {
      console.error("Error creating local tracks:", err);
      setError("Não foi possível acessar câmera/microfone");
      toast.error("Erro ao acessar dispositivos de mídia");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stopPreview = useCallback(() => {
    if (videoTrack) {
      videoTrack.stop();
      setVideoTrack(null);
    }
    if (audioTrack) {
      audioTrack.stop();
      setAudioTrack(null);
    }
  }, [videoTrack, audioTrack]);

  useEffect(() => {
    return () => {
      if (videoTrack) videoTrack.stop();
      if (audioTrack) audioTrack.stop();
    };
  }, []);

  return {
    videoTrack,
    audioTrack,
    startPreview,
    stopPreview,
    isLoading,
    error,
  };
}
