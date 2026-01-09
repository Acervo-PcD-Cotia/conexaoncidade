import { useState } from 'react';
import { ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NewsTranscriptAccordionProps {
  transcript: string;
  className?: string;
}

export function NewsTranscriptAccordion({ 
  transcript, 
  className 
}: NewsTranscriptAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!transcript) return null;

  // Clean HTML tags if present
  const cleanTranscript = transcript.replace(/<[^>]*>/g, '').trim();

  if (!cleanTranscript) return null;

  return (
    <div className={cn("border border-border rounded-lg overflow-hidden", className)}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 transition-colors"
        aria-expanded={isExpanded}
        aria-controls="transcript-content"
      >
        <div className="flex items-center gap-2 text-sm">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Ver transcrição</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      <div 
        id="transcript-content"
        className={cn(
          "overflow-hidden transition-all duration-200",
          isExpanded ? "max-h-96" : "max-h-0"
        )}
        role="region"
        aria-label="Transcrição do áudio"
      >
        <div className="p-4 max-h-80 overflow-y-auto bg-background">
          <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
            {cleanTranscript}
          </p>
        </div>
      </div>
    </div>
  );
}
