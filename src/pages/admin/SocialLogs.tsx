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
import { useSocialLogs } from "@/hooks/useSocialLogs";
import { PLATFORM_ICONS } from "@/hooks/useSocialAccounts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Info, AlertTriangle, XCircle } from "lucide-react";

const LEVEL_CONFIG = {
  info: {
    icon: Info,
    color: 'bg-blue-100 text-blue-800',
    label: 'Info',
  },
  warn: {
    icon: AlertTriangle,
    color: 'bg-yellow-100 text-yellow-800',
    label: 'Aviso',
  },
  error: {
    icon: XCircle,
    color: 'bg-red-100 text-red-800',
    label: 'Erro',
  },
};

export default function SocialLogs() {
  const [levelFilter, setLevelFilter] = useState<'info' | 'warn' | 'error' | undefined>(undefined);
  
  const { data: logs, isLoading } = useSocialLogs({ 
    level: levelFilter,
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
          value={levelFilter ?? 'all'} 
          onValueChange={(v) => setLevelFilter(v === 'all' ? undefined : v as 'info' | 'warn' | 'error')}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todos os níveis" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os níveis</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warn">Avisos</SelectItem>
            <SelectItem value="error">Erros</SelectItem>
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
                const config = LEVEL_CONFIG[log.level];
                const Icon = config.icon;
                
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
                        {log.social_post?.platform && (
                          <span className="text-lg">
                            {PLATFORM_ICONS[log.social_post.platform as keyof typeof PLATFORM_ICONS]}
                          </span>
                        )}
                        <Badge variant="outline" className={config.color}>
                          {config.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                        </span>
                      </div>
                      
                      <p className="font-medium">{log.message}</p>
                      
                      {log.social_post?.news?.title && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Notícia: {log.social_post.news.title}
                        </p>
                      )}
                      
                      {Object.keys(log.details).length > 0 && (
                        <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
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
