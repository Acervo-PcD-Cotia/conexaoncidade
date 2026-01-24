import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";

interface RecordingChunk {
  blob: Blob;
  timestamp: number;
}

interface UseLocalRecordingOptions {
  mimeType?: string;
  videoBitsPerSecond?: number;
  audioBitsPerSecond?: number;
  timeslice?: number;
}

interface UseLocalRecordingReturn {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  startRecording: (stream: MediaStream) => void;
  stopRecording: () => Promise<Blob | null>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  downloadRecording: (filename?: string) => void;
  getRecordedBlob: () => Blob | null;
}

export function useLocalRecording(
  options: UseLocalRecordingOptions = {}
): UseLocalRecordingReturn {
  const {
    mimeType = 'video/webm;codecs=vp9,opus',
    videoBitsPerSecond = 5000000, // 5 Mbps
    audioBitsPerSecond = 128000, // 128 kbps
    timeslice = 1000, // Save chunk every second
  } = options;

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<RecordingChunk[]>([]);
  const startTimeRef = useRef<number>(0);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const finalBlobRef = useRef<Blob | null>(null);

  const getSupportedMimeType = useCallback(() => {
    const mimeTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4',
    ];
    
    for (const type of mimeTypes) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    
    return mimeTypes[0]; // Fallback
  }, []);

  const startRecording = useCallback((stream: MediaStream) => {
    if (!stream || stream.getTracks().length === 0) {
      toast.error("Nenhum stream disponível para gravar");
      return;
    }

    // Clear previous recording
    chunksRef.current = [];
    finalBlobRef.current = null;
    
    const actualMimeType = MediaRecorder.isTypeSupported(mimeType) 
      ? mimeType 
      : getSupportedMimeType();

    try {
      const recorder = new MediaRecorder(stream, {
        mimeType: actualMimeType,
        videoBitsPerSecond,
        audioBitsPerSecond,
      });

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push({
            blob: event.data,
            timestamp: Date.now(),
          });
        }
      };

      recorder.onstop = () => {
        // Create final blob
        const blobs = chunksRef.current.map(c => c.blob);
        if (blobs.length > 0) {
          finalBlobRef.current = new Blob(blobs, { type: actualMimeType });
        }
      };

      recorder.onerror = (event) => {
        console.error("[useLocalRecording] Error:", event);
        toast.error("Erro na gravação");
        setIsRecording(false);
      };

      // Start recording with timeslice for periodic data
      recorder.start(timeslice);
      mediaRecorderRef.current = recorder;
      startTimeRef.current = Date.now();
      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);

      // Start duration timer
      durationIntervalRef.current = setInterval(() => {
        if (!isPaused) {
          setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
        }
      }, 1000);

      toast.success("Gravação local iniciada");
    } catch (error) {
      console.error("[useLocalRecording] Start error:", error);
      toast.error("Erro ao iniciar gravação");
    }
  }, [mimeType, videoBitsPerSecond, audioBitsPerSecond, timeslice, getSupportedMimeType, isPaused]);

  const stopRecording = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      
      if (!recorder || recorder.state === 'inactive') {
        resolve(finalBlobRef.current);
        return;
      }

      recorder.onstop = () => {
        // Create final blob
        const blobs = chunksRef.current.map(c => c.blob);
        if (blobs.length > 0) {
          finalBlobRef.current = new Blob(blobs, { type: recorder.mimeType });
        }
        resolve(finalBlobRef.current);
      };

      recorder.stop();
      
      // Clear interval
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      setIsRecording(false);
      setIsPaused(false);
      mediaRecorderRef.current = null;
      
      toast.success("Gravação local finalizada");
    });
  }, []);

  const pauseRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    
    if (recorder && recorder.state === 'recording') {
      recorder.pause();
      setIsPaused(true);
      toast.info("Gravação pausada");
    }
  }, []);

  const resumeRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    
    if (recorder && recorder.state === 'paused') {
      recorder.resume();
      setIsPaused(false);
      toast.info("Gravação retomada");
    }
  }, []);

  const downloadRecording = useCallback((filename?: string) => {
    const blob = finalBlobRef.current;
    
    if (!blob) {
      toast.error("Nenhuma gravação disponível");
      return;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `recording-${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Download iniciado");
  }, []);

  const getRecordedBlob = useCallback(() => {
    return finalBlobRef.current;
  }, []);

  return {
    isRecording,
    isPaused,
    duration,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    downloadRecording,
    getRecordedBlob,
  };
}
