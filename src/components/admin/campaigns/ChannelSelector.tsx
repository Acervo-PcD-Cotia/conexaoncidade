import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Layout, Megaphone, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { 
  ChannelType, 
  AdsChannelConfig, 
  PublidoorChannelConfig, 
  WebStoriesChannelConfig 
} from '@/types/campaigns-unified';
import { AdsChannelForm } from './AdsChannelForm';
import { PublidoorChannelForm } from './PublidoorChannelForm';
import { WebStoriesChannelForm } from './WebStoriesChannelForm';

interface ChannelSelectorProps {
  selectedChannels: ChannelType[];
  onChannelsChange: (channels: ChannelType[]) => void;
  adsConfig?: Partial<AdsChannelConfig>;
  onAdsConfigChange: (config: Partial<AdsChannelConfig>) => void;
  publidoorConfig?: Partial<PublidoorChannelConfig>;
  onPublidoorConfigChange: (config: Partial<PublidoorChannelConfig>) => void;
  webstoriesConfig?: Partial<WebStoriesChannelConfig>;
  onWebstoriesConfigChange: (config: Partial<WebStoriesChannelConfig>) => void;
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
}

const CHANNELS: ChannelOption[] = [
  {
    type: 'ads',
    label: 'Ads (Banners)',
    description: 'Banners tradicionais em diversas posições do site',
    icon: <Layout className="h-5 w-5" />,
  },
  {
    type: 'publidoor',
    label: 'Publidoor',
    description: 'Conteúdo de marca integrado ao editorial',
    icon: <Megaphone className="h-5 w-5" />,
  },
  {
    type: 'webstories',
    label: 'WebStories',
    description: 'Stories interativos em tela cheia',
    icon: <Smartphone className="h-5 w-5" />,
  },
];

export function ChannelSelector({
  selectedChannels,
  onChannelsChange,
  adsConfig,
  onAdsConfigChange,
  publidoorConfig,
  onPublidoorConfigChange,
  webstoriesConfig,
  onWebstoriesConfigChange,
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

  return (
    <div className="space-y-3">
      <Label className="text-base font-medium">Onde vai rodar?</Label>
      <p className="text-sm text-muted-foreground">
        Selecione os canais onde esta campanha será exibida
      </p>
      
      <div className="space-y-2">
        {CHANNELS.map(channel => (
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
                {channel.type === 'ads' && (
                  <AdsChannelForm
                    config={adsConfig}
                    onChange={onAdsConfigChange}
                    assetUrl={adsAssetUrl}
                    onAssetChange={onAdsAssetChange}
                  />
                )}
                {channel.type === 'publidoor' && (
                  <PublidoorChannelForm
                    config={publidoorConfig}
                    onChange={onPublidoorConfigChange}
                    assetUrl={publidoorAssetUrl}
                    onAssetChange={onPublidoorAssetChange}
                  />
                )}
                {channel.type === 'webstories' && (
                  <WebStoriesChannelForm
                    config={webstoriesConfig}
                    onChange={onWebstoriesConfigChange}
                    assetUrl={storyAssetUrl}
                    onAssetChange={onStoryAssetChange}
                  />
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  );
}
