import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FactCheckForm } from '@/components/factcheck/FactCheckForm';
import { FactCheckResult } from '@/components/factcheck/FactCheckResult';
import { useFactCheck, type FactCheckResult as FactCheckResultType, type FactCheckInputType } from '@/hooks/useFactCheck';
import { Loader2 } from 'lucide-react';

interface FactCheckModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultUrl?: string;
  defaultTitle?: string;
  refSlug?: string;
}

export function FactCheckModal({
  open,
  onOpenChange,
  defaultUrl,
  defaultTitle,
  refSlug
}: FactCheckModalProps) {
  const { submitVerification, reportError, submitToEditorial, isVerifying } = useFactCheck();
  const [result, setResult] = useState<FactCheckResultType | null>(null);

  const handleSubmit = async (data: {
    input_type: FactCheckInputType;
    content: string;
    image_url?: string;
    opt_in_editorial?: boolean;
  }) => {
    const factCheckResult = await submitVerification({
      ...data,
      ref_slug: refSlug
    });
    setResult(factCheckResult);
  };

  const handleReport = async (reason: string) => {
    if (result) {
      await reportError.mutateAsync({ factCheckId: result.id, reason });
    }
  };

  const handleSubmitToEditorial = async () => {
    if (result) {
      await submitToEditorial.mutateAsync(result.id);
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setResult(null);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {result ? 'Resultado da Verificação' : 'Verificar Informação'}
          </DialogTitle>
        </DialogHeader>

        {!result ? (
          <FactCheckForm
            onSubmit={handleSubmit}
            isLoading={isVerifying}
            defaultContent={defaultUrl || ''}
            defaultType={defaultUrl ? 'link' : 'text'}
          />
        ) : (
          <FactCheckResult
            result={result}
            onReport={handleReport}
            onSubmitToEditorial={handleSubmitToEditorial}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
