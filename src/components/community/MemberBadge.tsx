import { Badge } from "@/components/ui/badge";
import { 
  Crown, 
  Star, 
  Award, 
  Shield, 
  Sparkles,
  UserCheck,
  Medal
} from "lucide-react";
import { cn } from "@/lib/utils";
import { levelLabels, badgeLabels } from "@/hooks/useCommunity";

interface MemberBadgeProps {
  level: 'supporter' | 'collaborator' | 'ambassador' | 'leader';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const levelConfig = {
  supporter: {
    icon: UserCheck,
    color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    iconColor: 'text-slate-500',
  },
  collaborator: {
    icon: Award,
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    iconColor: 'text-blue-500',
  },
  ambassador: {
    icon: Star,
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    iconColor: 'text-purple-500',
  },
  leader: {
    icon: Crown,
    color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    iconColor: 'text-yellow-500',
  },
};

export function MemberBadge({ level, size = 'md', showLabel = true }: MemberBadgeProps) {
  const config = levelConfig[level];
  const Icon = config.icon;
  
  return (
    <Badge 
      variant="secondary" 
      className={cn(
        config.color,
        size === 'sm' && 'text-xs px-1.5 py-0',
        size === 'md' && 'text-sm px-2 py-0.5',
        size === 'lg' && 'text-base px-3 py-1',
      )}
    >
      <Icon className={cn(
        config.iconColor,
        size === 'sm' && 'h-3 w-3 mr-1',
        size === 'md' && 'h-4 w-4 mr-1.5',
        size === 'lg' && 'h-5 w-5 mr-2',
      )} />
      {showLabel && levelLabels[level]}
    </Badge>
  );
}

interface AchievementBadgeProps {
  badge: string;
  size?: 'sm' | 'md';
}

const badgeConfig: Record<string, { icon: typeof Medal; color: string }> = {
  founding_member: {
    icon: Sparkles,
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  },
  invited_member: {
    icon: UserCheck,
    color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  },
  top_contributor: {
    icon: Medal,
    color: 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300',
  },
  verified: {
    icon: Shield,
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  },
};

export function AchievementBadge({ badge, size = 'sm' }: AchievementBadgeProps) {
  const config = badgeConfig[badge] || { icon: Award, color: 'bg-gray-100 text-gray-700' };
  const Icon = config.icon;
  
  return (
    <Badge 
      variant="secondary" 
      className={cn(
        config.color,
        size === 'sm' && 'text-xs px-1.5 py-0',
        size === 'md' && 'text-sm px-2 py-0.5',
      )}
    >
      <Icon className={cn(
        size === 'sm' && 'h-3 w-3 mr-1',
        size === 'md' && 'h-4 w-4 mr-1.5',
      )} />
      {badgeLabels[badge] || badge}
    </Badge>
  );
}
