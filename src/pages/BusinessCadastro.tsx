import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Loader2, CheckCircle2, Share2 } from 'lucide-react';
import { useBusinessForm } from '@/hooks/useBusinessForm';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Step1Identification from '@/components/voce-no-google/Step1Identification';
import Step2Location from '@/components/voce-no-google/Step2Location';
import Step3Hours from '@/components/voce-no-google/Step3Hours';
import Step4Content from '@/components/voce-no-google/Step4Content';
import Step5Review from '@/components/voce-no-google/Step5Review';

const STEP_LABELS = ['Identificação', 'Localização', 'Horários', 'Conteúdo', 'Revisão'];

function slugify(text: string) {
  return text
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function BusinessCadastro() {
  const { formData, updateField, currentStep, nextStep, prevStep, goToStep, clearDraft } = useBusinessForm();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdSlug, setCreatedSlug] = useState('');

  const progress = ((currentStep + 1) / 5) * 100;

  const canProceed = () => {
    switch (currentStep) {
      case 0: return formData.name.length >= 3 && !!formData.category_main;
      case 1: return !!formData.phone && !!formData.email;
      case 2: return true;
      case 3: return formData.description_full.length >= 150;
      case 4: return confirmed;
      default: return true;
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para cadastrar sua empresa.');
      navigate('/spah?redirect=/voce-no-google/cadastro');
      return;
    }

    setSubmitting(true);
    try {
      const slug = slugify(`${formData.name}-${formData.city || 'brasil'}`);
      
      const { error } = await supabase.from('businesses').insert({
        user_id: user.id,
        name: formData.name,
        slug,
        category_main: formData.category_main,
        categories_secondary: formData.categories_secondary,
        city: formData.city || 'Brasil',
        state: formData.state || null,
        address: formData.address || null,
        cep: formData.cep?.replace(/\D/g, '') || null,
        neighborhoods: formData.neighborhood ? [formData.neighborhood] : null,
        phone: formData.phone || null,
        whatsapp: formData.whatsapp_same ? formData.phone : formData.whatsapp || null,
        email: formData.email || null,
        website: formData.website || null,
        instagram: formData.instagram || null,
        facebook: formData.facebook || null,
        google_maps_url: formData.google_maps_url || null,
        description_full: formData.description_full || null,
        opening_hours: formData.opening_hours as any,
        amenities: formData.amenities,
        tags: formData.services,
        cnpj: formData.cnpj || null,
        year_founded: formData.year_founded ? parseInt(formData.year_founded) : null,
        business_type: formData.business_type,
        service_areas: formData.service_areas.length > 0 ? formData.service_areas : null,
        services: formData.services.length > 0 ? formData.services : null,
        number: formData.number || null,
        complement: formData.complement || null,
        holiday_hours: formData.holiday_hours ? { type: formData.holiday_hours } : null,
        is_active: true,
        plan: 'free' as any,
        verification_status: 'pending' as any,
      } as any);

      if (error) throw error;

      setCreatedSlug(slug);
      setSuccess(true);
      clearDraft();
      toast.success('Empresa cadastrada com sucesso!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Erro ao cadastrar empresa.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    const shareText = `Acabei de cadastrar minha empresa no Conexão na Cidade! 🎉`;
    const shareUrl = `https://conexaonacidade.com.br/empresa/${createdSlug}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;

    return (
      <div className="container max-w-lg py-16 text-center space-y-6">
        <Helmet><title>Cadastro concluído | Você no Google</title></Helmet>
        <div className="mx-auto h-16 w-16 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Seu cadastro foi recebido!</h1>
        <div className="text-left space-y-2 bg-muted/50 rounded-lg p-4">
          <p className="text-sm font-semibold text-foreground">Próximos passos:</p>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Sua empresa será revisada pela equipe (até 24h)</li>
            <li>Após aprovação, seu perfil ficará público com SEO otimizado</li>
            <li>Você receberá um e-mail com o link do seu perfil</li>
            <li>Acompanhe estatísticas no seu painel</li>
          </ol>
        </div>
        <div className="flex flex-col gap-2">
          <Button asChild className="gap-2">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <Share2 className="h-4 w-4" /> Compartilhar no WhatsApp
            </a>
          </Button>
          <Button asChild variant="outline">
            <Link to="/voce-no-google">Voltar para Você no Google</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Cadastrar Empresa | Você no Google — Conexão na Cidade</title>
        <meta name="description" content="Cadastre sua empresa gratuitamente e apareça no Google, Maps e IA generativa." />
      </Helmet>

      <div className="container max-w-2xl py-8 space-y-6">
        {/* Header */}
        <div>
          <Link to="/voce-no-google" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-4">
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar
          </Link>
          <h1 className="text-xl font-bold text-foreground">Cadastrar minha empresa</h1>
          <p className="text-sm text-muted-foreground">Etapa {currentStep + 1} de 5 — {STEP_LABELS[currentStep]}</p>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between">
            {STEP_LABELS.map((label, i) => (
              <button
                key={i}
                onClick={() => goToStep(i)}
                className={`text-xs transition-colors ${i === currentStep ? 'text-primary font-semibold' : i < currentStep ? 'text-foreground' : 'text-muted-foreground'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="min-h-[400px]">
          {currentStep === 0 && <Step1Identification data={formData} onChange={updateField} />}
          {currentStep === 1 && <Step2Location data={formData} onChange={updateField} />}
          {currentStep === 2 && <Step3Hours data={formData} onChange={updateField} />}
          {currentStep === 3 && <Step4Content data={formData} onChange={updateField} />}
          {currentStep === 4 && <Step5Review data={formData} onGoToStep={goToStep} confirmed={confirmed} onConfirm={setConfirmed} />}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="outline" onClick={prevStep} disabled={currentStep === 0} className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Anterior
          </Button>

          {currentStep < 4 ? (
            <Button onClick={nextStep} disabled={!canProceed()} className="gap-1">
              Próximo <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!confirmed || submitting} className="gap-1">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {submitting ? 'Publicando...' : 'Publicar minha empresa'}
            </Button>
          )}
        </div>

        {/* Auto-save indicator */}
        <p className="text-center text-xs text-muted-foreground">💾 Dados salvos automaticamente</p>
      </div>
    </>
  );
}
