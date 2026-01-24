import { useState, useCallback, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type RecordingType = "cloud" | "local" | "separate";
export type RecordingStatus = "idle" | "starting" | "recording" | "paused" | "stopping" | "completed" | "error";

export interface RecordingInfo {
  egressId: string;
  type: RecordingType;
  startedAt: Date;
  duration: number;
  fileSize?: number;
  url?: string;
}

export interface UseConexaoRecordingOptions {
  sessionId: string;
  onRecordingStart?: () => void;
  onRecordingStop?: (url: string) => void;
  onError?: (error: string) => void;
}

export function useConexaoRecording(options: UseConexaoRecordingOptions) {
  const { sessionId, onRecordingStart, onRecordingStop, onError } = options;
  const queryClient = useQueryClient();
  
  const [status, setStatus] = useState<RecordingStatus>("idle");
  const [recordingType, setRecordingType] = useState<RecordingType>("cloud");
  const [duration, setDuration] = useState(0);
  const [egressId, setEgressId] = useState<string | null>(null);
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  
  // Local recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Check if cloud recording is available
  const { data: capabilities, isLoading: isCheckingCapabilities } = useQuery({
    queryKey: ["recording-capabilities"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("conexao-recording-check");
      if (error) throw error;
      return data as {
        cloud_available: boolean;
        local_available: boolean;
        livekit_configured: boolean;
        s3_configured: boolean;
        message: string;
      };
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 1,
  });

  const supportsCloudRecording = capabilities?.cloud_available ?? false;

  // Duration timer
  useEffect(() => {
    if (status === "recording") {
      startTimeRef.current = new Date();
      timerRef.current = setInterval(() => {
        if (startTimeRef.current) {
          setDuration(Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000));
        }
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [status]);

  // Start local recording with MediaRecorder
  const startLocalRecording = useCallback(async () => {
    try {
      // Get all audio and video tracks from the page
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      const recorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9,opus",
      });

      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        
        // Auto-download the file
        const a = document.createElement("a");
        a.href = url;
        a.download = `recording_${sessionId}_${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        setRecordingUrl(url);
        onRecordingStop?.(url);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start(1000); // Collect data every second
      mediaRecorderRef.current = recorder;

      return { success: true, egress_id: `local_${Date.now()}` };
    } catch (error) {
      console.error("[LocalRecording] Error:", error);
      throw error;
    }
  }, [sessionId, onRecordingStop]);

  // Stop local recording
  const stopLocalRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
  }, []);

  // Start recording mutation
  const startMutation = useMutation({
    mutationFn: async (type: RecordingType) => {
      setStatus("starting");
      
      // Auto-fallback to local if cloud not available
      let effectiveType = type;
      if (type === "cloud" && !supportsCloudRecording) {
        console.log("[Recording] Cloud not available, falling back to local");
        toast.info("Gravação cloud não disponível. Usando gravação local.");
        effectiveType = "local";
      }
      
      setRecordingType(effectiveType);

      // For local recording, handle in browser
      if (effectiveType === "local") {
        return await startLocalRecording();
      }
      
      // For cloud recording, call edge function
      const response = await supabase.functions.invoke("conexao-recording-start", {
        body: { 
          session_id: sessionId,
          type: effectiveType,
        },
      });
      
      if (response.error) throw new Error(response.error.message);
      
      // Check if server suggests local recording
      if (response.data?.suggestion === "local") {
        toast.info("S3 não configurado. Usando gravação local.");
        setRecordingType("local");
        return await startLocalRecording();
      }
      
      return response.data;
    },
    onSuccess: (data) => {
      setEgressId(data.egress_id);
      setRecordingId(data.recording_id || null);
      setStatus("recording");
      setDuration(0);
      toast.success("Gravação iniciada");
      onRecordingStart?.();
    },
    onError: (error) => {
      console.error("[Recording] Start error:", error);
      setStatus("error");
      toast.error("Erro ao iniciar gravação");
      onError?.(error.message);
    },
  });

  // Stop recording mutation
  const stopMutation = useMutation({
    mutationFn: async () => {
      if (!egressId && recordingType !== "local") {
        throw new Error("No active recording");
      }
      
      setStatus("stopping");
      
      // For local recording, just stop MediaRecorder
      if (recordingType === "local") {
        stopLocalRecording();
        return { success: true, recording_url: "", type: "local" };
      }
      
      // For cloud recording, call edge function
      const response = await supabase.functions.invoke("conexao-recording-stop", {
        body: { 
          session_id: sessionId,
          egress_id: egressId,
          recording_id: recordingId,
          type: recordingType,
        },
      });
      
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: (data) => {
      setStatus("completed");
      if (data.recording_url) {
        setRecordingUrl(data.recording_url);
      }
      setEgressId(null);
      setRecordingId(null);
      toast.success("Gravação finalizada");
      if (data.recording_url) {
        onRecordingStop?.(data.recording_url);
      }
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["conexao-session", sessionId] });
      queryClient.invalidateQueries({ queryKey: ["illumina-recordings", sessionId] });
    },
    onError: (error) => {
      console.error("[Recording] Stop error:", error);
      setStatus("error");
      toast.error("Erro ao parar gravação");
      onError?.(error.message);
    },
  });

  // Pause/Resume (only for local recording with MediaRecorder)
  const [isPaused, setIsPaused] = useState(false);

  const pauseRecording = useCallback(() => {
    if (recordingType === "local" && status === "recording" && mediaRecorderRef.current) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      toast.info("Gravação pausada");
    }
  }, [recordingType, status]);

  const resumeRecording = useCallback(() => {
    if (recordingType === "local" && isPaused && mediaRecorderRef.current) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      toast.info("Gravação retomada");
    }
  }, [recordingType, isPaused]);

  // Format duration as MM:SS or HH:MM:SS
  const formattedDuration = (() => {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  })();

  // Start recording with optional type override
  const startRecording = useCallback((type: RecordingType = "cloud") => {
    // If cloud is requested but not available, the mutation will handle fallback
    startMutation.mutate(type);
  }, [startMutation]);

  return {
    // State
    status,
    isRecording: status === "recording",
    isPaused,
    isStarting: startMutation.isPending,
    isStopping: stopMutation.isPending,
    isCheckingCapabilities,
    
    // Capabilities
    supportsCloudRecording,
    supportsLocalRecording: capabilities?.local_available ?? true,
    
    // Recording info
    recordingType,
    duration,
    formattedDuration,
    egressId,
    recordingId,
    recordingUrl,
    
    // Actions
    startRecording,
    stopRecording: () => stopMutation.mutate(),
    pauseRecording,
    resumeRecording,
    
    // Reset state
    reset: useCallback(() => {
      setStatus("idle");
      setDuration(0);
      setEgressId(null);
      setRecordingId(null);
      setRecordingUrl(null);
      setIsPaused(false);
      stopLocalRecording();
    }, [stopLocalRecording]),
  };
}
