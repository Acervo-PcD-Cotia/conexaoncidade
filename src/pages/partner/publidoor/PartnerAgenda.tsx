// Agenda de Exibição (readonly)
import { motion } from 'framer-motion';
import { Calendar, Clock, CalendarDays, Loader2 } from 'lucide-react';
import { usePartnerAuth } from '@/hooks/usePartnerAuth';
import { usePartnerPublidoors, usePartnerSchedules } from '@/hooks/usePartnerPublidoor';
import { PUBLIDOOR_SCHEDULE_TYPE_LABELS } from '@/types/publidoor';
import { format, differenceInDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const WEEKDAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function PartnerAgenda() {
  const { advertiser } = usePartnerAuth();
  const { data: publidoors = [], isLoading: loadingPublidoors } = usePartnerPublidoors(advertiser?.id);
  
  const mainPublidoor = publidoors[0];
  const { data: schedules = [], isLoading: loadingSchedules } = usePartnerSchedules(mainPublidoor?.id);
  
  const campaign = mainPublidoor?.campaign;
  const isLoading = loadingPublidoors || loadingSchedules;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!mainPublidoor) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Nenhuma agenda disponível</h2>
        <p className="text-muted-foreground">
          Você precisa ter uma vitrine ativa para ver a agenda.
        </p>
      </div>
    );
  }

  const daysRemaining = campaign?.ends_at 
    ? differenceInDays(parseISO(campaign.ends_at), new Date())
    : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Agenda de Exibição</h1>
        <p className="text-muted-foreground">
          Veja quando sua vitrine será exibida (somente leitura)
        </p>
      </div>

      {/* Campaign Period */}
      {campaign && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-card to-card border border-border"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold mb-2">{campaign.name || 'Período de Exibição'}</h3>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {campaign.starts_at && (
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Início: {format(parseISO(campaign.starts_at), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                )}
                {campaign.ends_at && (
                  <span className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    Fim: {format(parseISO(campaign.ends_at), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                )}
              </div>
            </div>
            
            {daysRemaining !== null && daysRemaining > 0 && (
              <div className="text-center p-4 rounded-xl bg-primary/20">
                <p className="text-3xl font-bold text-primary">{daysRemaining}</p>
                <p className="text-sm text-muted-foreground">dias restantes</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Schedules */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold">Horários de Exibição</h3>
        
        {schedules.length === 0 ? (
          <div className="p-8 rounded-2xl bg-card border border-border text-center">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhum horário específico configurado. Sua vitrine será exibida em todos os horários disponíveis.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {schedules.map((schedule, index) => (
              <motion.div
                key={schedule.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-card border border-border"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {PUBLIDOOR_SCHEDULE_TYPE_LABELS[schedule.schedule_type]}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {schedule.is_active ? 'Ativo' : 'Inativo'}
                    </p>
                  </div>
                </div>

                {/* Days of Week */}
                {schedule.days_of_week && schedule.days_of_week.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-2">Dias da semana:</p>
                    <div className="flex gap-2">
                      {schedule.days_of_week.map((day) => (
                        <span
                          key={day}
                          className="px-3 py-1 text-sm rounded-full bg-primary/20 text-primary"
                        >
                          {WEEKDAY_NAMES[day]}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Time Range */}
                {(schedule.time_start || schedule.time_end) && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {schedule.time_start || '00:00'} - {schedule.time_end || '23:59'}
                    </span>
                  </div>
                )}

                {/* Specific Dates */}
                {schedule.specific_dates && schedule.specific_dates.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">Datas específicas:</p>
                    <div className="flex flex-wrap gap-2">
                      {schedule.specific_dates.map((date) => (
                        <span
                          key={date}
                          className="px-3 py-1 text-sm rounded-full bg-muted"
                        >
                          {format(parseISO(date), "dd/MM", { locale: ptBR })}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 rounded-xl bg-muted/50 border border-border">
        <p className="text-sm text-muted-foreground">
          Os horários e locais de exibição são definidos pela equipe editorial e não podem ser alterados diretamente.
          Para solicitar mudanças, entre em contato conosco.
        </p>
      </div>
    </div>
  );
}
