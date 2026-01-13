import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { BAIRROS_COTIA } from "@/hooks/useCensoPcd";

interface CensoPcdHeatmapProps {
  data: { bairro: string; count: number }[];
  onBairroClick?: (bairro: string) => void;
}

export function CensoPcdHeatmap({ data, onBairroClick }: CensoPcdHeatmapProps) {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  
  const getCountForBairro = (bairro: string) => {
    return data.find(d => d.bairro === bairro)?.count || 0;
  };

  const getHeatColor = (count: number) => {
    const intensity = count / maxCount;
    if (count === 0) return "bg-muted text-muted-foreground";
    if (intensity < 0.25) return "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200";
    if (intensity < 0.5) return "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200";
    if (intensity < 0.75) return "bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200";
    return "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Mapa de Calor por Bairro</CardTitle>
        <p className="text-sm text-muted-foreground">
          Clique em um bairro para filtrar os dados
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
          {BAIRROS_COTIA.map((bairro) => {
            const count = getCountForBairro(bairro);
            return (
              <Tooltip key={bairro}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onBairroClick?.(bairro)}
                    className={`
                      p-2 rounded-lg text-xs font-medium transition-all
                      hover:ring-2 hover:ring-primary hover:ring-offset-2
                      ${getHeatColor(count)}
                    `}
                  >
                    <span className="block truncate">
                      {bairro.length > 12 ? bairro.substring(0, 10) + '...' : bairro}
                    </span>
                    <span className="block text-[10px] opacity-75">{count}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-medium">{bairro}</p>
                  <p className="text-sm">{count} resposta{count !== 1 ? 's' : ''}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-muted" />
            <span>0</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-green-100 dark:bg-green-900/50" />
            <span>1-25%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-yellow-100 dark:bg-yellow-900/50" />
            <span>26-50%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-orange-100 dark:bg-orange-900/50" />
            <span>51-75%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-red-100 dark:bg-red-900/50" />
            <span>76-100%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
