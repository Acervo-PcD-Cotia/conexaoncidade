import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Award, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface QuizQuestion {
  id: number;
  question: string;
  supportText?: string;
  image?: string;
  options: string[];
  type?: "closing";
  title?: string;
  text?: string;
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "Você sabia que o Portal Conexão na Cidade apoia ativamente a causa da Pessoa com Deficiência?",
    supportText: "O diretor do portal, o jornalista Benilton Freitas, se tornou uma Pessoa com Deficiência em 17 de agosto de 2020.",
    options: [
      "Sim",
      "Não sabia, mas achei importante saber"
    ]
  },
  {
    id: 2,
    question: "Você conhece ou convive com alguma Pessoa com Deficiência?",
    options: [
      "Sim",
      "Não",
      "Talvez, mas nunca parei para pensar sobre isso"
    ]
  },
  {
    id: 3,
    question: "Você sabia que o símbolo oficial da Pessoa com Deficiência hoje é o símbolo da acessibilidade?",
    image: "/accessibility-symbol.svg",
    supportText: "A deficiência vai muito além da mobilidade física.",
    options: [
      "Sim",
      "Não sabia"
    ]
  },
  {
    id: 4,
    question: "Você sabia que Cotia é reconhecida como uma das cidades onde as pessoas mais se mobilizam para ajudar Pessoas com Deficiência?",
    options: [
      "Sim",
      "Não sabia",
      "Fico feliz em saber disso"
    ]
  },
  {
    id: 5,
    question: 'Você sabia que o termo correto é "Pessoa com Deficiência"?',
    supportText: 'Termos como "especial", "portador de deficiência" ou apenas "PCD" não são os mais adequados.',
    options: [
      "Sim",
      "Não sabia, obrigado pela informação"
    ]
  },
  {
    id: 6,
    type: "closing",
    title: "Obrigado por chegar até aqui 💙",
    text: "Você respondeu algumas perguntas e, a cada resposta, ajudou a construir uma comunidade mais consciente e humana.\n\nAgora falta só um passo.",
    question: "Podemos avançar para o acesso à Comunidade Conexão na Cidade?",
    options: [
      "Sim, quero acessar a comunidade",
      "Claro, vamos avançar"
    ]
  }
];

interface SuperQuizProps {
  onComplete: () => void;
  isSubmitting?: boolean;
}

export function SuperQuiz({ onComplete, isSubmitting }: SuperQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const question = quizQuestions[currentQuestion];
  const isLastQuestion = currentQuestion === quizQuestions.length - 1;

  const handleNext = () => {
    if (isLastQuestion) {
      setIsCompleted(true);
    } else {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
    }
  };

  if (isCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8 space-y-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="w-20 h-20 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center"
        >
          <Award className="h-10 w-10 text-green-600 dark:text-green-400" />
        </motion.div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Seja bem-vinda(o).</h2>
          <p className="text-muted-foreground">Agora é hora de entrar.</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-6 py-4"
        >
          <Award className="h-8 w-8 text-amber-600" />
          <div className="text-left">
            <p className="font-semibold text-amber-800 dark:text-amber-200">
              Selo: Membro Fundador
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Você faz parte da história!
            </p>
          </div>
        </motion.div>

        <Button
          size="lg"
          onClick={onComplete}
          disabled={isSubmitting}
          className="mt-4"
        >
          {isSubmitting ? "Processando..." : "Acessar Comunidade"}
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress indicators */}
      <div className="flex items-center justify-center gap-2">
        <span className="text-sm text-muted-foreground">
          Pergunta {currentQuestion + 1} de {quizQuestions.length}
        </span>
      </div>
      <div className="flex items-center justify-center gap-1.5">
        {quizQuestions.map((_, idx) => (
          <div
            key={idx}
            className={cn(
              "w-2.5 h-2.5 rounded-full transition-colors",
              idx <= currentQuestion
                ? "bg-primary"
                : "bg-muted-foreground/20"
            )}
          />
        ))}
      </div>

      {/* Question content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Closing question special header */}
          {question.type === "closing" && (
            <div className="text-center space-y-4 pb-4">
              <Heart className="h-10 w-10 mx-auto text-primary" />
              <h3 className="text-xl font-bold">{question.title}</h3>
              <p className="text-muted-foreground whitespace-pre-line">
                {question.text}
              </p>
            </div>
          )}

          {/* Question text */}
          <h3 className={cn(
            "font-semibold",
            question.type === "closing" ? "text-lg text-center" : "text-lg"
          )}>
            {question.question}
          </h3>

          {/* Image if exists */}
          {question.image && (
            <div className="flex justify-center py-4">
              <div className="w-24 h-24 bg-primary/10 rounded-full p-4 flex items-center justify-center">
                <img
                  src={question.image}
                  alt="Símbolo de acessibilidade"
                  className="w-full h-full object-contain text-primary"
                />
              </div>
            </div>
          )}

          {/* Support text */}
          {question.supportText && (
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                {question.supportText}
              </p>
            </div>
          )}

          {/* Options */}
          <RadioGroup
            value={selectedAnswer || ""}
            onValueChange={setSelectedAnswer}
            className="space-y-3"
          >
            {question.options.map((option, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-colors",
                  selectedAnswer === option
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                )}
                onClick={() => setSelectedAnswer(option)}
              >
                <RadioGroupItem value={option} id={`option-${idx}`} />
                <Label
                  htmlFor={`option-${idx}`}
                  className="flex-1 cursor-pointer font-normal"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>

          {/* Next button */}
          <Button
            onClick={handleNext}
            disabled={!selectedAnswer}
            className="w-full"
          >
            {isLastQuestion ? "Concluir e Acessar" : "Próxima"}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}