import { useState, useRef, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// SpeechRecognition types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

interface UseAudioTranscriptionOptions {
  broadcastId: string;
  speakerName?: string;
  onTranscript?: (text: string) => void;
}

export function useAudioTranscription({
  broadcastId,
  speakerName,
  onTranscript,
}: UseAudioTranscriptionOptions) {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const isActiveRef = useRef(false);

  // Use browser's SpeechRecognition API for real-time transcription
  const startTranscription = useCallback(async () => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) {
      setError("Reconhecimento de voz não suportado neste navegador");
      return;
    }

    try {
      const recognition = new SpeechRecognitionAPI();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "pt-BR";

      recognition.onstart = () => {
        console.log("Speech recognition started");
        setIsTranscribing(true);
        setError(null);
      };

      recognition.onresult = async (event: SpeechRecognitionEvent) => {
        const lastResult = event.results[event.results.length - 1];
        const transcript = lastResult[0].transcript;
        const isFinal = lastResult.isFinal;

        // Only send final results to avoid duplicates
        if (isFinal && transcript.trim()) {
          onTranscript?.(transcript);
          
          // Send to edge function for storage
          try {
            await supabase.functions.invoke("broadcast-transcribe", {
              body: {
                broadcastId,
                audioText: transcript,
                speakerName,
                isFinal: true,
              },
            });
          } catch (err) {
            console.error("Error sending transcript:", err);
          }
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
          setError("Permissão de microfone negada");
        } else if (event.error !== "aborted") {
          setError(`Erro: ${event.error}`);
        }
      };

      recognition.onend = () => {
        console.log("Speech recognition ended");
        // Restart if still active
        if (isActiveRef.current && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch {
            // Already started
          }
        } else {
          setIsTranscribing(false);
        }
      };

      recognitionRef.current = recognition;
      isActiveRef.current = true;
      recognition.start();
    } catch (err) {
      console.error("Error starting transcription:", err);
      setError("Erro ao iniciar transcrição");
    }
  }, [broadcastId, speakerName, onTranscript]);

  const stopTranscription = useCallback(() => {
    isActiveRef.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsTranscribing(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTranscription();
    };
  }, [stopTranscription]);

  return {
    isTranscribing,
    error,
    startTranscription,
    stopTranscription,
  };
}