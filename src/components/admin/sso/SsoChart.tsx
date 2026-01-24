import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { SsoChartData } from "@/hooks/useSsoAnalytics";

interface SsoChartProps {
  data: SsoChartData[];
  isLoading?: boolean;
}

const chartConfig = {
  success: {
    label: "Sucesso",
    color: "hsl(var(--chart-1))",
  },
  failed: {
    label: "Falhas",
    color: "hsl(var(--chart-2))",
  },
};

export function SsoChart({ data, isLoading }: SsoChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tentativas SSO</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Carregando...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formattedData = data.map(item => ({
    ...item,
    dateLabel: format(parseISO(item.date), "dd/MM", { locale: ptBR }),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tentativas SSO (últimos 7 dias)</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="dateLabel" 
                tick={{ fontSize: 12 }}
                className="fill-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                className="fill-muted-foreground"
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="success"
                stroke="var(--color-success)"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Sucesso"
              />
              <Line
                type="monotone"
                dataKey="failed"
                stroke="var(--color-failed)"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Falhas"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
