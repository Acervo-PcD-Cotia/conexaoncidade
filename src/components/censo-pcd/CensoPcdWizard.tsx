import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Loader2, Send } from "lucide-react";
import { CensoPcdProgress } from "./CensoPcdProgress";
import { CensoPcdQuestion } from "./CensoPcdQuestion";
import { CensoPcdQuestionMulti } from "./CensoPcdQuestionMulti";
import { CensoPcdQuestionInput } from "./CensoPcdQuestionInput";
import {
  BAIRROS_COTIA,
  TIPOS_DEFICIENCIA,
  ATENDIMENTOS,
  NECESSIDADES_EDUCACIONAIS,
  BENEFICIOS,
  PRIORIDADES,
  CensoPcdFormData
} from "@/hooks/useCensoPcd";

interface Question {
  key: keyof CensoPcdFormData;
  question: string;
  type: "single" | "multi" | "text" | "date" | "select";
  options?: { value: string; label: string }[];
  block: string;
  blockNumber: number;
  conditional?: {
    dependsOn: keyof CensoPcdFormData;
    showWhen: (value: any) => boolean;
  };
  hint?: string;
  placeholder?: string;
}

const QUESTIONS: Question[] = [
  // Bloco 1: Perfil do Respondente
  {
    key: "respondente_tipo",
    question: "Você está respondendo como:",
    type: "single",
    block: "Perfil do Respondente",
    blockNumber: 1,
    options: [
      { value: "pcd", label: "Pessoa com Deficiência" },
      { value: "responsavel", label: "Responsável legal" },
      { value: "cuidador", label: "Cuidador" }
    ]
  },
  {
    key: "nome_completo",
    question: "Qual o nome completo da Pessoa com Deficiência?",
    type: "text",
    block: "Perfil do Respondente",
    blockNumber: 1,
    placeholder: "Digite o nome completo"
  },
  {
    key: "data_nascimento",
    question: "Qual a data de nascimento?",
    type: "date",
    block: "Perfil do Respondente",
    blockNumber: 1
  },
  {
    key: "sexo",
    question: "Sexo:",
    type: "single",
    block: "Perfil do Respondente",
    blockNumber: 1,
    options: [
      { value: "masculino", label: "Masculino" },
      { value: "feminino", label: "Feminino" },
      { value: "nao_informar", label: "Prefiro não informar" }
    ]
  },
  {
    key: "bairro",
    question: "Em qual bairro de Cotia você reside?",
    type: "select",
    block: "Perfil do Respondente",
    blockNumber: 1,
    options: BAIRROS_COTIA.map(b => ({ value: b, label: b })),
    placeholder: "Selecione seu bairro"
  },

  // Bloco 2: Deficiência/TEA
  {
    key: "tipos_deficiencia",
    question: "Quais tipos de deficiência a pessoa possui?",
    type: "multi",
    block: "Deficiência / TEA",
    blockNumber: 2,
    options: TIPOS_DEFICIENCIA,
    hint: "Selecione todas as opções que se aplicam"
  },
  {
    key: "possui_laudo",
    question: "A pessoa possui laudo médico?",
    type: "single",
    block: "Deficiência / TEA",
    blockNumber: 2,
    options: [
      { value: "sim", label: "Sim" },
      { value: "nao", label: "Não" },
      { value: "em_processo", label: "Em processo" }
    ]
  },
  {
    key: "nivel_suporte_tea",
    question: "Qual o nível de suporte do TEA?",
    type: "single",
    block: "Deficiência / TEA",
    blockNumber: 2,
    options: [
      { value: "nivel1", label: "Nível 1 - Requer suporte" },
      { value: "nivel2", label: "Nível 2 - Requer suporte substancial" },
      { value: "nivel3", label: "Nível 3 - Requer suporte muito substancial" }
    ],
    conditional: {
      dependsOn: "tipos_deficiencia",
      showWhen: (value: string[]) => value?.includes("tea")
    }
  },

  // Bloco 3: Saúde e Atendimento
  {
    key: "recebe_acompanhamento_medico",
    question: "A pessoa recebe acompanhamento médico atualmente?",
    type: "single",
    block: "Saúde e Atendimento",
    blockNumber: 3,
    options: [
      { value: "true", label: "Sim" },
      { value: "false", label: "Não" }
    ]
  },
  {
    key: "atendimentos_necessarios",
    question: "Quais atendimentos são necessários?",
    type: "multi",
    block: "Saúde e Atendimento",
    blockNumber: 3,
    options: ATENDIMENTOS,
    hint: "Selecione todos que se aplicam"
  },
  {
    key: "local_atendimento",
    question: "Onde ocorre o atendimento de saúde?",
    type: "single",
    block: "Saúde e Atendimento",
    blockNumber: 3,
    options: [
      { value: "sus", label: "SUS" },
      { value: "particular", label: "Particular" },
      { value: "convenio", label: "Convênio" },
      { value: "nenhum", label: "Não recebe atendimento" }
    ]
  },
  {
    key: "em_fila_espera",
    question: "A pessoa está em fila de espera para algum atendimento?",
    type: "single",
    block: "Saúde e Atendimento",
    blockNumber: 3,
    options: [
      { value: "true", label: "Sim" },
      { value: "false", label: "Não" }
    ]
  },

  // Bloco 4: Educação
  {
    key: "matriculado_escola",
    question: "A pessoa está matriculada em alguma escola?",
    type: "single",
    block: "Educação",
    blockNumber: 4,
    options: [
      { value: "municipal", label: "Escola Municipal" },
      { value: "estadual", label: "Escola Estadual" },
      { value: "particular", label: "Escola Particular" },
      { value: "nao_matriculado", label: "Não está matriculado" }
    ]
  },
  {
    key: "apoio_educacional",
    question: "A pessoa recebe apoio educacional adequado?",
    type: "single",
    block: "Educação",
    blockNumber: 4,
    options: [
      { value: "sim", label: "Sim" },
      { value: "parcial", label: "Parcial" },
      { value: "nao", label: "Não" }
    ]
  },
  {
    key: "necessidades_educacionais",
    question: "Quais necessidades educacionais a pessoa possui?",
    type: "multi",
    block: "Educação",
    blockNumber: 4,
    options: NECESSIDADES_EDUCACIONAIS,
    hint: "Selecione todas que se aplicam"
  },

  // Bloco 5: Assistência e Renda
  {
    key: "beneficio_recebido",
    question: "A família recebe algum benefício?",
    type: "multi",
    block: "Assistência e Renda",
    blockNumber: 5,
    options: BENEFICIOS,
    hint: "Selecione todos que se aplicam"
  },
  {
    key: "renda_suficiente",
    question: "A renda familiar é suficiente para custear os tratamentos?",
    type: "single",
    block: "Assistência e Renda",
    blockNumber: 5,
    options: [
      { value: "true", label: "Sim" },
      { value: "false", label: "Não" }
    ]
  },

  // Bloco 6: Prioridades
  {
    key: "maior_necessidade",
    question: "Qual é a maior necessidade atual?",
    type: "single",
    block: "Prioridades e Contato",
    blockNumber: 6,
    options: PRIORIDADES
  },
  {
    key: "autoriza_contato",
    question: "Você autoriza contato para ações, mutirões e programas?",
    type: "single",
    block: "Prioridades e Contato",
    blockNumber: 6,
    options: [
      { value: "true", label: "Sim, autorizo" },
      { value: "false", label: "Não autorizo" }
    ]
  }
];

interface CensoPcdWizardProps {
  onComplete: (data: CensoPcdFormData) => void;
  isSubmitting: boolean;
}

export function CensoPcdWizard({ onComplete, isSubmitting }: CensoPcdWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<CensoPcdFormData>>({
    tipos_deficiencia: [],
    atendimentos_necessarios: [],
    necessidades_educacionais: [],
    beneficio_recebido: []
  });

  const questionRef = useRef<HTMLDivElement>(null);

  // Filtrar perguntas condicionais
  const visibleQuestions = QUESTIONS.filter((q) => {
    if (!q.conditional) return true;
    const dependValue = answers[q.conditional.dependsOn];
    return q.conditional.showWhen(dependValue);
  });

  const currentQuestion = visibleQuestions[currentStep];
  const totalQuestions = visibleQuestions.length;
  const isLastStep = currentStep === totalQuestions - 1;

  useEffect(() => {
    questionRef.current?.focus();
  }, [currentStep]);

  const getCurrentAnswer = () => {
    const value = answers[currentQuestion.key];
    if (currentQuestion.type === "multi") {
      return value as string[] || [];
    }
    return value as string || "";
  };

  const canProceed = () => {
    const value = getCurrentAnswer();
    if (currentQuestion.type === "multi") {
      return (value as string[]).length > 0;
    }
    return value !== "" && value !== undefined;
  };

  const handleSingleAnswer = (value: string) => {
    let parsedValue: any = value;
    
    // Converter strings "true"/"false" para boolean
    if (value === "true") parsedValue = true;
    if (value === "false") parsedValue = false;

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.key]: parsedValue
    }));
  };

  const handleMultiAnswer = (values: string[]) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.key]: values
    }));
  };

  const handleNext = () => {
    if (isLastStep) {
      // Submeter
      const formData: CensoPcdFormData = {
        respondente_tipo: answers.respondente_tipo as string,
        nome_completo: answers.nome_completo as string,
        data_nascimento: answers.data_nascimento as string,
        sexo: answers.sexo as string,
        bairro: answers.bairro as string,
        tipos_deficiencia: answers.tipos_deficiencia as string[],
        possui_laudo: answers.possui_laudo as string,
        nivel_suporte_tea: answers.nivel_suporte_tea as string,
        recebe_acompanhamento_medico: answers.recebe_acompanhamento_medico as boolean,
        atendimentos_necessarios: answers.atendimentos_necessarios as string[],
        local_atendimento: answers.local_atendimento as string,
        em_fila_espera: answers.em_fila_espera as boolean,
        matriculado_escola: answers.matriculado_escola as string,
        apoio_educacional: answers.apoio_educacional as string,
        necessidades_educacionais: answers.necessidades_educacionais as string[],
        beneficio_recebido: answers.beneficio_recebido as string[],
        renda_suficiente: answers.renda_suficiente as boolean,
        maior_necessidade: answers.maior_necessidade as string,
        autoriza_contato: answers.autoriza_contato as boolean,
        consentimento_lgpd: true
      };
      onComplete(formData);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const renderQuestion = () => {
    const answer = getCurrentAnswer();

    switch (currentQuestion.type) {
      case "single":
        return (
          <CensoPcdQuestion
            question={currentQuestion.question}
            options={currentQuestion.options || []}
            value={typeof answer === "boolean" ? String(answer) : answer as string}
            onChange={handleSingleAnswer}
            questionNumber={currentStep + 1}
          />
        );
      case "multi":
        return (
          <CensoPcdQuestionMulti
            question={currentQuestion.question}
            options={currentQuestion.options || []}
            values={answer as string[]}
            onChange={handleMultiAnswer}
            questionNumber={currentStep + 1}
            hint={currentQuestion.hint}
          />
        );
      case "text":
      case "date":
      case "select":
        return (
          <CensoPcdQuestionInput
            question={currentQuestion.question}
            type={currentQuestion.type}
            value={answer as string}
            onChange={handleSingleAnswer}
            questionNumber={currentStep + 1}
            placeholder={currentQuestion.placeholder}
            options={currentQuestion.options}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <CensoPcdProgress
        current={currentStep + 1}
        total={totalQuestions}
        blockName={currentQuestion.block}
      />

      <Card className="shadow-lg">
        <CardContent className="p-6 md:p-8">
          <div 
            ref={questionRef}
            tabIndex={-1}
            className="outline-none min-h-[300px]"
          >
            {renderQuestion()}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between gap-4">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
          className="h-14 px-6 text-base"
          aria-label="Voltar para pergunta anterior"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Voltar
        </Button>

        <Button
          onClick={handleNext}
          disabled={!canProceed() || isSubmitting}
          className="h-14 px-8 text-base"
          aria-label={isLastStep ? "Enviar respostas" : "Próxima pergunta"}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Enviando...
            </>
          ) : isLastStep ? (
            <>
              <Send className="mr-2 h-5 w-5" />
              Enviar
            </>
          ) : (
            <>
              Próxima
              <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </div>

      <p className="text-sm text-center text-muted-foreground">
        Use <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Tab</kbd> para navegar e{" "}
        <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Enter</kbd> para confirmar
      </p>
    </div>
  );
}
