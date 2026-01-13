import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CensoPcdQuestionInputProps {
  question: string;
  type: "text" | "date" | "select";
  value: string;
  onChange: (value: string) => void;
  questionNumber: number;
  placeholder?: string;
  options?: { value: string; label: string }[];
}

export function CensoPcdQuestionInput({
  question,
  type,
  value,
  onChange,
  questionNumber,
  placeholder,
  options
}: CensoPcdQuestionInputProps) {
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onChange(format(date, "yyyy-MM-dd"));
    }
  };

  const parsedDate = value ? new Date(value) : undefined;

  return (
    <div 
      className="space-y-6"
      role="group"
      aria-labelledby={`question-${questionNumber}`}
    >
      <Label 
        htmlFor={`input-${questionNumber}`}
        id={`question-${questionNumber}`}
        className="text-xl md:text-2xl font-semibold text-foreground leading-relaxed block"
      >
        {question}
      </Label>

      {type === "text" && (
        <Input
          id={`input-${questionNumber}`}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-14 text-lg"
          aria-describedby={`question-${questionNumber}`}
        />
      )}

      {type === "date" && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id={`input-${questionNumber}`}
              variant="outline"
              className={cn(
                "w-full h-14 justify-start text-left text-lg font-normal",
                !value && "text-muted-foreground"
              )}
              aria-describedby={`question-${questionNumber}`}
            >
              <CalendarIcon className="mr-3 h-5 w-5" />
              {value ? format(parsedDate!, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : "Selecione a data"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={parsedDate}
              onSelect={handleDateSelect}
              locale={ptBR}
              captionLayout="dropdown-buttons"
              fromYear={1920}
              toYear={new Date().getFullYear()}
              defaultMonth={parsedDate || new Date(2000, 0)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      )}

      {type === "select" && options && (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger 
            id={`input-${questionNumber}`}
            className="h-14 text-lg"
            aria-describedby={`question-${questionNumber}`}
          >
            <SelectValue placeholder={placeholder || "Selecione uma opção"} />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value} className="text-base py-3">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
