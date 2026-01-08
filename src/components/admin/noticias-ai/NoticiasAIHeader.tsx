import { Sparkles, BookOpen, Play, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LEVELS, type Level } from '@/hooks/useNoticiasAIProgress';

interface NoticiasAIHeaderProps {
  level: Level;
  points: number;
  progressPercentage: number;
  onStartTour: () => void;
  onOpenTutorial: () => void;
}

export function NoticiasAIHeader({
  level,
  points,
  progressPercentage,
  onStartTour,
  onOpenTutorial,
}: NoticiasAIHeaderProps) {
  const levelInfo = LEVELS[level];

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg">
          <Sparkles className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Notícias AI</h1>
          <p className="text-sm text-muted-foreground">
            Geração e importação inteligente de notícias
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Level Badge */}
        <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2">
          <span className="text-xl">{levelInfo.icon}</span>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Nível</span>
            <span className="text-sm font-medium">{levelInfo.name}</span>
          </div>
        </div>

        {/* Points */}
        <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2">
          <Trophy className="h-4 w-4 text-amber-500" />
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Pontos</span>
            <span className="text-sm font-medium">{points}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="hidden min-w-[120px] items-center gap-2 rounded-lg border bg-card px-3 py-2 sm:flex">
          <div className="flex w-full flex-col gap-1">
            <span className="text-xs text-muted-foreground">Progresso</span>
            <div className="flex items-center gap-2">
              <Progress value={progressPercentage} className="h-2 flex-1" />
              <span className="text-xs font-medium">{progressPercentage}%</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <Button variant="outline" size="sm" onClick={onStartTour}>
          <Play className="mr-1 h-3 w-3" />
          Tour
        </Button>
        <Button variant="outline" size="sm" onClick={onOpenTutorial}>
          <BookOpen className="mr-1 h-3 w-3" />
          Tutorial
        </Button>
      </div>
    </div>
  );
}
