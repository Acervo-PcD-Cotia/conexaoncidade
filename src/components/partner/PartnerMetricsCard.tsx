// Card de métricas para o Partner
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface PartnerMetricsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function PartnerMetricsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
}: PartnerMetricsCardProps) {
  return (
    <div
      className={cn(
        'p-6 rounded-2xl bg-card border border-border',
        'hover:border-primary/30 transition-colors',
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-xl bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        {trend && (
          <span
            className={cn(
              'text-xs font-medium px-2 py-1 rounded-full',
              trend === 'up' && 'bg-green-500/20 text-green-500',
              trend === 'down' && 'bg-red-500/20 text-red-500',
              trend === 'neutral' && 'bg-muted text-muted-foreground'
            )}
          >
            {trend === 'up' && '↑'}
            {trend === 'down' && '↓'}
            {trend === 'neutral' && '–'}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-3xl font-bold text-foreground">{value}</h3>
        <p className="text-sm text-muted-foreground">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground/80 mt-2">{description}</p>
        )}
      </div>
    </div>
  );
}
