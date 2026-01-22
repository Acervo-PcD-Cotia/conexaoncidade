import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink } from "lucide-react";

interface ReplayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  recordingUrl: string;
  thumbnailUrl?: string | null;
}

export function ReplayModal({ 
  open, 
  onOpenChange, 
  title, 
  recordingUrl,
  thumbnailUrl 
}: ReplayModalProps) {
  const isYoutube = recordingUrl.includes("youtube.com") || recordingUrl.includes("youtu.be");
  const isAudio = recordingUrl.match(/\.(mp3|wav|ogg|m4a)$/i);

  const getYoutubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&?/]+)/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="pr-8">{title}</DialogTitle>
        </DialogHeader>
        
        <div className="p-4 pt-2">
          {isYoutube ? (
            <div className="aspect-video w-full">
              <iframe
                src={getYoutubeEmbedUrl(recordingUrl)}
                className="w-full h-full rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : isAudio ? (
            <div className="flex flex-col items-center gap-4 py-8">
              {thumbnailUrl && (
                <img 
                  src={thumbnailUrl} 
                  alt={title} 
                  className="w-48 h-48 object-cover rounded-lg shadow-lg"
                />
              )}
              <audio
                src={recordingUrl}
                controls
                autoPlay
                className="w-full max-w-md"
              />
            </div>
          ) : (
            <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
              <video
                src={recordingUrl}
                controls
                autoPlay
                className="w-full h-full"
                poster={thumbnailUrl || undefined}
              />
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" size="sm" asChild>
              <a href={recordingUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Abrir em nova aba
              </a>
            </Button>
            {!isYoutube && (
              <Button variant="outline" size="sm" asChild>
                <a href={recordingUrl} download>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </a>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
