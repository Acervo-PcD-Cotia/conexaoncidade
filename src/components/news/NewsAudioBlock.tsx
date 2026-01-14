import { useState } from 'react';
import { Download, Headphones, Loader2, ExternalLink, Mic, Volume2, Radio } from 'lucide-react';
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
  onAudioPlay?: () => void;
  onAudioStop?: () => void;
  onPodcastPlay?: () => void;
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
  onAudioPlay,
  onAudioStop,
  onPodcastPlay,
}: NewsAudioBlockProps) {
  const [showPodcastModal, setShowPodcastModal] = useState(false);

  // Determine audio state
  const isReady = audioStatus === 'ready' && audioUrl;
  const isGenerating = audioStatus === 'generating';
  const hasFailed = audioStatus === 'failed';
  const notGenerated = !audioStatus || audioStatus === 'not_generated';

  // Podcast state
  const isPodcastReady = (podcastStatus === 'ready' || podcastStatus === 'published') && podcastAudioUrl;

  // Use transcript if available, otherwise clean content
  const transcript = transcriptText || contentHtml;

  // Show fallback (Web Speech) when audio is not ready
  const showFallback = !isReady && !isGenerating;

  return (
    <div className={cn("space-y-4", className)}>
      {/* =========================================== */}
      {/* 🎧 PLAYER 1: VERSÃO EM ÁUDIO DA MATÉRIA    */}
      {/* =========================================== */}
      <section 
        className="bg-[hsl(217,91%,15%)] rounded-lg p-5 shadow-lg"
        aria-label="Versão em áudio da matéria"
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
          <div className="bg-white/10 rounded-full p-2">
            <Headphones className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">
              Versão em Áudio da Matéria
            </p>
            <p className="text-white/60 text-xs">
              Leitura integral do conteúdo
            </p>
          </div>
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
                onPlay={onAudioPlay}
                onPause={onAudioStop}
              />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2">
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

              {spotifyUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-green-400 hover:text-green-300 hover:bg-white/10 gap-1.5"
                  asChild
                >
                  <a href={spotifyUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3.5 w-3.5" />
                    Spotify
                  </a>
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Generating State */}
        {isGenerating && (
          <div className="flex items-center justify-center gap-3 py-4">
            <Loader2 className="h-5 w-5 animate-spin text-white/70" />
            <p className="text-white/70 text-sm">Gerando áudio profissional...</p>
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
          </div>
        )}
      </section>

      {/* =========================================== */}
      {/* 🎙️ PLAYER 2: PODCAST DA NOTÍCIA            */}
      {/* =========================================== */}
      {isPodcastReady && (
        <section 
          className="bg-gradient-to-br from-[hsl(270,50%,20%)] to-[hsl(300,40%,15%)] rounded-lg p-5 shadow-lg"
          aria-label="Podcast da notícia"
        >
          {/* Header */}
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
            <div className="bg-white/10 rounded-full p-2">
              <Radio className="h-5 w-5 text-purple-300" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">
                Podcast da Notícia
              </p>
              <p className="text-white/60 text-xs">
                Versão comentada e narrativa
              </p>
            </div>
          </div>

          {/* Podcast Player */}
          <div className="space-y-4">
            <div className="audio-player-dark">
              <NewsAudioPlayer
                audioUrl={podcastAudioUrl!}
                duration={audioDuration || 0}
                newsId={newsId}
                spotifyUrl={spotifyUrl}
                onPlay={onPodcastPlay}
              />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-white/70 hover:text-white hover:bg-white/10 gap-1.5"
                asChild
              >
                <a href={podcastAudioUrl!} download target="_blank" rel="noopener noreferrer">
                  <Download className="h-3.5 w-3.5" />
                  Baixar Podcast
                </a>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-purple-300 hover:text-purple-200 hover:bg-white/10 gap-1.5"
                onClick={() => setShowPodcastModal(true)}
              >
                <Mic className="h-3.5 w-3.5" />
                Plataformas
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Transcript (shared) */}
      {transcript && (isReady || isPodcastReady) && (
        <section className="bg-muted/50 rounded-lg p-4">
          <NewsTranscriptAccordion transcript={transcript} />
        </section>
      )}

      {/* Podcast Platforms Modal */}
      <PodcastPlatformsModal 
        open={showPodcastModal} 
        onOpenChange={setShowPodcastModal} 
      />
    </div>
  );
}
