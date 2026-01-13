import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { CensoPcdWizard } from "@/components/censo-pcd/CensoPcdWizard";
import { CensoPcdConsentModal } from "@/components/censo-pcd/CensoPcdConsentModal";
import { useCensoPcd, CensoPcdFormData } from "@/hooks/useCensoPcd";
import { Accessibility } from "lucide-react";

export default function CensoPcdQuiz() {
  const navigate = useNavigate();
  const [consentAccepted, setConsentAccepted] = useState(false);
  const { submitResponse } = useCensoPcd();

  const handleConsentAccept = () => {
    setConsentAccepted(true);
  };

  const handleConsentDecline = () => {
    navigate("/censo-pcd");
  };

  const handleComplete = async (data: CensoPcdFormData) => {
    try {
      const result = await submitResponse.mutateAsync(data);
      navigate("/censo-pcd/concluido", { state: { responseId: result.id } });
    } catch (error) {
      console.error("Erro ao submeter:", error);
    }
  };

  return (
    <>
      <Helmet>
        <title>Participar do Censo PcD Cotia</title>
        <meta name="description" content="Responda o questionário do Censo PcD Cotia e contribua para políticas públicas mais inclusivas." />
      </Helmet>

      <CensoPcdConsentModal
        open={!consentAccepted}
        onAccept={handleConsentAccept}
        onDecline={handleConsentDecline}
      />

      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background py-8">
        <div className="container">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Accessibility className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Censo PcD Cotia</h1>
          </div>

          {consentAccepted && (
            <CensoPcdWizard
              onComplete={handleComplete}
              isSubmitting={submitResponse.isPending}
            />
          )}
        </div>
      </div>
    </>
  );
}
