import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, School, MapPin, Clock, Accessibility, CheckCircle2 } from "lucide-react";
import { SchoolAutocomplete, School as SchoolType } from "./SchoolAutocomplete";
import { cn } from "@/lib/utils";

export interface QuizAnswers {
  rede: string;
  school?: SchoolType;
  schoolTexto?: string;
  turno: string;
  bairro: string;
  acessibilidade: string[];
}

interface TransportQuizWizardProps {
  onComplete: (answers: QuizAnswers) => void;
  onSchoolNotFound: () => void;
}

const STEPS = [
  { id: 1, title: "Rede da Escola", icon: School },
  { id: 2, title: "Escola", icon: School },
  { id: 3, title: "Turno", icon: Clock },
  { id: 4, title: "Bairro", icon: MapPin },
  { id: 5, title: "Acessibilidade", icon: Accessibility },
];

const REDES = [
  { value: "municipal", label: "Municipal" },
  { value: "estadual", label: "Estadual" },
  { value: "particular", label: "Particular" },
  { value: "nao_sei", label: "Não sei" },
];

const TURNOS = [
  { value: "manha", label: "Manhã" },
  { value: "tarde", label: "Tarde" },
  { value: "noite", label: "Noite" },
  { value: "integral", label: "Integral" },
];

const BAIRROS_COTIA = [
  "Centro", "Granja Viana", "Caucaia do Alto", "Jardim Atalaia", "Jardim Barbacena",
  "Jardim da Glória", "Jardim Nomura", "Parque São George", "Portão", "Ressaca",
  "Outro"
];

const ACESSIBILIDADE_TIPOS = [
  { value: "cadeira_rodas", label: "Cadeira de rodas" },
  { value: "mobilidade_reduzida", label: "Mobilidade reduzida" },
  { value: "autismo", label: "TEA (Autismo)" },
  { value: "auditiva", label: "Deficiência auditiva" },
  { value: "visual", label: "Deficiência visual" },
];

export function TransportQuizWizard({ onComplete, onSchoolNotFound }: TransportQuizWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({
    acessibilidade: [],
  });
  const [needsAccessibility, setNeedsAccessibility] = useState<boolean | null>(null);

  const progress = (currentStep / STEPS.length) * 100;

  const canProceed = () => {
    switch (currentStep) {
      case 1: return !!answers.rede;
      case 2: return !!answers.school || !!answers.schoolTexto;
      case 3: return !!answers.turno;
      case 4: return !!answers.bairro;
      case 5: return needsAccessibility !== null;
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(answers as QuizAnswers);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && canProceed()) {
      handleNext();
    }
  };

  const toggleAcessibilidade = (tipo: string) => {
    setAnswers(prev => ({
      ...prev,
      acessibilidade: prev.acessibilidade?.includes(tipo)
        ? prev.acessibilidade.filter(t => t !== tipo)
        : [...(prev.acessibilidade || []), tipo],
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Qual a rede da escola do seu filho(a)?
            </p>
            <RadioGroup
              value={answers.rede || ""}
              onValueChange={(value) => setAnswers({ ...answers, rede: value })}
              className="grid gap-3"
            >
              {REDES.map((rede) => (
                <div key={rede.value} className="flex items-center">
                  <RadioGroupItem
                    value={rede.value}
                    id={`rede-${rede.value}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`rede-${rede.value}`}
                    className={cn(
                      "flex w-full cursor-pointer items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground transition-colors",
                      "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
                      answers.rede === rede.value && "border-primary bg-primary/5"
                    )}
                  >
                    <span className="font-medium">{rede.label}</span>
                    {answers.rede === rede.value && (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Selecione a escola do seu filho(a):
            </p>
            <SchoolAutocomplete
              value={answers.school}
              onChange={(school) => setAnswers({ ...answers, school, schoolTexto: undefined })}
              filterRede={answers.rede !== "nao_sei" ? answers.rede : undefined}
            />
            <div className="pt-2">
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto text-muted-foreground"
                onClick={onSchoolNotFound}
              >
                Não encontrei minha escola
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Em qual turno seu filho(a) estuda?
            </p>
            <RadioGroup
              value={answers.turno || ""}
              onValueChange={(value) => setAnswers({ ...answers, turno: value })}
              className="grid gap-3"
            >
              {TURNOS.map((turno) => (
                <div key={turno.value} className="flex items-center">
                  <RadioGroupItem
                    value={turno.value}
                    id={`turno-${turno.value}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`turno-${turno.value}`}
                    className={cn(
                      "flex w-full cursor-pointer items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground transition-colors",
                      "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
                      answers.turno === turno.value && "border-primary bg-primary/5"
                    )}
                  >
                    <span className="font-medium">{turno.label}</span>
                    {answers.turno === turno.value && (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Em qual bairro você mora (local de embarque)?
            </p>
            <RadioGroup
              value={answers.bairro || ""}
              onValueChange={(value) => setAnswers({ ...answers, bairro: value })}
              className="grid gap-3 max-h-[400px] overflow-y-auto pr-2"
            >
              {BAIRROS_COTIA.map((bairro) => (
                <div key={bairro} className="flex items-center">
                  <RadioGroupItem
                    value={bairro}
                    id={`bairro-${bairro}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`bairro-${bairro}`}
                    className={cn(
                      "flex w-full cursor-pointer items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground transition-colors",
                      "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
                      answers.bairro === bairro && "border-primary bg-primary/5"
                    )}
                  >
                    <span className="font-medium">{bairro}</span>
                    {answers.bairro === bairro && (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Seu filho(a) precisa de transporte acessível?
            </p>
            <RadioGroup
              value={needsAccessibility === null ? "" : needsAccessibility ? "sim" : "nao"}
              onValueChange={(value) => {
                setNeedsAccessibility(value === "sim");
                if (value === "nao") {
                  setAnswers({ ...answers, acessibilidade: [] });
                }
              }}
              className="grid gap-3"
            >
              <div className="flex items-center">
                <RadioGroupItem value="nao" id="acessibilidade-nao" className="peer sr-only" />
                <Label
                  htmlFor="acessibilidade-nao"
                  className={cn(
                    "flex w-full cursor-pointer items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground transition-colors",
                    "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
                    needsAccessibility === false && "border-primary bg-primary/5"
                  )}
                >
                  <span className="font-medium">Não precisa</span>
                </Label>
              </div>
              <div className="flex items-center">
                <RadioGroupItem value="sim" id="acessibilidade-sim" className="peer sr-only" />
                <Label
                  htmlFor="acessibilidade-sim"
                  className={cn(
                    "flex w-full cursor-pointer items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground transition-colors",
                    "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
                    needsAccessibility === true && "border-primary bg-primary/5"
                  )}
                >
                  <span className="font-medium">Sim, precisa de acessibilidade</span>
                </Label>
              </div>
            </RadioGroup>

            {needsAccessibility && (
              <div className="pt-4 space-y-3">
                <p className="text-sm text-muted-foreground">
                  Quais tipos de acessibilidade são necessários? (pode marcar mais de um)
                </p>
                {ACESSIBILIDADE_TIPOS.map((tipo) => (
                  <div key={tipo.value} className="flex items-center space-x-3">
                    <Checkbox
                      id={`acessibilidade-tipo-${tipo.value}`}
                      checked={answers.acessibilidade?.includes(tipo.value)}
                      onCheckedChange={() => toggleAcessibilidade(tipo.value)}
                    />
                    <Label
                      htmlFor={`acessibilidade-tipo-${tipo.value}`}
                      className="cursor-pointer"
                    >
                      {tipo.label}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const StepIcon = STEPS[currentStep - 1].icon;

  return (
    <Card className="w-full max-w-lg mx-auto" onKeyDown={handleKeyDown}>
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Passo {currentStep} de {STEPS.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" aria-label={`Progresso: ${Math.round(progress)}%`} />
        <CardTitle className="flex items-center gap-2">
          <StepIcon className="h-5 w-5 text-primary" aria-hidden="true" />
          {STEPS[currentStep - 1].title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderStepContent()}

        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            aria-label="Voltar ao passo anterior"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar
          </Button>
          <Button
            type="button"
            onClick={handleNext}
            disabled={!canProceed()}
            aria-label={currentStep === STEPS.length ? "Buscar transportadores" : "Avançar para próximo passo"}
          >
            {currentStep === STEPS.length ? "Buscar" : "Próximo"}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
