import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Copy, Download, ShieldCheck, AlertTriangle } from 'lucide-react';

interface RecoveryCodesDisplayProps {
  codes: string[];
  isOpen: boolean;
  onClose: () => void;
}

export function RecoveryCodesDisplay({ codes, isOpen, onClose }: RecoveryCodesDisplayProps) {
  const [hasSaved, setHasSaved] = useState(false);

  const handleCopy = async () => {
    try {
      const text = codes.join('\n');
      await navigator.clipboard.writeText(text);
      toast.success('Códigos copiados para a área de transferência');
    } catch {
      toast.error('Erro ao copiar códigos');
    }
  };

  const handleDownload = () => {
    const text = [
      'CÓDIGOS DE RECUPERAÇÃO - 2FA',
      '==============================',
      '',
      'Guarde estes códigos em um local seguro.',
      'Cada código só pode ser usado uma vez.',
      '',
      ...codes,
      '',
      `Gerado em: ${new Date().toLocaleString('pt-BR')}`,
    ].join('\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'codigos-recuperacao-2fa.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Arquivo baixado com sucesso');
  };

  const handleClose = () => {
    if (!hasSaved) {
      toast.warning('Por favor, confirme que salvou os códigos antes de fechar');
      return;
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            Códigos de Recuperação
          </DialogTitle>
          <DialogDescription>
            Guarde estes códigos em um local seguro. Cada código só pode ser usado uma vez.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Importante:</strong> Estes códigos não serão exibidos novamente. 
                Se você perder acesso ao seu autenticador e não tiver estes códigos, 
                você perderá acesso à sua conta.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {codes.map((code, index) => (
              <div
                key={index}
                className="font-mono text-sm bg-muted px-3 py-2 rounded text-center border"
              >
                {code}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={handleCopy}>
              <Copy className="h-4 w-4 mr-2" />
              Copiar
            </Button>
            <Button variant="outline" className="flex-1" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Baixar TXT
            </Button>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="saved-codes"
              checked={hasSaved}
              onCheckedChange={(checked) => setHasSaved(checked === true)}
            />
            <label
              htmlFor="saved-codes"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Salvei os códigos em um local seguro
            </label>
          </div>

          <Button 
            className="w-full" 
            onClick={handleClose}
            disabled={!hasSaved}
          >
            Concluir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
