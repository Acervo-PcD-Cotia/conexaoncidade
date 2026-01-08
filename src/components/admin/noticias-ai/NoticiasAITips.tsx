import { Lightbulb, Zap, FileText, Layers, Link, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface NoticiasAITipsProps {
  onOpenTutorial: () => void;
}

const tips = [
  {
    badge: 'EXCLUSIVA',
    color: 'bg-red-500',
    icon: Zap,
    tip: 'Preserva o texto original sem alterações',
  },
  {
    badge: 'JSON',
    color: 'bg-emerald-500',
    icon: FileText,
    tip: 'Gera JSON para importação automática',
  },
  {
    badge: 'LOTE',
    color: 'bg-purple-500',
    icon: Layers,
    tip: 'Processa até 10 URLs simultaneamente',
  },
  {
    badge: 'URL',
    color: 'bg-gray-500',
    icon: Link,
    tip: 'Cole uma URL para extrair o conteúdo',
  },
];

export function NoticiasAITips({ onOpenTutorial }: NoticiasAITipsProps) {
  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="h-5 w-5 text-blue-500" />
          Dicas Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tips.map((tip) => (
          <div key={tip.badge} className="flex items-start gap-2">
            <Badge className={`${tip.color} shrink-0 text-white`}>
              {tip.badge}
            </Badge>
            <span className="text-sm text-muted-foreground">{tip.tip}</span>
          </div>
        ))}

        <Button
          variant="outline"
          size="sm"
          className="mt-2 w-full"
          onClick={onOpenTutorial}
        >
          <BookOpen className="mr-1 h-4 w-4" />
          Ver tutorial completo
        </Button>
      </CardContent>
    </Card>
  );
}
