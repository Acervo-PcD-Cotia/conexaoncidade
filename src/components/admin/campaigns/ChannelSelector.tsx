import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
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
  // Ads
  adsConfig?: Partial<AdsChannelConfig>;
  onAdsConfigChange: (config: Partial<AdsChannelConfig>) => void;
  adsAssetUrl?: string;
  onAdsAssetChange: (url: string, alt?: string) => void;
  // Publidoor
  publidoorConfig?: Partial<PublidoorChannelConfig>;
  onPublidoorConfigChange: (config: Partial<PublidoorChannelConfig>) => void;
  publidoorAssetUrl?: string;
  onPublidoorAssetChange: (url: string, alt?: string) => void;
  // WebStories
  webstoriesConfig?: Partial<WebStoriesChannelConfig>;
  onWebstoriesConfigChange: (config: Partial<WebStoriesChannelConfig>) => void;
  storyAssetUrl?: string;
  onStoryAssetChange: (url: string, alt?: string) => void;
  // Push
  pushConfig?: Partial<PushChannelConfig>;
  onPushConfigChange: (config: Partial<PushChannelConfig>) => void;
  // Newsletter
  newsletterConfig?: Partial<NewsletterChannelConfig>;
  onNewsletterConfigChange: (config: Partial<NewsletterChannelConfig>) => void;
  // Exit-Intent
  exitIntentConfig?: Partial<ExitIntentChannelConfig>;
  onExitIntentConfigChange: (config: Partial<ExitIntentChannelConfig>) => void;
  exitIntentHeroUrl?: string;
  onExitIntentHeroChange?: (url: string, alt?: string) => void;
  exitIntentSecondary1Url?: string;
  onExitIntentSecondary1Change?: (url: string, alt?: string) => void;
  exitIntentSecondary2Url?: string;
  onExitIntentSecondary2Change?: (url: string, alt?: string) => void;
  // Login Panel
  loginPanelConfig?: Partial<LoginPanelChannelConfig>;
  onLoginPanelConfigChange: (config: Partial<LoginPanelChannelConfig>) => void;
  loginPanelAssetUrl?: string;
  onLoginPanelAssetChange?: (url: string, alt?: string) => void;
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

// No-op function for fallback
const noop = () => {};

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
  onPushConfigChange = noop,
  newsletterConfig,
  onNewsletterConfigChange = noop,
  exitIntentConfig,
  onExitIntentConfigChange = noop,
  loginPanelConfig,
  onLoginPanelConfigChange = noop,
  adsAssetUrl,
  onAdsAssetChange,
  publidoorAssetUrl,
  onPublidoorAssetChange,
  storyAssetUrl,
  onStoryAssetChange,
  exitIntentHeroUrl,
  onExitIntentHeroChange,
  exitIntentSecondary1Url,
  onExitIntentSecondary1Change,
  exitIntentSecondary2Url,
  onExitIntentSecondary2Change,
  loginPanelAssetUrl,
  onLoginPanelAssetChange,
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

  const safeRenderChannelForm = (channel: ChannelOption) => {
    try {
      return renderChannelForm(channel);
    } catch (error) {
      console.error(`Error rendering form for ${channel.type}:`, error);
      return (
        <div className="p-4 text-sm text-destructive">
          Erro ao carregar formulário deste canal.
        </div>
      );
    }
  };

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
        return (
          <PushChannelForm
            config={pushConfig}
            onChange={onPushConfigChange}
          />
        );
      case 'newsletter':
        return (
          <NewsletterChannelForm
            config={newsletterConfig}
            onChange={onNewsletterConfigChange}
          />
        );
      case 'exit_intent':
        return (
          <ExitIntentChannelForm
            config={exitIntentConfig}
            onChange={onExitIntentConfigChange}
            heroAssetUrl={exitIntentHeroUrl}
            onHeroAssetChange={onExitIntentHeroChange}
            secondary1AssetUrl={exitIntentSecondary1Url}
            onSecondary1AssetChange={onExitIntentSecondary1Change}
            secondary2AssetUrl={exitIntentSecondary2Url}
            onSecondary2AssetChange={onExitIntentSecondary2Change}
          />
        );
      case 'login_panel':
        return (
          <LoginPanelChannelForm
            config={loginPanelConfig}
            onChange={onLoginPanelConfigChange}
            assetUrl={loginPanelAssetUrl}
            onAssetChange={onLoginPanelAssetChange}
          />
        );
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
              <div 
                key={channel.type} 
                className={cn(
                  "border rounded-lg transition-colors",
                  isSelected(channel.type) 
                    ? "border-primary bg-primary/5" 
                    : "border-border"
                )}
              >
                <div
                  className="flex items-start gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleChannel(channel.type)}
                >
                  <Checkbox
                    checked={isSelected(channel.type)}
                    className="mt-0.5 pointer-events-none"
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
                
                {isSelected(channel.type) && (
                  <div className="px-4 pb-4 pt-2 border-t border-border/50">
                    {safeRenderChannelForm(channel)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
