import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RoundSelectorProps {
  currentRound: number;
  totalRounds?: number;
  onRoundChange: (round: number) => void;
}

export function RoundSelector({ 
  currentRound, 
  totalRounds = 38, 
  onRoundChange 
}: RoundSelectorProps) {
  const rounds = Array.from({ length: totalRounds }, (_, i) => i + 1);
  
  const handlePrevious = () => {
    if (currentRound > 1) {
      onRoundChange(currentRound - 1);
    }
  };
  
  const handleNext = () => {
    if (currentRound < totalRounds) {
      onRoundChange(currentRound + 1);
    }
  };
  
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={handlePrevious}
        disabled={currentRound <= 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <Select
        value={String(currentRound)}
        onValueChange={(value) => onRoundChange(parseInt(value))}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Rodada" />
        </SelectTrigger>
        <SelectContent>
          {rounds.map((round) => (
            <SelectItem key={round} value={String(round)}>
              {round}ª Rodada
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Button
        variant="outline"
        size="icon"
        onClick={handleNext}
        disabled={currentRound >= totalRounds}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
