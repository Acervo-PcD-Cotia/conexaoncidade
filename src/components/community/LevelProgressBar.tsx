import { Progress } from "@/components/ui/progress";
import { levelLabels, levelThresholds } from "@/hooks/useCommunity";
import { Award, Star, Crown, Gem } from "lucide-react";

interface LevelProgressBarProps {
  level: 'supporter' | 'collaborator' | 'ambassador' | 'leader';
  points: number;
  showDetails?: boolean;
}

const levelIcons = {
  supporter: Star,
  collaborator: Award,
  ambassador: Crown,
  leader: Gem,
};

const levelColors = {
  supporter: "text-blue-500",
  collaborator: "text-purple-500",
  ambassador: "text-amber-500",
  leader: "text-emerald-500",
};

export function LevelProgressBar({ level, points, showDetails = true }: LevelProgressBarProps) {
  const levels = ['supporter', 'collaborator', 'ambassador', 'leader'] as const;
  const currentIndex = levels.indexOf(level);
  const isMaxLevel = level === 'leader';
  
  const currentThreshold = levelThresholds[level];
  const nextLevel = isMaxLevel ? 'leader' : levels[currentIndex + 1];
  const nextThreshold = levelThresholds[nextLevel];
  
  const pointsInLevel = points - currentThreshold;
  const pointsNeeded = nextThreshold - currentThreshold;
  const progress = isMaxLevel ? 100 : Math.min(100, (pointsInLevel / pointsNeeded) * 100);
  const pointsToNext = isMaxLevel ? 0 : nextThreshold - points;

  const Icon = levelIcons[level];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${levelColors[level]}`} />
          <span className="text-sm font-medium">{levelLabels[level]}</span>
        </div>
        {!isMaxLevel && (
          <span className="text-xs text-muted-foreground">
            Próximo: {levelLabels[nextLevel]}
          </span>
        )}
      </div>
      
      <Progress value={progress} className="h-2" />
      
      {showDetails && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{points.toLocaleString()} pts</span>
          {!isMaxLevel ? (
            <span>Faltam {pointsToNext.toLocaleString()} pts</span>
          ) : (
            <span className="text-primary font-medium">Nível máximo! 🎉</span>
          )}
        </div>
      )}
    </div>
  );
}
