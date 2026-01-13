import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Loader2, Accessibility } from 'lucide-react';
import { PhoneQuizQuestion } from './PhoneQuizQuestion';
import { PhoneQuizQuestionMulti } from './PhoneQuizQuestionMulti';
import type { QuizAnswersPCD } from '@/hooks/usePhoneChooser';

interface PhoneQuizWizardPCDProps {
  onComplete: (answers: QuizAnswersPCD) => void;
  isCalculating?: boolean;
}

type QuestionType = 'single' | 'multi';

interface Question {
  key: string;
  question: string;
  type: QuestionType;
  options: { value: string; label: string; description?: string }[];
  optional?: boolean;
  block: number;
  blockName: string;
}

const QUESTIONS: Question[] = [
  // BLOCO 1 - Perfil Geral
  {
    key: 'usage',
    question: 'Como você mais utiliza o celular?',
    type: 'single',
    block: 1,
    blockName: 'Perfil Geral',
    options: [
      { value: 'communication', label: 'Comunicação diária', description: 'WhatsApp, ligações, videochamadas' },
      { value: 'work', label: 'Trabalho e estudos', description: 'E-mails, documentos, reuniões' },
      { value: 'entertainment', label: 'Entretenimento', description: 'Vídeos, música, jogos' },
      { value: 'health', label: 'Saúde e bem-estar', description: 'Apps de saúde, monitoramento' },
      { value: 'basic', label: 'Uso básico', description: 'Ligações e mensagens simples' },
    ],
  },
  {
    key: 'budget',
    question: 'Qual faixa de preço você pretende investir?',
    type: 'single',
    block: 1,
    blockName: 'Perfil Geral',
    options: [
      { value: 'under800', label: 'Até R$ 800', description: 'Opções econômicas' },
      { value: '800to1500', label: 'R$ 800 a R$ 1.500', description: 'Bom custo-benefício' },
      { value: '1500to3000', label: 'R$ 1.500 a R$ 3.000', description: 'Equilíbrio entre preço e qualidade' },
      { value: 'above3000', label: 'Acima de R$ 3.000', description: 'Alta qualidade e recursos avançados' },
    ],
  },
  // BLOCO 2 - Identificação de Acessibilidade
  {
    key: 'isPCD',
    question: 'Você se identifica como Pessoa com Deficiência?',
    type: 'single',
    block: 2,
    blockName: 'Acessibilidade',
    options: [
      { value: 'yes', label: 'Sim' },
      { value: 'no', label: 'Não' },
      { value: 'prefer_not_say', label: 'Prefiro não informar' },
    ],
  },
  {
    key: 'disabilityTypes',
    question: 'Qual(is) tipo(s) de deficiência você possui?',
    type: 'multi',
    block: 2,
    blockName: 'Acessibilidade',
    optional: true,
    options: [
      { value: 'visual', label: 'Visual', description: 'Baixa visão ou cegueira' },
      { value: 'auditory', label: 'Auditiva', description: 'Surdez ou perda auditiva' },
      { value: 'motor', label: 'Física/motora', description: 'Dificuldade de movimento' },
      { value: 'intellectual', label: 'Intelectual' },
      { value: 'psychosocial', label: 'Psicossocial' },
      { value: 'neurodivergent', label: 'Neurodivergência', description: 'TEA, TDAH, etc.' },
      { value: 'multiple', label: 'Múltipla' },
      { value: 'prefer_not_say', label: 'Prefiro não informar' },
    ],
  },
  // BLOCO 3 - Necessidades Específicas
  {
    key: 'accessibilityNeeds',
    question: 'O que mais facilitaria o uso do celular para você?',
    type: 'multi',
    block: 3,
    blockName: 'Necessidades',
    optional: true,
    options: [
      { value: 'large_screen', label: 'Tela grande', description: 'Mais fácil de visualizar' },
      { value: 'high_contrast', label: 'Alto contraste', description: 'Cores bem definidas' },
      { value: 'screen_reader', label: 'Leitor de tela eficiente', description: 'TalkBack ou VoiceOver' },
      { value: 'voice_control', label: 'Controle por voz', description: 'Comandos falados' },
      { value: 'strong_vibration', label: 'Vibração forte', description: 'Notificações táteis' },
      { value: 'physical_buttons', label: 'Botões físicos ou atalhos', description: 'Acesso rápido' },
      { value: 'simple_interface', label: 'Interface simples', description: 'Fácil de usar' },
      { value: 'loud_audio', label: 'Áudio alto e limpo', description: 'Som de qualidade' },
    ],
  },
  {
    key: 'accessibilityTools',
    question: 'Você utiliza ou pretende utilizar algum recurso?',
    type: 'multi',
    block: 3,
    blockName: 'Necessidades',
    optional: true,
    options: [
      { value: 'talkback', label: 'TalkBack (Android)', description: 'Leitor de tela Android' },
      { value: 'voiceover', label: 'VoiceOver (iPhone)', description: 'Leitor de tela Apple' },
      { value: 'libras', label: 'VLibras ou apps de Libras' },
      { value: 'dictation', label: 'Ditado por voz' },
      { value: 'magnification', label: 'Ampliação de tela' },
      { value: 'accessibility_keys', label: 'Teclas de acessibilidade' },
      { value: 'none', label: 'Não utilizo recursos de acessibilidade' },
    ],
  },
  // BLOCO 4 - Conforto e Segurança
  {
    key: 'physicalPreferences',
    question: 'Você prefere celulares com quais características?',
    type: 'multi',
    block: 4,
    blockName: 'Conforto',
    optional: true,
    options: [
      { value: 'lightweight', label: 'Peso leve', description: 'Fácil de segurar' },
      { value: 'ergonomic', label: 'Boa pegada', description: 'Ergonomia' },
      { value: 'drop_resistant', label: 'Resistência a quedas' },
      { value: 'water_resistant', label: 'Resistência à água' },
      { value: 'long_battery', label: 'Bateria de longa duração' },
    ],
  },
  {
    key: 'securityNeeds',
    question: 'Você precisa de funções extras de segurança?',
    type: 'multi',
    block: 4,
    blockName: 'Conforto',
    optional: true,
    options: [
      { value: 'emergency_button', label: 'Botão de emergência', description: 'Acesso rápido a socorro' },
      { value: 'location_sharing', label: 'Compartilhamento de localização' },
      { value: 'face_unlock', label: 'Desbloqueio por biometria facial' },
      { value: 'fingerprint', label: 'Desbloqueio por digital' },
      { value: 'none', label: 'Não preciso de recursos extras' },
    ],
  },
  // BLOCO 5 - Preferências Finais
  {
    key: 'purchasePreference',
    question: 'Você prefere comprar o celular:',
    type: 'single',
    block: 5,
    blockName: 'Preferências',
    options: [
      { value: 'new', label: 'Novo', description: 'Produto lacrado' },
      { value: 'refurbished', label: 'Recondicionado', description: 'Economia com garantia' },
      { value: 'any', label: 'Tanto faz', description: 'Depende da oferta' },
    ],
  },
  {
    key: 'wantsInstallments',
    question: 'Deseja ver ofertas com parcelamento acessível?',
    type: 'single',
    block: 5,
    blockName: 'Preferências',
    options: [
      { value: 'true', label: 'Sim', description: 'Parcelas que cabem no bolso' },
      { value: 'false', label: 'Não', description: 'Pagamento à vista' },
    ],
  },
];

export function PhoneQuizWizardPCD({ onComplete, isCalculating }: PhoneQuizWizardPCDProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const questionRef = useRef<HTMLHeadingElement>(null);

  const currentQuestion = QUESTIONS[currentStep];
  const progress = ((currentStep + 1) / QUESTIONS.length) * 100;
  const currentBlock = currentQuestion.block;

  // Focus on question when step changes for screen readers
  useEffect(() => {
    if (questionRef.current) {
      questionRef.current.focus();
    }
  }, [currentStep]);

  const handleSingleAnswer = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.key]: value }));
  };

  const handleMultiAnswer = (values: string[]) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.key]: values }));
  };

  const getCurrentAnswer = () => {
    return answers[currentQuestion.key];
  };

  const canProceed = () => {
    const answer = getCurrentAnswer();
    if (currentQuestion.optional) return true;
    if (currentQuestion.type === 'multi') {
      return Array.isArray(answer) && answer.length > 0;
    }
    return !!answer;
  };

  const handleNext = () => {
    if (currentStep === QUESTIONS.length - 1) {
      // Build final answers
      const finalAnswers: QuizAnswersPCD = {
        usage: (answers.usage as QuizAnswersPCD['usage']) || 'communication',
        budget: (answers.budget as QuizAnswersPCD['budget']) || '800to1500',
        isPCD: (answers.isPCD as QuizAnswersPCD['isPCD']) || 'prefer_not_say',
        disabilityTypes: (answers.disabilityTypes as QuizAnswersPCD['disabilityTypes']) || [],
        accessibilityNeeds: (answers.accessibilityNeeds as QuizAnswersPCD['accessibilityNeeds']) || [],
        accessibilityTools: (answers.accessibilityTools as QuizAnswersPCD['accessibilityTools']) || [],
        physicalPreferences: (answers.physicalPreferences as QuizAnswersPCD['physicalPreferences']) || [],
        securityNeeds: (answers.securityNeeds as QuizAnswersPCD['securityNeeds']) || [],
        purchasePreference: (answers.purchasePreference as QuizAnswersPCD['purchasePreference']) || 'any',
        wantsInstallments: answers.wantsInstallments === 'true',
      };
      onComplete(finalAnswers);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  // Skip disability types question if user said they're not PCD
  useEffect(() => {
    if (currentQuestion.key === 'disabilityTypes' && answers.isPCD === 'no') {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, answers.isPCD, currentQuestion.key]);

  return (
    <div className="space-y-6" role="form" aria-label="Quiz inclusivo para escolha do celular ideal">
      {/* Progress and Block Info */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Accessibility className="w-4 h-4 text-primary" aria-hidden="true" />
            <span className="font-medium text-primary">
              Bloco {currentBlock}: {currentQuestion.blockName}
            </span>
          </div>
          <span className="text-muted-foreground" aria-live="polite">
            Pergunta {currentStep + 1} de {QUESTIONS.length}
          </span>
        </div>
        <Progress 
          value={progress} 
          className="h-2" 
          aria-label={`Progresso: ${Math.round(progress)}%`}
        />
      </div>

      {/* Question */}
      <div className="min-h-[300px]">
        {currentQuestion.type === 'single' ? (
          <PhoneQuizQuestion
            question={currentQuestion.question}
            options={currentQuestion.options}
            value={(getCurrentAnswer() as string) || null}
            onChange={handleSingleAnswer}
            optional={currentQuestion.optional}
          />
        ) : (
          <PhoneQuizQuestionMulti
            question={currentQuestion.question}
            options={currentQuestion.options}
            value={(getCurrentAnswer() as string[]) || []}
            onChange={handleMultiAnswer}
            optional={currentQuestion.optional}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between gap-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0 || isCalculating}
          className="flex-1 h-14 text-base"
          aria-label="Voltar para pergunta anterior"
        >
          <ArrowLeft className="w-5 h-5 mr-2" aria-hidden="true" />
          Voltar
        </Button>

        <Button
          type="button"
          onClick={handleNext}
          disabled={!canProceed() || isCalculating}
          className="flex-1 h-14 text-base"
          aria-label={currentStep === QUESTIONS.length - 1 ? 'Ver minha recomendação' : 'Ir para próxima pergunta'}
        >
          {isCalculating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" aria-hidden="true" />
              <span>Calculando...</span>
            </>
          ) : currentStep === QUESTIONS.length - 1 ? (
            <span>Ver Recomendação</span>
          ) : (
            <>
              <span>Próxima</span>
              <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
            </>
          )}
        </Button>
      </div>

      {/* Accessibility hint */}
      <p className="text-xs text-center text-muted-foreground" aria-live="polite">
        Use Tab para navegar e Enter ou Espaço para selecionar
      </p>
    </div>
  );
}
