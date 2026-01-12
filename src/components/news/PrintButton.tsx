import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function PrintButton() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.print()}
            className="print-hide h-10 w-10 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
            aria-label="Imprimir notícia"
          >
            <Printer className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Imprimir</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
