import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

interface CensoPcdQuestionProps {
  question: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  questionNumber: number;
}

export function CensoPcdQuestion({
  question,
  options,
  value,
  onChange,
  questionNumber
}: CensoPcdQuestionProps) {
  return (
    <div 
      className="space-y-6"
      role="group"
      aria-labelledby={`question-${questionNumber}`}
    >
      <h2 
        id={`question-${questionNumber}`}
        className="text-xl md:text-2xl font-semibold text-foreground leading-relaxed"
        tabIndex={-1}
      >
        {question}
      </h2>

      <RadioGroup
        value={value}
        onValueChange={onChange}
        className="space-y-3"
        aria-label={question}
      >
        {options.map((option) => (
          <div key={option.value}>
            <Label
              htmlFor={`option-${questionNumber}-${option.value}`}
              className={cn(
                "flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
                "hover:border-primary hover:bg-primary/5",
                "focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2",
                value === option.value
                  ? "border-primary bg-primary/10"
                  : "border-muted"
              )}
            >
              <RadioGroupItem
                value={option.value}
                id={`option-${questionNumber}-${option.value}`}
                className="shrink-0"
              />
              <span className="text-base md:text-lg">{option.label}</span>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
