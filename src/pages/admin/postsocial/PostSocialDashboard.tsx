import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Calendar, 
  List, 
  LayoutGrid, 
  Settings, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { usePostSocialStats, useSocialPostTargets, useActiveSocialAccounts } from "@/hooks/usePostSocial";
import { PLATFORM_ICONS, PLATFORM_LABELS, STATUS_LABELS, STATUS_COLORS } from "@/types/postsocial";
import type { SocialPostTarget } from "@/types/postsocial";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function PostSocialDashboard() {
  const navigate = useNavigate();
  const [view, setView] = useState<'list' | 'kanban' | 'calendar'>('list');
  
  const { data: stats, isLoading: statsLoading } = usePostSocialStats();
  const { data: targets, isLoading: targetsLoading, refetch } = useSocialPostTargets();
  const { data: accounts } = useActiveSocialAccounts();
  
  const statCards = [
    { label: 'Total', value: stats?.total_posts || 0, icon: TrendingUp, color: 'text-blue-600' },
    { label: 'Agendados', value: stats?.scheduled || 0, icon: Clock, color: 'text-yellow-600' },
    { label: 'Na Fila', value: stats?.in_queue || 0, icon: Send, color: 'text-purple-600' },
    { label: 'Publicados', value: stats?.posted || 0, icon: CheckCircle2, color: 'text-green-600' },
    { label: 'Falhou', value: stats?.failed || 0, icon: AlertCircle, color: 'text-red-600' },
    { label: 'Assistido', value: stats?.assisted || 0, icon: HelpCircle, color: 'text-orange-600' },
  ];
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">PostSocial</h1>
          <p className="text-muted-foreground">
            Automação de postagens em redes sociais
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/spah/painel/postsocial/settings')}>
            <Settings className="h-4 w-4 mr-2" />
            Configurar Redes
          </Button>
          <Button onClick={() => navigate('/spah/painel/postsocial/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Criar Post
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color} opacity-80`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Connected Accounts */}
      {accounts && accounts.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Contas Conectadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {accounts.map((account) => (
                <Badge key={account.id} variant="outline" className="gap-1 py-1.5 px-3">
                  <span>{PLATFORM_ICONS[account.platform]}</span>
                  <span>{account.display_name}</span>
                  {account.default_enabled && (
                    <span className="text-xs text-green-600">✓</span>
                  )}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Main Content */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle>Postagens</CardTitle>
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <Button
                variant={view === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setView('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={view === 'kanban' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setView('kanban')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={view === 'calendar' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setView('calendar')}
              >
                <Calendar className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {view === 'list' && (
            <TargetListView targets={targets || []} isLoading={targetsLoading} />
          )}
          {view === 'kanban' && (
            <KanbanView targets={targets || []} />
          )}
          {view === 'calendar' && (
            <CalendarView targets={targets || []} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// List View Component
function TargetListView({ targets, isLoading }: { targets: SocialPostTarget[]; isLoading: boolean }) {
  const navigate = useNavigate();
  
  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Carregando...
      </div>
    );
  }
  
  if (targets.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground mb-4">Nenhum post encontrado</p>
        <Button onClick={() => navigate('/spah/painel/postsocial/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Criar Primeiro Post
        </Button>
      </div>
    );
  }
  
  return (
    <div className="divide-y">
      {targets.slice(0, 50).map((target) => (
        <div
          key={target.id}
          className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
          onClick={() => navigate(`/admin/postsocial/${target.post_id}`)}
        >
          <div className="flex items-center gap-4">
            {/* Platform Icon */}
            <div className="text-2xl">
              {target.social_account && PLATFORM_ICONS[target.social_account.platform]}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">
                {target.post?.title || 'Sem título'}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {target.caption_override || target.post?.base_caption || 'Sem legenda'}
              </p>
            </div>
            
            {/* Schedule */}
            <div className="text-sm text-muted-foreground text-right">
              {target.scheduled_at ? (
                <div>
                  <p>{format(new Date(target.scheduled_at), 'dd/MM/yyyy')}</p>
                  <p>{format(new Date(target.scheduled_at), 'HH:mm')}</p>
                </div>
              ) : target.posted_at ? (
                <p>Publicado {formatDistanceToNow(new Date(target.posted_at), { locale: ptBR, addSuffix: true })}</p>
              ) : (
                <p>Rascunho</p>
              )}
            </div>
            
            {/* Status */}
            <Badge className={STATUS_COLORS[target.status]}>
              {STATUS_LABELS[target.status]}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

// Kanban View Component
function KanbanView({ targets }: { targets: SocialPostTarget[] }) {
  const columns = [
    { status: 'draft', label: 'Rascunho' },
    { status: 'scheduled', label: 'Agendado' },
    { status: 'queued', label: 'Na Fila' },
    { status: 'done', label: 'Publicado' },
    { status: 'assisted', label: 'Assistido' },
  ];
  
  return (
    <div className="flex gap-4 p-4 overflow-x-auto min-h-[400px]">
      {columns.map((column) => {
        const columnTargets = targets.filter(t => t.status === column.status);
        return (
          <div key={column.status} className="flex-shrink-0 w-72">
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">{column.label}</h3>
                <Badge variant="secondary">{columnTargets.length}</Badge>
              </div>
              <div className="space-y-2">
                {columnTargets.slice(0, 10).map((target) => (
                  <Card key={target.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span>{target.social_account && PLATFORM_ICONS[target.social_account.platform]}</span>
                        <span className="text-sm font-medium truncate">
                          {target.social_account?.display_name}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {target.post?.title}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Calendar View Component
function CalendarView({ targets }: { targets: SocialPostTarget[] }) {
  const scheduledTargets = targets.filter(t => t.scheduled_at);
  
  // Group by date
  const byDate: Record<string, SocialPostTarget[]> = {};
  scheduledTargets.forEach(t => {
    const date = format(new Date(t.scheduled_at!), 'yyyy-MM-dd');
    if (!byDate[date]) byDate[date] = [];
    byDate[date].push(t);
  });
  
  const dates = Object.keys(byDate).sort();
  
  return (
    <div className="p-4">
      {dates.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum post agendado
        </div>
      ) : (
        <div className="space-y-4">
          {dates.map(date => (
            <div key={date}>
              <h3 className="font-medium mb-2">
                {format(new Date(date), "EEEE, d 'de' MMMM", { locale: ptBR })}
              </h3>
              <div className="grid gap-2">
                {byDate[date].map(target => (
                  <Card key={target.id}>
                    <CardContent className="p-3 flex items-center gap-3">
                      <span className="text-lg">
                        {target.social_account && PLATFORM_ICONS[target.social_account.platform]}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{target.post?.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(target.scheduled_at!), 'HH:mm')}
                        </p>
                      </div>
                      <Badge className={STATUS_COLORS[target.status]}>
                        {STATUS_LABELS[target.status]}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
