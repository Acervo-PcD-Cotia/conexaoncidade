import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Smartphone, ArrowLeft, RotateCcw, GitCompare, History, Loader2, Accessibility } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCommunity } from '@/hooks/useCommunity';
import { usePhoneChooser, type QuizAnswersPCD, type Phone } from '@/hooks/usePhoneChooser';
import { PhoneQuizWizardPCD } from '@/components/community/phone-chooser/PhoneQuizWizardPCD';
import { PhoneResultCard } from '@/components/community/phone-chooser/PhoneResultCard';
import { PhoneComparisonModal } from '@/components/community/phone-chooser/PhoneComparisonModal';
import { PhoneHistoryList } from '@/components/community/phone-chooser/PhoneHistoryList';
import { toast } from 'sonner';

type PageState = 'intro' | 'quiz' | 'result' | 'history';

export default function PhoneChooserPage() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { hasAccess, isLoading: communityLoading } = useCommunity();
  const { 
    phones, 
    isLoadingPhones, 
    history, 
    isLoadingHistory, 
    calculatePCDRecommendation, 
    saveRecommendation 
  } = usePhoneChooser();

  const [pageState, setPageState] = useState<PageState>('intro');
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<{ main: Phone; alternatives: Phone[] } | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [currentAnswers, setCurrentAnswers] = useState<QuizAnswersPCD | null>(null);

  const isLoading = authLoading || communityLoading;

  // Handle quiz completion
  const handleQuizComplete = async (answers: QuizAnswersPCD) => {
    setIsCalculating(true);
    setCurrentAnswers(answers);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const recommendation = calculatePCDRecommendation(answers);

      if (!recommendation) {
        toast.error('Não encontramos celulares compatíveis. Tente ajustar suas preferências.');
        setIsCalculating(false);
        return;
      }

      setResult(recommendation);
      setPageState('result');

      if (user) {
        await saveRecommendation.mutateAsync({
          answers,
          mainPhoneId: recommendation.main.id,
          alternativeIds: recommendation.alternatives.map((p) => p.id),
        });
      }
    } catch (error) {
      console.error('Error calculating recommendation:', error);
      toast.error('Erro ao calcular recomendação');
    } finally {
      setIsCalculating(false);
    }
  };

  // Start new quiz
  const handleStartQuiz = () => {
    if (!user) {
      toast.info('Faça login para usar esta função exclusiva');
      return;
    }
    setResult(null);
    setCurrentAnswers(null);
    setPageState('quiz');
  };

  // View history item
  const handleViewHistoryItem = (rec: { recommended_phone?: Phone; alternatives?: Phone[] }) => {
    if (rec.recommended_phone) {
      setResult({
        main: rec.recommended_phone,
        alternatives: rec.alternatives || [],
      });
      setPageState('result');
    }
  };

  // Generate reason text for PCD
  const generateReasonText = (phone: Phone, answers: QuizAnswersPCD | null) => {
    if (!answers) return '';

    const reasons: string[] = [];

    if (answers.isPCD === 'yes' && (phone.accessibility_score || 0) >= 6) {
      reasons.push('tem ótimos recursos de acessibilidade');
    }
    if (answers.accessibilityNeeds.includes('large_screen') && (phone.screen_size || 0) >= 6.5) {
      reasons.push('possui tela grande e fácil de visualizar');
    }
    if (answers.accessibilityNeeds.includes('screen_reader') && 
        phone.accessibility_features?.includes('talkback')) {
      reasons.push('funciona bem com leitor de tela');
    }
    if (answers.physicalPreferences.includes('long_battery') && phone.battery_score >= 4) {
      reasons.push('a bateria dura muito tempo');
    }
    if (answers.budget === 'under800' || answers.budget === '800to1500') {
      reasons.push('cabe no seu orçamento');
    }

    if (reasons.length === 0) {
      reasons.push('combina bem com o que você precisa');
    }

    return `Indicamos este modelo porque ${reasons.slice(0, 2).join(' e ')}.`;
  };

  // Render loading state
  if (isLoading || isLoadingPhones) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-4xl mx-auto py-8 px-4">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Render login prompt for non-authenticated users
  if (!user) {
    return (
      <>
        <Helmet>
          <title>Escolha do Celular Ideal | Comunidade Conexão na Cidade</title>
          <meta
            name="description"
            content="Descubra o celular ideal para você com nossa ferramenta exclusiva. Responda algumas perguntas e receba uma recomendação personalizada."
          />
        </Helmet>

        <div className="min-h-screen bg-background">
          <div className="container max-w-2xl mx-auto py-12 px-4">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto p-4 rounded-full bg-primary/10 w-fit mb-4">
                  <Smartphone className="w-12 h-12 text-primary" />
                </div>
                <CardTitle className="text-2xl">Escolha do Celular Ideal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground">
                  Essa é uma função exclusiva para membros da comunidade. Faça login para continuar.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild size="lg">
                    <Link to="/comunidade/auth?mode=login&redirect=/comunidade/beneficios/celular-ideal">
                      Entrar
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link to="/comunidade/auth?mode=register&redirect=/comunidade/beneficios/celular-ideal">
                      Criar Conta
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  // Redirect to unlock if no community access
  if (!hasAccess) {
    useEffect(() => {
      navigate('/comunidade/desbloquear');
    }, [navigate]);
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Celular Acessível para Pessoas com Deficiência | Comunidade</title>
        <meta
          name="description"
          content="Descubra o celular ideal para pessoas com deficiência. Quiz inclusivo com recomendações personalizadas baseadas em acessibilidade, recursos PCD e necessidades específicas."
        />
        <meta name="keywords" content="celular acessível, smartphone pcd, celular deficiência visual, celular deficiência auditiva, celular deficiência motora, celular ideal 2026" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container max-w-4xl mx-auto py-8 px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/comunidade">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Link>
            </Button>

            {pageState !== 'intro' && (
              <Button variant="outline" size="sm" onClick={() => setPageState('history')}>
                <History className="w-4 h-4 mr-2" />
                Histórico
              </Button>
            )}
          </div>

          {/* Intro State */}
          {pageState === 'intro' && (
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto p-4 rounded-full bg-primary/10 w-fit mb-4">
                  <Smartphone className="w-12 h-12 text-primary" />
                </div>
                <CardTitle className="text-2xl md:text-3xl">Escolha do Celular Ideal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-lg text-muted-foreground max-w-md mx-auto">
                  Responda algumas perguntas simples e receba uma recomendação clara do melhor celular para você.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button size="lg" onClick={handleStartQuiz} className="min-w-[200px]">
                    <Smartphone className="w-5 h-5 mr-2" />
                    Começar
                  </Button>

                  {history.length > 0 && (
                    <Button variant="outline" size="lg" onClick={() => setPageState('history')}>
                      <History className="w-5 h-5 mr-2" />
                      Ver Histórico
                    </Button>
                  )}
                </div>

                <p className="text-sm text-muted-foreground">
                  Função exclusiva e gratuita para membros da comunidade
                </p>
              </CardContent>
            </Card>
          )}

          {/* Quiz State */}
          {pageState === 'quiz' && (
            <Card>
              <CardContent className="p-6 md:p-8">
                <PhoneQuizWizardPCD onComplete={handleQuizComplete} isCalculating={isCalculating} />
              </CardContent>
            </Card>
          )}

          {/* Result State */}
          {pageState === 'result' && result && (
            <div className="space-y-6">
              {/* Actions */}
              <div className="flex flex-wrap gap-3 justify-center">
                <Button variant="outline" onClick={handleStartQuiz}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Nova Busca
                </Button>
                {result.alternatives.length > 0 && (
                  <Button variant="outline" onClick={() => setShowComparison(true)}>
                    <GitCompare className="w-4 h-4 mr-2" />
                    Comparar
                  </Button>
                )}
              </div>

              {/* Main Result */}
              <PhoneResultCard
                phone={result.main}
                isMain
                reasonText={generateReasonText(result.main, currentAnswers)}
              />

              {/* Alternatives */}
              {result.alternatives.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-center">Alternativas</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {result.alternatives.map((phone) => (
                      <PhoneResultCard key={phone.id} phone={phone} />
                    ))}
                  </div>
                </div>
              )}

              {/* Comparison Modal */}
              <PhoneComparisonModal
                phones={[result.main, ...result.alternatives]}
                open={showComparison}
                onOpenChange={setShowComparison}
              />
            </div>
          )}

          {/* History State */}
          {pageState === 'history' && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <Button variant="ghost" size="sm" onClick={() => setPageState('intro')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
                </div>

                {isLoadingHistory ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <PhoneHistoryList history={history} onSelect={handleViewHistoryItem} />
                )}

                {!isLoadingHistory && (
                  <div className="mt-6 text-center">
                    <Button onClick={handleStartQuiz}>
                      <Smartphone className="w-4 h-4 mr-2" />
                      Nova Busca
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
