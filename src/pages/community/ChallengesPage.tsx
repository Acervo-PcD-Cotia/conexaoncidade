import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Trophy, ArrowLeft, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChallengesList } from '@/components/community/ChallengesList';
import { CommunityLayout } from '@/components/community/CommunityLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useCommunity } from '@/hooks/useCommunity';

export default function ChallengesPage() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { membership, isLoading: communityLoading } = useCommunity();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth?redirect=/comunidade/desafios');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!communityLoading && user && !membership?.access_granted_at) {
      navigate('/comunidade/desbloquear');
    }
  }, [membership, communityLoading, user, navigate]);

  if (authLoading || communityLoading) {
    return (
      <CommunityLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </CommunityLayout>
    );
  }

  if (!user || !membership?.access_granted_at) return null;

  return (
    <CommunityLayout>
      <Helmet>
        <title>Desafios da Comunidade | Conexão na Cidade</title>
        <meta name="description" content="Participe dos desafios semanais e mensais da comunidade e ganhe recompensas especiais." />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="h-6 w-6 text-pink-600" />
              Desafios da Comunidade
            </h1>
            <p className="text-muted-foreground">
              Complete desafios, ganhe pontos e desbloqueie recompensas especiais!
            </p>
          </div>
          <Link to="/comunidade/como-ganhar-pontos">
            <Button variant="outline" size="sm">
              <HelpCircle className="w-4 h-4 mr-2" />
              Como ganhar pontos?
            </Button>
          </Link>
        </div>

        {/* Challenges list */}
        <ChallengesList />
      </div>
    </CommunityLayout>
  );
}
