import { cn } from '@/lib/utils';
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle, AlertCircle, CircleDashed } from 'lucide-react';
import type { FactCheckVerdict } from '@/hooks/useFactCheck';

interface VerdictBadgeProps {
  verdict: FactCheckVerdict;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const verdictConfig: Record<FactCheckVerdict, {
  label: string;
  icon: typeof CheckCircle2;
  bgColor: string;
  textColor: string;
  borderColor: string;
}> = {
  'CONFIRMADO': {
    label: 'Confirmado',
    icon: CheckCircle2,
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    textColor: 'text-green-700 dark:text-green-400',
    borderColor: 'border-green-300 dark:border-green-700'
  },
  'PROVAVELMENTE_VERDADEIRO': {
    label: 'Provavelmente Verdadeiro',
    icon: CheckCircle2,
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    textColor: 'text-emerald-700 dark:text-emerald-400',
    borderColor: 'border-emerald-300 dark:border-emerald-700'
  },
  'ENGANOSO': {
    label: 'Enganoso',
    icon: AlertTriangle,
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    textColor: 'text-amber-700 dark:text-amber-400',
    borderColor: 'border-amber-300 dark:border-amber-700'
  },
  'PROVAVELMENTE_FALSO': {
    label: 'Provavelmente Falso',
    icon: AlertCircle,
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    textColor: 'text-orange-700 dark:text-orange-400',
    borderColor: 'border-orange-300 dark:border-orange-700'
  },
  'FALSO': {
    label: 'Falso',
    icon: XCircle,
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    textColor: 'text-red-700 dark:text-red-400',
    borderColor: 'border-red-300 dark:border-red-700'
  },
  'NAO_VERIFICAVEL_AINDA': {
    label: 'Não Verificável',
    icon: CircleDashed,
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    textColor: 'text-gray-700 dark:text-gray-400',
    borderColor: 'border-gray-300 dark:border-gray-600'
  }
};

const sizeConfig = {
  sm: {
    container: 'px-2 py-1 text-xs gap-1',
    icon: 'h-3 w-3'
  },
  md: {
    container: 'px-3 py-1.5 text-sm gap-1.5',
    icon: 'h-4 w-4'
  },
  lg: {
    container: 'px-4 py-2 text-base gap-2',
    icon: 'h-5 w-5'
  }
};

export function VerdictBadge({ verdict, size = 'md', showLabel = true, className }: VerdictBadgeProps) {
  const config = verdictConfig[verdict];
  const sizeStyles = sizeConfig[size];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border',
        config.bgColor,
        config.textColor,
        config.borderColor,
        sizeStyles.container,
        className
      )}
      role="status"
      aria-label={`Veredito: ${config.label}`}
    >
      <Icon className={sizeStyles.icon} aria-hidden="true" />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}
