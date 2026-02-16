import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  MoreVertical, 
  Play, 
  Pause, 
  Pencil, 
  Trash2, 
  Layout, 
  Megaphone, 
  Smartphone,
  Bell,
  Mail,
  DoorOpen,
  LogIn,
  BarChart3,
  Calendar,
  Copy,
  PanelTop,
  PanelRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { 
  CampaignUnified, 
  ChannelType 
} from '@/types/campaigns-unified';
import { STATUS_LABELS, STATUS_COLORS, CHANNEL_LABELS } from '@/types/campaigns-unified';

const CHANNEL_ICONS: Partial<Record<ChannelType, React.ReactNode>> = {
  ads: <Layout className="h-4 w-4" />,
  publidoor: <Megaphone className="h-4 w-4" />,
  webstories: <Smartphone className="h-4 w-4" />,
  push: <Bell className="h-4 w-4" />,
  newsletter: <Mail className="h-4 w-4" />,
  exit_intent: <DoorOpen className="h-4 w-4" />,
  login_panel: <LogIn className="h-4 w-4" />,
  banner_intro: <PanelTop className="h-4 w-4" />,
  floating_ad: <PanelRight className="h-4 w-4" />,
};

interface CampaignCardProps {
  campaign: CampaignUnified;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onToggleStatus: (id: string, status: 'active' | 'paused') => void;
  onViewMetrics: (id: string) => void;
}

export function CampaignCard({
  campaign,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleStatus,
  onViewMetrics,
}: CampaignCardProps) {
  const enabledChannels = campaign.channels?.filter(c => c.enabled) || [];
  const isActive = campaign.status === 'active';
  
  const formatDate = (date?: string) => {
    if (!date) return 'Sem data';
    return format(new Date(date), "dd/MM/yy", { locale: ptBR });
  };

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate">{campaign.name}</h3>
            <p className="text-sm text-muted-foreground truncate">{campaign.advertiser}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className={STATUS_COLORS[campaign.status]}>
              {STATUS_LABELS[campaign.status]}
            </Badge>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(campaign.id)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onViewMetrics(campaign.id)}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Ver Métricas
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate(campaign.id)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {isActive ? (
                  <DropdownMenuItem onClick={() => onToggleStatus(campaign.id, 'paused')}>
                    <Pause className="h-4 w-4 mr-2" />
                    Pausar
                  </DropdownMenuItem>
                ) : campaign.status !== 'ended' && (
                  <DropdownMenuItem onClick={() => onToggleStatus(campaign.id, 'active')}>
                    <Play className="h-4 w-4 mr-2" />
                    Ativar
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDelete(campaign.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3">
        {/* Channels */}
        <div className="flex flex-wrap gap-1.5">
          {enabledChannels.map(channel => (
            <Badge 
              key={channel.id} 
              variant="secondary"
              className="text-xs flex items-center gap-1"
            >
              {CHANNEL_ICONS[channel.channel_type]}
              {CHANNEL_LABELS[channel.channel_type]}
            </Badge>
          ))}
          {enabledChannels.length === 0 && (
            <span className="text-xs text-muted-foreground italic">
              Nenhum canal configurado
            </span>
          )}
        </div>
        
        {/* Dates */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>
            {formatDate(campaign.starts_at)} - {formatDate(campaign.ends_at)}
          </span>
        </div>
        
        {/* Priority */}
        {campaign.priority > 0 && (
          <div className="text-xs text-muted-foreground">
            Prioridade: <span className="font-medium">{campaign.priority}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
