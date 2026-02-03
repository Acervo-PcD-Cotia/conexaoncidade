import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Layout, Megaphone, Smartphone, Bell, Mail, DoorOpen, LogIn, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { 
  ChannelType, 
  AdsChannelConfig, 
  PublidoorChannelConfig, 
  WebStoriesChannelConfig,
  PushChannelConfig,
  NewsletterChannelConfig,
  ExitIntentChannelConfig,
  LoginPanelChannelConfig,
} from '@/types/campaigns-unified';
import { AdsChannelForm } from './AdsChannelForm';
import { PublidoorChannelForm } from './PublidoorChannelForm';
import { WebStoriesChannelForm } from './WebStoriesChannelForm';
import { PushChannelForm } from './PushChannelForm';
import { NewsletterChannelForm } from './NewsletterChannelForm';
import { ExitIntentChannelForm } from './ExitIntentChannelForm';
import { LoginPanelChannelForm } from './LoginPanelChannelForm';

interface ChannelSelectorProps {
  selectedChannels: ChannelType[];
  onChannelsChange: (channels: ChannelType[]) => void;
  adsConfig?: Partial<AdsChannelConfig>;
  onAdsConfigChange: (config: Partial<AdsChannelConfig>) => void;
  publidoorConfig?: Partial<PublidoorChannelConfig>;
  onPublidoorConfigChange: (config: Partial<PublidoorChannelConfig>) => void;
  webstoriesConfig?: Partial<WebStoriesChannelConfig>;
  onWebstoriesConfigChange: (config: Partial<WebStoriesChannelConfig>) => void;
  pushConfig?: Partial<PushChannelConfig>;
  onPushConfigChange?: (config: Partial<PushChannelConfig>) => void;
  newsletterConfig?: Partial<NewsletterChannelConfig>;
  onNewsletterConfigChange?: (config: Partial<NewsletterChannelConfig>) => void;
  exitIntentConfig?: Partial<ExitIntentChannelConfig>;
  onExitIntentConfigChange?: (config: Partial<ExitIntentChannelConfig>) => void;
  loginPanelConfig?: Partial<LoginPanelChannelConfig>;
  onLoginPanelConfigChange?: (config: Partial<LoginPanelChannelConfig>) => void;
  adsAssetUrl?: string;
  onAdsAssetChange: (url: string, alt?: string) => void;
  publidoorAssetUrl?: string;
  onPublidoorAssetChange: (url: string, alt?: string) => void;
  storyAssetUrl?: string;
  onStoryAssetChange: (url: string, alt?: string) => void;
}

interface ChannelOption {
  type: ChannelType;
  label: string;
  description: string;
  icon: React.ReactNode;
  requiresConfirmation?: boolean;
  category: 'display' | 'engagement' | 'direct';
}

const CHANNELS: ChannelOption[] = [
  {
    type: 'ads',
    label: 'Ads (Banners)',
    description: 'Banners tradicionais em diversas posições do site',
    icon: <Layout className="h-5 w-5" />,
    category: 'display',
  },
  {
    type: 'publidoor',
    label: 'Publidoor',
    description: 'Conteúdo de marca integrado ao editorial',
    icon: <Megaphone className="h-5 w-5" />,
    category: 'display',
  },
  {
    type: 'webstories',
    label: 'WebStories',
    description: 'Stories interativos em tela cheia',
    icon: <Smartphone className="h-5 w-5" />,
    category: 'display',
  },
  {
    type: 'exit_intent',
    label: 'Exit-Intent',
    description: 'Modal exibido quando usuário tenta sair',
    icon: <DoorOpen className="h-5 w-5" />,
    category: 'engagement',
  },
  {
    type: 'login_panel',
    label: 'Painel de Login',
    description: 'Criativo no lado esquerdo da tela de login',
    icon: <LogIn className="h-5 w-5" />,
    category: 'engagement',
  },
  {
    type: 'push',
    label: 'Push Notification',
    description: 'Notificação enviada diretamente aos usuários',
    icon: <Bell className="h-5 w-5" />,
    requiresConfirmation: true,
    category: 'direct',
  },
  {
    type: 'newsletter',
    label: 'Newsletter',
    description: 'Inserção em e-mails da newsletter',
    icon: <Mail className="h-5 w-5" />,
    requiresConfirmation: true,
    category: 'direct',
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  display: 'Exibição no Site',
  engagement: 'Engajamento',
  direct: 'Comunicação Direta',
};

export function ChannelSelector({
  selectedChannels,
  onChannelsChange,
  adsConfig,
  onAdsConfigChange,
  publidoorConfig,
  onPublidoorConfigChange,
  webstoriesConfig,
  onWebstoriesConfigChange,
  pushConfig,
  onPushConfigChange,
  newsletterConfig,
  onNewsletterConfigChange,
  exitIntentConfig,
  onExitIntentConfigChange,
  loginPanelConfig,
  onLoginPanelConfigChange,
  adsAssetUrl,
  onAdsAssetChange,
  publidoorAssetUrl,
  onPublidoorAssetChange,
  storyAssetUrl,
  onStoryAssetChange,
}: ChannelSelectorProps) {
  const toggleChannel = (type: ChannelType) => {
    if (selectedChannels.includes(type)) {
      onChannelsChange(selectedChannels.filter(c => c !== type));
    } else {
      onChannelsChange([...selectedChannels, type]);
    }
  };

  const isSelected = (type: ChannelType) => selectedChannels.includes(type);

  const groupedChannels = CHANNELS.reduce((acc, channel) => {
    if (!acc[channel.category]) {
      acc[channel.category] = [];
    }
    acc[channel.category].push(channel);
    return acc;
  }, {} as Record<string, ChannelOption[]>);

  const renderChannelForm = (channel: ChannelOption) => {
    switch (channel.type) {
      case 'ads':
        return (
          <AdsChannelForm
            config={adsConfig}
            onChange={onAdsConfigChange}
            assetUrl={adsAssetUrl}
            onAssetChange={onAdsAssetChange}
          />
        );
      case 'publidoor':
        return (
          <PublidoorChannelForm
            config={publidoorConfig}
            onChange={onPublidoorConfigChange}
            assetUrl={publidoorAssetUrl}
            onAssetChange={onPublidoorAssetChange}
          />
        );
      case 'webstories':
        return (
          <WebStoriesChannelForm
            config={webstoriesConfig}
            onChange={onWebstoriesConfigChange}
            assetUrl={storyAssetUrl}
            onAssetChange={onStoryAssetChange}
          />
        );
      case 'push':
        return onPushConfigChange ? (
          <PushChannelForm
            config={pushConfig}
            onChange={onPushConfigChange}
          />
        ) : null;
      case 'newsletter':
        return onNewsletterConfigChange ? (
          <NewsletterChannelForm
            config={newsletterConfig}
            onChange={onNewsletterConfigChange}
          />
        ) : null;
      case 'exit_intent':
        return onExitIntentConfigChange ? (
          <ExitIntentChannelForm
            config={exitIntentConfig}
            onChange={onExitIntentConfigChange}
          />
        ) : null;
      case 'login_panel':
        return onLoginPanelConfigChange ? (
          <LoginPanelChannelForm
            config={loginPanelConfig}
            onChange={onLoginPanelConfigChange}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium">Onde vai rodar?</Label>
        <p className="text-sm text-muted-foreground">
          Selecione os canais onde esta campanha será exibida
        </p>
      </div>
      
      {Object.entries(groupedChannels).map(([category, channels]) => (
        <div key={category} className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {CATEGORY_LABELS[category]}
          </h4>
          <div className="space-y-2">
            {channels.map(channel => (
              <Collapsible 
                key={channel.type} 
                open={isSelected(channel.type)}
                className={cn(
                  "border rounded-lg transition-colors",
                  isSelected(channel.type) 
                    ? "border-primary bg-primary/5" 
                    : "border-border"
                )}
              >
                <CollapsibleTrigger asChild>
                  <div
                    className="flex items-start gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => toggleChannel(channel.type)}
                  >
                    <Checkbox
                      checked={isSelected(channel.type)}
                      onCheckedChange={() => toggleChannel(channel.type)}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {channel.icon}
                        <span className="font-medium">{channel.label}</span>
                        {channel.requiresConfirmation && (
                          <Badge variant="outline" className="text-xs">
                            Requer confirmação
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {channel.description}
                      </p>
                    </div>
                    {isSelected(channel.type) && (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="px-4 pb-4 pt-2 border-t border-border/50">
                    {renderChannelForm(channel)}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
