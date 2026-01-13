import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface PhoneQuizQuestionMultiProps {
  question: string;
  options: Option[];
  value: string[];
  onChange: (values: string[]) => void;
  optional?: boolean;
}

export function PhoneQuizQuestionMulti({
  question,
  options,
  value,
  onChange,
  optional = false,
}: PhoneQuizQuestionMultiProps) {
  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  return (
    <div className="space-y-6" role="group" aria-labelledby="quiz-question">
      <div className="text-center space-y-2">
        <h2 
          id="quiz-question" 
          className="text-xl md:text-2xl font-semibold"
          tabIndex={-1}
        >
          {question}
        </h2>
        {optional && (
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Opcional - selecione uma ou mais opções
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          Selecione todas as opções que se aplicam
        </p>
      </div>

      <div 
        className="grid gap-3" 
        role="listbox" 
        aria-multiselectable="true"
        aria-label={question}
      >
        {options.map((option) => {
          const isSelected = value.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={isSelected}
              aria-label={`${option.label}${option.description ? `, ${option.description}` : ''}`}
              onClick={() => toggleOption(option.value)}
              className={cn(
                'w-full p-4 md:p-5 rounded-xl border-2 text-left transition-all',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                'hover:border-primary/50 hover:bg-primary/5',
                'min-h-[56px] flex items-center gap-4',
                isSelected
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card'
              )}
            >
              <div
                className={cn(
                  'w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0',
                  isSelected
                    ? 'border-primary bg-primary'
                    : 'border-muted-foreground/30'
                )}
                aria-hidden="true"
              >
                {isSelected && <Check className="w-4 h-4 text-primary-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-medium text-base md:text-lg block">{option.label}</span>
                {option.description && (
                  <span className="text-sm text-muted-foreground block mt-0.5">
                    {option.description}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
