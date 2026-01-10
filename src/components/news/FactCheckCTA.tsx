import { useState } from 'react';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FactCheckModal } from './FactCheckModal';
import { cn } from '@/lib/utils';

interface FactCheckCTAProps {
  newsSlug: string;
  newsTitle: string;
  newsUrl?: string;
  className?: string;
}

export function FactCheckCTA({ newsSlug, newsTitle, newsUrl, className }: FactCheckCTAProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fullUrl = newsUrl || (typeof window !== 'undefined' 
    ? `${window.location.origin}/noticia/${newsSlug}`
    : `/noticia/${newsSlug}`);

  return (
    <>
      <Card className={cn('border-primary/20 bg-primary/5', className)}>
        <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Verificar esta informação</h3>
              <p className="text-sm text-muted-foreground">
                Cheque se o conteúdo é verdadeiro antes de compartilhar
              </p>
            </div>
          </div>
          
          <Button onClick={() => setIsModalOpen(true)} className="gap-2 whitespace-nowrap">
            Verificar
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      <FactCheckModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        defaultUrl={fullUrl}
        defaultTitle={newsTitle}
        refSlug={newsSlug}
      />
    </>
  );
}
