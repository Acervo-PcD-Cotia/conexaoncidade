import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { CampaignEditorialSection } from '@/components/campaigns/CampaignEditorialSection';
import { GoogleMapsQuiz } from '@/components/campaigns/GoogleMapsQuiz';
import { BusinessRegistrationForm } from '@/components/campaigns/BusinessRegistrationForm';
import { CampaignConfirmation } from '@/components/campaigns/CampaignConfirmation';
import { useCreateCampaignLead, useUploadLeadPhoto, LeadFormData } from '@/hooks/useCampaignLeads';
import { toast } from 'sonner';
import { PhotoType } from '@/components/campaigns/BusinessPhotoUploader';

type CampaignStep = 'editorial' | 'quiz' | 'form' | 'confirmation';

interface PhotoFile {
  file: File;
  preview: string;
  type: PhotoType;
}

export default function GoogleMapsCampaign() {
  const [step, setStep] = useState<CampaignStep>('editorial');
  const [quizResponses, setQuizResponses] = useState<Record<string, string>>({});
  const [quizScore, setQuizScore] = useState(0);
  const [submittedData, setSubmittedData] = useState<{
    businessName: string;
    wantsCommunity?: 'yes' | 'yes_support' | 'only_free';
  } | null>(null);

  const createLead = useCreateCampaignLead();
  const uploadPhoto = useUploadLeadPhoto();

  const handleQuizComplete = (responses: Record<string, string>, score: number) => {
    setQuizResponses(responses);
    setQuizScore(score);
    setStep('form');
  };

  const handleFormSubmit = async (data: LeadFormData, photos: PhotoFile[]) => {
    try {
      // Create lead
      const lead = await createLead.mutateAsync(data);

      // Upload photos
      for (const photo of photos) {
        await uploadPhoto.mutateAsync({
          leadId: lead.id,
          file: photo.file,
          photoType: photo.type,
        });
      }

      setSubmittedData({
        businessName: data.business_name,
        wantsCommunity: data.wants_community,
      });
      setStep('confirmation');
      toast.success('Cadastro enviado com sucesso!');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Erro ao enviar cadastro. Tente novamente.');
    }
  };

  return (
    <>
      <Helmet>
        <title>Seu negócio aparece no Google Maps? | Conexão na Cidade</title>
        <meta 
          name="description" 
          content="Descubra se seu negócio está visível no Google Maps. Diagnóstico gratuito em 2 minutos. Cadastro e correções sem custo. Aumente suas visitas e clientes." 
        />
        <meta property="og:title" content="Seu negócio aparece no Google Maps como deveria?" />
        <meta property="og:description" content="Diagnóstico gratuito de visibilidade no Google Maps. Descubra se seu negócio está invisível para clientes." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://conexaonacidade.com.br/campanha/google-maps" />
      </Helmet>

      {step === 'editorial' && (
        <CampaignEditorialSection onStartQuiz={() => setStep('quiz')} />
      )}

      {step === 'quiz' && (
        <GoogleMapsQuiz
          onComplete={handleQuizComplete}
          onBack={() => setStep('editorial')}
        />
      )}

      {step === 'form' && (
        <BusinessRegistrationForm
          quizResponses={quizResponses}
          quizScore={quizScore}
          onSubmit={handleFormSubmit}
          onBack={() => setStep('quiz')}
          isSubmitting={createLead.isPending || uploadPhoto.isPending}
        />
      )}

      {step === 'confirmation' && submittedData && (
        <CampaignConfirmation
          businessName={submittedData.businessName}
          wantsCommunity={submittedData.wantsCommunity}
        />
      )}
    </>
  );
}
