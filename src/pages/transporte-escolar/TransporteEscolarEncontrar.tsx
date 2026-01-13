import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, MessageCircle, Loader2 } from "lucide-react";
import { TransportQuizWizard, QuizAnswers } from "@/components/transporte-escolar/TransportQuizWizard";
import { TransporterCard } from "@/components/transporte-escolar/TransporterCard";
import { SchoolNotFoundModal } from "@/components/transporte-escolar/SchoolNotFoundModal";
import { TransportDisclaimer } from "@/components/transporte-escolar/TransportDisclaimer";
import { useTransportSearch, SearchFilters } from "@/hooks/useTransportSearch";
import { useCreateTransportLead } from "@/hooks/useTransportLeads";

export default function TransporteEscolarEncontrar() {
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers | null>(null);
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [whatsapp, setWhatsapp] = useState("");

  const searchFilters: SearchFilters | undefined = quizAnswers
    ? {
        rede: quizAnswers.rede !== "nao_sei" ? quizAnswers.rede : undefined,
        schoolId: quizAnswers.school?.id,
        turno: quizAnswers.turno,
        bairro: quizAnswers.bairro,
        acessibilidade: quizAnswers.acessibilidade,
      }
    : undefined;

  const { data: transporters, isLoading } = useTransportSearch(searchFilters || {});
  const createLead = useCreateTransportLead();

  const handleQuizComplete = (answers: QuizAnswers) => {
    setQuizAnswers(answers);
    setQuizCompleted(true);
  };

  const handleSchoolNotFound = () => {
    setShowSchoolModal(false);
  };

  const formatWhatsApp = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 11);
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  };

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizAnswers || !whatsapp) return;

    await createLead.mutateAsync({
      rede: quizAnswers.rede,
      school_id: quizAnswers.school?.id,
      school_texto: quizAnswers.schoolTexto,
      bairro: quizAnswers.bairro,
      turno: quizAnswers.turno,
      acessibilidade: quizAnswers.acessibilidade,
      contato_whatsapp: whatsapp.replace(/\D/g, ""),
      consentimento: true,
    });

    setShowLeadForm(false);
  };

  const handleStartOver = () => {
    setQuizCompleted(false);
    setQuizAnswers(null);
    setShowLeadForm(false);
  };

  return (
    <>
      <Helmet>
        <title>Encontrar Transporte Escolar | Transporte Escolar Cotia</title>
        <meta
          name="description"
          content="Encontre o transporte escolar ideal para seu filho em Cotia. Responda algumas perguntas e veja as opções disponíveis."
        />
      </Helmet>

      <div className="container py-8 max-w-4xl">
        <div className="mb-8">
          <Link to="/transporte-escolar">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </Link>
        </div>

        {!quizCompleted ? (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold">Encontrar Transporte Escolar</h1>
              <p className="text-muted-foreground">
                Responda algumas perguntas para encontrar o transporte ideal
              </p>
            </div>

            <TransportQuizWizard
              onComplete={handleQuizComplete}
              onSchoolNotFound={() => setShowSchoolModal(true)}
            />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold">Resultados da Busca</h1>
              <p className="text-muted-foreground">
                {quizAnswers?.school
                  ? `Transporte para ${quizAnswers.school.nome_oficial}`
                  : `Transporte em ${quizAnswers?.bairro}`}
              </p>
              <Button variant="link" onClick={handleStartOver}>
                Refazer busca
              </Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : transporters && transporters.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {transporters.map((transporter) => (
                  <TransporterCard
                    key={transporter.id}
                    transporter={transporter}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center space-y-4">
                  <p className="text-lg text-muted-foreground">
                    Não encontramos transportadores para essa busca.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Deixe seu contato e avisaremos quando houver opções disponíveis.
                  </p>

                  {!showLeadForm ? (
                    <Button onClick={() => setShowLeadForm(true)}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Receber aviso
                    </Button>
                  ) : (
                    <form onSubmit={handleSubmitLead} className="max-w-sm mx-auto space-y-4">
                      <div className="space-y-2 text-left">
                        <Label htmlFor="lead-whatsapp">Seu WhatsApp</Label>
                        <Input
                          id="lead-whatsapp"
                          value={whatsapp}
                          onChange={(e) => setWhatsapp(formatWhatsApp(e.target.value))}
                          placeholder="(11) 99999-9999"
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={createLead.isPending}
                      >
                        {createLead.isPending && (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        )}
                        Enviar
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            )}

            <TransportDisclaimer />
          </div>
        )}
      </div>

      <SchoolNotFoundModal
        open={showSchoolModal}
        onOpenChange={setShowSchoolModal}
        onSuccess={handleSchoolNotFound}
      />
    </>
  );
}
