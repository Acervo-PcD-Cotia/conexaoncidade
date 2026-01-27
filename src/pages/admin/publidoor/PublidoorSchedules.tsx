import { Calendar, Clock, Sun, Moon, CalendarDays, PartyPopper } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PUBLIDOOR_SCHEDULE_TYPE_LABELS, PublidoorScheduleType } from "@/types/publidoor";

const SCHEDULE_ICONS: Record<PublidoorScheduleType, React.ReactNode> = {
  specific_dates: <CalendarDays className="h-5 w-5" />,
  weekdays: <Calendar className="h-5 w-5" />,
  time_range: <Clock className="h-5 w-5" />,
  business_hours: <Sun className="h-5 w-5" />,
  weekends: <Moon className="h-5 w-5" />,
  holidays: <PartyPopper className="h-5 w-5" />,
};

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function PublidoorSchedules() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Agenda & Programação</h1>
        <p className="text-muted-foreground">
          Configure quando seus Publidoors devem ser exibidos
        </p>
      </div>

      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">
            A programação é configurada individualmente em cada Publidoor.
          </p>
          <p className="text-sm text-muted-foreground">
            Acesse a edição de um Publidoor para configurar sua programação de exibição.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tipos de Programação</CardTitle>
          <CardDescription>
            Entenda as opções disponíveis para programar seus Publidoors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(Object.entries(PUBLIDOOR_SCHEDULE_TYPE_LABELS) as [PublidoorScheduleType, string][]).map(
              ([type, label]) => (
                <div
                  key={type}
                  className="flex items-start gap-3 p-4 rounded-lg border bg-card"
                >
                  <div className="text-primary">{SCHEDULE_ICONS[type]}</div>
                  <div>
                    <p className="font-medium">{label}</p>
                    <p className="text-sm text-muted-foreground">
                      {type === "specific_dates" && "Escolha datas exatas para exibição"}
                      {type === "weekdays" && "Selecione dias da semana específicos"}
                      {type === "time_range" && "Defina horários de início e fim"}
                      {type === "business_hours" && "Exibe apenas em horário comercial (8h-18h)"}
                      {type === "weekends" && "Exibe apenas nos finais de semana"}
                      {type === "holidays" && "Exibe em feriados e datas comemorativas"}
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dias da Semana</CardTitle>
          <CardDescription>Referência para configuração</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {WEEKDAYS.map((day, index) => (
              <Badge key={index} variant="outline" className="px-3 py-1">
                <span className="text-muted-foreground mr-1">{index}:</span> {day}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            Use os números 0-6 para configurar os dias da semana (0 = Domingo, 6 = Sábado).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
