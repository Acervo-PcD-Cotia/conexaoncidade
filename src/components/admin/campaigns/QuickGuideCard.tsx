import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CheckCircle2, Circle, ChevronDown, ChevronRight, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickGuideCheckItem {
  id: string;
  label: string;
  completed: boolean;
}

interface QuickGuideCardProps {
  isNewCampaign?: boolean;
  checkItems: QuickGuideCheckItem[];
}

const GUIDE_STEPS = [
  '1. Preencha Nome, Anunciante, Período e Status',
  '2. Selecione quais formatos (1–15) vai usar',
  '3. Faça upload dos criativos (um por formato)',
  '4. Configure o CTA (texto + URL com HTTPS)',
  '5. Crie ao menos 1 Ciclo de Distribuição (se for veicular)',
  '6. Salve e revise no checklist',
];

export function QuickGuideCard({ isNewCampaign = true, checkItems }: QuickGuideCardProps) {
  const [open, setOpen] = useState(isNewCampaign);
  const completedCount = checkItems.filter(i => i.completed).length;
  const totalCount = checkItems.length;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              Guia Rápido — Como cadastrar
            </CardTitle>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                {open ? 'Ocultar' : 'Exibir'}
              </Button>
            </CollapsibleTrigger>
          </div>
          <p className="text-xs text-muted-foreground">
            {completedCount}/{totalCount} itens concluídos
          </p>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* Steps */}
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Passos</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {GUIDE_STEPS.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            </div>

            {/* Checklist */}
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Checklist Automático</p>
              <div className="space-y-1">
                {checkItems.map(item => (
                  <div
                    key={item.id}
                    className={cn(
                      'flex items-center gap-2 text-sm py-1 px-2 rounded',
                      item.completed ? 'text-green-700 dark:text-green-400' : 'text-muted-foreground'
                    )}
                  >
                    {item.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 shrink-0" />
                    )}
                    <span className={item.completed ? 'line-through opacity-70' : ''}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
