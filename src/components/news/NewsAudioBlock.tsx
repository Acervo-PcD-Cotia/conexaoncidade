import { useState } from 'react';
import { Download, Headphones, Loader2, ExternalLink, Mic, Volume2 } from 'lucide-react';
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
  const [showPodcastModal, setShowPodcastModal] = useState(false);

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
      className={cn(
        "bg-[hsl(217,91%,15%)] rounded-none p-6",
        className
      )}
      aria-label="Versão em áudio"
    >
      {/* Header - Centered label */}
      <div className="text-center mb-4">
        <p className="text-white/90 text-sm font-medium tracking-wide uppercase flex items-center justify-center gap-2">
          <Volume2 className="h-4 w-4" />
          Versão em áudio
        </p>
      </div>

      {/* Audio Player - Ready State */}
      {isReady && (
        <div className="space-y-4">
          <div className="audio-player-dark">
            <NewsAudioPlayer
              audioUrl={audioUrl}
              duration={audioDuration || 0}
              newsId={newsId}
              spotifyUrl={spotifyUrl}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* Download Button */}
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-white/70 hover:text-white hover:bg-white/10 gap-1.5"
              asChild
            >
              <a href={audioUrl} download target="_blank" rel="noopener noreferrer">
                <Download className="h-3.5 w-3.5" />
                Baixar MP3
              </a>
            </Button>

            {/* Spotify Link */}
            {spotifyUrl && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-green-400 hover:text-green-300 hover:bg-white/10 gap-1.5"
                asChild
              >
                <a href={spotifyUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Ouvir no Spotify
                </a>
              </Button>
            )}

            {/* Podcast Button */}
            {isPodcastReady && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-white/70 hover:text-white hover:bg-white/10 gap-1.5"
                onClick={() => setShowPodcastModal(true)}
              >
                <Mic className="h-3.5 w-3.5" />
                Podcast
              </Button>
            )}
          </div>

          {/* Transcript */}
          {transcript && (
            <div className="transcript-dark">
              <NewsTranscriptAccordion transcript={transcript} />
            </div>
          )}
        </div>
      )}

      {/* Generating State */}
      {isGenerating && (
        <div className="flex items-center justify-center gap-3 py-4">
          <Loader2 className="h-5 w-5 animate-spin text-white/70" />
          <p className="text-white/70 text-sm">Gerando áudio...</p>
        </div>
      )}

      {/* Failed State */}
      {hasFailed && (
        <div className="text-center py-2 mb-3">
          <p className="text-sm text-red-300/80">
            Não foi possível gerar o áudio. Use o leitor do navegador.
          </p>
        </div>
      )}

      {/* Fallback: Web Speech API */}
      {showFallback && contentHtml && (
        <div className="space-y-3">
          {notGenerated && (
            <p className="text-xs text-white/50 text-center mb-2">
              Áudio profissional em preparação. Use o leitor do navegador:
            </p>
          )}
          <div className="webspeech-dark">
            <WebSpeechPlayer text={contentHtml} />
          </div>
          
          {/* Transcript */}
          {transcript && (
            <div className="transcript-dark">
              <NewsTranscriptAccordion transcript={transcript} className="mt-3" />
            </div>
          )}
        </div>
      )}

      {/* Podcast Platforms Modal */}
      <PodcastPlatformsModal 
        open={showPodcastModal} 
        onOpenChange={setShowPodcastModal} 
      />
    </section>
  );
}
