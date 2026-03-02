import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useLiveBroadcasts } from '@/hooks/useBroadcast';
import { useTVConfig } from '@/hooks/useBroadcastConfig';

export function LiveFloatingPopup() {
  const { data: liveBroadcasts } = useLiveBroadcasts();
  const tvConfig = useTVConfig();
  const [dismissed, setDismissed] = useState(false);

  // Pick first live TV broadcast
  const liveBroadcast = liveBroadcasts?.find(b => b.channel?.type === 'tv') || liveBroadcasts?.[0];

  const storageKey = liveBroadcast ? `live-popup-closed-${liveBroadcast.id}` : null;

  useEffect(() => {
    if (storageKey && sessionStorage.getItem(storageKey)) {
      setDismissed(true);
    }
  }, [storageKey]);

  if (!liveBroadcast || dismissed) return null;

  const handleClose = () => {
    setDismissed(true);
    if (storageKey) {
      sessionStorage.setItem(storageKey, '1');
    }
  };

  // Build embed URL - use TV config or construct from YouTube
  const embedUrl = tvConfig.embed_url
    ? `${tvConfig.embed_url}${tvConfig.embed_url.includes('?') ? '&' : '?'}autoplay=1&mute=1`
    : null;

  if (!embedUrl) return null;

  return (
    <div 
      className="fixed right-5 bottom-5 z-[9999] w-[340px] max-w-[90vw] md:right-5 md:bottom-5"
      role="complementary"
      aria-label="Transmissão ao vivo"
    >
      <div className="bg-[#0d0d0d] rounded-xl overflow-hidden shadow-2xl relative">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-black/60 text-white/80 hover:text-white flex items-center justify-center transition-colors"
          aria-label="Fechar player ao vivo"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-2 bg-black/85 text-white">
          <span className="bg-red-600 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider animate-pulse">
            Ao Vivo
          </span>
          <span className="text-xs font-semibold truncate">
            {liveBroadcast.title || tvConfig.title}
          </span>
        </div>

        {/* Video Embed */}
        <div className="aspect-video">
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="autoplay; encrypted-media"
            allowFullScreen
            title="Transmissão ao vivo"
          />
        </div>
      </div>
    </div>
  );
}
