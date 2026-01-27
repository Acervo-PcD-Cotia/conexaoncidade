// Badge de status para o Publidoor Partner
import { cn } from '@/lib/utils';
import type { PublidoorItemStatus } from '@/types/publidoor';

interface PartnerStatusBadgeProps {
  status: PublidoorItemStatus;
  className?: string;
}

const STATUS_CONFIG: Record<PublidoorItemStatus, { label: string; className: string }> = {
  draft: {
    label: 'Rascunho',
    className: 'bg-muted text-muted-foreground',
  },
  review: {
    label: 'Em Análise',
    className: 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30',
  },
  approved: {
    label: 'Aprovado',
    className: 'bg-blue-500/20 text-blue-500 border border-blue-500/30',
  },
  published: {
    label: 'Ativo',
    className: 'bg-green-500/20 text-green-500 border border-green-500/30',
  },
};

export function PartnerStatusBadge({ status, className }: PartnerStatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
        config.className,
        className
      )}
    >
      <span className="w-2 h-2 rounded-full mr-2 bg-current animate-pulse" />
      {config.label}
    </span>
  );
}
