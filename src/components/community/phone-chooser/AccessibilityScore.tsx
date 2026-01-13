import { cn } from '@/lib/utils';
import { Accessibility } from 'lucide-react';

interface AccessibilityScoreProps {
  score: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function AccessibilityScore({ score, showLabel = true, size = 'md' }: AccessibilityScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-100';
    if (score >= 6) return 'text-blue-600 bg-blue-100';
    if (score >= 4) return 'text-amber-600 bg-amber-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Excelente';
    if (score >= 6) return 'Bom';
    if (score >= 4) return 'Regular';
    return 'Básico';
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        getScoreColor(score),
        sizeClasses[size]
      )}
      role="meter"
      aria-valuenow={score}
      aria-valuemin={0}
      aria-valuemax={10}
      aria-label={`Nota de acessibilidade: ${score} de 10, ${getScoreLabel(score)}`}
    >
      <Accessibility className={iconSizes[size]} aria-hidden="true" />
      <span>{score}/10</span>
      {showLabel && <span className="hidden sm:inline">- {getScoreLabel(score)}</span>}
    </div>
  );
}
