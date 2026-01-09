import { Link } from "react-router-dom";
import { Volume2, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { NewsItem } from "@/hooks/useNews";

interface QuickNoteModalProps {
  news: NewsItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickNoteModal({ news, open, onOpenChange }: QuickNoteModalProps) {
  if (!news) return null;

  const handleTTS = () => {
    const text = `${news.title}. ${news.excerpt || ""}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    speechSynthesis.speak(utterance);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge
              style={{
                backgroundColor: news.category?.color || "hsl(var(--primary))",
                color: "white",
              }}
              className="text-[10px]"
            >
              {news.category?.name || "Notícia"}
            </Badge>
            {news.highlight === "urgent" && (
              <Badge className="bg-destructive text-destructive-foreground text-[10px]">
                URGENTE
              </Badge>
            )}
          </div>
          <DialogTitle className="text-left font-heading text-lg leading-tight">
            {news.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Excerpt */}
          {news.excerpt && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {news.excerpt}
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={handleTTS}
              aria-label="Ouvir resumo da notícia"
            >
              <Volume2 className="h-4 w-4" />
              Ouvir resumo
            </Button>
            <Button
              asChild
              className="flex-1 gap-2"
            >
              <Link to={`/noticia/${news.slug}`}>
                <ExternalLink className="h-4 w-4" />
                Ler completo
              </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
