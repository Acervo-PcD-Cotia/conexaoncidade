import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

interface CensoPcdQuestionMultiProps {
  question: string;
  options: Option[];
  values: string[];
  onChange: (values: string[]) => void;
  questionNumber: number;
  hint?: string;
}

export function CensoPcdQuestionMulti({
  question,
  options,
  values,
  onChange,
  questionNumber,
  hint
}: CensoPcdQuestionMultiProps) {
  const toggleValue = (value: string) => {
    if (values.includes(value)) {
      onChange(values.filter((v) => v !== value));
    } else {
      onChange([...values, value]);
    }
  };

  return (
    <div 
      className="space-y-6"
      role="group"
      aria-labelledby={`question-${questionNumber}`}
    >
      <div>
        <h2 
          id={`question-${questionNumber}`}
          className="text-xl md:text-2xl font-semibold text-foreground leading-relaxed"
          tabIndex={-1}
        >
          {question}
        </h2>
        {hint && (
          <p className="text-sm text-muted-foreground mt-2" id={`hint-${questionNumber}`}>
            {hint}
          </p>
        )}
      </div>

      <div 
        className="space-y-3"
        role="group"
        aria-describedby={hint ? `hint-${questionNumber}` : undefined}
      >
        {options.map((option) => {
          const isChecked = values.includes(option.value);
          return (
            <div key={option.value}>
              <Label
                htmlFor={`option-${questionNumber}-${option.value}`}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
                  "hover:border-primary hover:bg-primary/5",
                  "focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2",
                  isChecked
                    ? "border-primary bg-primary/10"
                    : "border-muted"
                )}
              >
                <Checkbox
                  id={`option-${questionNumber}-${option.value}`}
                  checked={isChecked}
                  onCheckedChange={() => toggleValue(option.value)}
                  className="shrink-0"
                  aria-describedby={`label-${questionNumber}-${option.value}`}
                />
                <span 
                  id={`label-${questionNumber}-${option.value}`}
                  className="text-base md:text-lg"
                >
                  {option.label}
                </span>
              </Label>
            </div>
          );
        })}
      </div>

      {values.length > 0 && (
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {values.length} {values.length === 1 ? "opção selecionada" : "opções selecionadas"}
        </p>
      )}
    </div>
  );
}
