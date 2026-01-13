import { Progress } from "@/components/ui/progress";

interface CensoPcdProgressProps {
  current: number;
  total: number;
  blockName: string;
}

export function CensoPcdProgress({ current, total, blockName }: CensoPcdProgressProps) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="w-full space-y-2" role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}>
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium text-primary" aria-live="polite">
          {blockName}
        </span>
        <span className="text-muted-foreground">
          Pergunta {current} de {total}
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
      <p className="sr-only">Progresso: {percentage}% completo</p>
    </div>
  );
}
