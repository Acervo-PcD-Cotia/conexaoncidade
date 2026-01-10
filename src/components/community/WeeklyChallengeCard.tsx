import { Trophy, Clock, Gift, Check } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ChallengeWithProgress } from '@/hooks/useChallenges';

interface WeeklyChallengeCardProps {
  challenge: ChallengeWithProgress;
  timeRemaining: string;
  onClaimReward: (challengeId: string) => void;
  isClaimingReward: boolean;
}

export function WeeklyChallengeCard({
  challenge,
  timeRemaining,
  onClaimReward,
  isClaimingReward
}: WeeklyChallengeCardProps) {
  const currentValue = challenge.progress?.current_value || 0;
  const progressPercent = Math.min(100, (currentValue / challenge.goal_value) * 100);
  const isCompleted = !!challenge.progress?.completed_at;
  const isRewardClaimed = !!challenge.progress?.reward_claimed_at;

  const getChallengeTypeBadge = () => {
    switch (challenge.challenge_type) {
      case 'weekly':
        return { label: 'Semanal', variant: 'default' as const };
      case 'monthly':
        return { label: 'Mensal', variant: 'secondary' as const };
      case 'special':
        return { label: 'Especial', variant: 'destructive' as const };
      case 'seasonal':
        return { label: 'Temporada', variant: 'outline' as const };
      default:
        return { label: 'Desafio', variant: 'default' as const };
    }
  };

  const getRewardIcon = () => {
    switch (challenge.reward_type) {
      case 'badge':
        return '🏅';
      case 'points':
        return '⭐';
      case 'early_access':
        return '🚀';
      case 'exclusive_content':
        return '🎁';
      default:
        return '🏆';
    }
  };

  const badge = getChallengeTypeBadge();

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all",
      isCompleted && !isRewardClaimed && "ring-2 ring-primary animate-pulse",
      isRewardClaimed && "opacity-75"
    )}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full" />
      
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{challenge.icon || '🎯'}</span>
            <div>
              <Badge variant={badge.variant} className="text-xs">
                {badge.label}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <Clock className="w-3 h-3" />
            <span>{timeRemaining}</span>
          </div>
        </div>
        <h3 className="font-semibold text-lg mt-2">{challenge.title}</h3>
        {challenge.description && (
          <p className="text-sm text-muted-foreground">{challenge.description}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium">
              {currentValue}/{challenge.goal_value} ({Math.round(progressPercent)}%)
            </span>
          </div>
          <Progress 
            value={progressPercent} 
            className={cn(
              "h-3",
              isCompleted && "bg-green-100 [&>div]:bg-green-500"
            )}
          />
        </div>

        {/* Reward section */}
        <div className={cn(
          "flex items-center gap-3 p-3 rounded-lg",
          isCompleted ? "bg-primary/10" : "bg-muted/50"
        )}>
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-background">
            <span className="text-xl">{getRewardIcon()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Recompensa</p>
            <p className="text-xs text-muted-foreground truncate">
              {challenge.reward_description || 'Completar o desafio'}
            </p>
          </div>
          {isCompleted && !isRewardClaimed && (
            <Gift className="w-5 h-5 text-primary animate-bounce" />
          )}
          {isRewardClaimed && (
            <Check className="w-5 h-5 text-green-500" />
          )}
        </div>

        {/* Action button */}
        {isCompleted && !isRewardClaimed && (
          <Button 
            onClick={() => onClaimReward(challenge.id)}
            disabled={isClaimingReward}
            className="w-full"
          >
            <Trophy className="w-4 h-4 mr-2" />
            Resgatar Recompensa
          </Button>
        )}

        {isRewardClaimed && (
          <div className="flex items-center justify-center gap-2 text-sm text-green-600 font-medium">
            <Check className="w-4 h-4" />
            Recompensa resgatada!
          </div>
        )}
      </CardContent>
    </Card>
  );
}
