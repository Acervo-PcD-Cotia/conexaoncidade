import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, MapPin, AlertTriangle, CheckCircle } from 'lucide-react';

interface QuizQuestion {
  id: number;
  question: string;
  options: { label: string; value: string; weight: number }[];
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: 'Seu negócio já aparece no Google Maps?',
    options: [
      { label: 'Sim', value: 'yes', weight: 0 },
      { label: 'Não', value: 'no', weight: 2 },
      { label: 'Não sei', value: 'unknown', weight: 1 },
    ],
  },
  {
    id: 2,
    question: 'Seu perfil possui fotos reais e recentes?',
    options: [
      { label: 'Sim, atualizadas', value: 'yes', weight: 0 },
      { label: 'Poucas fotos', value: 'few', weight: 1 },
      { label: 'Não possui fotos', value: 'no', weight: 2 },
    ],
  },
  {
    id: 3,
    question: 'Você costuma responder avaliações de clientes?',
    options: [
      { label: 'Sempre', value: 'always', weight: 0 },
      { label: 'Às vezes', value: 'sometimes', weight: 1 },
      { label: 'Nunca', value: 'never', weight: 2 },
    ],
  },
  {
    id: 4,
    question: 'Seu horário de funcionamento no Google Maps está sempre correto?',
    options: [
      { label: 'Sim', value: 'yes', weight: 0 },
      { label: 'Não', value: 'no', weight: 2 },
      { label: 'Não sei', value: 'unknown', weight: 1 },
    ],
  },
  {
    id: 5,
    question: 'Seu negócio aparece quando alguém pesquisa "serviço + bairro"?',
    options: [
      { label: 'Sim', value: 'yes', weight: 0 },
      { label: 'Não', value: 'no', weight: 2 },
      { label: 'Nunca testei', value: 'unknown', weight: 1 },
    ],
  },
  {
    id: 6,
    question: 'Você sabia que pequenas correções no Google Maps podem aumentar a visibilidade sem anúncios pagos?',
    options: [
      { label: 'Sim, já sabia', value: 'yes', weight: 0 },
      { label: 'Não sabia', value: 'no', weight: 0 },
    ],
  },
];

interface GoogleMapsQuizProps {
  onComplete: (responses: Record<string, string>, score: number) => void;
  onBack: () => void;
}

export function GoogleMapsQuiz({ onComplete, onBack }: GoogleMapsQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);

  const question = quizQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;

  const handleAnswer = (value: string, weight: number) => {
    const newResponses = {
      ...responses,
      [`q${question.id}`]: value,
      [`q${question.id}_weight`]: String(weight),
    };
    setResponses(newResponses);

    if (currentQuestion < quizQuestions.length - 1) {
      setTimeout(() => setCurrentQuestion(prev => prev + 1), 300);
    } else {
      setShowResult(true);
    }
  };

  const calculateScore = () => {
    let score = 0;
    quizQuestions.forEach(q => {
      const weight = parseInt(responses[`q${q.id}_weight`] || '0');
      score += weight;
    });
    return score;
  };

  const getResultMessage = (score: number) => {
    if (score <= 3) {
      return {
        type: 'good',
        title: 'Seu negócio parece bem posicionado!',
        message: 'Parabéns! Seu perfil no Google Maps está em bom estado. Mas sempre há espaço para melhorias.',
        icon: CheckCircle,
        color: 'text-primary',
        bgColor: 'bg-primary/10',
      };
    } else if (score <= 6) {
      return {
        type: 'warning',
        title: 'Seu negócio pode estar perdendo visibilidade',
        message: 'Identificamos alguns pontos de melhoria que podem aumentar suas visitas e clientes.',
        icon: AlertTriangle,
        color: 'text-amber-500',
        bgColor: 'bg-amber-500/10',
      };
    } else {
      return {
        type: 'critical',
        title: 'Atenção! Seu negócio pode estar invisível',
        message: 'Existem problemas importantes que podem estar impedindo clientes de encontrar você no Google.',
        icon: AlertTriangle,
        color: 'text-destructive',
        bgColor: 'bg-destructive/10',
      };
    }
  };

  const handleContinue = () => {
    const score = calculateScore();
    onComplete(responses, score);
  };

  if (showResult) {
    const score = calculateScore();
    const result = getResultMessage(score);
    const Icon = result.icon;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center p-4"
      >
        <Card className="max-w-lg w-full">
          <CardContent className="pt-8 pb-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className={`w-20 h-20 rounded-full ${result.bgColor} flex items-center justify-center mx-auto mb-6`}
            >
              <Icon className={`h-10 w-10 ${result.color}`} />
            </motion.div>

            <h2 className="text-2xl font-bold mb-4">{result.title}</h2>
            <p className="text-muted-foreground mb-8">{result.message}</p>

            <div className="space-y-3">
              <Button onClick={handleContinue} size="lg" className="w-full">
                Quero corrigir minha presença no Google Maps
              </Button>
              <Button variant="ghost" onClick={onBack} className="w-full">
                Voltar ao início
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={currentQuestion === 0 ? onBack : () => setCurrentQuestion(prev => prev - 1)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>

          <div className="flex items-center gap-3 mb-4">
            <MapPin className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              Diagnóstico Google Maps
            </span>
          </div>

          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2 text-right">
            Pergunta {currentQuestion + 1} de {quizQuestions.length}
          </p>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardContent className="pt-8 pb-6">
                <h2 className="text-xl font-semibold mb-6 text-center">
                  {question.question}
                </h2>

                <div className="space-y-3">
                  {question.options.map((option) => (
                    <motion.button
                      key={option.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer(option.value, option.weight)}
                      className={`
                        w-full p-4 text-left rounded-lg border-2 transition-all
                        hover:border-primary hover:bg-primary/5
                        ${responses[`q${question.id}`] === option.value 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border'}
                      `}
                    >
                      <span className="font-medium">{option.label}</span>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
