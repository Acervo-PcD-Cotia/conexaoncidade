import { useState } from 'react';
import { Download, Headphones, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NewsAudioPlayer } from './NewsAudioPlayer';
import { WebSpeechPlayer } from './WebSpeechPlayer';
import { NewsTranscriptAccordion } from './NewsTranscriptAccordion';
import { cn } from '@/lib/utils';

interface NewsAudioBlockProps {
  newsId: string;
  audioUrl?: string | null;
  audioStatus?: string | null;
  audioDuration?: number | null;
  transcriptText?: string | null;
  contentHtml?: string | null;
  spotifyUrl?: string | null;
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
  className,
}: NewsAudioBlockProps) {
  const [showTranscript, setShowTranscript] = useState(false);

  // Determine audio state
  const isReady = audioStatus === 'ready' && audioUrl;
  const isGenerating = audioStatus === 'generating';
  const hasFailed = audioStatus === 'failed';
  const notGenerated = !audioStatus || audioStatus === 'not_generated';

  // Use transcript if available, otherwise clean content
  const transcript = transcriptText || contentHtml;

  // Show fallback (Web Speech) when audio is not ready
  const showFallback = !isReady && !isGenerating;

  return (
    <section 
      className={cn(
        "bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 rounded-xl p-5 border border-primary/20",
        className
      )}
      aria-label="Versão em áudio"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Headphones className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Versão em Áudio</h3>
          <p className="text-xs text-muted-foreground">Ouça esta notícia</p>
        </div>
      </div>

      {/* Audio Player - Ready State */}
      {isReady && (
        <div className="space-y-3">
          <NewsAudioPlayer
            audioUrl={audioUrl}
            duration={audioDuration || 0}
            newsId={newsId}
            spotifyUrl={spotifyUrl}
          />

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Download Button */}
            <Button
              variant="ghost"
              size="sm"
              className="text-xs gap-1.5"
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
                className="text-xs gap-1.5 text-green-600 hover:text-green-700"
                asChild
              >
                <a href={spotifyUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Ouvir no Spotify
                </a>
              </Button>
            )}
          </div>

          {/* Transcript */}
          {transcript && (
            <NewsTranscriptAccordion transcript={transcript} />
          )}
        </div>
      )}

      {/* Generating State */}
      {isGenerating && (
        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <div>
            <p className="font-medium text-sm">Gerando áudio...</p>
            <p className="text-xs text-muted-foreground">
              O áudio desta notícia está sendo processado. Enquanto isso, você pode usar o leitor do navegador.
            </p>
          </div>
        </div>
      )}

      {/* Failed State */}
      {hasFailed && (
        <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20 mb-3">
          <p className="text-sm text-destructive">
            Não foi possível gerar o áudio desta notícia. Use o leitor do navegador como alternativa.
          </p>
        </div>
      )}

      {/* Fallback: Web Speech API */}
      {showFallback && contentHtml && (
        <div className="space-y-3">
          {notGenerated && (
            <p className="text-xs text-muted-foreground mb-2">
              Áudio profissional não disponível. Use o leitor do navegador:
            </p>
          )}
          <WebSpeechPlayer text={contentHtml} />
          
          {/* Transcript */}
          {transcript && (
            <NewsTranscriptAccordion transcript={transcript} className="mt-3" />
          )}
        </div>
      )}
    </section>
  );
}
