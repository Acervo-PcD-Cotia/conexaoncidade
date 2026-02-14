import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Layout, Megaphone, Smartphone, Bell, Mail, DoorOpen, LogIn, PanelTop, PanelRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChannelType } from '@/types/campaigns-unified';
import type { ChannelConfigs, ChannelAssets } from './useCampaignFormReducer';
import { AdsChannelForm } from './AdsChannelForm';
import { PublidoorChannelForm } from './PublidoorChannelForm';
import { WebStoriesChannelForm } from './WebStoriesChannelForm';
import { PushChannelForm } from './PushChannelForm';
import { NewsletterChannelForm } from './NewsletterChannelForm';
import { ExitIntentChannelForm } from './ExitIntentChannelForm';
import { LoginPanelChannelForm } from './LoginPanelChannelForm';
import { BannerIntroChannelForm } from './BannerIntroChannelForm';
import { FloatingAdChannelForm } from './FloatingAdChannelForm';

export interface ChannelSelectorProps {
  selectedChannels: ChannelType[];
  onToggleChannel: (channel: ChannelType) => void;
  channelConfigs: ChannelConfigs;
  onConfigChange: (channel: ChannelType, config: Partial<Record<string, unknown>>) => void;
  channelAssets: ChannelAssets;
  onAssetChange: (key: keyof ChannelAssets, url: string, alt?: string) => void;
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
    type: 'banner_intro',
    label: 'Banner Intro',
    description: 'Banner de entrada na primeira dobra da Home (970×250)',
    icon: <PanelTop className="h-5 w-5" />,
    category: 'display',
  },
  {
    type: 'floating_ad',
    label: 'Destaque Flutuante',
    description: 'Banner lateral fixo na tela (300×600)',
    icon: <PanelRight className="h-5 w-5" />,
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

export const ChannelSelector = React.memo(function ChannelSelector({
  selectedChannels,
  onToggleChannel,
  channelConfigs,
  onConfigChange,
  channelAssets,
  onAssetChange,
}: ChannelSelectorProps) {
  const isSelected = (type: ChannelType) => selectedChannels.includes(type);

  const handleToggle = React.useCallback((channelType: ChannelType) => {
    console.log('[ChannelSelector] toggle', {
      channel: channelType,
      currentSelected: selectedChannels,
      willBeSelected: !selectedChannels.includes(channelType),
    });
    onToggleChannel(channelType);
  }, [selectedChannels, onToggleChannel]);

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
            config={channelConfigs.ads}
            onChange={(config) => onConfigChange('ads', config)}
            assetUrl={channelAssets.ads.url}
            onAssetChange={(url, alt) => onAssetChange('ads', url, alt)}
          />
        );
      case 'publidoor':
        return (
          <PublidoorChannelForm
            config={channelConfigs.publidoor}
            onChange={(config) => onConfigChange('publidoor', config)}
            assetUrl={channelAssets.publidoor.url}
            onAssetChange={(url, alt) => onAssetChange('publidoor', url, alt)}
          />
        );
      case 'webstories':
        return (
          <WebStoriesChannelForm
            config={channelConfigs.webstories}
            onChange={(config) => onConfigChange('webstories', config)}
            assetUrl={channelAssets.webstories.url}
            onAssetChange={(url, alt) => onAssetChange('webstories', url, alt)}
          />
        );
      case 'push':
        return (
          <PushChannelForm
            config={channelConfigs.push}
            onChange={(config) => onConfigChange('push', config)}
          />
        );
      case 'newsletter':
        return (
          <NewsletterChannelForm
            config={channelConfigs.newsletter}
            onChange={(config) => onConfigChange('newsletter', config)}
          />
        );
      case 'exit_intent':
        return (
          <ExitIntentChannelForm
            config={channelConfigs.exit_intent}
            onChange={(config) => onConfigChange('exit_intent', config)}
            heroAssetUrl={channelAssets.exitIntentHero.url}
            onHeroAssetChange={(url, alt) => onAssetChange('exitIntentHero', url, alt)}
            secondary1AssetUrl={channelAssets.exitIntentSecondary1.url}
            onSecondary1AssetChange={(url, alt) => onAssetChange('exitIntentSecondary1', url, alt)}
            secondary2AssetUrl={channelAssets.exitIntentSecondary2.url}
            onSecondary2AssetChange={(url, alt) => onAssetChange('exitIntentSecondary2', url, alt)}
          />
        );
      case 'login_panel':
        return (
          <LoginPanelChannelForm
            config={channelConfigs.login_panel}
            onChange={(config) => onConfigChange('login_panel', config)}
            assetUrl={channelAssets.loginPanel.url}
            onAssetChange={(url, alt) => onAssetChange('loginPanel', url, alt)}
          />
        );
      case 'banner_intro':
        return (
          <BannerIntroChannelForm
            config={channelConfigs.banner_intro as Record<string, unknown>}
            onChange={(config) => onConfigChange('banner_intro', config)}
            assetUrl={channelAssets.bannerIntro?.url || ''}
            onAssetChange={(url, alt) => onAssetChange('bannerIntro', url, alt)}
          />
        );
      case 'floating_ad':
        return (
          <FloatingAdChannelForm
            config={channelConfigs.floating_ad as Record<string, unknown>}
            onChange={(config) => onConfigChange('floating_ad', config)}
            assetUrl={channelAssets.floatingAd?.url || ''}
            onAssetChange={(url, alt) => onAssetChange('floatingAd', url, alt)}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggle(channel.type);
                  }}
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
                  <div
                    className="px-4 pb-4 pt-2 border-t border-border/50"
                    onClick={(e) => e.stopPropagation()}
                  >
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
});
