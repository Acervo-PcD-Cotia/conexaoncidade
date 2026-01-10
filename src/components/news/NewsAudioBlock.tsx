import { useState } from 'react';
import { Download, Headphones, Loader2, ExternalLink, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NewsAudioPlayer } from './NewsAudioPlayer';
import { WebSpeechPlayer } from './WebSpeechPlayer';
import { NewsTranscriptAccordion } from './NewsTranscriptAccordion';
import { PodcastPlatformsModal } from './PodcastPlatformsModal';
import { cn } from '@/lib/utils';

interface NewsAudioBlockProps {
  newsId: string;
  audioUrl?: string | null;
  audioStatus?: string | null;
  audioDuration?: number | null;
  transcriptText?: string | null;
  contentHtml?: string | null;
  spotifyUrl?: string | null;
  podcastStatus?: string | null;
  podcastAudioUrl?: string | null;
  className?: string;
}

export function NewsAudioBlock({
  newsId,
  audioUrl,
  audioStatus,
  audioDuration,
  transcriptText,
  contentHtml,
  spotifyUrl,
  podcastStatus,
  podcastAudioUrl,
  className,
}: NewsAudioBlockProps) {
  const [showTranscript, setShowTranscript] = useState(false);
  const [showPodcastModal, setShowPodcastModal] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);

  // Determine audio state
  const isReady = audioStatus === 'ready' && audioUrl;
  const isGenerating = audioStatus === 'generating';
  const hasFailed = audioStatus === 'failed';
  const notGenerated = !audioStatus || audioStatus === 'not_generated';

  // Podcast state
  const isPodcastReady = podcastStatus === 'ready' || podcastStatus === 'published';

  // Use transcript if available, otherwise clean content
  const transcript = transcriptText || contentHtml;

  // Show fallback (Web Speech) when audio is not ready
  const showFallback = !isReady && !isGenerating;

  return (
    <section 
      className={cn("py-4 border-b border-border", className)}
      aria-label="Versão em áudio"
    >
      {/* Estilo Agência Brasil: botões simples inline */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Botão principal de áudio */}
        {isReady && (
          <Button
            variant="ghost"
            size="sm"
            className="text-sm gap-2 text-primary hover:text-primary/80 hover:bg-primary/5 px-0"
            onClick={() => setShowPlayer(!showPlayer)}
          >
            <Headphones className="h-4 w-4" />
            {showPlayer ? 'Ocultar player' : 'Versão em áudio'}
          </Button>
        )}

        {/* Estado gerando */}
        {isGenerating && (
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Gerando áudio...
          </span>
        )}

        {showFallback && contentHtml && (
          <WebSpeechPlayer text={contentHtml} className="!p-2 !bg-transparent !border-0" />
        )}

        {/* Download */}
        {isReady && (
          <Button
            variant="ghost"
            size="sm"
            className="text-sm gap-2 text-muted-foreground hover:text-foreground px-0"
            asChild
          >
            <a href={audioUrl} download target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4" />
              Baixar MP3
            </a>
          </Button>
        )}

        {/* Spotify */}
        {spotifyUrl && (
          <Button
            variant="ghost"
            size="sm"
            className="text-sm gap-2 text-muted-foreground hover:text-foreground px-0"
            asChild
          >
            <a href={spotifyUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              Spotify
            </a>
          </Button>
        )}

        {/* Podcast */}
        {isPodcastReady && (
          <Button
            variant="ghost"
            size="sm"
            className="text-sm gap-2 text-muted-foreground hover:text-foreground px-0"
            onClick={() => setShowPodcastModal(true)}
          >
            <Mic className="h-4 w-4" />
            Podcast
          </Button>
        )}
      </div>

      {/* Player expandido - minimalista */}
      {isReady && showPlayer && (
        <div className="mt-4 p-4 bg-muted/30 rounded-lg">
          <NewsAudioPlayer
            audioUrl={audioUrl}
            duration={audioDuration || 0}
            newsId={newsId}
            spotifyUrl={spotifyUrl}
          />
          
          {/* Transcrição */}
          {transcript && (
            <NewsTranscriptAccordion transcript={transcript} className="mt-4" />
          )}
        </div>
      )}

      {/* Mensagem de erro discreta */}
      {hasFailed && (
        <p className="text-xs text-muted-foreground mt-2">
          Áudio não disponível. Use o leitor do navegador.
        </p>
      )}

      {/* Modal de plataformas */}
      <PodcastPlatformsModal 
        open={showPodcastModal} 
        onOpenChange={setShowPodcastModal} 
      />
    </section>
  );
}
