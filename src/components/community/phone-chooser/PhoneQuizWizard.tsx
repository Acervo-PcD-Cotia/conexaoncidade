import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { PhoneQuizQuestion } from './PhoneQuizQuestion';
import type { QuizAnswers } from '@/hooks/usePhoneChooser';

interface PhoneQuizWizardProps {
  onComplete: (answers: QuizAnswers) => void;
  isCalculating?: boolean;
}

const QUESTIONS = [
  {
    key: 'usage',
    question: 'Para que você mais usa o celular?',
    options: [
      { value: 'social', label: 'Redes sociais e mensagens', description: 'WhatsApp, Instagram, TikTok...' },
      { value: 'photography', label: 'Fotos e vídeos', description: 'Gosto de registrar momentos' },
      { value: 'games', label: 'Jogos', description: 'Free Fire, PUBG, outros jogos' },
      { value: 'work', label: 'Trabalho e produtividade', description: 'E-mails, documentos, reuniões' },
      { value: 'all', label: 'Tudo um pouco', description: 'Uso variado' },
    ],
  },
  {
    key: 'budget',
    question: 'Quanto pretende gastar?',
    options: [
      { value: 'budget', label: 'Até R$ 1.500', description: 'Bom custo-benefício' },
      { value: 'mid', label: 'R$ 1.500 a R$ 3.000', description: 'Equilíbrio entre preço e qualidade' },
      { value: 'premium', label: 'R$ 3.000 a R$ 6.000', description: 'Alta qualidade' },
      { value: 'flagship', label: 'Acima de R$ 6.000', description: 'O melhor disponível' },
    ],
  },
  {
    key: 'brand',
    question: 'Tem alguma marca preferida?',
    optional: true,
    options: [
      { value: 'Samsung', label: 'Samsung' },
      { value: 'Apple', label: 'Apple (iPhone)' },
      { value: 'Motorola', label: 'Motorola' },
      { value: 'Xiaomi', label: 'Xiaomi' },
      { value: 'any', label: 'Sem preferência', description: 'Aceito qualquer marca' },
    ],
  },
  {
    key: 'priority',
    question: 'O que é mais importante para você?',
    options: [
      { value: 'battery', label: 'Duração da bateria', description: 'Celular que dura o dia todo' },
      { value: 'camera', label: 'Qualidade da câmera', description: 'Fotos bonitas e nítidas' },
      { value: 'gaming', label: 'Desempenho para jogos', description: 'Rodar jogos sem travar' },
      { value: 'storage', label: 'Espaço para fotos/apps', description: 'Muito armazenamento' },
      { value: 'price', label: 'Preço mais baixo possível', description: 'Economizar dinheiro' },
    ],
  },
  {
    key: 'gaming',
    question: 'Você joga no celular?',
    options: [
      { value: 'none', label: 'Não jogo', description: 'Não tenho interesse' },
      { value: 'casual', label: 'Jogos leves (casual)', description: 'Candy Crush, Subway Surfers...' },
      { value: 'heavy', label: 'Jogos pesados (competitivo)', description: 'Free Fire, PUBG, Genshin...' },
    ],
  },
  {
    key: 'work',
    question: 'Usa para trabalho?',
    options: [
      { value: 'true', label: 'Sim, preciso para trabalho', description: 'E-mails, apps profissionais' },
      { value: 'false', label: 'Não, uso pessoal', description: 'Apenas para uso pessoal' },
    ],
  },
  {
    key: 'social',
    question: 'Usa muito redes sociais?',
    options: [
      { value: 'heavy', label: 'Uso bastante', description: 'TikTok, Instagram, Facebook...' },
      { value: 'moderate', label: 'Uso moderado', description: 'Algumas vezes por dia' },
      { value: 'light', label: 'Uso pouco', description: 'Raramente acesso' },
    ],
  },
];

export function PhoneQuizWizard({ onComplete, isCalculating }: PhoneQuizWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const currentQuestion = QUESTIONS[currentStep];
  const progress = ((currentStep + 1) / QUESTIONS.length) * 100;

  const handleAnswer = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.key]: value }));
  };

  const canProceed = answers[currentQuestion.key] || currentQuestion.optional;

  const handleNext = () => {
    if (currentStep === QUESTIONS.length - 1) {
      // Submit
      const finalAnswers: QuizAnswers = {
        usage: (answers.usage as QuizAnswers['usage']) || 'all',
        budget: (answers.budget as QuizAnswers['budget']) || 'mid',
        brand: answers.brand === 'any' ? null : answers.brand || null,
        priority: (answers.priority as QuizAnswers['priority']) || 'battery',
        gaming: (answers.gaming as QuizAnswers['gaming']) || 'none',
        work: answers.work === 'true',
        social: (answers.social as QuizAnswers['social']) || 'moderate',
      };
      onComplete(finalAnswers);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  return (
    <div className="space-y-8">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            Pergunta {currentStep + 1} de {QUESTIONS.length}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question */}
      <PhoneQuizQuestion
        question={currentQuestion.question}
        options={currentQuestion.options}
        value={answers[currentQuestion.key] || null}
        onChange={handleAnswer}
        optional={currentQuestion.optional}
      />

      {/* Navigation */}
      <div className="flex justify-between gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0 || isCalculating}
          className="flex-1 h-12"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <Button
          type="button"
          onClick={handleNext}
          disabled={!canProceed || isCalculating}
          className="flex-1 h-12"
        >
          {isCalculating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Calculando...
            </>
          ) : currentStep === QUESTIONS.length - 1 ? (
            'Ver Recomendação'
          ) : (
            <>
              Próxima
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
