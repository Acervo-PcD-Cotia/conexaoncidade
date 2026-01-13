import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Eye, 
  Ear, 
  Hand, 
  Brain, 
  Heart, 
  Accessibility,
  MonitorSmartphone,
  LucideIcon
} from 'lucide-react';

type BadgeType = 
  | 'pcd_friendly' 
  | 'high_legibility' 
  | 'motor_friendly' 
  | 'vision_friendly' 
  | 'hearing_friendly' 
  | 'cognitive_friendly';

interface AccessibilityBadgeProps {
  type: BadgeType;
  size?: 'sm' | 'md';
}

const BADGE_CONFIG: Record<BadgeType, { label: string; icon: LucideIcon; color: string; description: string }> = {
  pcd_friendly: {
    label: 'Acessível PCD',
    icon: Accessibility,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    description: 'Celular com boa compatibilidade para pessoas com deficiência',
  },
  high_legibility: {
    label: 'Alta Legibilidade',
    icon: Eye,
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    description: 'Tela grande e clara, fácil de ler',
  },
  motor_friendly: {
    label: 'Mobilidade Reduzida',
    icon: Hand,
    color: 'bg-green-100 text-green-700 border-green-200',
    description: 'Controles adaptados para mobilidade reduzida',
  },
  vision_friendly: {
    label: 'Deficiência Visual',
    icon: Eye,
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    description: 'Excelente suporte para leitores de tela',
  },
  hearing_friendly: {
    label: 'Deficiência Auditiva',
    icon: Ear,
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    description: 'Vibração forte e alertas visuais',
  },
  cognitive_friendly: {
    label: 'Interface Simples',
    icon: Brain,
    color: 'bg-teal-100 text-teal-700 border-teal-200',
    description: 'Interface intuitiva e simplificada',
  },
};

export function AccessibilityBadge({ type, size = 'md' }: AccessibilityBadgeProps) {
  const config = BADGE_CONFIG[type];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        'flex items-center gap-1.5 font-medium',
        config.color,
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1'
      )}
      title={config.description}
      aria-label={`${config.label}: ${config.description}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} aria-hidden="true" />
      <span>{config.label}</span>
    </Badge>
  );
}

export function AccessibilityBadgeList({ badges, size = 'md' }: { badges: string[]; size?: 'sm' | 'md' }) {
  const validBadges = badges.filter((b) => b in BADGE_CONFIG) as BadgeType[];
  
  if (validBadges.length === 0) return null;

  return (
    <div 
      className="flex flex-wrap gap-2" 
      role="list" 
      aria-label="Selos de acessibilidade"
    >
      {validBadges.map((badge) => (
        <div key={badge} role="listitem">
          <AccessibilityBadge type={badge} size={size} />
        </div>
      ))}
    </div>
  );
}
