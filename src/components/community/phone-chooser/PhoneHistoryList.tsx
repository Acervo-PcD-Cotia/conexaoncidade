import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Calendar, ChevronRight } from 'lucide-react';
import type { PhoneRecommendation } from '@/hooks/usePhoneChooser';

interface PhoneHistoryListProps {
  history: PhoneRecommendation[];
  onSelect?: (recommendation: PhoneRecommendation) => void;
}

export function PhoneHistoryList({ history, onSelect }: PhoneHistoryListProps) {
  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Smartphone className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>Você ainda não fez nenhuma busca.</p>
        <p className="text-sm">Complete o questionário para receber sua primeira recomendação!</p>
      </div>
    );
  }

  const getBudgetLabel = (budget: string) => {
    switch (budget) {
      case 'budget':
        return 'Até R$ 1.500';
      case 'mid':
        return 'R$ 1.500-3.000';
      case 'premium':
        return 'R$ 3.000-6.000';
      case 'flagship':
        return 'Acima de R$ 6.000';
      default:
        return budget;
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg">Suas Buscas Anteriores</h3>
      
      <div className="space-y-2">
        {history.map((rec) => (
          <Card
            key={rec.id}
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => onSelect?.(rec)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <Smartphone className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">
                      {rec.recommended_phone?.name || 'Recomendação'}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      {format(new Date(rec.created_at), "d 'de' MMMM", { locale: ptBR })}
                      <Badge variant="outline" className="text-xs">
                        {getBudgetLabel(rec.answers.budget)}
                      </Badge>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
