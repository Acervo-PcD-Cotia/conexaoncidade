import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ShieldCheck, History, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FactCheckForm } from '@/components/factcheck/FactCheckForm';
import { FactCheckResult } from '@/components/factcheck/FactCheckResult';
import { VerdictBadge } from '@/components/factcheck/VerdictBadge';
import { useFactCheck, useFactCheckHistory, useFactCheckById, type FactCheckResult as FactCheckResultType, type FactCheckInputType } from '@/hooks/useFactCheck';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

export default function AntiFakeNews() {
  const [searchParams] = useSearchParams();
  const refSlug = searchParams.get('ref');
  const viewId = searchParams.get('id');
  
  const { user } = useAuth();
  const { submitVerification, reportError, submitToEditorial, isVerifying } = useFactCheck();
  const { data: history, isLoading: isHistoryLoading } = useFactCheckHistory(10);
  const { data: existingCheck, isLoading: isExistingLoading } = useFactCheckById(viewId);
  
  const [result, setResult] = useState<FactCheckResultType | null>(null);

  // If viewing an existing check
  useEffect(() => {
    if (existingCheck && viewId) {
      setResult({
        id: existingCheck.id,
        created_at: existingCheck.created_at,
        verdict: existingCheck.verdict,
        score: existingCheck.score,
        summary: existingCheck.summary || '',
        claims: existingCheck.claims || [],
        sources: existingCheck.sources || [],
        methodology: existingCheck.methodology || '',
        limitations: existingCheck.limitations || '',
        share_url: existingCheck.share_url || ''
      });
    }
  }, [existingCheck, viewId]);

  const handleSubmit = async (data: {
    input_type: FactCheckInputType;
    content: string;
    image_url?: string;
    opt_in_editorial?: boolean;
  }) => {
    const factCheckResult = await submitVerification({
      ...data,
      ref_slug: refSlug || undefined
    });
    setResult(factCheckResult);
  };

  const handleReport = async (reason: string) => {
    if (result) {
      await reportError.mutateAsync({ factCheckId: result.id, reason });
    }
  };

  const handleSubmitToEditorial = async () => {
    if (result) {
      await submitToEditorial.mutateAsync(result.id);
    }
  };

  const handleNewVerification = () => {
    setResult(null);
  };

  if (isExistingLoading && viewId) {
    return (
      <div className="container max-w-4xl py-8">
        <Skeleton className="h-12 w-64 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Check Fake News | Conexão na Cidade</title>
        <meta 
          name="description" 
          content="Verifique se uma informação é verdadeira antes de compartilhar. Cheque links, textos, títulos e imagens." 
        />
      </Helmet>

      <div className="container max-w-4xl py-8">
        {/* Header */}
        <header className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex items-center justify-center h-14 w-14 rounded-full bg-primary/10">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-heading mb-3">
            Check Fake News
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Verifique links, textos, prints e boatos antes de compartilhar.
            Nossa ferramenta analisa fontes confiáveis para ajudar você a identificar desinformação.
          </p>
        </header>

        {/* Main Content */}
        <div className="space-y-8">
          {!result ? (
            <>
              {/* Verification Form */}
              <Card>
                <CardHeader>
                  <CardTitle>O que você quer verificar?</CardTitle>
                </CardHeader>
                <CardContent>
                  <FactCheckForm
                    onSubmit={handleSubmit}
                    isLoading={isVerifying}
                    defaultContent={refSlug ? `https://conexaonacidade.com.br/noticia/${refSlug}` : ''}
                    defaultType={refSlug ? 'link' : 'text'}
                  />
                </CardContent>
              </Card>

              {/* User History */}
              {user && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5" />
                      Suas verificações recentes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isHistoryLoading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} className="h-16 w-full" />
                        ))}
                      </div>
                    ) : history && history.length > 0 ? (
                      <div className="space-y-3">
                        {history.map((check) => (
                          <Link
                            key={check.id}
                            to={`/anti-fake-news?id=${check.id}`}
                            className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex-1 min-w-0 mr-4">
                              <p className="text-sm font-medium truncate">
                                {check.input_content.slice(0, 80)}
                                {check.input_content.length > 80 ? '...' : ''}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(check.created_at), "d 'de' MMM, HH:mm", { locale: ptBR })}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium">{check.score}pts</span>
                              <VerdictBadge verdict={check.verdict} size="sm" showLabel={false} />
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Você ainda não fez nenhuma verificação.
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <>
              {/* Back button */}
              <Button variant="ghost" onClick={handleNewVerification} className="gap-2 -ml-2">
                <ArrowLeft className="h-4 w-4" />
                Nova verificação
              </Button>

              {/* Result */}
              <Card>
                <CardContent className="pt-6">
                  <FactCheckResult
                    result={result}
                    onReport={handleReport}
                    onSubmitToEditorial={handleSubmitToEditorial}
                  />
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </>
  );
}
