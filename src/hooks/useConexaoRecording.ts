import { useState, useCallback, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);

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

  // Start recording mutation
  const startMutation = useMutation({
    mutationFn: async (type: RecordingType) => {
      setStatus("starting");
      setRecordingType(type);
      
      const response = await supabase.functions.invoke("conexao-recording-start", {
        body: { 
          session_id: sessionId,
          type,
        },
      });
      
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: (data) => {
      setEgressId(data.egress_id);
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
      if (!egressId) throw new Error("No active recording");
      
      setStatus("stopping");
      
      const response = await supabase.functions.invoke("conexao-recording-stop", {
        body: { 
          session_id: sessionId,
          egress_id: egressId,
        },
      });
      
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: (data) => {
      setStatus("completed");
      setRecordingUrl(data.recording_url);
      setEgressId(null);
      toast.success("Gravação finalizada");
      onRecordingStop?.(data.recording_url);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["conexao-session", sessionId] });
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
    if (recordingType === "local" && status === "recording") {
      setIsPaused(true);
      // Would pause MediaRecorder here
      toast.info("Gravação pausada");
    }
  }, [recordingType, status]);

  const resumeRecording = useCallback(() => {
    if (recordingType === "local" && isPaused) {
      setIsPaused(false);
      // Would resume MediaRecorder here
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

  return {
    // State
    status,
    isRecording: status === "recording",
    isPaused,
    isStarting: startMutation.isPending,
    isStopping: stopMutation.isPending,
    
    // Recording info
    recordingType,
    duration,
    formattedDuration,
    egressId,
    recordingUrl,
    
    // Actions
    startRecording: (type: RecordingType = "cloud") => startMutation.mutate(type),
    stopRecording: () => stopMutation.mutate(),
    pauseRecording,
    resumeRecording,
    
    // Reset state
    reset: useCallback(() => {
      setStatus("idle");
      setDuration(0);
      setEgressId(null);
      setRecordingUrl(null);
      setIsPaused(false);
    }, []),
  };
}
