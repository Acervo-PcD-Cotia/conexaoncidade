import { Target, Check, Circle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { type Milestone } from '@/hooks/useNoticiasAIProgress';

interface NoticiasAIProgressProps {
  nextMilestones: Milestone[];
  completedMilestones: string[];
  progressPercentage: number;
}

export function NoticiasAIProgress({
  nextMilestones,
  completedMilestones,
  progressPercentage,
}: NoticiasAIProgressProps) {
  return (
    <Card className="border-l-4 border-l-amber-500">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="h-5 w-5 text-amber-500" />
          Próximos Objetivos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progresso Geral</span>
            <span className="font-medium">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <div className="space-y-2">
          {nextMilestones.map((milestone) => {
            const isCompleted = completedMilestones.includes(milestone.id);
            
            return (
              <div
                key={milestone.id}
                className={`flex items-center justify-between rounded-lg border p-2 transition-colors ${
                  isCompleted ? 'bg-green-50 border-green-200' : 'hover:bg-accent/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isCompleted ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className={isCompleted ? 'text-green-700 line-through' : ''}>
                    {milestone.name}
                  </span>
                </div>
                <span className={`text-sm font-medium ${isCompleted ? 'text-green-600' : 'text-amber-600'}`}>
                  +{milestone.points}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
