import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSocialLogs, SocialLog } from "@/hooks/useSocialLogs";
import { PLATFORM_ICONS } from "@/hooks/useSocialAccounts";
import type { LogEvent, SocialPlatform } from "@/types/postsocial";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Send, AlertTriangle, XCircle, RotateCcw, UserCheck } from "lucide-react";

const EVENT_CONFIG: Record<LogEvent, { icon: React.ComponentType<{ className?: string }>; color: string; label: string }> = {
  queued: {
    icon: Send,
    color: 'bg-blue-100 text-blue-800',
    label: 'Na Fila',
  },
  sent: {
    icon: UserCheck,
    color: 'bg-green-100 text-green-800',
    label: 'Enviado',
  },
  error: {
    icon: XCircle,
    color: 'bg-red-100 text-red-800',
    label: 'Erro',
  },
  retry: {
    icon: RotateCcw,
    color: 'bg-yellow-100 text-yellow-800',
    label: 'Retry',
  },
  assisted: {
    icon: AlertTriangle,
    color: 'bg-orange-100 text-orange-800',
    label: 'Assistido',
  },
};

export default function SocialLogs() {
  const [eventFilter, setEventFilter] = useState<LogEvent | undefined>(undefined);
  
  const { data: logs, isLoading } = useSocialLogs({ 
    event: eventFilter,
    limit: 200 
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Logs de Publicação</h1>
        <p className="text-muted-foreground">
          Acompanhe todos os eventos do sistema de distribuição social
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Select 
          value={eventFilter ?? 'all'} 
          onValueChange={(v) => setEventFilter(v === 'all' ? undefined : v as LogEvent)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todos os eventos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os eventos</SelectItem>
            <SelectItem value="queued">Na Fila</SelectItem>
            <SelectItem value="sent">Enviado</SelectItem>
            <SelectItem value="error">Erro</SelectItem>
            <SelectItem value="retry">Retry</SelectItem>
            <SelectItem value="assisted">Assistido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Timeline de Eventos</CardTitle>
          <CardDescription>
            Últimos {logs?.length ?? 0} eventos registrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-center py-8">Carregando...</p>
          ) : !logs || logs.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum log encontrado
            </p>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => {
                const config = EVENT_CONFIG[log.event as LogEvent] ?? EVENT_CONFIG.queued;
                const Icon = config.icon;
                const platform = log.target?.social_account?.platform as SocialPlatform | undefined;
                
                return (
                  <div 
                    key={log.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                  >
                    <div className={`p-1.5 rounded ${config.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {platform && (
                          <span className="text-lg">
                            {PLATFORM_ICONS[platform]}
                          </span>
                        )}
                        <Badge variant="outline" className={config.color}>
                          {config.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                        </span>
                      </div>
                      
                      <p className="font-medium">
                        {log.event.toUpperCase()} - {log.target?.social_account?.display_name ?? 'Unknown'}
                      </p>
                      
                      {log.payload_json && Object.keys(log.payload_json).length > 0 && (
                        <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-x-auto">
                          {JSON.stringify(log.payload_json, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
