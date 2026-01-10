import { useState } from 'react';
import { Share2, Flag, Send, ChevronDown, ChevronUp, Copy, Check, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { VerdictBadge } from './VerdictBadge';
import { ScoreGauge } from './ScoreGauge';
import { SourcesList } from './SourcesList';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { FactCheckResult as FactCheckResultType } from '@/hooks/useFactCheck';

interface FactCheckResultProps {
  result: FactCheckResultType;
  onReport: (reason: string) => Promise<void>;
  onSubmitToEditorial: () => Promise<void>;
  className?: string;
}

export function FactCheckResult({
  result,
  onReport,
  onSubmitToEditorial,
  className
}: FactCheckResultProps) {
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(result.share_url);
      setCopied(true);
      toast.success('Link copiado!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Erro ao copiar link');
    }
  };

  const handleReport = async () => {
    if (!reportReason.trim()) return;
    setIsReporting(true);
    try {
      await onReport(reportReason);
      setIsReportDialogOpen(false);
      setReportReason('');
    } finally {
      setIsReporting(false);
    }
  };

  const handleSubmitToEditorial = async () => {
    setIsSubmitting(true);
    try {
      await onSubmitToEditorial();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with verdict and score */}
      <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-xl bg-muted/50 border">
        <ScoreGauge score={result.score} size="lg" />
        <div className="flex-1 text-center sm:text-left">
          <VerdictBadge verdict={result.verdict} size="lg" className="mb-3" />
          <p className="text-lg text-foreground leading-relaxed">
            {result.summary}
          </p>
        </div>
      </div>

      {/* Transparency notice */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
          <p>Resultado automatizado baseado em evidências encontradas e pode mudar com novas informações.</p>
          <p>Veja as fontes e datas antes de compartilhar.</p>
        </div>
      </div>

      {/* Claims */}
      {result.claims && result.claims.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Alegações verificadas</h3>
          <ul className="space-y-2">
            {result.claims.map((claim, index) => (
              <li key={index} className="flex items-start gap-2 text-muted-foreground">
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0">
                  {index + 1}
                </span>
                <span>{claim}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Sources */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Evidências e Fontes</h3>
        <SourcesList sources={result.sources} />
      </div>

      {/* Methodology (collapsible) */}
      <Collapsible open={isMethodologyOpen} onOpenChange={setIsMethodologyOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-4 h-auto">
            <span className="font-medium">Metodologia e Limitações</span>
            {isMethodologyOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 px-4 pb-4">
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1">Metodologia</h4>
            <p className="text-sm">{result.methodology}</p>
          </div>
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1">Limitações</h4>
            <p className="text-sm">{result.limitations}</p>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pt-4 border-t">
        {/* Share */}
        <Button variant="outline" onClick={handleCopyLink} className="gap-2">
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copiado!
            </>
          ) : (
            <>
              <Share2 className="h-4 w-4" />
              Compartilhar
            </>
          )}
        </Button>

        {/* Report Error */}
        <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Flag className="h-4 w-4" />
              Reportar erro
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reportar erro na verificação</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                Se você discorda do resultado ou identificou um erro, explique abaixo:
              </p>
              <Textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Explique por que você acredita que esta verificação está incorreta..."
                rows={4}
              />
              <Button
                onClick={handleReport}
                disabled={!reportReason.trim() || isReporting}
                className="w-full"
              >
                {isReporting ? 'Enviando...' : 'Enviar denúncia'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Submit to Editorial */}
        <Button
          variant="secondary"
          onClick={handleSubmitToEditorial}
          disabled={isSubmitting}
          className="gap-2"
        >
          <Send className="h-4 w-4" />
          {isSubmitting ? 'Enviando...' : 'Enviar para apuração'}
        </Button>
      </div>
    </div>
  );
}
