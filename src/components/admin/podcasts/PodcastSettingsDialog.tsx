import { useState, useEffect } from "react";
import { Settings, Save, Loader2, Copy, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePodcastFeeds, useUpdatePodcastSettings } from "@/hooks/usePodcasts";
import { toast } from "sonner";

interface PodcastSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PodcastSettingsDialog({ open, onOpenChange }: PodcastSettingsDialogProps) {
  const { data: feeds } = usePodcastFeeds();
  const updateMutation = useUpdatePodcastSettings();

  const [formData, setFormData] = useState({
    spotify_url: "",
    apple_url: "",
    google_url: "",
    deezer_url: "",
    amazon_url: "",
  });

  const portalFeed = feeds?.find((f) => f.feed_type === "portal");
  const feedUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-podcast-feed`;

  useEffect(() => {
    if (portalFeed) {
      setFormData({
        spotify_url: portalFeed.spotify_url || "",
        apple_url: portalFeed.apple_url || "",
        google_url: portalFeed.google_url || "",
        deezer_url: portalFeed.deezer_url || "",
        amazon_url: portalFeed.amazon_url || "",
      });
    }
  }, [portalFeed]);

  const handleSave = () => {
    updateMutation.mutate(formData, {
      onSuccess: () => onOpenChange(false),
    });
  };

  const handleCopyFeedUrl = () => {
    navigator.clipboard.writeText(feedUrl);
    toast.success("URL do feed copiada!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações de Podcast
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* RSS Feed URL */}
          <div className="rounded-lg border p-4 bg-muted/30">
            <Label className="text-sm font-medium">Feed RSS</Label>
            <div className="flex gap-2 mt-2">
              <Input value={feedUrl} readOnly className="font-mono text-xs" />
              <Button variant="outline" size="icon" onClick={handleCopyFeedUrl}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" asChild>
                <a href={feedUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Use este feed para cadastrar nas plataformas de podcast
            </p>
          </div>

          {/* Platform URLs */}
          <div className="space-y-4">
            <h4 className="font-medium">Plataformas de Distribuição</h4>

            <div className="space-y-3">
              <div>
                <Label className="flex items-center gap-2">
                  <span className="text-lg">🟢</span> Spotify
                </Label>
                <Input
                  value={formData.spotify_url}
                  onChange={(e) => setFormData((p) => ({ ...p, spotify_url: e.target.value }))}
                  placeholder="https://open.spotify.com/show/..."
                />
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  <span className="text-lg">🍎</span> Apple Podcasts
                </Label>
                <Input
                  value={formData.apple_url}
                  onChange={(e) => setFormData((p) => ({ ...p, apple_url: e.target.value }))}
                  placeholder="https://podcasts.apple.com/..."
                />
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  <span className="text-lg">▶️</span> Google / YouTube Music
                </Label>
                <Input
                  value={formData.google_url}
                  onChange={(e) => setFormData((p) => ({ ...p, google_url: e.target.value }))}
                  placeholder="https://music.youtube.com/..."
                />
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  <span className="text-lg">🎵</span> Deezer
                </Label>
                <Input
                  value={formData.deezer_url}
                  onChange={(e) => setFormData((p) => ({ ...p, deezer_url: e.target.value }))}
                  placeholder="https://www.deezer.com/show/..."
                />
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  <span className="text-lg">📦</span> Amazon Music
                </Label>
                <Input
                  value={formData.amazon_url}
                  onChange={(e) => setFormData((p) => ({ ...p, amazon_url: e.target.value }))}
                  placeholder="https://music.amazon.com/podcasts/..."
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
