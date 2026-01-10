import { ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Platform {
  name: string;
  icon: string;
  urlKey: keyof PlatformUrls;
  color: string;
}

interface PlatformUrls {
  spotify_url?: string | null;
  apple_url?: string | null;
  google_url?: string | null;
  deezer_url?: string | null;
  amazon_url?: string | null;
}

const platforms: Platform[] = [
  { name: "Spotify", icon: "🟢", urlKey: "spotify_url", color: "hover:bg-green-500/10" },
  { name: "Apple Podcasts", icon: "🍎", urlKey: "apple_url", color: "hover:bg-purple-500/10" },
  { name: "YouTube Music", icon: "▶️", urlKey: "google_url", color: "hover:bg-red-500/10" },
  { name: "Deezer", icon: "🎵", urlKey: "deezer_url", color: "hover:bg-orange-500/10" },
  { name: "Amazon Music", icon: "📦", urlKey: "amazon_url", color: "hover:bg-blue-500/10" },
];

interface PodcastPlatformsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PodcastPlatformsModal({ open, onOpenChange }: PodcastPlatformsModalProps) {
  const { data: feed } = useQuery({
    queryKey: ["podcast-feed-platforms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("podcast_feeds")
        .select("spotify_url, apple_url, google_url, deezer_url, amazon_url")
        .eq("feed_type", "portal")
        .eq("is_active", true)
        .single();

      if (error) return null;
      return data as PlatformUrls;
    },
  });

  const availablePlatforms = platforms.filter(
    (p) => feed && feed[p.urlKey]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🎙️ Ouça nas plataformas de áudio
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-2 py-4">
          {availablePlatforms.length > 0 ? (
            availablePlatforms.map((platform) => (
              <Button
                key={platform.name}
                variant="outline"
                className={`justify-start gap-3 h-12 ${platform.color}`}
                asChild
              >
                <a
                  href={feed?.[platform.urlKey] || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="text-xl">{platform.icon}</span>
                  <span className="flex-1 text-left">{platform.name}</span>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>
              </Button>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-4">
              Nenhuma plataforma configurada ainda.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
