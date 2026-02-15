import { AlertTriangle, ExternalLink, SkipForward, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface DuplicateInfo {
  articleTitle: string;
  matchType: 'slug' | 'source_url' | 'title_similarity';
  existingId: string;
  existingTitle?: string;
}

interface DuplicateWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  duplicate: DuplicateInfo | null;
  onSkip: () => void;
  onImportAnyway: () => void;
  isLoading?: boolean;
}

const matchTypeLabels: Record<string, { label: string; description: string; severity: 'high' | 'medium' }> = {
  slug: {
    label: 'Slug idêntico',
    description: 'Já existe uma notícia com o mesmo slug (URL).',
    severity: 'high',
  },
  source_url: {
    label: 'URL fonte igual',
    description: 'Esta URL já foi importada anteriormente.',
    severity: 'high',
  },
  title_similarity: {
    label: 'Título similar',
    description: 'Existe uma notícia com título muito parecido (>85% similaridade).',
    severity: 'medium',
  },
};

export function DuplicateWarningDialog({
  open,
  onOpenChange,
  duplicate,
  onSkip,
  onImportAnyway,
  isLoading,
}: DuplicateWarningDialogProps) {
  if (!duplicate) return null;

  const matchInfo = matchTypeLabels[duplicate.matchType];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-amber-100 p-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <DialogTitle>Possível Duplicata Detectada</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            {matchInfo.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Badge
                variant={matchInfo.severity === 'high' ? 'destructive' : 'secondary'}
              >
                {matchInfo.label}
              </Badge>
            </div>
            
            <div className="text-sm">
              <span className="text-muted-foreground">Artigo a importar:</span>
              <p className="font-medium line-clamp-2">{duplicate.articleTitle}</p>
            </div>

            {duplicate.existingTitle && (
              <div className="text-sm border-t pt-2 mt-2">
                <span className="text-muted-foreground">Notícia existente:</span>
                <p className="font-medium line-clamp-2">{duplicate.existingTitle}</p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              asChild
            >
              <Link to={`/spah/painel/news/${duplicate.existingId}/edit`} target="_blank">
                <FileText className="mr-1 h-4 w-4" />
                Ver existente
                <ExternalLink className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={onSkip}
            disabled={isLoading}
          >
            <SkipForward className="mr-1 h-4 w-4" />
            Pular
          </Button>
          <Button
            variant="default"
            onClick={onImportAnyway}
            disabled={isLoading}
          >
            {isLoading ? 'Importando...' : 'Importar mesmo assim'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
