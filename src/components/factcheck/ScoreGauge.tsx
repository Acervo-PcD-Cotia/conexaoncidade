import { cn } from '@/lib/utils';

interface ScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

function getScoreColor(score: number): string {
  if (score >= 85) return 'text-green-600 dark:text-green-400';
  if (score >= 70) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 40) return 'text-amber-600 dark:text-amber-400';
  if (score >= 20) return 'text-orange-600 dark:text-orange-400';
  return 'text-red-600 dark:text-red-400';
}

function getScoreGradient(score: number): string {
  if (score >= 85) return 'from-green-500 to-green-600';
  if (score >= 70) return 'from-emerald-500 to-emerald-600';
  if (score >= 40) return 'from-amber-500 to-amber-600';
  if (score >= 20) return 'from-orange-500 to-orange-600';
  return 'from-red-500 to-red-600';
}

const sizeConfig = {
  sm: { container: 'w-16 h-16', text: 'text-xl', label: 'text-[10px]' },
  md: { container: 'w-24 h-24', text: 'text-3xl', label: 'text-xs' },
  lg: { container: 'w-32 h-32', text: 'text-4xl', label: 'text-sm' }
};

export function ScoreGauge({ score, size = 'md', showLabel = true, className }: ScoreGaugeProps) {
  const sizes = sizeConfig[size];
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center', sizes.container, className)}>
      {/* Background circle */}
      <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-muted/20"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={cn('transition-all duration-500', `stroke-current ${getScoreColor(score)}`)}
        />
      </svg>
      
      {/* Score text */}
      <div className="flex flex-col items-center">
        <span className={cn('font-bold', sizes.text, getScoreColor(score))}>
          {score}
        </span>
        {showLabel && (
          <span className={cn('text-muted-foreground', sizes.label)}>pontos</span>
        )}
      </div>
    </div>
  );
}
