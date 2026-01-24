import { useState, useCallback, useEffect, useRef } from "react";

export interface UseAudioLevelOptions {
  deviceId?: string | null;
  fftSize?: number;
  smoothingTimeConstant?: number;
}

export interface UseAudioLevelReturn {
  level: number;
  peakLevel: number;
  isCapturing: boolean;
  error: string | null;
  startCapture: () => Promise<void>;
  stopCapture: () => void;
}

export function useAudioLevel(options: UseAudioLevelOptions = {}): UseAudioLevelReturn {
  const { deviceId, fftSize = 256, smoothingTimeConstant = 0.8 } = options;
  
  const [level, setLevel] = useState(0);
  const [peakLevel, setPeakLevel] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const peakDecayRef = useRef<number>(0);

  const stopCapture = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    analyserRef.current = null;
    setIsCapturing(false);
    setLevel(0);
    setPeakLevel(0);
  }, []);

  const startCapture = useCallback(async () => {
    stopCapture();
    setError(null);
    
    try {
      const constraints: MediaStreamConstraints = {
        audio: deviceId ? { deviceId: { exact: deviceId } } : true,
        video: false,
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = fftSize;
      analyser.smoothingTimeConstant = smoothingTimeConstant;
      analyserRef.current = analyser;
      
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      setIsCapturing(true);
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const updateLevel = () => {
        if (!analyserRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i] * dataArray[i];
        }
        const rms = Math.sqrt(sum / dataArray.length);
        const normalizedLevel = Math.min(100, (rms / 128) * 100);
        setLevel(normalizedLevel);
        
        if (normalizedLevel > peakDecayRef.current) {
          peakDecayRef.current = normalizedLevel;
          setPeakLevel(normalizedLevel);
        } else {
          peakDecayRef.current = Math.max(0, peakDecayRef.current - 0.5);
          setPeakLevel(peakDecayRef.current);
        }
        
        animationRef.current = requestAnimationFrame(updateLevel);
      };
      
      updateLevel();
    } catch (err) {
      console.error("Error starting audio capture:", err);
      setError("Não foi possível capturar áudio");
      setIsCapturing(false);
    }
  }, [deviceId, fftSize, smoothingTimeConstant, stopCapture]);

  useEffect(() => {
    return () => {
      stopCapture();
    };
  }, [stopCapture]);

  return {
    level,
    peakLevel,
    isCapturing,
    error,
    startCapture,
    stopCapture,
  };
}
