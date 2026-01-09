import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface WebSpeechPlayerProps {
  text: string;
  className?: string;
}

const PLAYBACK_RATES = [0.8, 1, 1.2, 1.5];

export function WebSpeechPlayer({ text, className }: WebSpeechPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
    }
  }, []);

  const cleanTextForSpeech = useCallback((html: string) => {
    // Remove HTML tags
    const temp = document.createElement('div');
    temp.innerHTML = html;
    let cleanText = temp.textContent || temp.innerText || '';
    
    // Improve reading flow
    cleanText = cleanText
      .replace(/\s+/g, ' ')
      .replace(/\.\s+/g, '. ')
      .trim();
    
    return cleanText;
  }, []);

  const speak = useCallback(() => {
    if (!isSupported) return;

    const synth = window.speechSynthesis;
    
    // If paused, resume
    if (isPaused) {
      synth.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    // Cancel any ongoing speech
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanTextForSpeech(text));
    utterance.lang = 'pt-BR';
    utterance.rate = rate;
    utterance.volume = isMuted ? 0 : volume;

    // Get Portuguese voice if available
    const voices = synth.getVoices();
    const ptVoice = voices.find(
      (v) => v.lang.startsWith('pt-BR') || v.lang.startsWith('pt')
    );
    if (ptVoice) {
      utterance.voice = ptVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    synth.speak(utterance);
  }, [text, rate, volume, isMuted, isPaused, isSupported, cleanTextForSpeech]);

  const pause = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  }, [isSupported]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  }, [isSupported]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      speak();
    }
  }, [isPlaying, pause, speak]);

  const handleRateChange = useCallback(() => {
    const currentIndex = PLAYBACK_RATES.indexOf(rate);
    const nextIndex = (currentIndex + 1) % PLAYBACK_RATES.length;
    setRate(PLAYBACK_RATES[nextIndex]);
  }, [rate]);

  const handleVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
  }, [isMuted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!isSupported) {
    return null;
  }

  return (
    <div className={cn(
      "flex items-center gap-3 p-3 bg-muted/50 rounded-lg border",
      className
    )}>
      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10 shrink-0"
        onClick={togglePlay}
        aria-label={isPlaying ? 'Pausar leitura' : isPaused ? 'Continuar leitura' : 'Iniciar leitura'}
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4 ml-0.5" />
        )}
      </Button>

      {(isPlaying || isPaused) && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={stop}
          aria-label="Parar leitura"
        >
          <Square className="h-3 w-3" />
        </Button>
      )}

      <span className="text-sm text-muted-foreground">
        {isPlaying ? 'Reproduzindo...' : isPaused ? 'Pausado' : 'Ouvir pelo navegador'}
      </span>

      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={handleRateChange}
          className="px-2 py-0.5 text-xs rounded bg-background hover:bg-muted font-medium transition-colors"
          aria-label={`Velocidade: ${rate}x. Clique para alterar`}
        >
          {rate}x
        </button>

        <button 
          onClick={toggleMute} 
          className="p-1 hover:bg-background rounded"
          aria-label={isMuted ? 'Ativar som' : 'Silenciar'}
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Volume2 className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        <Slider
          value={[isMuted ? 0 : volume]}
          max={1}
          step={0.1}
          onValueChange={handleVolumeChange}
          className="w-16"
          aria-label="Volume"
        />
      </div>
    </div>
  );
}
