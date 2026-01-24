import { useState, useCallback, useEffect } from "react";

export interface MediaDevice {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
}

export interface UseDeviceSelectorReturn {
  // Available devices
  videoDevices: MediaDevice[];
  audioInputDevices: MediaDevice[];
  audioOutputDevices: MediaDevice[];
  
  // Selected devices
  selectedVideoDevice: string | null;
  selectedAudioInputDevice: string | null;
  selectedAudioOutputDevice: string | null;
  
  // Selection functions
  setSelectedVideoDevice: (deviceId: string) => void;
  setSelectedAudioInputDevice: (deviceId: string) => void;
  setSelectedAudioOutputDevice: (deviceId: string) => void;
  
  // State
  isLoading: boolean;
  error: string | null;
  hasPermissions: boolean;
  
  // Actions
  refreshDevices: () => Promise<void>;
  requestPermissions: () => Promise<boolean>;
}

export function useDeviceSelector(): UseDeviceSelectorReturn {
  const [videoDevices, setVideoDevices] = useState<MediaDevice[]>([]);
  const [audioInputDevices, setAudioInputDevices] = useState<MediaDevice[]>([]);
  const [audioOutputDevices, setAudioOutputDevices] = useState<MediaDevice[]>([]);
  
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string | null>(null);
  const [selectedAudioInputDevice, setSelectedAudioInputDevice] = useState<string | null>(null);
  const [selectedAudioOutputDevice, setSelectedAudioOutputDevice] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasPermissions, setHasPermissions] = useState(false);

  const mapDevice = (device: MediaDeviceInfo): MediaDevice => ({
    deviceId: device.deviceId,
    label: device.label || `${device.kind} (${device.deviceId.slice(0, 8)}...)`,
    kind: device.kind,
  });

  const refreshDevices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      const video = devices.filter(d => d.kind === "videoinput").map(mapDevice);
      const audioIn = devices.filter(d => d.kind === "audioinput").map(mapDevice);
      const audioOut = devices.filter(d => d.kind === "audiooutput").map(mapDevice);
      
      setVideoDevices(video);
      setAudioInputDevices(audioIn);
      setAudioOutputDevices(audioOut);
      
      // Auto-select first device if none selected
      if (!selectedVideoDevice && video.length > 0) {
        setSelectedVideoDevice(video[0].deviceId);
      }
      if (!selectedAudioInputDevice && audioIn.length > 0) {
        setSelectedAudioInputDevice(audioIn[0].deviceId);
      }
      if (!selectedAudioOutputDevice && audioOut.length > 0) {
        setSelectedAudioOutputDevice(audioOut[0].deviceId);
      }
      
      // Check if we have labels (indicates permission was granted)
      const hasLabels = devices.some(d => d.label);
      setHasPermissions(hasLabels);
    } catch (err) {
      console.error("Error enumerating devices:", err);
      setError("Não foi possível listar dispositivos de mídia");
    } finally {
      setIsLoading(false);
    }
  }, [selectedVideoDevice, selectedAudioInputDevice, selectedAudioOutputDevice]);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      
      // Stop all tracks after getting permission
      stream.getTracks().forEach(track => track.stop());
      
      setHasPermissions(true);
      await refreshDevices();
      return true;
    } catch (err) {
      console.error("Error requesting media permissions:", err);
      setError("Permissão de câmera/microfone negada");
      setHasPermissions(false);
      return false;
    }
  }, [refreshDevices]);

  // Listen for device changes
  useEffect(() => {
    navigator.mediaDevices.addEventListener("devicechange", refreshDevices);
    return () => {
      navigator.mediaDevices.removeEventListener("devicechange", refreshDevices);
    };
  }, [refreshDevices]);

  // Initial load
  useEffect(() => {
    refreshDevices();
  }, []);

  return {
    videoDevices,
    audioInputDevices,
    audioOutputDevices,
    selectedVideoDevice,
    selectedAudioInputDevice,
    selectedAudioOutputDevice,
    setSelectedVideoDevice,
    setSelectedAudioInputDevice,
    setSelectedAudioOutputDevice,
    isLoading,
    error,
    hasPermissions,
    refreshDevices,
    requestPermissions,
  };
}
