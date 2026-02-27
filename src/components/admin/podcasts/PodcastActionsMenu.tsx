import { MoreHorizontal, Mic, RefreshCw, Upload, History, Copy, Trash2, ExternalLink, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePublishPodcast, useDeletePodcast, PodcastNews } from "@/hooks/usePodcasts";
import { toast } from "sonner";

interface PodcastActionsMenuProps {
  podcast: PodcastNews;
  onViewLogs: () => void;
  onAddPodcast?: () => void;
}

export function PodcastActionsMenu({ podcast, onViewLogs, onAddPodcast }: PodcastActionsMenuProps) {
  const publishMutation = usePublishPodcast();
  const deleteMutation = useDeletePodcast();

  const isGenerating = podcast.podcast_status === "generating";
  const isReady = podcast.podcast_status === "ready";
  const isPublished = podcast.podcast_status === "published";
  const hasAudio = !!podcast.podcast_audio_url;

  const handleCopyLinks = () => {
    if (podcast.podcast_audio_url) {
      navigator.clipboard.writeText(podcast.podcast_audio_url);
      toast.success("Link do áudio copiado!");
    } else {
      toast.error("Podcast ainda não foi gerado");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {/* Add/Replace Podcast - opens the full dialog */}
        <DropdownMenuItem onClick={onAddPodcast}>
          <Plus className="mr-2 h-4 w-4" />
          {hasAudio ? "Substituir Podcast" : "Adicionar Podcast"}
        </DropdownMenuItem>

        {(isReady || hasAudio) && !isPublished && (
          <DropdownMenuItem
            onClick={() => publishMutation.mutate(podcast.id)}
            disabled={publishMutation.isPending}
          >
            <Upload className="mr-2 h-4 w-4" />
            Publicar no RSS
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={onViewLogs}>
          <History className="mr-2 h-4 w-4" />
          Ver Logs
        </DropdownMenuItem>

        {hasAudio && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleCopyLinks}>
              <Copy className="mr-2 h-4 w-4" />
              Copiar Link
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={podcast.podcast_audio_url!} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Ouvir Podcast
              </a>
            </DropdownMenuItem>
          </>
        )}

        {hasAudio && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => deleteMutation.mutate(podcast.id)}
              disabled={deleteMutation.isPending}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir Podcast
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
