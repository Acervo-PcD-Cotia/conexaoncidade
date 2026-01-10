import { useChallenges } from '@/hooks/useChallenges';
import { WeeklyChallengeCard } from './WeeklyChallengeCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy } from 'lucide-react';

export function ChallengesList() {
  const { challenges, isLoading, claimReward, isClaimingReward, getTimeRemaining } = useChallenges();

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    );
  }

  if (challenges.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Nenhum desafio ativo</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Novos desafios são lançados semanalmente. Volte em breve para participar!
        </p>
      </div>
    );
  }

  // Group challenges by type
  const weeklyChallenges = challenges.filter(c => c.challenge_type === 'weekly');
  const monthlyChallenges = challenges.filter(c => c.challenge_type === 'monthly');
  const specialChallenges = challenges.filter(c => c.challenge_type === 'special' || c.challenge_type === 'seasonal');

  return (
    <div className="space-y-8">
      {weeklyChallenges.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="text-2xl">📅</span>
            Desafios da Semana
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {weeklyChallenges.map(challenge => (
              <WeeklyChallengeCard
                key={challenge.id}
                challenge={challenge}
                timeRemaining={getTimeRemaining(challenge.end_date)}
                onClaimReward={claimReward}
                isClaimingReward={isClaimingReward}
              />
            ))}
          </div>
        </section>
      )}

      {monthlyChallenges.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="text-2xl">🗓️</span>
            Desafios do Mês
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {monthlyChallenges.map(challenge => (
              <WeeklyChallengeCard
                key={challenge.id}
                challenge={challenge}
                timeRemaining={getTimeRemaining(challenge.end_date)}
                onClaimReward={claimReward}
                isClaimingReward={isClaimingReward}
              />
            ))}
          </div>
        </section>
      )}

      {specialChallenges.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="text-2xl">✨</span>
            Desafios Especiais
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {specialChallenges.map(challenge => (
              <WeeklyChallengeCard
                key={challenge.id}
                challenge={challenge}
                timeRemaining={getTimeRemaining(challenge.end_date)}
                onClaimReward={claimReward}
                isClaimingReward={isClaimingReward}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
