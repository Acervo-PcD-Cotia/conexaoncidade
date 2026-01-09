import { Progress } from "@/components/ui/progress";
import { Share2, Trophy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface UnlockProgressProps {
  current: number;
  total?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function UnlockProgress({ 
  current, 
  total = 12, 
  showLabel = true,
  size = 'md' 
}: UnlockProgressProps) {
  const percentage = Math.min((current / total) * 100, 100);
  const isComplete = current >= total;

  return (
    <div className="space-y-2">
      {showLabel && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {isComplete ? (
              <Trophy className="h-4 w-4 text-yellow-500" />
            ) : (
              <Share2 className="h-4 w-4 text-muted-foreground" />
            )}
            <span className={cn(
              "font-medium",
              isComplete ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
            )}>
              {isComplete ? 'Acesso desbloqueado!' : 'Progresso do desbloqueio'}
            </span>
          </div>
          <span className={cn(
            "font-bold",
            isComplete ? "text-green-600 dark:text-green-400" : "text-foreground"
          )}>
            {current}/{total}
          </span>
        </div>
      )}
      
      <div className="relative">
        <Progress 
          value={percentage} 
          className={cn(
            size === 'sm' && 'h-2',
            size === 'md' && 'h-3',
            size === 'lg' && 'h-4',
          )}
        />
        {isComplete && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Check className="h-3 w-3 text-white" />
          </div>
        )}
      </div>
      
      {!isComplete && showLabel && (
        <p className="text-xs text-muted-foreground">
          Compartilhe mais {total - current} {total - current === 1 ? 'conteúdo' : 'conteúdos'} para desbloquear
        </p>
      )}
    </div>
  );
}
