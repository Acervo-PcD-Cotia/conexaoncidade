import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
  description?: string;
}

interface PhoneQuizQuestionProps {
  question: string;
  options: Option[];
  value: string | null;
  onChange: (value: string) => void;
  optional?: boolean;
}

export function PhoneQuizQuestion({ question, options, value, onChange, optional }: PhoneQuizQuestionProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl md:text-2xl font-semibold text-foreground">{question}</h2>
        {optional && <p className="text-sm text-muted-foreground mt-1">(Opcional)</p>}
      </div>

      <div className="grid gap-3">
        {options.map((option) => (
          <Button
            key={option.value}
            type="button"
            variant="outline"
            className={cn(
              'h-auto min-h-[56px] py-4 px-6 text-left justify-start flex-col items-start transition-all',
              'hover:border-primary hover:bg-primary/5',
              value === option.value && 'border-primary bg-primary/10 ring-2 ring-primary/20'
            )}
            onClick={() => onChange(option.value)}
            aria-pressed={value === option.value}
          >
            <span className="font-medium text-base">{option.label}</span>
            {option.description && <span className="text-sm text-muted-foreground mt-1">{option.description}</span>}
          </Button>
        ))}
      </div>
    </div>
  );
}
