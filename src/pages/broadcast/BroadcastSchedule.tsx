import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Clock, Radio, Tv } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWeeklySchedule } from "@/hooks/useBroadcast";
import { Skeleton } from "@/components/ui/skeleton";

const DAYS_OF_WEEK = [
  { value: 0, label: "Dom", fullLabel: "Domingo" },
  { value: 1, label: "Seg", fullLabel: "Segunda-feira" },
  { value: 2, label: "Ter", fullLabel: "Terça-feira" },
  { value: 3, label: "Qua", fullLabel: "Quarta-feira" },
  { value: 4, label: "Qui", fullLabel: "Quinta-feira" },
  { value: 5, label: "Sex", fullLabel: "Sexta-feira" },
  { value: 6, label: "Sáb", fullLabel: "Sábado" },
];

export default function BroadcastSchedule() {
  const today = new Date().getDay();
  const [selectedDay, setSelectedDay] = useState(today.toString());
  const { data: schedule, isLoading } = useWeeklySchedule();

  const filteredSchedule = schedule?.filter(
    (item) => item.day_of_week.toString() === selectedDay
  );

  const currentTime = new Date().toTimeString().slice(0, 5);

  const isNow = (startTime: string, endTime: string) => {
    return (
      parseInt(selectedDay) === today &&
      currentTime >= startTime &&
      currentTime <= endTime
    );
  };

  return (
    <>
      <Helmet>
        <title>Programação | Conexão Ao Vivo</title>
        <meta name="description" content="Confira a grade de programação da nossa Web TV e Web Rádio" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b">
          <div className="container max-w-5xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link to="/ao-vivo">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Programação</h1>
                <p className="text-muted-foreground">Grade semanal de transmissões</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container max-w-5xl mx-auto px-4 py-6">
          <Tabs value={selectedDay} onValueChange={setSelectedDay}>
            <TabsList className="w-full justify-start overflow-x-auto mb-6">
              {DAYS_OF_WEEK.map((day) => (
                <TabsTrigger
                  key={day.value}
                  value={day.value.toString()}
                  className="flex-shrink-0"
                >
                  <span className="hidden sm:inline">{day.fullLabel}</span>
                  <span className="sm:hidden">{day.label}</span>
                  {day.value === today && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Hoje
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {DAYS_OF_WEEK.map((day) => (
              <TabsContent key={day.value} value={day.value.toString()}>
                <Card>
                  <CardHeader>
                    <CardTitle>{day.fullLabel}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} className="h-20 w-full" />
                        ))}
                      </div>
                    ) : filteredSchedule?.length === 0 ? (
                      <p className="text-center py-8 text-muted-foreground">
                        Nenhuma programação para este dia
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {filteredSchedule
                          ?.sort((a, b) => a.start_time.localeCompare(b.start_time))
                          .map((item) => {
                            const isCurrentlyLive = isNow(item.start_time, item.end_time);

                            return (
                              <div
                                key={item.id}
                                className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                                  isCurrentlyLive
                                    ? "bg-primary/5 border-primary"
                                    : "hover:bg-accent"
                                }`}
                              >
                                <div className="flex flex-col items-center text-center min-w-[60px]">
                                  <span className="text-lg font-bold">
                                    {item.start_time.slice(0, 5)}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {item.end_time.slice(0, 5)}
                                  </span>
                                </div>

                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  {item.channel?.type === "radio" ? (
                                    <Radio className="w-5 h-5 text-primary" />
                                  ) : (
                                    <Tv className="w-5 h-5 text-primary" />
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-medium truncate">
                                      {item.program?.name || "Programação"}
                                    </h3>
                                    {isCurrentlyLive && (
                                      <Badge variant="destructive" className="animate-pulse">
                                        🔴 AO VIVO
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground truncate">
                                    {item.channel?.name}
                                    {item.program?.host_name && ` • ${item.program.host_name}`}
                                  </p>
                                </div>

                                {item.is_live && (
                                  <Button variant="outline" size="sm" asChild>
                                    <Link to="/ao-vivo">Assistir</Link>
                                  </Button>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </>
  );
}
