import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Trophy, ArrowLeft, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChallengesList } from '@/components/community/ChallengesList';
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user || !membership?.access_granted_at) return null;

  return (
    <>
      <Helmet>
        <title>Desafios da Comunidade | Conexão na Cidade</title>
        <meta name="description" content="Participe dos desafios semanais e mensais da comunidade e ganhe recompensas especiais." />
      </Helmet>

      <main className="min-h-screen bg-background">
        {/* Hero section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-background py-12">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" size="icon" onClick={() => navigate('/comunidade')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <Trophy className="w-8 h-8 text-primary" />
                  Desafios da Comunidade
                </h1>
                <p className="text-muted-foreground mt-1">
                  Complete desafios, ganhe pontos e desbloqueie recompensas especiais!
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to="/comunidade/como-ganhar-pontos">
                <Button variant="outline" size="sm">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Como ganhar pontos?
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Challenges list */}
        <section className="py-8">
          <div className="container max-w-6xl mx-auto px-4">
            <ChallengesList />
          </div>
        </section>
      </main>
    </>
  );
}
