import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, MapPin, Building2, Settings, FileText, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BusinessPhotoUploader, PhotoType } from './BusinessPhotoUploader';
import { LeadFormData } from '@/hooks/useCampaignLeads';

const formSchema = z.object({
  // Bloco A
  business_name: z.string().min(2, 'Nome do negócio é obrigatório').max(100),
  business_category: z.string().min(1, 'Selecione uma categoria'),
  address: z.string().min(5, 'Endereço é obrigatório'),
  whatsapp: z.string().min(10, 'WhatsApp inválido').max(15),
  email: z.string().email('Email inválido'),
  
  // Bloco B
  has_google_maps: z.enum(['yes', 'no', 'unknown']).optional(),
  google_maps_link: z.string().url().optional().or(z.literal('')),
  has_photos: z.enum(['yes', 'few', 'no']).optional(),
  responds_reviews: z.enum(['always', 'sometimes', 'never']).optional(),
  correct_hours: z.enum(['yes', 'no', 'unknown']).optional(),
  
  // Bloco C
  authorized_review: z.boolean().default(false),
  authorized_photos: z.boolean().default(false),
  authorized_corrections: z.boolean().default(false),
  authorized_local_guide: z.boolean().default(false),
  
  // Bloco D
  business_description: z.string().optional(),
  
  // Bloco E
  consent_google_maps: z.boolean().default(false),
  consent_portal: z.boolean().default(false),
  consent_community: z.boolean().default(false),
  wants_community: z.enum(['yes', 'yes_support', 'only_free']).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface PhotoFile {
  file: File;
  preview: string;
  type: PhotoType;
}

interface BusinessRegistrationFormProps {
  quizResponses: Record<string, string>;
  quizScore: number;
  onSubmit: (data: LeadFormData, photos: PhotoFile[]) => Promise<void>;
  onBack: () => void;
  isSubmitting: boolean;
}

const steps = [
  { id: 'identification', title: 'Identificação', icon: Building2 },
  { id: 'status', title: 'Situação', icon: MapPin },
  { id: 'authorizations', title: 'Autorizações', icon: Settings },
  { id: 'content', title: 'Conteúdo', icon: FileText },
  { id: 'consent', title: 'Finalizar', icon: Users },
];

const categories = [
  { value: 'restaurant', label: 'Restaurante / Alimentação' },
  { value: 'commerce', label: 'Comércio' },
  { value: 'service', label: 'Prestador de Serviço' },
  { value: 'health', label: 'Clínica / Saúde' },
  { value: 'education', label: 'Educação' },
  { value: 'beauty', label: 'Beleza / Estética' },
  { value: 'automotive', label: 'Automotivo' },
  { value: 'other', label: 'Outro' },
];

export function BusinessRegistrationForm({
  quizResponses,
  quizScore,
  onSubmit,
  onBack,
  isSubmitting,
}: BusinessRegistrationFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [photos, setPhotos] = useState<PhotoFile[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      business_name: '',
      business_category: '',
      address: '',
      whatsapp: '',
      email: '',
      has_google_maps: quizResponses.q1 as 'yes' | 'no' | 'unknown' | undefined,
      has_photos: quizResponses.q2 as 'yes' | 'few' | 'no' | undefined,
      responds_reviews: quizResponses.q3 as 'always' | 'sometimes' | 'never' | undefined,
      correct_hours: quizResponses.q4 as 'yes' | 'no' | 'unknown' | undefined,
      authorized_review: false,
      authorized_photos: false,
      authorized_corrections: false,
      authorized_local_guide: false,
      business_description: '',
      consent_google_maps: false,
      consent_portal: false,
      consent_community: false,
      wants_community: 'yes',
    },
  });

  const watchHasGoogleMaps = form.watch('has_google_maps');
  const progress = ((currentStep + 1) / steps.length) * 100;

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await form.trigger(fieldsToValidate as any);
    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      onBack();
    }
  };

  const getFieldsForStep = (step: number): (keyof FormData)[] => {
    switch (step) {
      case 0:
        return ['business_name', 'business_category', 'address', 'whatsapp', 'email'];
      case 1:
        return ['has_google_maps', 'has_photos', 'responds_reviews', 'correct_hours'];
      case 2:
        return ['authorized_review', 'authorized_photos', 'authorized_corrections', 'authorized_local_guide'];
      case 3:
        return ['business_description'];
      case 4:
        return ['consent_google_maps', 'consent_portal', 'consent_community', 'wants_community'];
      default:
        return [];
    }
  };

  const handleSubmit = async (data: FormData) => {
    const leadData: LeadFormData = {
      business_name: data.business_name,
      business_category: data.business_category,
      address: data.address,
      whatsapp: data.whatsapp,
      email: data.email,
      has_google_maps: data.has_google_maps,
      google_maps_link: data.google_maps_link || undefined,
      has_photos: data.has_photos,
      responds_reviews: data.responds_reviews,
      correct_hours: data.correct_hours,
      authorized_review: data.authorized_review,
      authorized_photos: data.authorized_photos,
      authorized_corrections: data.authorized_corrections,
      authorized_local_guide: data.authorized_local_guide,
      business_description: data.business_description,
      consent_google_maps: data.consent_google_maps,
      consent_portal: data.consent_portal,
      consent_community: data.consent_community,
      wants_community: data.wants_community,
      quiz_responses: quizResponses,
      quiz_score: quizScore,
    };
    await onSubmit(leadData, photos);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="business_name">Nome do negócio *</Label>
              <Input
                id="business_name"
                placeholder="Como deve aparecer no Google Maps"
                {...form.register('business_name')}
              />
              {form.formState.errors.business_name && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.business_name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="business_category">Categoria principal *</Label>
              <Select
                onValueChange={(value) => form.setValue('business_category', value)}
                value={form.watch('business_category')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.business_category && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.business_category.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="address">Endereço completo *</Label>
              <Input
                id="address"
                placeholder="Rua, número, bairro, cidade"
                {...form.register('address')}
              />
              {form.formState.errors.address && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.address.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="whatsapp">WhatsApp do negócio *</Label>
                <Input
                  id="whatsapp"
                  placeholder="11999999999"
                  {...form.register('whatsapp')}
                />
                {form.formState.errors.whatsapp && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.whatsapp.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email do responsável *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contato@negocio.com"
                  {...form.register('email')}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.email.message}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base">Seu negócio já possui cadastro no Google Maps?</Label>
              <RadioGroup
                onValueChange={(value) => form.setValue('has_google_maps', value as 'yes' | 'no' | 'unknown')}
                value={form.watch('has_google_maps')}
                className="mt-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="gm-yes" />
                  <Label htmlFor="gm-yes" className="font-normal">Sim</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="gm-no" />
                  <Label htmlFor="gm-no" className="font-normal">Não</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="unknown" id="gm-unknown" />
                  <Label htmlFor="gm-unknown" className="font-normal">Não sei</Label>
                </div>
              </RadioGroup>
            </div>

            {watchHasGoogleMaps === 'yes' && (
              <div>
                <Label htmlFor="google_maps_link">Link do seu negócio no Google Maps</Label>
                <Input
                  id="google_maps_link"
                  placeholder="https://maps.google.com/..."
                  {...form.register('google_maps_link')}
                />
              </div>
            )}

            <div>
              <Label className="text-base">O perfil possui fotos reais e recentes?</Label>
              <RadioGroup
                onValueChange={(value) => form.setValue('has_photos', value as 'yes' | 'few' | 'no')}
                value={form.watch('has_photos')}
                className="mt-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="photos-yes" />
                  <Label htmlFor="photos-yes" className="font-normal">Sim</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="few" id="photos-few" />
                  <Label htmlFor="photos-few" className="font-normal">Poucas</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="photos-no" />
                  <Label htmlFor="photos-no" className="font-normal">Não</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base">Você responde avaliações de clientes?</Label>
              <RadioGroup
                onValueChange={(value) => form.setValue('responds_reviews', value as 'always' | 'sometimes' | 'never')}
                value={form.watch('responds_reviews')}
                className="mt-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="always" id="reviews-always" />
                  <Label htmlFor="reviews-always" className="font-normal">Sempre</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sometimes" id="reviews-sometimes" />
                  <Label htmlFor="reviews-sometimes" className="font-normal">Às vezes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="never" id="reviews-never" />
                  <Label htmlFor="reviews-never" className="font-normal">Nunca</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base">O horário de funcionamento está correto?</Label>
              <RadioGroup
                onValueChange={(value) => form.setValue('correct_hours', value as 'yes' | 'no' | 'unknown')}
                value={form.watch('correct_hours')}
                className="mt-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="hours-yes" />
                  <Label htmlFor="hours-yes" className="font-normal">Sim</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="hours-no" />
                  <Label htmlFor="hours-no" className="font-normal">Não</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="unknown" id="hours-unknown" />
                  <Label htmlFor="hours-unknown" className="font-normal">Não sei</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Algumas ações ajudam mais pessoas a encontrar seu negócio no Google Maps. 
                Selecione o que você autoriza:
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="auth-review"
                  checked={form.watch('authorized_review')}
                  onCheckedChange={(checked) => form.setValue('authorized_review', !!checked)}
                />
                <div className="space-y-1">
                  <Label htmlFor="auth-review" className="font-medium cursor-pointer">
                    Avaliação descritiva do local
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Publicaremos uma avaliação positiva e honesta sobre seu negócio
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="auth-photos"
                  checked={form.watch('authorized_photos')}
                  onCheckedChange={(checked) => form.setValue('authorized_photos', !!checked)}
                />
                <div className="space-y-1">
                  <Label htmlFor="auth-photos" className="font-medium cursor-pointer">
                    Envio de fotos reais do estabelecimento
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Usaremos as fotos que você enviar para melhorar seu perfil
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="auth-corrections"
                  checked={form.watch('authorized_corrections')}
                  onCheckedChange={(checked) => form.setValue('authorized_corrections', !!checked)}
                />
                <div className="space-y-1">
                  <Label htmlFor="auth-corrections" className="font-medium cursor-pointer">
                    Correção de informações
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Horário, categoria, descrição e outras informações
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="auth-local-guide"
                  checked={form.watch('authorized_local_guide')}
                  onCheckedChange={(checked) => form.setValue('authorized_local_guide', !!checked)}
                />
                <div className="space-y-1">
                  <Label htmlFor="auth-local-guide" className="font-medium cursor-pointer">
                    Inclusão no Guia Local do Conexão na Cidade
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Seu negócio será listado em nosso diretório de empresas locais
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="business_description" className="text-base">
                Descreva brevemente seu negócio
              </Label>
              <p className="text-sm text-muted-foreground mb-3">
                O que faz, para quem atende, há quanto tempo existe
              </p>
              <Textarea
                id="business_description"
                placeholder="Ex: Padaria artesanal há 15 anos no bairro, especializada em pães integrais e bolos caseiros..."
                className="min-h-[120px]"
                {...form.register('business_description')}
              />
            </div>

            <BusinessPhotoUploader
              photos={photos}
              onChange={setPhotos}
              maxPhotos={10}
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label className="text-base">
                Você autoriza o uso dessas informações para:
              </Label>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="consent-gm"
                  checked={form.watch('consent_google_maps')}
                  onCheckedChange={(checked) => form.setValue('consent_google_maps', !!checked)}
                />
                <Label htmlFor="consent-gm" className="font-normal cursor-pointer">
                  Cadastro ou correção no Google Maps
                </Label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="consent-portal"
                  checked={form.watch('consent_portal')}
                  onCheckedChange={(checked) => form.setValue('consent_portal', !!checked)}
                />
                <Label htmlFor="consent-portal" className="font-normal cursor-pointer">
                  Divulgação no Portal Conexão na Cidade
                </Label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="consent-community"
                  checked={form.watch('consent_community')}
                  onCheckedChange={(checked) => form.setValue('consent_community', !!checked)}
                />
                <Label htmlFor="consent-community" className="font-normal cursor-pointer">
                  Inclusão na comunidade local de negócios
                </Label>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Label className="text-base">
                Deseja fazer parte da Comunidade Conexão na Cidade?
              </Label>
              <RadioGroup
                onValueChange={(value) => form.setValue('wants_community', value as 'yes' | 'yes_support' | 'only_free')}
                value={form.watch('wants_community')}
                className="mt-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="community-yes" />
                  <Label htmlFor="community-yes" className="font-normal">Sim</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes_support" id="community-support" />
                  <Label htmlFor="community-support" className="font-normal">
                    Sim, quero apoio para aparecer melhor no Google Maps
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="only_free" id="community-free" />
                  <Label htmlFor="community-free" className="font-normal">
                    Apenas o cadastro gratuito
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" onClick={prevStep} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>

          <div className="flex items-center gap-3 mb-4">
            <MapPin className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              Cadastro do Negócio
            </span>
          </div>

          <Progress value={progress} className="h-2 mb-2" />
          
          {/* Step indicators */}
          <div className="flex justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.id}
                  className={`flex flex-col items-center ${
                    index <= currentStep ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                    index <= currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs hidden sm:block">{step.title}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {(() => {
                  const Icon = steps[currentStep].icon;
                  return <Icon className="h-5 w-5" />;
                })()}
                {steps[currentStep].title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderStep()}
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <Button type="button" variant="outline" onClick={prevStep}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Anterior
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button type="button" onClick={nextStep}>
                Próximo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Finalizar Cadastro'
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
